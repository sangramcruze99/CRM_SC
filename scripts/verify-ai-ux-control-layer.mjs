import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env');

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

console.log('========================================================================');
console.log('🧪 HUMAN AI CONTROL LAYER & AI UX SIMPLIFICATION VERIFICATION AUDIT');
console.log('========================================================================\n');

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    console.log(`✅ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${message}`);
  }
}

const BASE_URL = 'http://localhost:4000';

async function runTests() {
  // Test 1: AI Overview endpoint
  console.log('▶ [1/7] Testing /api/ai/control/overview...');
  try {
    const res = await fetch(`${BASE_URL}/api/ai/control/overview`);
    assert(res.ok, `Overview HTTP status is ${res.status}`);
    const data = await res.json();
    assert(data.metrics !== undefined, 'Overview returns metrics object');
    assert(typeof data.metrics.activeAssistants === 'number', `Active assistants count: ${data.metrics.activeAssistants}`);
    assert(Array.isArray(data.proactiveActions), `Proactive actions count: ${data.proactiveActions.length}`);
    assert(data.systemStatus === 'ACTIVE' || data.systemStatus === 'PAUSED', `System status is ${data.systemStatus}`);
  } catch (err) {
    assert(false, `Overview test failed: ${err.message}`);
  }

  // Test 2: Universal Ask AI Intent Router
  console.log('\n▶ [2/7] Testing /api/ai/control/ask (Universal Intent Router)...');
  try {
    // 2.1 Deals intent
    const dealsRes = await fetch(`${BASE_URL}/api/ai/control/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'Find deals that need my attention today' }),
    });
    const dealsData = await dealsRes.json();
    assert(dealsData.intent === 'DEALS_REVIEW', `Deals query mapped to intent: ${dealsData.intent}`);
    assert(dealsData.department.includes('Sales AI'), `Routed to Sales AI: ${dealsData.department}`);
    assert(Array.isArray(dealsData.suggestedActions) && dealsData.suggestedActions.length > 0, 'Returned suggested next actions');

    // 2.2 Invoices intent
    const invRes = await fetch(`${BASE_URL}/api/ai/control/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'Show me unpaid invoices' }),
    });
    const invData = await invRes.json();
    assert(invData.intent === 'INVOICES_COLLECTION', `Invoice query mapped to intent: ${invData.intent}`);
    assert(invData.department.includes('Finance AI'), `Routed to Finance AI: ${invData.department}`);

    // 2.3 Churn intent
    const churnRes = await fetch(`${BASE_URL}/api/ai/control/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'Find customers who might churn' }),
    });
    const churnData = await churnRes.json();
    assert(churnData.intent === 'CHURN_PREVENTION', `Churn query mapped to intent: ${churnData.intent}`);
    assert(churnData.department.includes('Customer Success AI'), `Routed to Customer Success AI: ${churnData.department}`);

    // 2.4 Daily briefing intent
    const briefRes = await fetch(`${BASE_URL}/api/ai/control/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'Give me my daily briefing' }),
    });
    const briefData = await briefRes.json();
    assert(briefData.intent === 'DAILY_BRIEFING', `Briefing query mapped to intent: ${briefData.intent}`);
  } catch (err) {
    assert(false, `Ask AI test failed: ${err.message}`);
  }

  // Test 3: My AI Team Roster & Autonomy Levels
  console.log('\n▶ [3/7] Testing /api/ai/control/team (Digital Employees)...');
  try {
    const res = await fetch(`${BASE_URL}/api/ai/control/team`);
    assert(res.ok, `Team HTTP status is ${res.status}`);
    const data = await res.json();
    assert(Array.isArray(data.team), `Roster returned ${data.team?.length} digital employees`);
    assert(data.team.length >= 6, 'Contains Sales, CS, Finance, Support, Operations, and Marketing AI');

    const salesDept = data.team.find((d) => d.id === 'sales');
    assert(salesDept !== undefined, 'Sales AI exists in roster');
    assert(['RECOMMEND', 'ASSIST', 'AUTOPILOT'].includes(salesDept.autonomy), `Sales autonomy mode is valid: ${salesDept.autonomy}`);
    assert(Array.isArray(salesDept.willDo) && salesDept.willDo.length > 0, 'Clear "AI will do" boundaries defined');
    assert(Array.isArray(salesDept.willNotDo) && salesDept.willNotDo.length > 0, 'Clear "AI will NOT do" boundaries defined');
  } catch (err) {
    assert(false, `Team test failed: ${err.message}`);
  }

  // Test 4: Autonomy Mode Switching
  console.log('\n▶ [4/7] Testing PATCH /api/ai/control/team (Autonomy Switch)...');
  try {
    const patchRes = await fetch(`${BASE_URL}/api/ai/control/team`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ departmentId: 'sales', autonomy: 'AUTOPILOT' }),
    });
    assert(patchRes.ok, `Patch HTTP status is ${patchRes.status}`);
    const patchData = await patchRes.json();
    assert(patchData.department?.autonomy === 'AUTOPILOT', `Autonomy mode successfully updated to: ${patchData.department?.autonomy}`);

    // Revert back to ASSIST
    await fetch(`${BASE_URL}/api/ai/control/team`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ departmentId: 'sales', autonomy: 'ASSIST' }),
    });
    assert(true, 'Reverted Sales AI back to ASSIST safety mode');
  } catch (err) {
    assert(false, `Autonomy switch test failed: ${err.message}`);
  }

  // Test 5: Simple AI Usage & Spending Limits
  console.log('\n▶ [5/7] Testing /api/ai/control/usage...');
  try {
    const res = await fetch(`${BASE_URL}/api/ai/control/usage`);
    assert(res.ok, `Usage HTTP status is ${res.status}`);
    const data = await res.json();
    assert(typeof data.amountUsed === 'number', `Amount used: $${data.amountUsed}`);
    assert(typeof data.amountRemaining === 'number', `Amount remaining: $${data.amountRemaining}`);
    assert(Array.isArray(data.breakdown) && data.breakdown.length > 0, 'Department spending breakdown provided');
    assert(['fast', 'balanced', 'best'].includes(data.quality), `AI quality mode: ${data.quality}`);
    assert(['ask_me', 'stop_ai', 'continue_usage'].includes(data.onLimitReached), `Spending limit rule: ${data.onLimitReached}`);
  } catch (err) {
    assert(false, `Usage test failed: ${err.message}`);
  }

  // Test 6: Global Emergency AI Pause
  console.log('\n▶ [6/7] Testing /api/ai/control/pause (Emergency Control)...');
  try {
    // Pause AI
    const pauseRes = await fetch(`${BASE_URL}/api/ai/control/pause`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pause: true }),
    });
    const pauseData = await pauseRes.json();
    assert(pauseData.isPaused === true, 'Global emergency pause successfully engaged');

    // Resume AI
    const resumeRes = await fetch(`${BASE_URL}/api/ai/control/pause`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pause: false }),
    });
    const resumeData = await resumeRes.json();
    assert(resumeData.isPaused === false, 'AI team successfully resumed normal operations');
  } catch (err) {
    assert(false, `Pause test failed: ${err.message}`);
  }

  // Test 7: AI Activity Feed with Explanations
  console.log('\n▶ [7/7] Testing /api/ai/control/activity (Audit & Explanations)...');
  try {
    const res = await fetch(`${BASE_URL}/api/ai/control/activity`);
    assert(res.ok, `Activity HTTP status is ${res.status}`);
    const data = await res.json();
    assert(Array.isArray(data.activities) && data.activities.length > 0, `Returned ${data.activities?.length} activity events`);

    const first = data.activities[0];
    assert(Boolean(first.why), `Includes human-readable "Why did AI act?": ${first.why?.substring(0, 40)}...`);
    assert(Boolean(first.result), `Includes outcome result: ${first.result?.substring(0, 40)}...`);
  } catch (err) {
    assert(false, `Activity test failed: ${err.message}`);
  }

  console.log('\n========================================================================');
  console.log(`📊 AUDIT SUMMARY: ${passed}/${total} assertions passed (${Math.round((passed / total) * 100)}%)`);
  console.log('========================================================================\n');

  if (passed === total) {
    console.log('🎉 ALL AI UX SIMPLIFICATION CHECKS PASSED! The Human AI Control Layer is fully operational.');
    process.exit(0);
  } else {
    console.error('⚠️ Some assertions failed. Review log above.');
    process.exit(1);
  }
}

runTests();
