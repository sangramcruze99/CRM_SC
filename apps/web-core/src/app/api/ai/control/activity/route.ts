import { NextRequest, NextResponse } from 'next/server';

const activities = [
  {
    id: 'act_101',
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    department: 'Sales AI',
    departmentKey: 'sales',
    action: 'Discovered stalled enterprise opportunity',
    target: 'Acme Corp ($42,000 Deal)',
    why: 'No email, call, or meeting recorded for 11 consecutive days while in Proposal stage.',
    result: 'Prepared personalized executive check-in message for account rep review.',
    requiresApproval: true,
    status: 'NEEDS_APPROVAL',
    approvalId: 'app_deal_acme',
  },
  {
    id: 'act_102',
    timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    department: 'Support AI',
    departmentKey: 'support',
    action: 'Resolved customer authentication question',
    target: 'Ticket #3412 (Elena Rostova)',
    why: 'User inquired about SSO login instructions documented in company knowledge base.',
    result: 'Provided step-by-step SSO resolution link and confirmed ticket closure.',
    requiresApproval: false,
    status: 'COMPLETED',
  },
  {
    id: 'act_103',
    timestamp: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
    department: 'Finance AI',
    departmentKey: 'finance',
    action: 'Identified past-due receivable',
    target: 'Invoice #1084 ($6,200)',
    why: 'Payment terms exceeded by 7 days under standard Net-30 agreement.',
    result: 'Generated calibrated polite payment reminder draft.',
    requiresApproval: true,
    status: 'NEEDS_APPROVAL',
    approvalId: 'app_inv_1084',
  },
  {
    id: 'act_104',
    timestamp: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    department: 'Customer Success AI',
    departmentKey: 'cs',
    action: 'Flagged usage dip warning',
    target: 'Globex Logistics Account',
    why: 'Daily active seat utilization decreased by 35% over past 2 billing cycles.',
    result: 'Staged customer health review and notified customer success manager.',
    requiresApproval: false,
    status: 'COMPLETED',
  },
  {
    id: 'act_105',
    timestamp: new Date(Date.now() - 140 * 60 * 1000).toISOString(),
    department: 'Marketing AI',
    departmentKey: 'marketing',
    action: 'Prepared weekly product update draft',
    target: 'Release 1.8 Announcement Campaign',
    why: 'New feature milestone reached in product repository.',
    result: 'Generated multi-channel copy draft for LinkedIn, Twitter, and email newsletter.',
    requiresApproval: true,
    status: 'NEEDS_APPROVAL',
    approvalId: 'app_mkt_108',
  },
  {
    id: 'act_106',
    timestamp: new Date(Date.now() - 210 * 60 * 1000).toISOString(),
    department: 'Operations AI',
    departmentKey: 'operations',
    action: 'Automated onboarding project initialization',
    target: 'Hyperion Technologies Project Board',
    why: 'Commercial deal moved to Closed-Won status.',
    result: 'Created 8 standard onboarding milestone tasks and assigned technical lead.',
    requiresApproval: false,
    status: 'COMPLETED',
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const department = searchParams.get('department');

  let filtered = activities;
  if (department && department !== 'all') {
    filtered = activities.filter((a) => a.departmentKey === department);
  }

  return NextResponse.json({
    activities: filtered,
    total: filtered.length,
  });
}
