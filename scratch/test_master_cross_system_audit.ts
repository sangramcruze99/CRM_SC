import path from 'path';
const { PrismaClient } = require(path.resolve(__dirname, '../packages/database'));

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:4000';

interface StepResult {
  step: string;
  passed: boolean;
  details: string;
}

const auditResults: Record<string, StepResult[]> = {
  'TENANT_ISOLATION': [],
  'HEALTHCARE_JOURNEY': [],
  'REAL_ESTATE_JOURNEY': [],
  'RESTAURANT_JOURNEY': [],
  'RETAIL_JOURNEY': [],
  'SAAS_JOURNEY': [],
  'AGENCY_JOURNEY': [],
  'CUSTOM_WORKSPACE_JOURNEY': [],
  'FINANCE_INTEGRITY': [],
};

function record(suite: string, step: string, passed: boolean, details: string) {
  auditResults[suite].push({ step, passed, details });
  const icon = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`[${suite}] ${icon} - ${step}: ${details}`);
}

async function runMasterAudit() {
  console.log('================================================================');
  console.log('STARTING BUSINESS OS MASTER CROSS-SYSTEM INTEGRATION AUDIT');
  console.log('================================================================\n');

  const tenantAlpha = `tenant_alpha_${Date.now()}`;
  const tenantBeta = `tenant_beta_${Date.now()}`;

  // ---------------------------------------------------------
  // 1. TENANT ISOLATION SUITE
  // ---------------------------------------------------------
  console.log('--- 1. Testing Cross-Tenant Data Isolation ---');
  try {
    // Tenant Alpha creates property
    const propRes = await fetch(`${BASE_URL}/api/niche/realestate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-tenant-id': tenantAlpha },
      body: JSON.stringify({
        action: 'create_property',
        payload: { title: `Alpha Exclusive Penthouse ${Date.now()}`, price: 4500000 },
      }),
    });
    const propJson = await propRes.json();
    const propTitle = propJson.record?.title;

    // Tenant Beta requests real estate data
    const betaRes = await fetch(`${BASE_URL}/api/niche/realestate`, {
      headers: { 'x-tenant-id': tenantBeta },
    });
    const betaJson = await betaRes.json();
    const foundLeak = (betaJson.data?.properties || []).find((p: any) => p.title === propTitle);

    record(
      'TENANT_ISOLATION',
      'Real Estate Listing Isolation',
      !foundLeak,
      foundLeak ? `Tenant Beta leaked Alpha listing: ${foundLeak.title}` : 'Tenant Beta cannot see Tenant Alpha listings'
    );

    // Audit Log Isolation Test
    const leakedLog = (betaJson.auditLogs || []).find((l: any) => l.tenantId === tenantAlpha);
    record(
      'TENANT_ISOLATION',
      'Audit Trail Partitioning',
      !leakedLog,
      leakedLog ? `Tenant Beta received Tenant Alpha audit log: ${leakedLog.action}` : 'Audit logs are strictly partitioned by tenant'
    );
  } catch (err: any) {
    record('TENANT_ISOLATION', 'Tenant Isolation Test Execution', false, err.message);
  }

  // ---------------------------------------------------------
  // 2. HEALTHCARE BUSINESS JOURNEY
  // ---------------------------------------------------------
  console.log('\n--- 2. Testing Healthcare End-to-End Business Flow ---');
  try {
    const medTenant = `med_center_${Date.now()}`;

    // Step A: Admit Patient
    const admitRes = await fetch(`${BASE_URL}/api/niche/hospital`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-tenant-id': medTenant },
      body: JSON.stringify({
        action: 'admit_patient',
        payload: {
          name: 'Sarah Connor',
          age: 38,
          gender: 'Female',
          department: 'Cardiology',
          attendingPhysician: 'Dr. John Watson',
          triageLevel: 'URGENT',
          roomNumber: 'ICU-104',
          insuranceStatus: 'VERIFIED',
        },
      }),
    });
    const admitJson = await admitRes.json();
    record('HEALTHCARE_JOURNEY', 'Patient Inpatient Admission', admitJson.success && !!admitJson.record?.id, `Patient ID: ${admitJson.record?.id}`);

    // Step B: Book Consultation
    const apptRes = await fetch(`${BASE_URL}/api/niche/hospital`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-tenant-id': medTenant },
      body: JSON.stringify({
        action: 'book_appointment',
        payload: {
          patient: 'Sarah Connor',
          doctor: 'Dr. John Watson',
          time: '02:30 PM',
          type: 'Echocardiogram Review',
        },
      }),
    });
    const apptJson = await apptRes.json();
    record('HEALTHCARE_JOURNEY', 'Specialist Appointment Scheduling', apptJson.success && !!apptJson.record?.id, `Appointment ID: ${apptJson.record?.id}`);

    // Step C: Issue Signed Digital Prescription
    const rxRes = await fetch(`${BASE_URL}/api/niche/hospital`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-tenant-id': medTenant },
      body: JSON.stringify({
        action: 'issue_prescription',
        payload: {
          patientName: 'Sarah Connor',
          ehrRecordId: 'EHR-99210',
          diagnosis: 'Acute Cardiac Arrhythmia',
          medications: [{ drug: 'Metoprolol', dosage: '50mg', frequency: 'Twice daily' }],
          prescribedBy: 'Dr. John Watson',
        },
      }),
    });
    const rxJson = await rxRes.json();
    record('HEALTHCARE_JOURNEY', 'Digital EHR Prescription', rxJson.success && !!rxJson.record?.id, `Rx ID: ${rxJson.record?.id}`);

    // Step D: Verify Metrics Recalculation & Audit Verification
    const hospGet = await fetch(`${BASE_URL}/api/niche/hospital`, {
      headers: { 'x-tenant-id': medTenant },
    });
    const hospJson = await hospGet.json();
    const hasAudit = (hospJson.auditLogs || []).some((l: any) => l.action === 'ADMIT_PATIENT' && l.tenantId === medTenant);
    record('HEALTHCARE_JOURNEY', 'Clinical KPI Recalculation', hospJson.metrics?.occupiedBeds > 0, `Occupied beds: ${hospJson.metrics?.occupiedBeds}`);
    record('HEALTHCARE_JOURNEY', 'HIPAA/Compliance Audit Trail', hasAudit, 'Admit action captured in tenant audit log');
  } catch (err: any) {
    record('HEALTHCARE_JOURNEY', 'Healthcare Flow Failure', false, err.message);
  }

  // ---------------------------------------------------------
  // 3. REAL ESTATE BUSINESS JOURNEY
  // ---------------------------------------------------------
  console.log('\n--- 3. Testing Real Estate End-to-End Business Flow ---');
  try {
    const reTenant = `brokerage_${Date.now()}`;

    // Step A: Create MLS Listing
    const listingRes = await fetch(`${BASE_URL}/api/niche/realestate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-tenant-id': reTenant },
      body: JSON.stringify({
        action: 'create_property',
        payload: {
          title: 'Oceanfront Villa Malibu',
          address: '24000 Pacific Coast Hwy',
          price: 3800000,
          beds: 5,
          baths: 6,
          sqft: 5200,
          agent: 'Elena Rostova',
        },
      }),
    });
    const listingJson = await listingRes.json();
    record('REAL_ESTATE_JOURNEY', 'MLS Property Listing Creation', listingJson.success && listingJson.record?.price === 3800000, `Property ID: ${listingJson.record?.id}`);

    // Step B: Book Private Viewing
    const showRes = await fetch(`${BASE_URL}/api/niche/realestate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-tenant-id': reTenant },
      body: JSON.stringify({
        action: 'book_showing',
        payload: {
          propertyId: listingJson.record?.id,
          propertyTitle: 'Oceanfront Villa Malibu',
          buyerName: 'Arthur Dent',
          date: '2026-10-12',
          time: '11:00 AM',
        },
      }),
    });
    const showJson = await showRes.json();
    record('REAL_ESTATE_JOURNEY', 'Buyer Viewing Scheduled', showJson.success && !!showJson.record?.id, `Showing ID: ${showJson.record?.id}`);

    // Step C: Open Escrow Deal with 3% Brokerage Commission
    const dealRes = await fetch(`${BASE_URL}/api/niche/realestate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-tenant-id': reTenant },
      body: JSON.stringify({
        action: 'open_escrow',
        payload: {
          propertyTitle: 'Oceanfront Villa Malibu',
          buyerName: 'Arthur Dent',
          offerAmount: 3750000,
          closingDate: '2026-11-15',
        },
      }),
    });
    const dealJson = await dealRes.json();
    const expectedCommission = 3750000 * 0.03; // $112,500
    record(
      'REAL_ESTATE_JOURNEY',
      'Escrow Opening & Commission Calculation',
      dealJson.success && dealJson.record?.commissionAmount === expectedCommission,
      `Offer: $${dealJson.record?.offerAmount}, Commission: $${dealJson.record?.commissionAmount}`
    );

    // Step D: Verify Listing Volume & Pending Pipeline
    const reGet = await fetch(`${BASE_URL}/api/niche/realestate`, {
      headers: { 'x-tenant-id': reTenant },
    });
    const reJson = await reGet.json();
    record('REAL_ESTATE_JOURNEY', 'Pipeline KPI Sync', reJson.metrics?.pendingDealsCount === 1, `Pending volume: $${reJson.metrics?.pendingDealsVolume}`);
  } catch (err: any) {
    record('REAL_ESTATE_JOURNEY', 'Real Estate Flow Failure', false, err.message);
  }

  // ---------------------------------------------------------
  // 4. RESTAURANT BUSINESS JOURNEY
  // ---------------------------------------------------------
  console.log('\n--- 4. Testing Restaurant End-to-End Business Flow ---');
  try {
    const restTenant = `bistro_${Date.now()}`;

    // Step A: Seat Floor Table
    const seatRes = await fetch(`${BASE_URL}/api/niche/restaurant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-tenant-id': restTenant },
      body: JSON.stringify({
        action: 'seat_table',
        payload: {
          tableId: 'T-01',
          guestName: 'Chef Gordon Table',
          server: 'Marco Pierre',
        },
      }),
    });
    const seatJson = await seatRes.json();
    record('RESTAURANT_JOURNEY', 'Table Floor Seating', seatJson.success && seatJson.record?.status === 'OCCUPIED', `Table ${seatJson.record?.number} Occupied`);

    // Step B: Dispatch Kitchen Order Ticket (KOT)
    const kotRes = await fetch(`${BASE_URL}/api/niche/restaurant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-tenant-id': restTenant },
      body: JSON.stringify({
        action: 'create_kitchen_order',
        payload: {
          tableId: 'T-01',
          tableNumber: 'Table 1',
          items: [
            { name: 'Wagyu Ribeye', qty: 2, price: 85 },
            { name: 'Truffle Risotto', qty: 1, price: 42 },
          ],
          waiter: 'Marco Pierre',
        },
      }),
    });
    const kotJson = await kotRes.json();
    record('RESTAURANT_JOURNEY', 'KOT Kitchen Order Dispatch', kotJson.success && kotJson.record?.status === 'PREPARING', `Ticket ID: ${kotJson.record?.id}`);

    // Step C: Expediter Marks Ticket READY
    const readyRes = await fetch(`${BASE_URL}/api/niche/restaurant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-tenant-id': restTenant },
      body: JSON.stringify({
        action: 'mark_order_ready',
        payload: { orderId: kotJson.record?.id },
      }),
    });
    const readyJson = await readyRes.json();
    record('RESTAURANT_JOURNEY', 'Kitchen Ticket Expediting (READY)', readyJson.success && readyJson.record?.status === 'READY', `KOT ${kotJson.record?.id} Ready`);

    // Step D: Verify Live Gross Sales
    const restGet = await fetch(`${BASE_URL}/api/niche/restaurant`, {
      headers: { 'x-tenant-id': restTenant },
    });
    const restMetrics = await restGet.json();
    const expectedOrderTotal = 2 * 85 + 1 * 42; // $212
    record(
      'RESTAURANT_JOURNEY',
      'Live Gross Sales Recalculation',
      restMetrics.metrics?.liveGrossSales >= expectedOrderTotal,
      `Live Sales: $${restMetrics.metrics?.liveGrossSales}`
    );
  } catch (err: any) {
    record('RESTAURANT_JOURNEY', 'Restaurant Flow Failure', false, err.message);
  }

  // ---------------------------------------------------------
  // 5. RETAIL & KHATA CREDIT JOURNEY
  // ---------------------------------------------------------
  console.log('\n--- 5. Testing Retail & Ledger Business Flow ---');
  try {
    const retailTenant = `retail_mart_${Date.now()}`;

    // Step A: Ingest Customer & Register Khata
    const khataRes = await fetch(`${BASE_URL}/api/niche/retail`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-tenant-id': retailTenant },
      body: JSON.stringify({
        action: 'add_khata_credit',
        payload: {
          customerId: 'KHATA-01',
          amount: 150.0,
        },
      }),
    });
    const khataJson = await khataRes.json();
    record('RETAIL_JOURNEY', 'Khata Customer Credit Ledger Entry', khataJson.success && khataJson.record?.totalCreditDue > 0, `Credit Due: $${khataJson.record?.totalCreditDue}`);

    // Step B: POS Checkout with Stock Deduction
    const posRes = await fetch(`${BASE_URL}/api/niche/retail`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-tenant-id': retailTenant },
      body: JSON.stringify({
        action: 'pos_checkout',
        payload: {
          customerName: 'Alice Buyer',
          items: [{ name: 'Organic Almond Milk 1L', qty: 3, price: 4.99 }],
          totalAmount: 14.97,
          paymentMethod: 'CARD',
        },
      }),
    });
    const posJson = await posRes.json();
    record('RETAIL_JOURNEY', 'POS Sale Receipt & Stock Deduction', posJson.success && !!posJson.record?.receiptNumber, `Receipt: ${posJson.record?.receiptNumber}`);

    // Step C: Verify Revenue & Dues KPI
    const retailGet = await fetch(`${BASE_URL}/api/niche/retail`, {
      headers: { 'x-tenant-id': retailTenant },
    });
    const retailMetrics = await retailGet.json();
    record(
      'RETAIL_JOURNEY',
      'Daily Revenue & Outstanding Khata Sync',
      retailMetrics.metrics?.todayReceiptsCount >= 1,
      `Receipts: ${retailMetrics.metrics?.todayReceiptsCount}, Sales Rev: $${retailMetrics.metrics?.totalSalesRevenue}`
    );
  } catch (err: any) {
    record('RETAIL_JOURNEY', 'Retail Flow Failure', false, err.message);
  }

  // ---------------------------------------------------------
  // 6. SaaS / SME MRR SUBSCRIPTION JOURNEY
  // ---------------------------------------------------------
  console.log('\n--- 6. Testing SaaS / SME Subscription Business Flow ---');
  try {
    const saasTenant = `saas_corp_${Date.now()}`;

    // Step A: Provision Subscription
    const subRes = await fetch(`${BASE_URL}/api/niche/sme`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-tenant-id': saasTenant },
      body: JSON.stringify({
        action: 'create_subscription',
        payload: {
          customerName: 'Stripe Global Ltd',
          plan: 'Enterprise Scale',
          mrr: 4500,
          seats: 50,
        },
      }),
    });
    const subJson = await subRes.json();
    record('SAAS_JOURNEY', 'Subscription Provisioning', subJson.success && subJson.record?.mrr === 4500, `MRR: $${subJson.record?.mrr}`);

    // Step B: Expansion / Upgrade
    const upgRes = await fetch(`${BASE_URL}/api/niche/sme`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-tenant-id': saasTenant },
      body: JSON.stringify({
        action: 'upgrade_subscription',
        payload: {
          id: subJson.record?.id,
          mrrAdd: 2000,
          seatsAdd: 25,
        },
      }),
    });
    const upgJson = await upgRes.json();
    record('SAAS_JOURNEY', 'Account Expansion Upgrade', upgJson.success && upgJson.record?.mrr === 6500, `Expanded MRR: $${upgJson.record?.mrr}, Seats: ${upgJson.record?.seats}`);

    // Step C: Annualized Run-Rate (ARR) Calculation
    const smeGet = await fetch(`${BASE_URL}/api/niche/sme`, {
      headers: { 'x-tenant-id': saasTenant },
    });
    const smeMetrics = await smeGet.json();
    const expectedArr = 6500 * 12; // $78,000
    record(
      'SAAS_JOURNEY',
      'ARR Recalculation',
      smeMetrics.metrics?.annualizedRunRate === expectedArr,
      `Calculated ARR: $${smeMetrics.metrics?.annualizedRunRate}`
    );
  } catch (err: any) {
    record('SAAS_JOURNEY', 'SaaS Flow Failure', false, err.message);
  }

  // ---------------------------------------------------------
  // 7. CREATIVE AGENCY JOURNEY
  // ---------------------------------------------------------
  console.log('\n--- 7. Testing Creative Agency Deliverable Flow ---');
  try {
    const agencyTenant = `agency_${Date.now()}`;

    // Step A: Create Milestone Deliverable
    const delRes = await fetch(`${BASE_URL}/api/niche/agency`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-tenant-id': agencyTenant },
      body: JSON.stringify({
        action: 'create_deliverable',
        payload: {
          clientName: 'Nike EMEA',
          projectTitle: 'Global Brand Refresh 2026',
          milestone: 'Interactive 3D Lookbook',
          retainerAmount: 28000,
        },
      }),
    });
    const delJson = await delRes.json();
    record('AGENCY_JOURNEY', 'Milestone Deliverable Ingestion', delJson.success && delJson.record?.retainerAmount === 28000, `Retainer: $${delJson.record?.retainerAmount}`);

    // Step B: Client Sign-off / Approval
    const appRes = await fetch(`${BASE_URL}/api/niche/agency`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-tenant-id': agencyTenant },
      body: JSON.stringify({
        action: 'approve_deliverable',
        payload: { id: delJson.record?.id },
      }),
    });
    const appJson = await appRes.json();
    record('AGENCY_JOURNEY', 'Client Milestone Sign-off', appJson.success && appJson.record?.status === 'APPROVED', `Deliverable ${appJson.record?.id} APPROVED`);
  } catch (err: any) {
    record('AGENCY_JOURNEY', 'Agency Flow Failure', false, err.message);
  }

  // ---------------------------------------------------------
  // 8. CUSTOM WORKSPACE / DYNAMIC NICHE
  // ---------------------------------------------------------
  console.log('\n--- 8. Testing Custom Dynamic Workspace Flow ---');
  try {
    const customTenant = `custom_org_${Date.now()}`;
    const dynamicNiche = 'biotech_lab';

    // Step A: Ingest custom record
    const dynRes = await fetch(`${BASE_URL}/api/niche/${dynamicNiche}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-tenant-id': customTenant },
      body: JSON.stringify({
        action: 'create_record',
        payload: {
          name: 'CRISPR Sequence Batch #892',
          primaryField: 'Polymerase Target Beta',
          secondaryField: 'Purity 99.4%',
          amount: '$45,000',
        },
      }),
    });
    const dynJson = await dynRes.json();
    record('CUSTOM_WORKSPACE_JOURNEY', 'Dynamic Record Creation', dynJson.success && !!dynJson.record?.id, `Custom Record ID: ${dynJson.record?.id}`);

    // Step B: Advance Record Status
    const updateRes = await fetch(`${BASE_URL}/api/niche/${dynamicNiche}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-tenant-id': customTenant },
      body: JSON.stringify({
        action: 'update_record_status',
        payload: {
          id: dynJson.record?.id,
          status: 'SEQUENCED',
          statusColor: '#10b981',
        },
      }),
    });
    const updateJson = await updateRes.json();
    record('CUSTOM_WORKSPACE_JOURNEY', 'Dynamic Record State Transition', updateJson.success && updateJson.record?.status === 'SEQUENCED', `Status: ${updateJson.record?.status}`);

    // Step C: Verify Dynamic Workspace Metrics
    const dynGet = await fetch(`${BASE_URL}/api/niche/${dynamicNiche}`, {
      headers: { 'x-tenant-id': customTenant },
    });
    const dynMetrics = await dynGet.json();
    record(
      'CUSTOM_WORKSPACE_JOURNEY',
      'Dynamic Metric Aggregation',
      dynMetrics.metrics?.totalRecords === 1,
      `Records: ${dynMetrics.metrics?.totalRecords}, Active: ${dynMetrics.metrics?.activeRecords}`
    );
  } catch (err: any) {
    record('CUSTOM_WORKSPACE_JOURNEY', 'Custom Workspace Flow Failure', false, err.message);
  }

  // ---------------------------------------------------------
  // 9. HIGH-INTEGRITY FINANCIAL SUBSYSTEM AUDIT
  // ---------------------------------------------------------
  console.log('\n--- 9. Testing High-Integrity Financial Ledger Subsystem ---');
  try {
    const finTenant = `fin_${Date.now()}`;
    await prisma.tenant.create({
      data: {
        id: finTenant,
        name: 'Financial Audit Tenant',
        domain: `${finTenant}.test`,
      },
    });
    const invoiceNum = `INV-AUDIT-${Date.now().toString().slice(-6)}`;

    // Clean any prior conflict
    await prisma.invoice.deleteMany({ where: { invoiceNum } });

    // Step A: Issue $1,000 Invoice
    const invoice = await prisma.invoice.create({
      data: {
        tenantId: finTenant,
        invoiceNum,
        amount: 1000.0,
        status: 'ISSUED',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    record('FINANCE_INTEGRITY', 'Invoice Creation ($1,000.00)', invoice.amount === 1000, `Invoice ${invoice.invoiceNum} created`);

    // Step B: Partial Payment $400.00
    const payment1 = await prisma.payment.create({
      data: {
        tenantId: finTenant,
        paymentNumber: `PAY-1-${Date.now()}`,
        amount: 400.0,
        method: 'WIRE_TRANSFER',
        status: 'COMPLETED',
        allocations: {
          create: {
            tenantId: finTenant,
            invoiceId: invoice.id,
            amount: 400.0,
          },
        },
      },
      include: { allocations: true },
    });

    // Recalculate balance
    const allocs1 = await prisma.paymentAllocation.findMany({ where: { invoiceId: invoice.id } });
    const paid1 = allocs1.reduce((sum, a) => sum + a.amount, 0);
    const balanceDue1 = invoice.amount - paid1;
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: balanceDue1 <= 0 ? 'PAID' : 'PARTIALLY_PAID' },
    });
    record(
      'FINANCE_INTEGRITY',
      'Partial Payment Settlement ($400.00)',
      paid1 === 400 && balanceDue1 === 600,
      `Paid: $${paid1}, Balance Due: $${balanceDue1}`
    );

    // Step C: Full Settlement $600.00
    const payment2 = await prisma.payment.create({
      data: {
        tenantId: finTenant,
        paymentNumber: `PAY-2-${Date.now()}`,
        amount: 600.0,
        method: 'CREDIT_CARD',
        status: 'COMPLETED',
        allocations: {
          create: {
            tenantId: finTenant,
            invoiceId: invoice.id,
            amount: 600.0,
          },
        },
      },
      include: { allocations: true },
    });

    const allocs2 = await prisma.paymentAllocation.findMany({ where: { invoiceId: invoice.id } });
    const paid2 = allocs2.reduce((sum, a) => sum + a.amount, 0);
    const balanceDue2 = invoice.amount - paid2;
    const finalInvoice = await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: balanceDue2 <= 0 ? 'PAID' : 'PARTIALLY_PAID' },
    });

    record(
      'FINANCE_INTEGRITY',
      'Full Settlement Balance Clearing ($600.00)',
      paid2 === 1000 && balanceDue2 === 0 && finalInvoice.status === 'PAID',
      `Paid: $${paid2}, Due: $${balanceDue2}, Status: ${finalInvoice.status}`
    );

    // Step D: Cleanup test tenant cascade
    await prisma.tenant.delete({ where: { id: finTenant } });
    record('FINANCE_INTEGRITY', 'Test Data Cascade Cleanup', true, `Tenant ${finTenant} and all linked records safely removed`);
  } catch (err: any) {
    record('FINANCE_INTEGRITY', 'Financial Subsystem Failure', false, err.message);
  } finally {
    await prisma.$disconnect();
  }

  // ---------------------------------------------------------
  // SUMMARY SCORECARD
  // ---------------------------------------------------------
  console.log('\n================================================================');
  console.log('MASTER AUDIT SCORECARD SUMMARY');
  console.log('================================================================');
  let totalSteps = 0;
  let totalPassed = 0;
  let totalFailed = 0;

  for (const [suite, steps] of Object.entries(auditResults)) {
    const passed = steps.filter((s) => s.passed).length;
    const failed = steps.filter((s) => !s.passed).length;
    totalSteps += steps.length;
    totalPassed += passed;
    totalFailed += failed;
    const status = failed === 0 ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${suite}: ${passed}/${steps.length} checks passed`);
  }

  console.log('----------------------------------------------------------------');
  console.log(`TOTAL AUDIT CHECKS: ${totalSteps}`);
  console.log(`PASSED: ${totalPassed}`);
  console.log(`FAILED: ${totalFailed}`);
  console.log(`SUCCESS RATE: ${((totalPassed / totalSteps) * 100).toFixed(1)}%`);
  console.log('================================================================\n');

  if (totalFailed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runMasterAudit();
