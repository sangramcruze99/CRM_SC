import { NextResponse } from 'next/server';
import { createQueueJob, listQueueJobs, getQueueJob } from '@/lib/asyncQueue';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');

  if (jobId) {
    const job = getQueueJob(jobId);
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    return NextResponse.json(job);
  }

  return NextResponse.json({ jobs: listQueueJobs() });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, title, payload } = body;

    if (!type || !title) {
      return NextResponse.json({ error: 'Missing type or title' }, { status: 400 });
    }

    const job = createQueueJob(type, title, payload);
    return NextResponse.json(job, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
