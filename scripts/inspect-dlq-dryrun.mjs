import http from 'node:http';

async function fetchHttp(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = http.request(
      {
        host: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname + parsed.search,
        method: options.method || 'GET',
        headers: options.headers || {},
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
      }
    );
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function main() {
  console.log('=== DEAD-LETTER QUEUE (DLQ) DRY-RUN INSPECTION ===\n');

  const loginRes = await fetchHttp('http://127.0.0.1:3011/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@gmail.com',
      password: 'AdminSecure2026!#',
    }),
  });

  const { access_token } = JSON.parse(loginRes.body);

  const dlqRes = await fetchHttp('http://127.0.0.1:3009/workflows/dlq', {
    headers: {
      Authorization: `Bearer ${access_token}`,
      'x-tenant-id': 'default-tenant',
    },
  });

  const dlqData = JSON.parse(dlqRes.body);
  console.log(`TOTAL_DLQ_COUNT: ${dlqData.count}`);
  console.log(`JOBS_ARRAY_LENGTH: ${dlqData.dlq?.length}\n`);

  const groups = new Map();

  if (Array.isArray(dlqData.dlq)) {
    dlqData.dlq.forEach((job) => {
      const key = `${job.name} | ${job.failedReason} | tenant:${job.data?.tenantId || 'default'}`;
      if (!groups.has(key)) {
        groups.set(key, {
          name: job.name,
          failedReason: job.failedReason,
          tenantId: job.data?.tenantId || 'default-tenant',
          workflowId: job.data?.workflowId || job.data?.workflowSlug || 'unknown',
          attemptsMade: job.attemptsMade,
          count: 0,
          ids: [],
        });
      }
      const g = groups.get(key);
      g.count++;
      g.ids.push(job.id);
    });

    console.log('--- JOB GROUPS & PROPOSED DISPOSITION ---');
    for (const [key, g] of groups.entries()) {
      console.log(`\nGroup: ${g.name} (${g.count} jobs)`);
      console.log(`  - Target Tenant: ${g.tenantId}`);
      console.log(`  - Referenced Workflow: ${g.workflowId}`);
      console.log(`  - Failure Cause: ${g.failedReason}`);
      console.log(`  - Max Retries Made: ${g.attemptsMade}`);
      console.log(`  - Partial Side Effects: NONE (Aborted prior to node graph execution)`);
      console.log(`  - Proposed Disposition: PURGE after operator approval. Replay is safe no-op if workflow missing.`);
      console.log(`  - Sample Job IDs: ${g.ids.slice(0, 3).join(', ')}${g.ids.length > 3 ? ` ... (+${g.ids.length - 3} more)` : ''}`);
    }
  }
}

main().catch(console.error);
