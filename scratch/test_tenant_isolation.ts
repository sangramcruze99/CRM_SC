
async function testTenantIsolation() {
  console.log('Testing Tenant Isolation on /api/niche/hospital...');

  // 1. Tenant A admits a patient
  const patientNameA = `TenantA_Patient_${Date.now()}`;
  const resA = await fetch('http://localhost:4000/api/niche/hospital', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-tenant-id': 'tenant_alpha',
    },
    body: JSON.stringify({
      action: 'admit_patient',
      payload: {
        name: patientNameA,
        age: 45,
        department: 'Cardiology',
      },
    }),
  });

  const jsonA = await resA.json();
  console.log('Tenant A Admit Result:', jsonA.success ? 'Created' : 'Failed', jsonA.record?.name);

  // 2. Tenant B fetches hospital data
  const resB = await fetch('http://localhost:4000/api/niche/hospital', {
    headers: {
      'x-tenant-id': 'tenant_beta',
    },
  });

  const jsonB = await resB.json();
  const foundInB = (jsonB.data?.patients || []).find((p: any) => p.name === patientNameA);

  if (foundInB) {
    console.error('❌ CRITICAL VULNERABILITY (P0): Tenant B can see Tenant A patient:', foundInB.name);
  } else {
    console.log('✅ PASS: Tenant B cannot see Tenant A patient.');
  }

  // 3. Test Audit Logs Isolation
  const logsB = jsonB.auditLogs || [];
  const leakedLog = logsB.find((l: any) => l.tenantId === 'tenant_alpha');
  if (leakedLog) {
    console.error('❌ CRITICAL VULNERABILITY (P0): Tenant B received Tenant A audit logs:', leakedLog);
  } else {
    console.log('✅ PASS: Tenant B does not receive Tenant A audit logs.');
  }
}

testTenantIsolation();
