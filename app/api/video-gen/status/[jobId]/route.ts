import { NextRequest, NextResponse } from 'next/server'
import { getJob } from '@/lib/video-gen/job-store'

export const runtime = 'nodejs'
export const maxDuration = 10

/**
 * GET /api/video-gen/status/[jobId]
 * Check the status of a video generation job
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const jobId = params.jobId
    
    const job = getJob(jobId)
    
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(job)
    
  } catch (error) {
    console.error('Failed to get job status:', error)
    return NextResponse.json(
      { error: 'Failed to get status' },
      { status: 500 }
    )
  }
}
