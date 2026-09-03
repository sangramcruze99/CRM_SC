import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PluginsService implements OnModuleInit {
  private static inMemoryPlugins: any[] = [
    { id: 'plug_1', name: 'Advanced CRM', description: 'Enterprise CRM features including forecasting.', version: '2.0.0', price: 99 },
    { id: 'plug_2', name: 'Email Marketing', description: 'Campaign builder and mass emailing.', version: '1.5.0', price: 49 },
    { id: 'plug_3', name: 'AI Sales Assistant', description: 'AI-powered meeting summarizer and lead scoring.', version: '1.0.0', price: 149 },
    { id: 'plug_4', name: 'Slack Integration', description: 'Connect workflows directly to Slack channels.', version: '1.2.1', price: 0 },
  ];
  private static inMemoryInstalled: any[] = [];

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    if (this.prisma.isConnected) {
      try {
        const count = await this.prisma.plugin.count();
        if (count === 0) {
          await this.prisma.plugin.createMany({
            data: PluginsService.inMemoryPlugins,
          });
        }
      } catch {
        // ignore
      }
    }
  }

  async findAll(tenantId: string) {
    if (this.prisma.isConnected) {
      try {
        const plugins = await this.prisma.plugin.findMany();
        const installed = await this.prisma.installedPlugin.findMany({
          where: { tenantId }
        });
        
        return plugins.map(plugin => ({
          ...plugin,
          isInstalled: installed.some(ip => ip.pluginId === plugin.id),
          installedAt: installed.find(ip => ip.pluginId === plugin.id)?.createdAt
        }));
      } catch {
        // fallback
      }
    }

    return PluginsService.inMemoryPlugins.map(plugin => ({
      ...plugin,
      isInstalled: PluginsService.inMemoryInstalled.some(ip => ip.tenantId === tenantId && ip.pluginId === plugin.id),
      installedAt: PluginsService.inMemoryInstalled.find(ip => ip.tenantId === tenantId && ip.pluginId === plugin.id)?.createdAt
    }));
  }

  async install(tenantId: string, pluginId: string) {
    if (this.prisma.isConnected) {
      try {
        const installed = await this.prisma.installedPlugin.findFirst({
          where: { tenantId, pluginId }
        });
        
        if (!installed) {
          return await this.prisma.installedPlugin.create({
            data: { tenantId, pluginId }
          });
        }
        return installed;
      } catch {
        // fallback
      }
    }

    let installed = PluginsService.inMemoryInstalled.find(ip => ip.tenantId === tenantId && ip.pluginId === pluginId);
    if (!installed) {
      installed = { id: `inst_${Date.now()}`, tenantId, pluginId, createdAt: new Date() };
      PluginsService.inMemoryInstalled.push(installed);
    }
    return installed;
  }

  async uninstall(tenantId: string, pluginId: string) {
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.installedPlugin.deleteMany({
          where: { tenantId, pluginId }
        });
      } catch {
        // fallback
      }
    }

    PluginsService.inMemoryInstalled = PluginsService.inMemoryInstalled.filter(
      ip => !(ip.tenantId === tenantId && ip.pluginId === pluginId)
    );
    return { count: 1 };
  }
}
