// scratch/test-resend-service.js
// Verification of Resend API key and service functionality
const fs = require('fs');
const path = require('path');

async function testResendIntegration() {
  console.log('--- Testing Resend API Integration ---');

  // Load .env directly
  const envContent = fs.readFileSync(path.resolve(__dirname, '../.env'), 'utf-8');
  let apiKey = '';
  let fromEmail = '';

  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('RESEND_API_KEY=')) {
      apiKey = trimmed.replace('RESEND_API_KEY=', '').replace(/['"]/g, '');
    }
    if (trimmed.startsWith('RESEND_FROM_EMAIL=')) {
      fromEmail = trimmed.replace('RESEND_FROM_EMAIL=', '').replace(/['"]/g, '');
    }
  }

  console.log(`[Config Check] Key detected: ${apiKey ? apiKey.substring(0, 10) + '...' : 'MISSING'}`);
  console.log(`[Config Check] Sender: ${fromEmail || 'Default'}`);

  if (!apiKey) {
    console.error('FAILED: RESEND_API_KEY not found in .env');
    process.exit(1);
  }

  // Real dispatch test
  console.log('\n[Test 1] Dispatching test email to delivered@resend.dev...');
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail || 'Business OS <onboarding@resend.dev>',
      to: ['delivered@resend.dev'],
      subject: 'Business OS Verification: Resend Key Active',
      html: '<h2>Resend Integration Verified</h2><p>Your API key was successfully wired into the Business OS automation and workflow executor pipeline.</p>',
      text: 'Resend Integration Verified. Your API key was successfully wired into Business OS.',
    }),
  });

  const data = await res.json();
  console.log(`[Test 1] Response status: ${res.status}`);
  console.log('[Test 1] Response body:', data);

  if (res.ok && data.id) {
    console.log(`\n SUCCESS: Real email dispatched via Resend! Message ID: ${data.id}`);
  } else {
    console.error('\n❌ FAILED: Resend did not return an email ID.', data);
    process.exit(1);
  }
}

testResendIntegration().catch(err => {
  console.error('Exception during test:', err);
  process.exit(1);
});
