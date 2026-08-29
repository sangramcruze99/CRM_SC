export interface QueueJob {
  id: string;
  type: 'OCR_NEURAL_VISION' | 'B2B_LEAD_INGEST' | 'AI_LEDGER_RECONCILE' | 'EMBEDDING_INDEX';
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress: number; // 0 to 100
  title: string;
  payload: any;
  result?: any;
  error?: string;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
}

// In-memory queue store for demonstration / local dev
const queueStore = new Map<string, QueueJob>();

export function createQueueJob(
  type: QueueJob['type'],
  title: string,
  payload: any
): QueueJob {
  const job: QueueJob = {
    id: `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    type,
    status: 'QUEUED',
    progress: 0,
    title,
    payload,
    startedAt: new Date().toISOString(),
  };

  queueStore.set(job.id, job);

  // Trigger decoupled async worker execution simulation
  simulateWorkerExecution(job.id);

  return job;
}

export function getQueueJob(jobId: string): QueueJob | undefined {
  return queueStore.get(jobId);
}

export function listQueueJobs(): QueueJob[] {
  return Array.from(queueStore.values()).sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  );
}

function simulateWorkerExecution(jobId: string) {
  const intervals = [25, 50, 75, 100];
  let step = 0;

  const timer = setInterval(() => {
    const job = queueStore.get(jobId);
    if (!job) {
      clearInterval(timer);
      return;
    }

    if (step < intervals.length) {
      job.status = 'PROCESSING';
      job.progress = intervals[step];
      step++;
    } else {
      job.status = 'COMPLETED';
      job.progress = 100;
      job.completedAt = new Date().toISOString();
      job.durationMs = new Date(job.completedAt).getTime() - new Date(job.startedAt).getTime();
      clearInterval(timer);
    }
  }, 400);
}
