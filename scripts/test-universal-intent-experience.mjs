// scripts/test-universal-intent-experience.mjs
// End-to-End Verification Suite for Universal Intent & Outcome Layer

import http from 'http';

const AUTOMATION_URL = process.env.AUTOMATION_URL || 'http://localhost:3009';
const API_KEY = process.env.API_KEY || 'ee03f6bc2fba450fdf6d080ae6c8c919';
const TENANT_ID = 'default-tenant';

function makeRequest(method, path, body = null, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, AUTOMATION_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'x-tenant-id': TENANT_ID,
        ...extraHeaders,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

const isOk = (status) => status >= 200 && status < 300;

async function runTests() {
  console.log('============================================================');
  console.log('UNIVERSAL INTENT & OUTCOME LAYER: VERIFICATION SUITE');
  console.log('============================================================\n');

  let passed = 0;
  let failed = 0;

  // TEST 0: Domain Configuration Packs
  try {
    console.log('TEST 0: Domain Configuration Packs Retrieval');
    const res = await makeRequest('GET', '/intent/domains');
    if (isOk(res.status) && Array.isArray(res.data) && res.data.length >= 9) {
      console.log(`✅ Passed: Retrieved ${res.data.length} domain configuration packs.`);
      const domains = res.data.map((d) => d.id).join(', ');
      console.log(`   Domains: ${domains}`);
      passed++;
    } else {
      console.error(`❌ Failed: Unexpected response status ${res.status}`, res.data);
      failed++;
    }
  } catch (err) {
    console.error(`❌ Error in TEST 0:`, err.message);
    failed++;
  }

  // TEST 1: RECRUITMENT DOMAIN
  // Prompt: Graduate, CGPA 3.0+, 2 years experience, at least 5 of these 8 skills
  let recruitmentIntent = null;
  try {
    console.log('\nTEST 1: Recruitment Intent Parsing & DAG Compilation');
    const prompt =
      'I need a graduate with CGPA 3.00 or above, at least 2 years relevant experience, and at least 5 of these 8 skills: MS Office, Excel, Word, PowerPoint, Google Sheets, Communication, Reporting, Data Entry. Accounting software experience is preferred.';
    const parseRes = await makeRequest('POST', '/intent/parse', { prompt, domain: 'recruitment' });

    if (isOk(parseRes.status) && parseRes.data.goal) {
      recruitmentIntent = parseRes.data;
      console.log(`✅ Intent Parsed Successfully:`);
      console.log(`   • Goal: "${recruitmentIntent.goal}"`);
      console.log(`   • Domain: ${recruitmentIntent.domainName} (${recruitmentIntent.domain})`);

      const ruleGroup = recruitmentIntent.ruleGroups?.[0];
      const atLeastN = ruleGroup?.atLeastNRules?.[0];
      console.log(`   • At-Least-N Rule: ${atLeastN ? `${atLeastN.threshold} of ${atLeastN.total} skills` : 'None'}`);
      console.log(`   • Skills: ${atLeastN?.items.slice(0, 4).join(', ')}... (${atLeastN?.items.length} total)`);
      console.log(`   • Result Destination: ${recruitmentIntent.resultDestination?.name}`);

      // Compile to DAG
      const compileRes = await makeRequest('POST', '/intent/compile', { intent: recruitmentIntent });
      if (isOk(compileRes.status) && compileRes.data.nodes?.length >= 3) {
        console.log(`✅ Compiled to Workflow DAG:`);
        console.log(`   • Nodes (${compileRes.data.nodes.length}): ${compileRes.data.nodes.map((n) => n.name).join(' → ')}`);
        console.log(`   • Edges: ${compileRes.data.edges.length}`);
        passed++;
      } else {
        console.error(`❌ Compile failed:`, compileRes.data);
        failed++;
      }
    } else {
      console.error(`❌ Parse failed:`, parseRes.data);
      failed++;
    }
  } catch (err) {
    console.error(`❌ Error in TEST 1:`, err.message);
    failed++;
  }

  // TEST 2: AI FRONT DESK / RECEPTIONIST
  // Prompt: Handle after-hours calls and book appointments. Transfer complicated calls to a human.
  try {
    console.log('\nTEST 2: AI Front Desk Intent (After-hours Calls & Appointment Booking)');
    const prompt =
      'Handle after-hours calls and book appointments. Transfer complicated calls to a human.';
    const parseRes = await makeRequest('POST', '/intent/parse', { prompt, domain: 'front_desk' });

    if (isOk(parseRes.status) && parseRes.data.domain === 'front_desk') {
      const intent = parseRes.data;
      console.log(`✅ Front Desk Intent Parsed:`);
      console.log(`   • Timing Window: ${intent.trigger.timing}`);
      console.log(`   • Actions: ${intent.actions.map((a) => a.name).join(', ')}`);
      console.log(`   • Escalation / Exception: ${intent.exceptions.onUncertain}`);

      const compileRes = await makeRequest('POST', '/intent/compile', { intent });
      if (isOk(compileRes.status) && compileRes.data.nodes.some((n) => n.type.includes('voice') || n.type.includes('call'))) {
        console.log(`✅ Compiled to Voice Receptionist DAG:`);
        console.log(`   • Trigger: ${compileRes.data.nodes[0]?.name}`);
        console.log(`   • Flow: ${compileRes.data.nodes.map((n) => n.name).join(' → ')}`);
        passed++;
      } else {
        console.error(`❌ Compilation missing voice nodes:`, compileRes.data);
        failed++;
      }
    } else {
      console.error(`❌ Front desk parse failed:`, parseRes.data);
      failed++;
    }
  } catch (err) {
    console.error(`❌ Error in TEST 2:`, err.message);
    failed++;
  }

  // TEST 3: SALES / CRM
  // Prompt: When a new lead arrives, score it. If highly interested, contact immediately. If no response after 2 days, follow up.
  try {
    console.log('\nTEST 3: Sales Lead Nurturing & Automated Follow-up Intent');
    const prompt =
      'When a new lead arrives, score it. If highly interested, contact immediately. If no response after 2 days, follow up.';
    const parseRes = await makeRequest('POST', '/intent/parse', { prompt, domain: 'sales' });

    if (isOk(parseRes.status) && parseRes.data.domain === 'sales') {
      const intent = parseRes.data;
      console.log(`✅ Sales Intent Parsed:`);
      console.log(`   • Lead Trigger: ${intent.trigger.description}`);
      console.log(`   • Rule Priority: ${intent.ruleGroups[0]?.rules[0]?.priority || 'REQUIRED'}`);
      console.log(`   • Follow-up Timing: ${intent.timing.delay || '2 days'}`);

      const compileRes = await makeRequest('POST', '/intent/compile', { intent });
      if (isOk(compileRes.status) && compileRes.data.nodes.some((n) => n.type.includes('sales') || n.type.includes('delay') || n.type.includes('crm'))) {
        console.log(`✅ Compiled to Sales Lead DAG:`);
        console.log(`   • Nodes: ${compileRes.data.nodes.map((n) => n.name).join(' → ')}`);
        passed++;
      } else {
        console.error(`❌ Sales DAG compilation incomplete:`, compileRes.data);
        failed++;
      }
    } else {
      console.error(`❌ Sales parse failed:`, parseRes.data);
      failed++;
    }
  } catch (err) {
    console.error(`❌ Error in TEST 3:`, err.message);
    failed++;
  }

  // TEST 4: FINANCE & ACCOUNTING
  // Prompt: Process invoices automatically, but require approval over $5,000.
  let financeIntent = null;
  try {
    console.log('\nTEST 4: Finance Automated Invoice Processing with $5,000 Approval Gate');
    const prompt = 'Process invoices automatically, but require approval over $5,000.';
    const parseRes = await makeRequest('POST', '/intent/parse', { prompt, domain: 'finance' });

    if (isOk(parseRes.status) && parseRes.data.domain === 'finance') {
      financeIntent = parseRes.data;
      console.log(`✅ Finance Intent Parsed:`);
      console.log(`   • Goal: "${financeIntent.goal}"`);
      console.log(`   • Approval Required: ${financeIntent.approvalPolicy.required}`);
      console.log(`   • Approval Threshold: $${financeIntent.approvalPolicy.thresholdAmount?.toLocaleString()}`);
      console.log(`   • Reviewer Role: ${financeIntent.approvalPolicy.reviewerRole}`);

      const compileRes = await makeRequest('POST', '/intent/compile', { intent: financeIntent });
      if (isOk(compileRes.status) && compileRes.data.nodes.some((n) => n.type.includes('approval') || n.type.includes('condition'))) {
        console.log(`✅ Compiled to Finance Workflow DAG:`);
        console.log(`   • Branching nodes created: ${compileRes.data.nodes.map((n) => n.name).join(' → ')}`);
        passed++;
      } else {
        console.error(`❌ Finance DAG compilation missing approval node:`, compileRes.data);
        failed++;
      }
    } else {
      console.error(`❌ Finance parse failed:`, parseRes.data);
      failed++;
    }
  } catch (err) {
    console.error(`❌ Error in TEST 4:`, err.message);
    failed++;
  }

  // TEST 5: CUSTOMER SUPPORT
  // Prompt: If the customer is frustrated or the AI is unsure, escalate to human.
  try {
    console.log('\nTEST 5: Support Sentiment Analysis & Live Human Escalation Intent');
    const prompt = 'If the customer is frustrated or the AI is unsure, escalate to human.';
    const parseRes = await makeRequest('POST', '/intent/parse', { prompt, domain: 'support' });

    if (isOk(parseRes.status) && parseRes.data.domain === 'support') {
      const intent = parseRes.data;
      console.log(`✅ Support Intent Parsed:`);
      console.log(`   • Exception Handling: ${intent.exceptions.onUncertain}`);
      console.log(`   • Result Destination: ${intent.resultDestination.name}`);
      console.log(`   • Actions: ${intent.actions.map((a) => a.name).join(', ')}`);

      const compileRes = await makeRequest('POST', '/intent/compile', { intent });
      if (isOk(compileRes.status) && compileRes.data.nodes.length >= 3) {
        console.log(`✅ Compiled to Support Escalation DAG:`);
        console.log(`   • Nodes: ${compileRes.data.nodes.map((n) => n.name).join(' → ')}`);
        passed++;
      } else {
        console.error(`❌ Support DAG compilation error:`, compileRes.data);
        failed++;
      }
    } else {
      console.error(`❌ Support parse failed:`, parseRes.data);
      failed++;
    }
  } catch (err) {
    console.error(`❌ Error in TEST 5:`, err.message);
    failed++;
  }

  // TEST 6: SIMULATION SUITE
  // Run explainable test simulations on Recruitment & Finance
  try {
    console.log('\nTEST 6: Explainable Step-by-Step Simulation (Recruitment & Finance)');

    if (recruitmentIntent) {
      console.log('   Simulating Candidate Application (CGPA 3.42, 3 yrs exp, 6 skills)...');
      const simRes = await makeRequest('POST', '/intent/simulate', {
        intent: recruitmentIntent,
        mockInput: {
          candidateName: 'Sarah Jenkins',
          cgpa: 3.42,
          experienceYears: 3,
          skills: ['Excel', 'MS Office', 'Communication', 'Reporting', 'Data Entry', 'Google Sheets'],
        },
      });

      if (isOk(simRes.status) && simRes.data.steps?.length >= 3) {
        console.log(`   ✅ Recruitment Simulation Passed:`);
        console.log(`      • Status: ${simRes.data.overallStatus}`);
        console.log(`      • Summary: ${simRes.data.finalSummary}`);
        console.log(`      • Steps Executed:`);
        simRes.data.steps.forEach((s) => {
          console.log(`        Step ${s.stepNumber} [${s.phase}]: ${s.title} (${s.outcome})`);
        });
      } else {
        console.error('   ❌ Recruitment simulation failed:', simRes.data);
      }
    }

    if (financeIntent) {
      console.log('\n   Simulating Invoice Approval ($7,500 > $5,000 threshold)...');
      const simHigh = await makeRequest('POST', '/intent/simulate', {
        intent: financeIntent,
        mockInput: {
          invoiceNumber: 'INV-9921',
          vendorName: 'Cloud Infrastructure Corp',
          amount: 7500,
        },
      });

      console.log('   Simulating Invoice Auto-Processing ($3,200 <= $5,000 threshold)...');
      const simLow = await makeRequest('POST', '/intent/simulate', {
        intent: financeIntent,
        mockInput: {
          invoiceNumber: 'INV-9922',
          vendorName: 'Office Depot',
          amount: 3200,
        },
      });

      if (
        isOk(simHigh.status) &&
        isOk(simLow.status) &&
        (simHigh.data.overallStatus === 'SUCCESS_APPROVED' || simHigh.data.overallStatus === 'ESCALATED_HUMAN') &&
        simLow.data.overallStatus === 'SUCCESS_AUTO'
      ) {
        console.log(`   ✅ Finance Dual-Branch Simulation Verified:`);
        console.log(`      • $7,500 Invoice: ${simHigh.data.overallStatus} (${simHigh.data.finalSummary})`);
        console.log(`      • $3,200 Invoice: ${simLow.data.overallStatus} (${simLow.data.finalSummary})`);
        passed++;
      } else {
        console.error('   ❌ Finance simulation failed:', { simHigh: simHigh.data, simLow: simLow.data });
        failed++;
      }
    } else {
      failed++;
    }
  } catch (err) {
    console.error(`❌ Error in TEST 6:`, err.message);
    failed++;
  }

  console.log('\n============================================================');
  console.log(`VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
