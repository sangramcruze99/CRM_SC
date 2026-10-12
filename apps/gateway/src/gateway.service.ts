import { Injectable, Logger } from '@nestjs/common';

export interface ServiceRouteConfig {
  name: string;
  targetUrl: string;
  isCore: boolean;
  rateLimit: number; // requests per minute
}

@Injectable()
export class GatewayService {
  private readonly logger = new Logger(GatewayService.name);

  private readonly routingMesh: Record<string, ServiceRouteConfig> = {
    crm: { name: 'crm', targetUrl: 'http://localhost:3001', isCore: true, rateLimit: 600 },
    sales: { name: 'sales', targetUrl: 'http://localhost:3005', isCore: true, rateLimit: 600 },
    platform: { name: 'platform', targetUrl: 'http://localhost:3008', isCore: true, rateLimit: 600 },
    automation: { name: 'automation', targetUrl: 'http://localhost:3009', isCore: true, rateLimit: 600 },
    ai: { name: 'ai-engine', targetUrl: 'http://localhost:3010', isCore: true, rateLimit: 300 },
    auth: { name: 'auth', targetUrl: 'http://localhost:3011', isCore: true, rateLimit: 120 },
    marketplace: { name: 'marketplace', targetUrl: 'http://localhost:3012', isCore: false, rateLimit: 300 },
    bi: { name: 'bi-engine', targetUrl: 'http://localhost:3013', isCore: false, rateLimit: 300 },
    chat: { name: 'chat', targetUrl: 'http://localhost:3014', isCore: true, rateLimit: 1200 },
    finance: { name: 'finance', targetUrl: 'http://localhost:3015', isCore: true, rateLimit: 600 },
    helpdesk: { name: 'helpdesk', targetUrl: 'http://localhost:3016', isCore: false, rateLimit: 300 },
    projects: { name: 'projects', targetUrl: 'http://localhost:3017', isCore: false, rateLimit: 300 },
    hr: { name: 'hr', targetUrl: 'http://localhost:3018', isCore: false, rateLimit: 300 },
    search: { name: 'search', targetUrl: 'http://localhost:3019', isCore: false, rateLimit: 600 },
    documents: { name: 'documents', targetUrl: 'http://localhost:3020', isCore: true, rateLimit: 300 },
    admin: { name: 'admin', targetUrl: 'http://localhost:3021', isCore: false, rateLimit: 120 },
    developer: { name: 'developer', targetUrl: 'http://localhost:3022', isCore: false, rateLimit: 300 },
    audit: { name: 'audit', targetUrl: 'http://localhost:3023', isCore: false, rateLimit: 1200 },
    cms: { name: 'cms', targetUrl: 'http://localhost:3024', isCore: false, rateLimit: 300 },
    settings: { name: 'settings', targetUrl: 'http://localhost:3025', isCore: false, rateLimit: 300 },
    inventory: { name: 'inventory', targetUrl: 'http://localhost:3026', isCore: false, rateLimit: 600 },
    billing: { name: 'billing', targetUrl: 'http://localhost:3027', isCore: true, rateLimit: 300 },
    notifications: { name: 'notifications', targetUrl: 'http://localhost:3028', isCore: true, rateLimit: 1200 },
    portal: { name: 'portal', targetUrl: 'http://localhost:3029', isCore: false, rateLimit: 300 },
    'python-ai': { name: 'python-ai', targetUrl: 'http://localhost:3030', isCore: true, rateLimit: 120 },
    storage: { name: 'storage', targetUrl: 'http://localhost:3031', isCore: false, rateLimit: 300 },
    events: { name: 'events', targetUrl: 'http://localhost:3032', isCore: true, rateLimit: 1200 },
  };

  getRoutingMesh() {
    return this.routingMesh;
  }

  resolveTarget(serviceKey: string): ServiceRouteConfig | undefined {
    return this.routingMesh[serviceKey.toLowerCase()];
  }

  getMeshHealth() {
    return {
      status: 'HEALTHY',
      gatewayPort: 3000,
      totalRegisteredNodes: Object.keys(this.routingMesh).length,
      routes: Object.keys(this.routingMesh),
      timestamp: new Date().toISOString(),
    };
  }
}
