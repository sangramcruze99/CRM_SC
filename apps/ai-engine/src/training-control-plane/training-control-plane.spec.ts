import { AgentRegistryService } from './registry/agent-registry.service';
import { DatasetPipelineService } from './datasets/dataset-pipeline.service';
import { EvaluationEngineService } from './evaluation/evaluation-engine.service';
import { ModelRegistryService } from './models/model-registry.service';
import { AgentFeedbackService } from './feedback/agent-feedback.service';

describe('Stage 7: AI Agent Training, Evaluation & Model Operations Platform', () => {
  let mockPrisma: any;
  let registryService: AgentRegistryService;
  let datasetService: DatasetPipelineService;
  let evalService: EvaluationEngineService;
  let modelService: ModelRegistryService;
  let feedbackService: AgentFeedbackService;

  const mockDb = {
    agents: new Map<string, any>(),
    versions: new Map<string, any>(),
    datasets: new Map<string, any>(),
    examples: [] as any[],
    goldenScenarios: new Map<string, any>(),
    evaluations: [] as any[],
    regressions: [] as any[],
    models: new Map<string, any>(),
    feedback: [] as any[],
  };

  beforeEach(async () => {
    mockDb.agents.clear();
    mockDb.versions.clear();
    mockDb.datasets.clear();
    mockDb.examples = [];
    mockDb.goldenScenarios.clear();
    mockDb.evaluations = [];
    mockDb.regressions = [];
    mockDb.models.clear();
    mockDb.feedback = [];

    mockPrisma = {
      agentRegistryEntry: {
        upsert: jest.fn().mockImplementation(({ where, update, create }) => {
          const item = { ...(mockDb.agents.get(where.agentId) || create), ...update };
          mockDb.agents.set(where.agentId, item);
          return Promise.resolve(item);
        }),
        findMany: jest.fn().mockImplementation(() => {
          return Promise.resolve(
            Array.from(mockDb.agents.values()).map((a) => ({
              ...a,
              versions: Array.from(mockDb.versions.values()).filter((v) => v.agentId === a.agentId),
              evaluations: mockDb.evaluations.filter((e) => e.agentId === a.agentId),
            })),
          );
        }),
        findUnique: jest.fn().mockImplementation(({ where }) => {
          const a = mockDb.agents.get(where.agentId);
          if (!a) return Promise.resolve(null);
          return Promise.resolve({
            ...a,
            versions: Array.from(mockDb.versions.values()).filter((v) => v.agentId === a.agentId),
            datasets: Array.from(mockDb.datasets.values()).filter((d) => d.agentId === a.agentId),
            evaluations: mockDb.evaluations.filter((e) => e.agentId === a.agentId),
            goldenScenarios: Array.from(mockDb.goldenScenarios.values()).filter((g) => g.agentId === a.agentId),
          });
        }),
        update: jest.fn().mockImplementation(({ where, data }) => {
          const a = mockDb.agents.get(where.agentId);
          const updated = { ...a, ...data };
          mockDb.agents.set(where.agentId, updated);
          return Promise.resolve(updated);
        }),
      },

      agentVersion: {
        upsert: jest.fn().mockImplementation(({ where, update, create }) => {
          const key = `${where.agentId_version.agentId}:${where.agentId_version.version}`;
          const item = { ...(mockDb.versions.get(key) || create), ...update };
          mockDb.versions.set(key, item);
          return Promise.resolve(item);
        }),
        create: jest.fn().mockImplementation(({ data }) => {
          const key = `${data.agentId}:${data.version}`;
          mockDb.versions.set(key, data);
          return Promise.resolve({ id: `ver_${Date.now()}`, ...data });
        }),
        findUnique: jest.fn().mockImplementation(({ where }) => {
          const key = `${where.agentId_version.agentId}:${where.agentId_version.version}`;
          return Promise.resolve(mockDb.versions.get(key) || null);
        }),
        update: jest.fn().mockImplementation(({ data }) => Promise.resolve(data)),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },

      agentDataset: {
        upsert: jest.fn().mockImplementation(({ where, update, create }) => {
          const item = { ...(mockDb.datasets.get(where.datasetId) || create), ...update };
          mockDb.datasets.set(where.datasetId, item);
          return Promise.resolve(item);
        }),
        findUnique: jest.fn().mockImplementation(({ where }) => {
          const d = mockDb.datasets.get(where.datasetId);
          if (!d) return Promise.resolve(null);
          return Promise.resolve({
            ...d,
            examples: mockDb.examples.filter((e) => e.datasetId === d.datasetId),
          });
        }),
        findFirst: jest.fn().mockImplementation(({ where }) => {
          const d = Array.from(mockDb.datasets.values()).find((x) => x.agentId === where.agentId);
          if (!d) return Promise.resolve(null);
          return Promise.resolve({
            ...d,
            examples: mockDb.examples.filter((e) => e.datasetId === d.datasetId),
          });
        }),
        findMany: jest.fn().mockImplementation(() => Promise.resolve(Array.from(mockDb.datasets.values()))),
        update: jest.fn().mockImplementation(({ where, data }) => {
          const d = mockDb.datasets.get(where.datasetId);
          const updated = { ...d, ...data };
          mockDb.datasets.set(where.datasetId, updated);
          return Promise.resolve(updated);
        }),
      },

      datasetExample: {
        create: jest.fn().mockImplementation(({ data }) => {
          const record = { id: `ex_${Date.now()}`, ...data };
          mockDb.examples.push(record);
          return Promise.resolve(record);
        }),
      },

      agentGoldenScenario: {
        upsert: jest.fn().mockImplementation(({ where, update, create }) => {
          const item = { ...(mockDb.goldenScenarios.get(where.scenarioId) || create), ...update };
          mockDb.goldenScenarios.set(where.scenarioId, item);
          return Promise.resolve(item);
        }),
        findMany: jest.fn().mockImplementation(({ where }) => {
          return Promise.resolve(
            Array.from(mockDb.goldenScenarios.values()).filter(
              (g) => !where?.agentId || g.agentId === where.agentId,
            ),
          );
        }),
      },

      agentEvaluationRun: {
        create: jest.fn().mockImplementation(({ data }) => {
          const record = { id: `run_${Date.now()}`, createdAt: new Date(), ...data };
          mockDb.evaluations.push(record);
          return Promise.resolve(record);
        }),
        findFirst: jest.fn().mockImplementation(({ where }) => {
          const r = mockDb.evaluations.find((e) => e.agentId === where.agentId);
          return Promise.resolve(r || null);
        }),
        findMany: jest.fn().mockImplementation(() => Promise.resolve(mockDb.evaluations)),
      },

      agentRegressionRun: {
        create: jest.fn().mockImplementation(({ data }) => {
          const record = { id: `regr_${Date.now()}`, executedAt: new Date(), ...data };
          mockDb.regressions.push(record);
          return Promise.resolve(record);
        }),
        findFirst: jest.fn().mockImplementation(({ where }) => {
          const r = mockDb.regressions.find((e) => e.agentId === where.agentId);
          return Promise.resolve(r || null);
        }),
      },

      modelRegistry: {
        upsert: jest.fn().mockImplementation(({ where, update, create }) => {
          const item = { ...(mockDb.models.get(where.modelId) || create), ...update };
          mockDb.models.set(where.modelId, item);
          return Promise.resolve(item);
        }),
        findUnique: jest.fn().mockImplementation(({ where }) => Promise.resolve(mockDb.models.get(where.modelId) || null)),
        findMany: jest.fn().mockImplementation(() => Promise.resolve(Array.from(mockDb.models.values()))),
        create: jest.fn().mockImplementation(({ data }) => {
          mockDb.models.set(data.modelId, data);
          return Promise.resolve(data);
        }),
        update: jest.fn().mockImplementation(({ where, data }) => {
          const m = mockDb.models.get(where.modelId);
          const updated = { ...m, ...data };
          mockDb.models.set(where.modelId, updated);
          return Promise.resolve(updated);
        }),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },

      agentResultFeedback: {
        create: jest.fn().mockImplementation(({ data }) => {
          const record = { id: `fb_${Date.now()}`, ...data };
          mockDb.feedback.push(record);
          return Promise.resolve(record);
        }),
        findUnique: jest.fn().mockImplementation(({ where }) => {
          return Promise.resolve(mockDb.feedback.find((f) => f.id === where.id) || null);
        }),
        findMany: jest.fn().mockImplementation(() => Promise.resolve(mockDb.feedback)),
        update: jest.fn().mockImplementation(({ where, data }) => {
          const idx = mockDb.feedback.findIndex((f) => f.id === where.id);
          if (idx !== -1) mockDb.feedback[idx] = { ...mockDb.feedback[idx], ...data };
          return Promise.resolve(mockDb.feedback[idx]);
        }),
      },

      agentExecution: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'exec-101',
          inputPrompt: 'Audit invoice INV-4091 overdue for $14,500.',
        }),
      },
    };

    registryService = new AgentRegistryService(mockPrisma as any);
    datasetService = new DatasetPipelineService(mockPrisma as any);
    evalService = new EvaluationEngineService(mockPrisma as any, registryService, datasetService);
    modelService = new ModelRegistryService(mockPrisma as any, registryService);
    feedbackService = new AgentFeedbackService(mockPrisma as any, datasetService);

    await registryService.onModuleInit();
    await datasetService.onModuleInit();
    await evalService.onModuleInit();
    await modelService.onModuleInit();
  });

  describe('1. Central Agent Registry & Versioning', () => {
    it('should register and seed all 10 production agents', async () => {
      const agents = await registryService.listAgents();
      expect(agents.length).toBe(10);

      const agentIds = agents.map((a) => a.agentId);
      expect(agentIds).toContain('ares');
      expect(agentIds).toContain('athena');
      expect(agentIds).toContain('midas');
      expect(agentIds).toContain('hermes');
      expect(agentIds).toContain('vesta');
      expect(agentIds).toContain('lead_qualification');
      expect(agentIds).toContain('recruitment');
      expect(agentIds).toContain('customer_support');
      expect(agentIds).toContain('ecommerce');
      expect(agentIds).toContain('content');
    });

    it('should maintain strict domain configurations for Midas, Recruitment, and Ares', async () => {
      const midas = await registryService.getAgent('midas');
      expect(midas.domain).toBe('FINANCE');
      expect(midas.allowedTools).toContain('get_overdue_invoices');
      expect(midas.allowedTools).toContain('create_payment_link');
      expect(midas.businessRules).toContain('Calculations must be performed by deterministic arithmetic, never inferred by LLM text generation.');

      const recruitment = await registryService.getAgent('recruitment');
      expect(recruitment.domain).toBe('HR');
      expect(recruitment.businessRules).toContain('Autonomous final hiring or rejection decisions are strictly prohibited.');

      const ares = await registryService.getAgent('ares');
      expect(ares.domain).toBe('SALES');
      expect(ares.allowedTools).toContain('search_crm_deals');
    });

    it('should create new versions and allow instant rollback', async () => {
      await registryService.createAgentVersion('midas', {
        version: '1.5.0-exp',
        changelog: 'Experimental fast invoice routing',
        model: 'groq/compound',
      });

      const rollbackRes = await registryService.rollbackToVersion('midas', '1.4.0', 'TEST_LEAD');
      expect(rollbackRes.success).toBe(true);
      expect(rollbackRes.currentVersion).toBe('1.4.0');
    });
  });

  describe('2. Dataset Pipeline & Sanitization', () => {
    it('should sanitize API keys, secrets, credit cards, and SSNs', () => {
      const raw = 'Invoice INV-100 with API key sk-live99887766554433221100 and secret: "super_secret_token" and card 4111-2222-3333-4444';
      const { cleaned, wasSanitized } = datasetService.sanitizeText(raw);

      expect(wasSanitized).toBe(true);
      expect(cleaned).not.toContain('sk-live99887766554433221100');
      expect(cleaned).toContain('[REDACTED_API_TOKEN]');
      expect(cleaned).not.toContain('4111-2222-3333-4444');
      expect(cleaned).toContain('[REDACTED_CARD_NUMBER]');
      // Preserves domain invoice identifier
      expect(cleaned).toContain('INV-100');
    });

    it('should enforce tenant isolation on datasets', async () => {
      await datasetService.createDataset({
        datasetId: 'tenant-a-dataset',
        agentId: 'midas',
        name: 'Tenant A Dataset',
        version: '1.0.0',
        purpose: 'EVALUATION',
        tenantId: 'tenant_A',
      });

      // Accessible by Tenant A
      const dsA = await datasetService.getDataset('tenant-a-dataset', 'tenant_A');
      expect(dsA.datasetId).toBe('tenant-a-dataset');

      // Blocked for Tenant B
      await expect(datasetService.getDataset('tenant-a-dataset', 'tenant_B')).rejects.toThrow('Unauthorized');
    });
  });

  describe('3. 12-Metric Evaluation Engine & Golden Scenarios', () => {
    it('should evaluate all 12 individual metrics without collapsing into a single score', async () => {
      const evalRes = await evalService.runEvaluation({
        agentId: 'midas',
      });

      expect(evalRes.metrics).toBeDefined();
      expect(evalRes.metrics.taskCorrectness).toBeGreaterThanOrEqual(0.85);
      expect(evalRes.metrics.groundingScore).toBeGreaterThanOrEqual(0.90);
      expect(evalRes.metrics.toolSelectionScore).toBeGreaterThanOrEqual(0.90);
      expect(evalRes.metrics.outputStructureScore).toBe(1.0);
      expect(evalRes.metrics.businessRuleCompliance).toBe(1.0);
      expect(evalRes.metrics.safetyScore).toBe(1.0);
      expect(evalRes.metrics.hallucinationRate).toBe(0.0);
      expect(evalRes.metrics.avgLatencyMs).toBeGreaterThan(0);
      expect(evalRes.metrics.costPerDecisionUsd).toBeLessThan(0.01);
      expect(evalRes.metrics.reliabilityRate).toBeGreaterThanOrEqual(0.90);
      expect(evalRes.goldenPassed).toBe(true);
      expect(evalRes.passedOverall).toBe(true);
    });

    it('should execute Midas Golden Test #001 with deterministic financial calculation', async () => {
      const golden = await evalService.listGoldenScenarios('midas');
      const test001 = golden.find((g) => g.scenarioId === 'MIDAS-GOLDEN-001');

      expect(test001).toBeDefined();
      expect(test001!.expectedResult.remainingBalance).toBe(3000);
      expect(test001!.expectedResult.paymentStatus).toBe('PARTIALLY_PAID');
    });

    it('should execute comparative regression runner and detect delta', async () => {
      const regr = await evalService.runRegressionTest({
        agentId: 'midas',
        baselineVersion: '1.3.0',
        candidateVersion: '1.4.0',
      });

      expect(regr.regressionId).toBeDefined();
      expect(regr.isApproved).toBe(true);
      expect(regr.isRegressed).toBe(false);
      expect(regr.diff).toBeDefined();
    });
  });

  describe('4. Model Registry, Deployment Gates & Rollback', () => {
    it('should enforce 5 mandatory deployment gates before production promotion', async () => {
      // Register candidate model
      await modelService.registerModel({
        modelId: 'midas-candidate-v1.5',
        baseModel: 'Qwen/Qwen2.5-7B-Instruct',
        provider: 'ollama',
        version: '1.5.0',
        agentId: 'midas',
      });

      // Verification fails before evaluation & regression exist
      const gateCheck = await modelService.verifyDeploymentGates('midas-candidate-v1.5', 'PRODUCTION');
      expect(gateCheck.canPromote).toBe(false);
      expect(gateCheck.reasons.length).toBeGreaterThan(0);

      // Verify promotion is blocked when gates fail
      await expect(
        modelService.promoteModel('midas-candidate-v1.5', 'PRODUCTION'),
      ).rejects.toThrow('Deployment Gate Violation');
    });

    it('should promote an approved model and allow instant rollback', async () => {
      // Simulate completed eval and regression for midas-gemma-v1.4
      await evalService.runEvaluation({ agentId: 'midas', agentVersion: '1.4.0' });
      await evalService.runRegressionTest({ agentId: 'midas', baselineVersion: '1.3.0', candidateVersion: '1.4.0' });

      const promo = await modelService.promoteModel('midas-gemma-v1.4', 'PRODUCTION', 'CHIEF_TECH_OFFICER');
      expect(promo.success).toBe(true);
      expect(promo.status).toBe('PRODUCTION');

      // Test rollback
      const rollback = await modelService.rollbackModel('midas', 'midas-gemma-v1.4', 'AUDIT_OFFICER');
      expect(rollback.success).toBe(true);
      expect(rollback.activeModelId).toBe('midas-gemma-v1.4');
    });
  });

  describe('5. Universal Agent Result Feedback Loop', () => {
    it('should capture structured feedback and promote to candidate dataset example', async () => {
      const fb = await feedbackService.submitFeedback({
        tenantId: 'tenant_123',
        executionId: 'exec-101',
        agentId: 'midas',
        userRating: 'INCORRECT',
        errorCategory: 'PAYMENT_STATUS',
        correctionValue: 'PARTIALLY_PAID',
        userNotes: 'Customer made partial ACH deposit of $2,000.',
        submittedBy: 'AR_ACCOUNTANT',
      });

      expect(fb.id).toBeDefined();
      expect(fb.isCandidateForDataset).toBe(true);

      // Promote to dataset candidate
      const promoted = await feedbackService.promoteFeedbackToDataset({
        feedbackId: fb.id,
        targetDatasetId: 'midas-eval-v1',
        reviewedBy: 'AI_DATA_ENGINEER',
      });

      expect(promoted.success).toBe(true);
      expect(promoted.exampleId).toBeDefined();

      // Verify example exists in dataset
      const ds = await datasetService.getDataset('midas-eval-v1');
      const addedExample = ds.examples.find((e) => e.exampleId === promoted.exampleId);
      expect(addedExample).toBeDefined();
      expect(addedExample?.riskLevel).toBe('HIGH');
      expect(addedExample?.isEdgeCase).toBe(true);
    });
  });
});
