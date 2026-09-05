import { AgentToolRegistryService } from './agent-tool-registry.service';

describe('AgentToolRegistryService', () => {
  let registry: AgentToolRegistryService;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = {
      toolDefinition: {
        upsert: jest.fn().mockResolvedValue({}),
      },
      toolExecution: {
        create: jest.fn().mockResolvedValue({ id: 'tool-exec-1' }),
        update: jest.fn().mockResolvedValue({}),
      },
      contact: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'c1', firstName: 'Elena', lastName: 'Rostova', email: 'elena@example.com' },
        ]),
        create: jest.fn().mockResolvedValue({ id: 'c2', firstName: 'John', email: 'john@example.com' }),
      },
      deal: {
        create: jest.fn().mockResolvedValue({ id: 'deal-101', title: 'Enterprise Expansion', amount: 50000 }),
        update: jest.fn().mockResolvedValue({ id: 'deal-101', stage: 'Proposal' }),
      },
      activity: {
        create: jest.fn().mockResolvedValue({ id: 'act-1' }),
      },
    };

    registry = new AgentToolRegistryService(mockPrisma);
    await registry.onModuleInit();
  });

  it('should initialize and register core business tools in memory', () => {
    const tools = registry.getTools();
    expect(tools.length).toBeGreaterThanOrEqual(10);

    const toolNames = tools.map((t) => t.name);
    expect(toolNames).toContain('search_crm_contacts');
    expect(toolNames).toContain('create_crm_contact');
    expect(toolNames).toContain('update_crm_contact');
    expect(toolNames).toContain('create_crm_deal');
    expect(toolNames).toContain('send_email');
    expect(toolNames).toContain('send_whatsapp');
    expect(toolNames).toContain('book_calendar');
  });

  it('should correctly classify tool risk levels', () => {
    const searchTool = registry.getTool('search_crm_contacts');
    expect(searchTool?.riskLevel).toBe('LOW');
    expect(searchTool?.requiresApproval).toBe(false);

    const emailTool = registry.getTool('send_email');
    expect(emailTool?.riskLevel).toBe('HIGH');
    expect(emailTool?.requiresApproval).toBe(true);

    const moveDealTool = registry.getTool('move_crm_deal');
    expect(moveDealTool?.riskLevel).toBe('HIGH');
    expect(moveDealTool?.requiresApproval).toBe(false);
  });

  it('should execute low-risk read tools without approval gates', async () => {
    const result = await registry.executeTool(
      'tenant-default',
      'search_crm_contacts',
      { query: 'Elena' },
    );

    expect(result.success).toBe(true);
    expect(result.output).toBeDefined();
    expect(result.output.contacts.length).toBe(1);
    expect(result.output.contacts[0].firstName).toBe('Elena');
  });
});
