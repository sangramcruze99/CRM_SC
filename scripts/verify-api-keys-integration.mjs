// scripts/verify-api-keys-integration.mjs
// Verifies integration of all 3 API keys across the Business OS CRM system

import fs from 'fs';
import path from 'path';

const EXPECTED_GROQ = process.env.GROQ_API_KEY || '';
const EXPECTED_GEMINI = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
const EXPECTED_API_KEY = process.env.API_KEY || process.env.SYSTEM_API_KEY || '';

async function main() {
  console.log('===============================================================');
  console.log(' Business OS — API Key System Integration & Verification Audit ');
  console.log('===============================================================\n');

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

  // 1. Verify .env file configuration
  const envContent = fs.readFileSync(path.resolve(process.cwd(), '.env'), 'utf-8');
  assert(envContent.includes(`GROQ_API_KEY="${EXPECTED_GROQ}"`), 'Root .env contains active GROQ_API_KEY');
  assert(envContent.includes(`GEMINI_API_KEY="${EXPECTED_GEMINI}"`), 'Root .env contains active GEMINI_API_KEY');
  assert(envContent.includes(`GOOGLE_API_KEY="${EXPECTED_GEMINI}"`), 'Root .env contains GOOGLE_API_KEY alias');
  assert(envContent.includes(`API_KEY="${EXPECTED_API_KEY}"`), 'Root .env contains system API_KEY');
  assert(envContent.includes(`SYSTEM_API_KEY="${EXPECTED_API_KEY}"`), 'Root .env contains SYSTEM_API_KEY');

  // 2. Direct Groq Cloud API test
  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${EXPECTED_GROQ}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'groq/compound',
        messages: [{ role: 'user', content: 'Say GROQ_ACTIVE' }],
      }),
    });
    assert(groqRes.status === 200, `Direct Groq Cloud API returned HTTP 200 (Model: groq/compound)`);
    const groqData = await groqRes.json();
    assert(groqData.choices?.[0]?.message?.content?.includes('GROQ_ACTIVE'), 'Groq returned verified completion');
  } catch (err) {
    assert(false, `Direct Groq Cloud API failed: ${err.message}`);
  }

  // 3. Direct Google Gemini API test
  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${encodeURIComponent(EXPECTED_GEMINI)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Respond with the exact word: GEMINI_ACTIVE' }] }],
        }),
      }
    );
    assert(geminiRes.status === 200, `Direct Google Gemini API returned HTTP 200 (Model: gemini-3.6-flash)`);
    const geminiData = await geminiRes.json();
    const geminiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    assert(geminiText.includes('GEMINI_ACTIVE'), 'Gemini returned verified generation');
  } catch (err) {
    assert(false, `Direct Google Gemini API failed: ${err.message}`);
  }

  // 4. Live Microservice Ask AI via X-API-Key with Groq Provider
  try {
    const aiGroqRes = await fetch('http://localhost:3010/prompts/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': EXPECTED_API_KEY,
        'x-tenant-id': 'default-tenant',
      },
      body: JSON.stringify({
        query: 'What is our commercial pipeline health?',
        provider: 'groq',
      }),
    });
    assert(aiGroqRes.status === 201, 'AI Engine /prompts/ask authenticated via X-API-Key with status 201');
    const aiGroqData = await aiGroqRes.json();
    assert(aiGroqData.provider === 'groq', `AI Engine routed request to Groq provider`);
    assert(Boolean(aiGroqData.reply), 'AI Engine Groq response contains business intelligence content');
  } catch (err) {
    assert(false, `AI Engine Groq test failed: ${err.message}`);
  }

  // 5. Live Microservice Ask AI via Bearer API_KEY with Gemini Provider
  try {
    const aiGeminiRes = await fetch('http://localhost:3010/prompts/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${EXPECTED_API_KEY}`,
        'x-tenant-id': 'default-tenant',
      },
      body: JSON.stringify({
        query: 'Summarize our current active enterprise deals.',
        provider: 'gemini',
      }),
    });
    assert(aiGeminiRes.status === 201, 'AI Engine /prompts/ask authenticated via Bearer API_KEY with status 201');
    const aiGeminiData = await aiGeminiRes.json();
    assert(aiGeminiData.provider === 'gemini', `AI Engine routed request to Gemini provider`);
    assert(Boolean(aiGeminiData.reply), 'AI Engine Gemini response contains reasoning output');
  } catch (err) {
    assert(false, `AI Engine Gemini test failed: ${err.message}`);
  }

  console.log('\n===============================================================');
  console.log(` Summary: ${passed}/${total} assertions passed (${Math.round((passed / total) * 100)}%)`);
  console.log('===============================================================\n');

  if (passed === total) {
    console.log('✨ All 3 API Keys are successfully integrated and verified!');
    process.exit(0);
  } else {
    console.error('⚠️ One or more integration tests failed.');
    process.exit(1);
  }
}

main();
