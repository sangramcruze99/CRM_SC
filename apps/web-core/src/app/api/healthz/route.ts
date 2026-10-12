import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const correlationId = req.headers.get('x-correlation-id') || crypto.randomUUID();

  return NextResponse.json(
    {
      status: 'UP',
      service: 'web-core',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      correlationId,
    },
    {
      status: 200,
      headers: {
        'x-correlation-id': correlationId,
      },
    }
  );
}
