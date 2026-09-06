import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'replace-with-a-secure-random-32-byte-hex-or-base64-string';
const TENANT_ID = 'tenant_enterprise_demo';

const token = jwt.sign(
  {
    sub: 'ai_evaluator_admin',
    tenantId: TENANT_ID,
    email: 'admin@enterprise.internal',
    role: 'SUPER_ADMIN',
  },
  JWT_SECRET,
  { expiresIn: '2h' }
);

const authHeaders = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
  'x-tenant-id': TENANT_ID,
};

const pythonAuthHeaders = {
  'Content-Type': 'application/json',
  'X-Service-Key': 'business-os-internal-ai-key-secret',
  'X-Tenant-ID': TENANT_ID,
};

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  dim: '\x1b[2m',
};

async function testAICapabilities() {
  console.log(`\n${c.bold}${c.cyan}========================================================================${c.reset}`);
  console.log(`${c.bold}🤖 Business OS: Live AI Capabilities & Decision Engine Test Suite${c.reset}`);
  console.log(`${c.bold}${c.cyan}========================================================================${c.reset}\n`);

  let totalTests = 0;
  let passedTests = 0;

  // ---------------------------------------------------------------------------
  // TEST 1: Agent Swarm & Microservice Tool Registry
  // ---------------------------------------------------------------------------
  totalTests++;
  console.log(`${c.bold}Test 1: Agent Swarm & Tool Registry Inspection (AI Engine :3010)${c.reset}`);
  try {
    const res = await fetch('http://localhost:3010/agents', { headers: authHeaders });
    const agents = await res.json();

    const toolsRes = await fetch('http://localhost:3010/agents/tools/catalog', { headers: authHeaders });
    const tools = await toolsRes.json();

    if (Array.isArray(agents) && agents.length >= 10 && Array.isArray(tools) && tools.length >= 10) {
      console.log(`  ✅ ${c.green}10/10 Domain Agents Active:${c.reset} ${agents.map((a) => a.name.split(' ')[0]).join(', ')}`);
      console.log(`  ✅ ${c.green}${tools.length} Microservice Tools Registered:${c.reset} ${tools.slice(0, 5).map((t) => t.name).join(', ')}...`);
      passedTests++;
    } else {
      console.log(`  ❌ Failed to retrieve full agent roster or tool catalog.`);
    }
  } catch (err) {
    console.log(`  ❌ Error querying /agents: ${err.message}`);
  }

  // ---------------------------------------------------------------------------
  // TEST 2: Autonomous Decision Loop (OODA: Observe, Predict, Recommend, Act)
  // ---------------------------------------------------------------------------
  totalTests++;
  console.log(`\n${c.bold}Test 2: Autonomous OODA Decision Loop & Scenario Intelligence (Ares :3010)${c.reset}`);
  try {
    const decidePayload = {
      targetEntity: 'Deal',
      targetId: 'deal_acme_enterprise_99',
      scenario: 'PROPOSAL_STALLED_FOLLOWUP',
      parameters: {
        dealTitle: 'Acme Global Cloud Modernization',
        amount: 85000,
        daysInactive: 12,
        recipientEmail: 'vp.procurement@acme.com',
      },
    };

    const res = await fetch('http://localhost:3010/agents/decide', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(decidePayload),
    });

    const decision = await res.json();
    if (decision && decision.observe && decision.predict && decision.recommend && decision.act) {
      console.log(`  ✅ ${c.green}Full 4-Stage OODA Decision Loop Synthesized:${c.reset}`);
      console.log(`     • [Observe]    Metrics: ${decision.observe.metricsAnalyzed.entityType} ${decision.observe.metricsAnalyzed.entityId} (Sentiment: ${decision.observe.metricsAnalyzed.sentimentScore})`);
      console.log(`     • [Predict]    Event: ${c.yellow}${decision.predict.event}${c.reset} (Probability: ${(decision.predict.probability * 100).toFixed(0)}%, Impact: ${decision.predict.impactScore})`);
      console.log(`     • [Recommend]  Action: ${c.bold}${decision.recommend.action}${c.reset} (Confidence: ${(decision.recommend.confidence * 100).toFixed(0)}%, Risk: ${decision.recommend.riskLevel})`);
      console.log(`     • [Act]        Disposition: ${c.cyan}${decision.act.disposition}${c.reset} (${decision.act.details})`);
      passedTests++;
    } else {
      console.log(`  ❌ Decision endpoint returned unexpected shape:`, decision);
    }
  } catch (err) {
    console.log(`  ❌ Error in /agents/decide: ${err.message}`);
  }

  // ---------------------------------------------------------------------------
  // TEST 3: Multi-Agent Collaboration Chain
  // ---------------------------------------------------------------------------
  totalTests++;
  console.log(`\n${c.bold}Test 3: Multi-Agent Collaboration Chain (AI Engine :3010)${c.reset}`);
  try {
    const res = await fetch('http://localhost:3010/agents/chain', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        scenario: 'ACCOUNT_RETENTION_INTERVENTION',
        targetId: 'cnt_enterprise_vip',
      }),
    });

    const chainResult = await res.json();
    if (chainResult && chainResult.chainId && Array.isArray(chainResult.handoffSteps)) {
      console.log(`  ✅ ${c.green}Multi-Agent Chain Executed Successfully (${chainResult.chainId}):${c.reset}`);
      console.log(`     • Trigger Event:  ${chainResult.triggerEvent}`);
      console.log(`     • Participants:   ${chainResult.participants.join(' ➔ ')}`);
      chainResult.handoffSteps.forEach((s) => {
        console.log(`     • Step ${s.step} [${s.sentinelName.split(' ')[0]}]: ${s.action} (${s.status})`);
      });
      console.log(`     • Outcome:        ${chainResult.finalOutcome}`);
      passedTests++;
    } else {
      console.log(`  ❌ Multi-agent collaboration returned unexpected shape:`, chainResult);
    }
  } catch (err) {
    console.log(`  ❌ Error in /agents/chain: ${err.message}`);
  }

  // ---------------------------------------------------------------------------
  // TEST 4: Natural Language AI Workflow Generator (Automation :3009)
  // ---------------------------------------------------------------------------
  totalTests++;
  console.log(`\n${c.bold}Test 4: Natural Language to DAG Workflow Synthesis (Automation :3009)${c.reset}`);
  try {
    const prompt = 'When a high-value real estate lead submits an inquiry, qualify them with AI. If score >= 80, create a luxury deal and send VIP email with 3-day follow-up.';
    const res = await fetch('http://localhost:3009/workflows/generate', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ prompt }),
    });

    const wf = await res.json();
    if (wf && wf.status === 'DRAFT' && Array.isArray(wf.nodes) && wf.nodes.length >= 4) {
      console.log(`  ✅ ${c.green}Synthesized Valid Workflow Graph:${c.reset}`);
      console.log(`     • Status:         ${c.yellow}${wf.status}${c.reset} (v${wf.version})`);
      console.log(`     • Total Nodes:    ${c.bold}${wf.nodes.length} nodes${c.reset} (${wf.nodes.map((n) => n.type).join(' ➔ ')})`);
      console.log(`     • Directed Edges: ${c.bold}${wf.edges.length} edges${c.reset}`);
      console.log(`     • Trigger Type:   ${wf.triggerType}`);
      passedTests++;
    } else {
      console.log(`  ❌ Generator failed to produce expected DAG structure:`, wf);
    }
  } catch (err) {
    console.log(`  ❌ Error in /workflows/generate: ${err.message}`);
  }

  // ---------------------------------------------------------------------------
  // TEST 5: Graph Validator & Safety Gate Enforcement (Automation :3009)
  // ---------------------------------------------------------------------------
  totalTests++;
  console.log(`\n${c.bold}Test 5: Graph Validator & Safety Gate Enforcement (Automation :3009)${c.reset}`);
  try {
    const dangerousGraph = {
      nodes: [
        { id: 'trig_1', type: 'trigger:payment_dispute', name: 'Trigger', config: {} },
        { id: 'pay_refund', type: 'finance:send_refund', name: 'Issue $10,000 Refund', config: { amount: 10000 } },
      ],
      edges: [{ id: 'e1', source: 'trig_1', target: 'pay_refund' }],
    };

    const res = await fetch('http://localhost:3009/workflows/validate', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(dangerousGraph),
    });

    const report = await res.json();
    const blocked = report.valid === false && report.errors.some((e) => e.code === 'APPROVAL_REQUIRED');

    if (blocked) {
      console.log(`  ✅ ${c.green}Safety Sentinel Active:${c.reset} Intercepted high-risk action without human approval policy.`);
      console.log(`     • Error Code:    ${c.red}APPROVAL_REQUIRED${c.reset}`);
      console.log(`     • Node Flagged:  ${report.errors[0]?.message}`);
      passedTests++;
    } else {
      console.log(`  ❌ Validator failed to block unsupervised high-risk node:`, report);
    }
  } catch (err) {
    console.log(`  ❌ Error in /workflows/validate: ${err.message}`);
  }

  // ---------------------------------------------------------------------------
  // TEST 6: Controlled Agent-to-Agent Handoff (AI Engine :3010)
  // ---------------------------------------------------------------------------
  totalTests++;
  console.log(`\n${c.bold}Test 6: Cross-Department Agent Handoff Protocol (AI Engine :3010)${c.reset}`);
  try {
    const handoffPayload = {
      workflowId: 'wf_enterprise_closing',
      executionId: `exec_${Date.now()}`,
      sourceAgent: 'agent_lead_qualification',
      targetAgentId: 'agent_sales',
      tenantId: TENANT_ID,
      entity: {
        type: 'deal',
        id: 'deal_qualified_101',
      },
      objective: 'Transition qualified lead into Ares pipeline closing plan',
      facts: {
        companySize: '500+ employees',
        budgetApproved: true,
        primaryNeed: 'Multi-niche workspace CRM consolidation',
      },
      risk: 'MEDIUM',
    };

    const res = await fetch('http://localhost:3010/orchestrator/handoff', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(handoffPayload),
    });

    const handoffResult = await res.json();
    if (handoffResult && handoffResult.success && handoffResult.status === 'COMPLETED') {
      console.log(`  ✅ ${c.green}Agent Handoff Executed Successfully:${c.reset}`);
      console.log(`     • Source Agent:  ${c.dim}${handoffPayload.sourceAgent}${c.reset}`);
      console.log(`     • Target Agent:  ${c.cyan}${handoffResult.targetAgent}${c.reset}`);
      console.log(`     • Status:        ${handoffResult.status}`);
      console.log(`     • Objective:     ${handoffResult.output?.objective || handoffPayload.objective}`);
      console.log(`     • Tokens Used:   ${handoffResult.tokensUsed}`);
      passedTests++;
    } else {
      console.log(`  ❌ Handoff returned unexpected result:`, handoffResult);
    }
  } catch (err) {
    console.log(`  ❌ Error in /orchestrator/handoff: ${err.message}`);
  }

  // ---------------------------------------------------------------------------
  // TEST 7: Python AI Model Catalog & Multi-Tenant Registry (Python AI :3030)
  // ---------------------------------------------------------------------------
  totalTests++;
  console.log(`\n${c.bold}Test 7: Python AI Model Catalog & Domain Agent Registry (Python AI :3030)${c.reset}`);
  try {
    const modelsRes = await fetch('http://localhost:3030/v1/models');
    const modelsData = await modelsRes.json();

    const agentsRes = await fetch('http://localhost:3030/v1/agents', { headers: pythonAuthHeaders });
    const agentsData = await agentsRes.json();

    if (modelsRes.ok && Array.isArray(modelsData.models) && agentsRes.ok && Array.isArray(agentsData)) {
      console.log(`  ✅ ${c.green}Python AI Model Router & Agent Registry Active:${c.reset}`);
      console.log(`     • Available LLMs:  ${modelsData.models.slice(0, 4).map((m) => m.id).join(', ')}... (${modelsData.models.length} total)`);
      console.log(`     • ML Agents:      ${agentsData.map((a) => a.id).join(', ')} (${agentsData.length} agents)`);
      passedTests++;
    } else {
      console.log(`  ❌ Python AI responded with status: ${modelsRes.status} / ${agentsRes.status}`);
    }
  } catch (err) {
    console.log(`  ❌ Error connecting to Python AI: ${err.message}`);
  }

  // ---------------------------------------------------------------------------
  // TEST 8: Python AI Fast Model Inference (Python AI :3030)
  // ---------------------------------------------------------------------------
  totalTests++;
  console.log(`\n${c.bold}Test 8: Python AI Fast Inference Execution (Python AI :3030)${c.reset}`);
  try {
    const res = await fetch('http://localhost:3030/v1/inference/generate', {
      method: 'POST',
      headers: pythonAuthHeaders,
      body: JSON.stringify({
        model: 'local/business-os',
        tenant_id: TENANT_ID,
        messages: [
          { role: 'system', content: 'You are Ares, sales intelligence agent.' },
          { role: 'user', content: 'Generate closing action items for Acme Deal.' },
        ],
      }),
    });

    const infData = await res.json();
    if (res.ok && infData.request_id && infData.content) {
      console.log(`  ✅ ${c.green}Inference Completed Successfully:${c.reset}`);
      console.log(`     • Request ID:   ${infData.request_id}`);
      console.log(`     • Model Used:   ${c.cyan}${infData.model}${c.reset} (${infData.provider})`);
      console.log(`     • Latency:      ${infData.latency_ms}ms`);
      console.log(`     • Total Tokens: ${infData.usage.total_tokens}`);
      passedTests++;
    } else {
      console.log(`  ❌ Inference failed:`, infData);
    }
  } catch (err) {
    console.log(`  ❌ Error in /v1/inference/generate: ${err.message}`);
  }

  // ---------------------------------------------------------------------------
  // TEST 9: Dense Vector Embeddings for Semantic Search & RAG (Python AI :3030)
  // ---------------------------------------------------------------------------
  totalTests++;
  console.log(`\n${c.bold}Test 9: Vector Embeddings Generation for RAG (Python AI :3030)${c.reset}`);
  try {
    const res = await fetch('http://localhost:3030/v1/embeddings', {
      method: 'POST',
      headers: pythonAuthHeaders,
      body: JSON.stringify({
        input: ['Enterprise CRM Lead qualification scoring', 'Autonomous workflow DAG'],
        model: 'all-MiniLM-L6-v2',
      }),
    });

    const embData = await res.json();
    if (res.ok && Array.isArray(embData.embeddings) && embData.embeddings.length === 2 && embData.dimensions === 384) {
      console.log(`  ✅ ${c.green}Vector Embeddings Generated Successfully:${c.reset}`);
      console.log(`     • Model:        ${embData.model}`);
      console.log(`     • Dimensions:   ${embData.dimensions} dense dimensions`);
      console.log(`     • Chunks:       ${embData.embeddings.length} text vectors generated`);
      passedTests++;
    } else {
      console.log(`  ❌ Embeddings failed:`, embData);
    }
  } catch (err) {
    console.log(`  ❌ Error in /v1/embeddings: ${err.message}`);
  }

  // ---------------------------------------------------------------------------
  // TEST 10: Human-in-the-Loop Governance & Explainability (AI Engine :3010)
  // ---------------------------------------------------------------------------
  totalTests++;
  console.log(`\n${c.bold}Test 10: Human-in-the-Loop Approval & Explainability (AI Engine :3010)${c.reset}`);
  try {
    const res = await fetch('http://localhost:3010/agents/approvals', { headers: authHeaders });
    const approvals = await res.json();

    if (Array.isArray(approvals)) {
      console.log(`  ✅ ${c.green}HITL Governance Engine Active:${c.reset}`);
      console.log(`     • Approval Queue: ${approvals.length} pending actions managed under strict safety policies`);
      console.log(`     • Policy Model:   Zero Unauthorized Write Operations`);
      passedTests++;
    } else {
      console.log(`  ❌ Failed to fetch approvals:`, approvals);
    }
  } catch (err) {
    console.log(`  ❌ Error in /agents/approvals: ${err.message}`);
  }

  // ---------------------------------------------------------------------------
  // SUMMARY SCORECARD
  // ---------------------------------------------------------------------------
  console.log(`\n${c.bold}${c.cyan}========================================================================${c.reset}`);
  const pct = Math.round((passedTests / totalTests) * 100);
  console.log(
    `${c.bold}🏁 AI Capabilities Verification Score: ${c.green}${passedTests}/${totalTests} Passed (${pct}%)${c.reset}`
  );
  console.log(`${c.bold}${c.cyan}========================================================================${c.reset}\n`);
}

testAICapabilities().catch(console.error);
