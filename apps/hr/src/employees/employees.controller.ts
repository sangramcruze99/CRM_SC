import {
  Controller,
  Get,
  Post,
  Body,
  Headers,
  BadRequestException,
  Param,
  Patch,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';

@Controller('hr')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get('employees')
  async getEmployees(@Headers('x-tenant-id') tenantId: string) {
    if (!tenantId)
      throw new BadRequestException('x-tenant-id header is required');

    let employees = await this.employeesService.findEmployees(tenantId);

    // Seed some initial data for demo purposes
    if (employees.length === 0) {
      await this.employeesService.seedDemoData(tenantId);
      employees = await this.employeesService.findEmployees(tenantId);
    }

    return employees;
  }

  @Post('employees')
  async createEmployee(
    @Headers('x-tenant-id') tenantId: string,
    @Body()
    data: {
      firstName: string;
      lastName: string;
      email: string;
      jobTitle?: string;
      departmentId?: string;
    },
  ) {
    return this.employeesService.createEmployee(tenantId, data);
  }

  @Get('leave')
  async getLeaveRequests(@Headers('x-tenant-id') tenantId: string) {
    if (!tenantId)
      throw new BadRequestException('x-tenant-id header is required');
    return this.employeesService.findLeaveRequests(tenantId);
  }

  @Post('leave')
  async requestLeave(
    @Headers('x-tenant-id') tenantId: string,
    @Body()
    data: {
      employeeId: string;
      type: string;
      startDate: string;
      endDate: string;
      reason?: string;
    },
  ) {
    return this.employeesService.requestLeave(tenantId, data);
  }

  @Patch('leave/:id/status')
  async updateLeaveStatus(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() data: { status: string },
  ) {
    if (!tenantId)
      throw new BadRequestException('x-tenant-id header is required');
    return this.employeesService.updateLeaveStatus(tenantId, id, data.status);
  }
}
