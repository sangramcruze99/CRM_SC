import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  publishCandidateApplied,
  publishBusinessEvent,
} from '@repo/core-types';

@Injectable()
export class EmployeesService {
  private readonly logger = new Logger(EmployeesService.name);
  constructor(private prisma: PrismaService) {}

  private static inMemoryEmployees: any[] = [];

  async findEmployees(tenantId: string) {
    if (this.prisma.isConnected) {
      try {
        const records = await this.prisma.employee.findMany({
          where: { tenantId },
          include: {
            department: true,
            leaveRequests: {
              orderBy: { startDate: 'desc' },
              take: 5,
            },
          },
          orderBy: { firstName: 'asc' },
        });
        if (records && records.length > 0) return records;
      } catch {
        // fallback
      }
    }
    return EmployeesService.inMemoryEmployees.filter(
      (e) => e.tenantId === tenantId,
    );
  }

  async createEmployee(
    tenantId: string,
    data: {
      firstName: string;
      lastName: string;
      email: string;
      jobTitle?: string;
      departmentId?: string;
    },
  ) {
    let emp: any = null;
    if (this.prisma.isConnected) {
      try {
        emp = await this.prisma.employee.create({
          data: {
            tenantId,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            jobTitle: data.jobTitle,
            departmentId: data.departmentId,
          },
        });
      } catch {
        // fallback
      }
    }

    if (!emp) {
      emp = {
        id: `emp_${Date.now()}`,
        tenantId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        jobTitle: data.jobTitle || 'Team Member',
        department: { name: 'General' },
        leaveRequests: [],
      };
      EmployeesService.inMemoryEmployees.unshift(emp);
    }

    publishBusinessEvent({
      tenantId,
      type: 'EMPLOYEE_CREATED',
      source: 'hr',
      payload: {
        employeeId: emp.id,
        name: `${emp.firstName} ${emp.lastName}`,
        email: emp.email,
      },
    }).catch(() => null);

    return emp;
  }

  async submitCandidateApplication(
    tenantId: string,
    data: {
      name: string;
      email: string;
      roleApplied: string;
      resumeUrl?: string;
    },
  ) {
    const candidateId = `cand_${Date.now()}`;
    await publishCandidateApplied(tenantId, {
      id: candidateId,
      name: data.name,
      email: data.email,
      roleApplied: data.roleApplied,
      resumeUrl: data.resumeUrl,
    }).catch((e) =>
      this.logger.warn(`Failed to publish CANDIDATE_APPLIED: ${e.message}`),
    );

    return {
      candidateId,
      status: 'APPLICATION_RECEIVED',
      role: data.roleApplied,
    };
  }

  async findLeaveRequests(tenantId: string) {
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.leaveRequest.findMany({
          where: { tenantId },
          include: {
            employee: true,
          },
          orderBy: { createdAt: 'desc' },
        });
      } catch {
        // fallback
      }
    }
    return [];
  }

  async requestLeave(
    tenantId: string,
    data: {
      employeeId: string;
      type: string;
      startDate: string;
      endDate: string;
      reason?: string;
    },
  ) {
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.leaveRequest.create({
          data: {
            tenantId,
            employeeId: data.employeeId,
            type: data.type,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
            reason: data.reason,
            status: 'PENDING',
          },
        });
      } catch {
        // fallback
      }
    }
    return { id: `leave_${Date.now()}`, tenantId, ...data, status: 'PENDING' };
  }

  async updateLeaveStatus(tenantId: string, id: string, status: string) {
    if (this.prisma.isConnected) {
      try {
        const existing = await this.prisma.leaveRequest.findFirst({
          where: { id, tenantId },
        });
        if (!existing) return null;

        return await this.prisma.leaveRequest.update({
          where: { id },
          data: { status },
        });
      } catch {
        // fallback
      }
    }
    return { id, status };
  }

  async seedDemoData(tenantId: string) {
    return true;
  }
}
