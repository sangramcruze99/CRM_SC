import { Controller, Get, Post, Body, Headers, Param, Patch, Delete } from '@nestjs/common';
import { TasksService } from './tasks.service';

@Controller('projects')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async getProjects(@Headers('x-tenant-id') tenantId: string) {
    const effectiveTenantId = tenantId || 'default-tenant';
    
    let projects = await this.tasksService.findProjects(effectiveTenantId);
    
    if (projects.length === 0) {
      await this.tasksService.getOrCreateProject(effectiveTenantId, "Main Workspace Sprint");
      projects = await this.tasksService.findProjects(effectiveTenantId);
    }
    
    return projects;
  }

  @Post('tasks')
  async createDefaultTask(
    @Headers('x-tenant-id') tenantId: string,
    @Body() data: { title: string, description?: string, status?: string }
  ) {
    const effectiveTenantId = tenantId || 'default-tenant';
    const project = await this.tasksService.getOrCreateProject(effectiveTenantId, "Main Workspace Sprint");
    return this.tasksService.createTask(effectiveTenantId, project.id, data);
  }

  @Post(':projectId/tasks')
  async createTask(
    @Headers('x-tenant-id') tenantId: string,
    @Param('projectId') projectId: string,
    @Body() data: { title: string, description?: string, status?: string }
  ) {
    const effectiveTenantId = tenantId || 'default-tenant';
    return this.tasksService.createTask(effectiveTenantId, projectId, data);
  }

  @Patch('tasks/:id/status')
  async updateTaskStatus(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() data: { status: string }
  ) {
    const effectiveTenantId = tenantId || 'default-tenant';
    return this.tasksService.updateTaskStatus(effectiveTenantId, id, data.status);
  }

  @Delete('tasks/:id')
  async deleteTask(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string
  ) {
    const effectiveTenantId = tenantId || 'default-tenant';
    return this.tasksService.deleteTask(effectiveTenantId, id);
  }
}
