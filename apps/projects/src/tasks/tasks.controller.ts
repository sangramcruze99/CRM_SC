import { Controller, Get, Post, Body, Headers, BadRequestException, Param, Patch, Delete } from '@nestjs/common';
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

  @Post(':projectId/tasks')
  async createTask(
    @Param('projectId') projectId: string,
    @Body() data: { title: string, description?: string, status?: string }
  ) {
    return this.tasksService.createTask(projectId, data);
  }

  @Patch('tasks/:id/status')
  async updateTaskStatus(
    @Param('id') id: string,
    @Body() data: { status: string }
  ) {
    return this.tasksService.updateTaskStatus(id, data.status);
  }

  @Delete('tasks/:id')
  async deleteTask(@Param('id') id: string) {
    return this.tasksService.deleteTask(id);
  }
}
