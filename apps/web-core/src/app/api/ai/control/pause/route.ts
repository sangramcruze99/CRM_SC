import { NextRequest, NextResponse } from 'next/server';

let pauseState = {
  isPaused: false,
  pausedAt: null as string | null,
  pausedBy: null as string | null,
};

export async function GET() {
  return NextResponse.json(pauseState);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const shouldPause = Boolean(body.pause);

    pauseState.isPaused = shouldPause;
    pauseState.pausedAt = shouldPause ? new Date().toISOString() : null;
    pauseState.pausedBy = shouldPause ? 'Workspace Administrator' : null;

    return NextResponse.json({
      success: true,
      isPaused: pauseState.isPaused,
      pausedAt: pauseState.pausedAt,
      message: shouldPause
        ? 'AI team has been paused. No new autonomous actions will start.'
        : 'AI team has resumed normal operations.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
