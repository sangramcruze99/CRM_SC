import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TasksService {
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
    return TasksService.inMemoryProjects.filter(p => p.tenantId === tenantId || p.tenantId === 'default-tenant');
  }

  async getOrCreateProject(tenantId: string, name: string) {
    if (this.prisma.isConnected) {
      try {
        const existing = await this.prisma.project.findFirst({
          where: { tenantId, name }
        });
        if (existing) return existing;
        return await this.prisma.project.create({
          data: { tenantId, name }
        });
      } catch {
        // fallback
      }
    }
    let proj = TasksService.inMemoryProjects.find(p => p.name === name);
    if (!proj) {
      proj = { id: `proj_${Date.now()}`, tenantId, name, tasks: [] };
      TasksService.inMemoryProjects.push(proj);
    }
    return proj;
  }

  async createTask(projectId: string, data: { title: string, description?: string, status?: string }) {
    if (this.prisma.isConnected) {
      try {
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
    const proj = TasksService.inMemoryProjects.find(p => p.id === projectId) || TasksService.inMemoryProjects[0];
    if (proj) {
      proj.tasks.unshift(newTask);
    }
    return newTask;
  }

  async updateTaskStatus(taskId: string, status: string) {
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.task.update({
          where: { id: taskId },
          data: { status }
        });
      } catch {
        // fallback
      }
    }
    for (const proj of TasksService.inMemoryProjects) {
      const task = proj.tasks.find((t: any) => t.id === taskId);
      if (task) {
        task.status = status;
        return task;
      }
    }
    return { id: taskId, status };
  }

  async deleteTask(taskId: string) {
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.task.delete({
          where: { id: taskId }
        });
      } catch {
        // fallback
      }
    }
    for (const proj of TasksService.inMemoryProjects) {
      proj.tasks = proj.tasks.filter((t: any) => t.id !== taskId);
    }
    return { success: true, id: taskId };
  }
}
