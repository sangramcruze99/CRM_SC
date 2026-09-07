import { NextRequest, NextResponse } from 'next/server';

let usageSettings = {
  monthlyLimit: 100.00,
  quality: 'balanced' as 'fast' | 'balanced' | 'best',
  onLimitReached: 'ask_me' as 'ask_me' | 'stop_ai' | 'continue_usage',
};

export async function GET() {
  const usedAmount = 62.40;
  const remaining = Math.max(0, usageSettings.monthlyLimit - usedAmount);
  const percentUsed = Math.min(100, Math.round((usedAmount / usageSettings.monthlyLimit) * 100));

  const breakdown = [
    { department: 'Sales AI', amount: 21.20, percent: 34 },
    { department: 'Customer Success AI', amount: 15.30, percent: 25 },
    { department: 'Finance AI', amount: 9.80, percent: 16 },
    { department: 'Support AI', amount: 7.10, percent: 11 },
    { department: 'Operations AI', amount: 5.40, percent: 9 },
    { department: 'Marketing AI', amount: 3.60, percent: 5 },
  ];

  return NextResponse.json({
    monthlyAllowance: usageSettings.monthlyLimit,
    amountUsed: usedAmount,
    amountRemaining: remaining,
    percentUsed,
    quality: usageSettings.quality,
    onLimitReached: usageSettings.onLimitReached,
    breakdown,
    billingCycleEnd: '2026-09-30',
    // Progressive disclosure data for developers/advanced view
    advanced: {
      totalTokens: 1428500,
      activeProviders: ['groq', 'gemini-3.6-flash', 'groq/compound'],
      averageLatencyMs: 420,
      meteredModelCalls: 864,
    },
  });
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.quality && ['fast', 'balanced', 'best'].includes(body.quality)) {
      usageSettings.quality = body.quality;
    }
    if (body.onLimitReached && ['ask_me', 'stop_ai', 'continue_usage'].includes(body.onLimitReached)) {
      usageSettings.onLimitReached = body.onLimitReached;
    }
    if (typeof body.monthlyLimit === 'number' && body.monthlyLimit > 0) {
      usageSettings.monthlyLimit = body.monthlyLimit;
    }

    return NextResponse.json({
      success: true,
      message: 'AI usage & budget settings updated.',
      settings: usageSettings,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
