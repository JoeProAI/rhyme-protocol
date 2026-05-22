'use client'

import { useEffect, useState } from 'react'

/**
 * ChallengeActivity. Pulls a live count of submissions for this slug
 * from the public gallery. Falls back to a quiet placeholder if the
 * gallery returns nothing yet.
 */
export default function ChallengeActivity({ slug }: { slug: string }) {
  const [count, setCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch(`/api/gallery?type=lyrics&limit=200`, { cache: 'no-store' })
        if (!res.ok) throw new Error()
        const data = await res.json()
        if (cancelled) return
        const items = (data.items || []) as { style?: string; prompt?: string }[]
        const matching = items.filter(
          (i) => i.style === slug || (i.prompt && i.prompt.includes(`[${slug} challenge]`))
        ).length
        setCount(matching)
      } catch {
        if (!cancelled) setCount(0)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [slug])

  if (loading) {
    return (
      <span className="text-[10px] font-mono tracking-widest text-muted animate-pulse">
        LOADING...
      </span>
    )
  }

  if (count === null || count === 0) {
    return (
      <span className="text-[10px] font-mono tracking-widest text-muted">
        BE THE FIRST TO SHIP
      </span>
    )
  }

  return (
    <span className="text-[10px] font-mono tracking-widest text-accent">
      {count} {count === 1 ? 'WRITER' : 'WRITERS'} SHIPPED
    </span>
  )
}
