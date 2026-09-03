import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmployeesService {
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
              take: 5
            }
          },
          orderBy: { firstName: 'asc' }
        });
        if (records && records.length > 0) return records;
      } catch {
        // fallback
      }
    }
    return EmployeesService.inMemoryEmployees.filter(e => e.tenantId === tenantId || e.tenantId === 'default-tenant');
  }

  async createEmployee(tenantId: string, data: { firstName: string, lastName: string, email: string, jobTitle?: string, departmentId?: string }) {
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.employee.create({
          data: {
            tenantId,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            jobTitle: data.jobTitle,
            departmentId: data.departmentId
          }
        });
      } catch {
        // fallback
      }
    }

    const newEmp = {
      id: `emp_${Date.now()}`,
      tenantId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      jobTitle: data.jobTitle || 'Team Member',
      department: { name: 'General' },
      leaveRequests: []
    };
    EmployeesService.inMemoryEmployees.unshift(newEmp);
    return newEmp;
  }

  async findLeaveRequests(tenantId: string) {
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.leaveRequest.findMany({
          where: { tenantId },
          include: {
            employee: true
          },
          orderBy: { createdAt: 'desc' }
        });
      } catch {
        // fallback
      }
    }
    return [];
  }

  async requestLeave(tenantId: string, data: { employeeId: string, type: string, startDate: string, endDate: string, reason?: string }) {
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
            status: 'PENDING'
          }
        });
      } catch {
        // fallback
      }
    }
    return { id: `leave_${Date.now()}`, tenantId, ...data, status: 'PENDING' };
  }

  async updateLeaveStatus(id: string, status: string) {
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.leaveRequest.update({
          where: { id },
          data: { status }
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
