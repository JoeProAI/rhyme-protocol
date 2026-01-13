'use client'

import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect } from 'react'

export default function SignIn() {
  const { user, loading, signInWithGoogle, signInAnonymously } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && !loading) {
      router.push('/studio/gallery')
    }
  }, [user, loading, router])

  const handleGoogle = async () => {
    try {
      await signInWithGoogle()
      router.push('/studio/gallery')
    } catch (error) {
      console.error('Sign in failed:', error)
    }
  }

  const handleAnonymous = async () => {
    try {
      await signInAnonymously()
      router.push('/studio/gallery')
    } catch (error) {
      console.error('Anonymous sign in failed:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Link 
          href="/" 
          className="text-text-secondary hover:text-accent transition-colors text-sm mb-8 inline-block"
        >
          ← Back to Home
        </Link>
        
        <div className="border border-border-subtle bg-surface p-8">
          <h1 className="text-3xl font-display tracking-tight mb-2">
            <span className="text-text">SIGN</span>
            <span className="text-accent">_IN</span>
          </h1>
          <p className="text-text-secondary text-sm mb-8">
            Sign in to save your creations and access them anywhere
          </p>
          
          <div className="space-y-3">
            <button
              onClick={handleGoogle}
              className="w-full py-3 px-4 border border-border-subtle hover:border-accent bg-bg text-text flex items-center justify-center gap-3 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
            
            <button
              onClick={handleAnonymous}
              className="w-full py-3 px-4 border border-border-subtle hover:border-accent bg-bg text-text flex items-center justify-center gap-3 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Continue as Guest
            </button>
          </div>
          
          <p className="text-xs text-muted text-center mt-6">
            Your creations are private and only visible to you
          </p>
        </div>
      </div>
    </div>
  )
}
