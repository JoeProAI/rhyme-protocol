'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Daily {
  theme: string
  style: string
  bars: number
  hint: string
  date: string
  index: number
  total: number
}

export default function DailyPromptCard() {
  const [data, setData] = useState<Daily | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/daily-prompt')
      .then((r) => r.json())
      .then(setData)
      .catch(() => setError(true))
  }, [])

  if (error || !data) return null

  const href = `/studio/lyrics?theme=${encodeURIComponent(data.theme)}&style=${encodeURIComponent(data.style)}&bars=${data.bars}`

  return (
    <Link
      href={href}
      className="group block relative border border-accent/30 bg-accent/5 p-5 sm:p-6 mb-8 hover:border-accent transition-all"
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="text-[10px] font-mono tracking-widest text-accent">
          DAILY_PROMPT · {data.date}
        </div>
        <div className="text-[10px] font-mono text-muted">
          #{data.index + 1}/{data.total}
        </div>
      </div>
      <h3 className="text-lg sm:text-xl font-display tracking-tight text-text mb-2 leading-snug">
        “{data.theme}”
      </h3>
      <p className="text-sm text-text-secondary mb-4">{data.hint}</p>
      <div className="flex items-center justify-between text-xs font-mono tracking-wider text-text-secondary">
        <span>
          {data.style.toUpperCase()} · {data.bars} BARS
        </span>
        <span className="text-accent group-hover:translate-x-1 transition-transform">
          WRITE IT →
        </span>
      </div>
    </Link>
  )
}
