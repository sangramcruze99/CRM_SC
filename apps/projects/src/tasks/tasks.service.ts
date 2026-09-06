import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { publishProjectCreated } from '@repo/core-types';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  constructor(private prisma: PrismaService) {}

  private static inMemoryProjects: any[] = [
    {
      id: 'proj_01',
      tenantId: 'default-tenant',
      name: 'Main Workspace Sprint',
      tasks: []
    }
  ];

  async findProjects(tenantId: string) {
    if (this.prisma.isConnected) {
      try {
        const records = await this.prisma.project.findMany({
          where: { tenantId },
          include: {
            tasks: {
              orderBy: { createdAt: 'desc' }
            }
          },
          orderBy: { createdAt: 'desc' }
        });
        if (records && records.length > 0) return records;
      } catch {
        // fallback
      }
    }
    return TasksService.inMemoryProjects.filter(p => p.tenantId === tenantId);
  }

  async getOrCreateProject(tenantId: string, name: string) {
    let proj: any = null;
    let isNew = false;

    if (this.prisma.isConnected) {
      try {
        const existing = await this.prisma.project.findFirst({
          where: { tenantId, name }
        });
        if (existing) return existing;
        proj = await this.prisma.project.create({
          data: { tenantId, name }
        });
        isNew = true;
      } catch {
        // fallback
      }
    }

    if (!proj) {
      proj = TasksService.inMemoryProjects.find(p => p.name === name && p.tenantId === tenantId);
      if (!proj) {
        proj = { id: `proj_${Date.now()}`, tenantId, name, tasks: [] };
        TasksService.inMemoryProjects.push(proj);
        isNew = true;
      }
    }

    if (isNew && proj) {
      publishProjectCreated(tenantId, { id: proj.id, name: proj.name, description: proj.description })
        .catch((e) => this.logger.warn(`Failed to publish PROJECT_CREATED: ${e.message}`));
    }

    return proj;
  }


  async createTask(tenantId: string, projectId: string, data: { title: string, description?: string, status?: string }) {
    if (this.prisma.isConnected) {
      try {
        // Verify project belongs to caller's tenant
        const project = await this.prisma.project.findFirst({
          where: { id: projectId, tenantId }
        });
        if (!project) return null;

        return await this.prisma.task.create({
          data: {
            projectId,
            title: data.title,
            description: data.description,
            status: data.status || 'TODO',
          }
        });
      } catch {
        // fallback
      }
    }
    const newTask = {
      id: `tsk_${Date.now()}`,
      projectId,
      title: data.title,
      description: data.description || '',
      status: data.status || 'TODO',
      priority: 'MEDIUM',
      createdAt: new Date()
    };
    const proj = TasksService.inMemoryProjects.find(p => p.id === projectId && p.tenantId === tenantId) || 
      TasksService.inMemoryProjects.find(p => p.tenantId === tenantId);
    if (proj) {
      proj.tasks.unshift(newTask);
    }
    return newTask;
  }

  async updateTaskStatus(tenantId: string, taskId: string, status: string) {
    if (this.prisma.isConnected) {
      try {
        // Verify task belongs to project owned by tenant
        const task = await this.prisma.task.findFirst({
          where: {
            id: taskId,
            project: { tenantId }
          }
        });
        if (!task) return null;

        return await this.prisma.task.update({
          where: { id: taskId },
          data: { status }
        });
      } catch {
        // fallback
      }
    }
    for (const proj of TasksService.inMemoryProjects) {
      if (proj.tenantId === tenantId) {
        const task = proj.tasks.find((t: any) => t.id === taskId);
        if (task) {
          task.status = status;
          return task;
        }
      }
    }
    return { id: taskId, status };
  }

  async deleteTask(tenantId: string, taskId: string) {
    if (this.prisma.isConnected) {
      try {
        // Verify task belongs to project owned by tenant
        const task = await this.prisma.task.findFirst({
          where: {
            id: taskId,
            project: { tenantId }
          }
        });
        if (!task) return { success: false, id: taskId };

        return await this.prisma.task.delete({
          where: { id: taskId }
        });
      } catch {
        // fallback
      }
    }
    for (const proj of TasksService.inMemoryProjects) {
      if (proj.tenantId === tenantId) {
        proj.tasks = proj.tasks.filter((t: any) => t.id !== taskId);
      }
    }
    return { success: true, id: taskId };
  }
}
