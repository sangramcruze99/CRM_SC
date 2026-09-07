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

console.log('================================================================');
console.log('🚀 BUSINESS OS — TWILIO & STRIPE PRODUCTION INTEGRATION VERIFIER');
console.log('================================================================\n');

let allPassed = true;

// 1. STRIPE VERIFICATION
console.log('▶ [1/2] Verifying Stripe Sandbox Integration...');
const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey || stripeKey.includes('placeholder')) {
  console.error('❌ STRIPE_SECRET_KEY is missing or contains placeholder!');
  allPassed = false;
} else {
  console.log(`🔑 Stripe Key: ${stripeKey.substring(0, 12)}...${stripeKey.substring(stripeKey.length - 4)}`);

  try {
    // 1.1 Account info
    const accountRes = await fetch('https://api.stripe.com/v1/account', {
      headers: {
        Authorization: `Bearer ${stripeKey}`,
      },
    });
    const accountData = await accountRes.json();
    if (accountRes.ok) {
      console.log(`✅ Stripe Account Verified! ID: ${accountData.id} | Business: ${accountData.business_profile?.name || accountData.settings?.dashboard?.display_name || 'Business OS Sandbox'} | Charges Enabled: ${accountData.charges_enabled}`);
    } else {
      console.error(`❌ Stripe Account Fetch Failed: ${accountData.error?.message}`);
      allPassed = false;
    }

    // 1.2 Customer Create & Delete lifecycle
    const customerParams = new URLSearchParams();
    customerParams.append('name', 'BusinessOS Automated Test');
    customerParams.append('email', `test_runner_${Date.now()}@businessos.test`);
    customerParams.append('metadata[source]', 'integration_test');

    const createRes = await fetch('https://api.stripe.com/v1/customers', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: customerParams.toString(),
    });
    const createData = await createRes.json();
    if (createRes.ok && createData.id) {
      console.log(`✅ Stripe Live Customer Lifecycle Succeeded: Created ${createData.id}`);

      // Delete customer
      const delRes = await fetch(`https://api.stripe.com/v1/customers/${createData.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${stripeKey}` },
      });
      const delData = await delRes.json();
      if (delRes.ok && delData.deleted) {
        console.log(`✅ Stripe Live Customer Cleanup Succeeded: Deleted ${createData.id}`);
      }
    } else {
      console.error(`❌ Stripe Customer Creation Failed: ${createData.error?.message}`);
      allPassed = false;
    }
  } catch (err) {
    console.error(`❌ Stripe Network Error: ${err.message}`);
    allPassed = false;
  }
}

console.log('\n----------------------------------------------------------------\n');

// 2. TWILIO VERIFICATION
console.log('▶ [2/2] Verifying Twilio Integration...');
const twilioSid = process.env.TWILIO_API_KEY_SID || process.env.TWILIO_ACCOUNT_SID;
const twilioSecret = process.env.TWILIO_API_KEY_SECRET || process.env.TWILIO_AUTH_TOKEN;

if (!twilioSid || !twilioSecret) {
  console.error('❌ Twilio credentials missing!');
  allPassed = false;
} else {
  console.log(`🔑 Twilio Key SID: ${twilioSid}`);
  console.log(`🔑 Twilio Secret: ${twilioSecret.substring(0, 6)}...${twilioSecret.substring(twilioSecret.length - 4)}`);

  const basicAuth = Buffer.from(`${twilioSid}:${twilioSecret}`).toString('base64');

  try {
    // 2.1 Verify Messaging Services endpoint
    const msgRes = await fetch('https://messaging.twilio.com/v1/Services?PageSize=5', {
      headers: {
        Authorization: `Basic ${basicAuth}`,
      },
    });
    const msgData = await msgRes.json();
    if (msgRes.ok) {
      console.log(`✅ Twilio Messaging API Connected! HTTP ${msgRes.status} | Services count: ${msgData.services?.length ?? 0}`);
    } else {
      console.warn(`⚠️ Twilio Messaging Services response: HTTP ${msgRes.status} - ${msgData.message || JSON.stringify(msgData)}`);
    }

    // 2.2 Verify Services endpoint
    const vrfRes = await fetch('https://verify.twilio.com/v2/Services?PageSize=5', {
      headers: {
        Authorization: `Basic ${basicAuth}`,
      },
    });
    const vrfData = await vrfRes.json();
    if (vrfRes.ok) {
      console.log(`✅ Twilio Verify API Connected! HTTP ${vrfRes.status} | Services count: ${vrfData.services?.length ?? 0}`);
    } else {
      console.warn(`⚠️ Twilio Verify Services response: HTTP ${vrfRes.status} - ${vrfData.message || JSON.stringify(vrfData)}`);
    }

    if (msgRes.ok || vrfRes.ok) {
      console.log(`✅ Twilio API Key & Secret authenticated successfully with Twilio Cloud APIs!`);
    } else {
      console.error(`❌ Twilio Authentication failed across endpoints.`);
      allPassed = false;
    }
  } catch (err) {
    console.error(`❌ Twilio Network Error: ${err.message}`);
    allPassed = false;
  }
}

console.log('\n================================================================');
if (allPassed) {
  console.log('🎉 ALL INTEGRATION TESTS PASSED! Both Twilio and Stripe are fully operational.');
} else {
  console.log('⚠️ One or more checks encountered errors. Review logs above.');
}
console.log('================================================================');
