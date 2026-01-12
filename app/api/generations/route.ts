import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getGenerations, deleteGeneration } from '@/lib/generations'
import { cookies } from 'next/headers'

/**
 * GET /api/generations
 * Get current user's generation history
 */
export async function GET(req: NextRequest) {
  const session = await auth()
  
  // Use auth user ID or fall back to anonymous session
  let userId: string
  if (session?.user?.id) {
    userId = session.user.id
  } else {
    const cookieStore = cookies()
    userId = cookieStore.get('anon_session')?.value || 'anonymous'
  }
  
  const generations = await getGenerations(userId)
  
  return NextResponse.json({
    generations,
    authenticated: !!session?.user,
  })
}

/**
 * DELETE /api/generations?id=xxx
 * Delete a generation from history
 */
export async function DELETE(req: NextRequest) {
  const session = await auth()
  
  let userId: string
  if (session?.user?.id) {
    userId = session.user.id
  } else {
    const cookieStore = cookies()
    userId = cookieStore.get('anon_session')?.value || 'anonymous'
  }
  
  const { searchParams } = new URL(req.url)
  const generationId = searchParams.get('id')
  
  if (!generationId) {
    return NextResponse.json({ error: 'Generation ID required' }, { status: 400 })
  }
  
  const deleted = await deleteGeneration(userId, generationId)
  
  return NextResponse.json({ deleted })
}
