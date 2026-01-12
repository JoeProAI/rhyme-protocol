/**
 * In-Memory Job Store for Video Generation
 * Stores job status and results temporarily
 * 
 * Note: This is a simple in-memory store. In production, use Redis or a database.
 */

export interface VideoGenerationJob {
  id: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  progress: {
    currentSegment: number
    totalSegments: number
    message: string
  }
  segments: Array<{
    index: number
    startTime: number
    endTime: number
    videoUrl: string
    status: 'completed' | 'failed'
  }>
  error?: string
  totalCost?: number
  totalDuration?: number
  createdAt: number
  completedAt?: number
}

// In-memory store (will reset on deployment/restart)
const jobs = new Map<string, VideoGenerationJob>()

// Auto-cleanup old jobs after 1 hour
setInterval(() => {
  const oneHourAgo = Date.now() - 60 * 60 * 1000
  const entries = Array.from(jobs.entries())
  for (const [id, job] of entries) {
    if (job.createdAt < oneHourAgo) {
      jobs.delete(id)
    }
  }
}, 5 * 60 * 1000) // Check every 5 minutes

export function createJob(totalSegments: number): string {
  const id = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  jobs.set(id, {
    id,
    status: 'queued',
    progress: {
      currentSegment: 0,
      totalSegments,
      message: 'Starting video generation...',
    },
    segments: [],
    createdAt: Date.now(),
  })
  
  return id
}

export function getJob(id: string): VideoGenerationJob | undefined {
  return jobs.get(id)
}

export function updateJob(id: string, updates: Partial<VideoGenerationJob>): void {
  const job = jobs.get(id)
  if (!job) return
  
  jobs.set(id, { ...job, ...updates })
}

export function updateJobProgress(
  id: string,
  currentSegment: number,
  message: string
): void {
  const job = jobs.get(id)
  if (!job) return
  
  jobs.set(id, {
    ...job,
    progress: {
      ...job.progress,
      currentSegment,
      message,
    },
  })
}

export function completeJob(
  id: string,
  segments: VideoGenerationJob['segments'],
  totalCost: number,
  totalDuration: number
): void {
  const job = jobs.get(id)
  if (!job) return
  
  jobs.set(id, {
    ...job,
    status: 'completed',
    segments,
    totalCost,
    totalDuration,
    completedAt: Date.now(),
  })
}

export function failJob(id: string, error: string): void {
  const job = jobs.get(id)
  if (!job) return
  
  jobs.set(id, {
    ...job,
    status: 'failed',
    error,
    completedAt: Date.now(),
  })
}
