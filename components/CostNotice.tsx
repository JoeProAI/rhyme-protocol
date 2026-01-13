'use client'

import { useState } from 'react'

const COSTS = {
  coverArt: '$0.02 - $0.08',
  video: '$0.50 - $2.00',
  lyrics: '$0.01 - $0.05',
}

export function CostNotice({ type }: { type: 'cover-art' | 'video' | 'lyrics' }) {
  const [expanded, setExpanded] = useState(false)
  
  const cost = type === 'cover-art' ? COSTS.coverArt : type === 'video' ? COSTS.video : COSTS.lyrics

  return (
    <div className="border border-border-subtle bg-surface/50 p-4 text-sm">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left flex items-center justify-between"
      >
        <span className="text-muted">
          This costs me <span className="text-accent font-mono">{cost}</span> per generation
        </span>
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          className={`text-muted transition-transform ${expanded ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>
      
      {expanded && (
        <div className="mt-4 pt-4 border-t border-border-subtle space-y-3">
          <p className="text-muted">
            This tool is free to use. I cover the AI costs out of pocket to help artists create.
          </p>
          <p className="text-text-secondary">
            If you find value in this, consider supporting:
          </p>
          <div className="flex flex-wrap gap-3">
            <a 
              href="https://paypal.me/JoeProAI" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0070ba] text-white text-xs font-medium hover:bg-[#005ea6] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.77.77 0 0 1 .757-.629h6.527c2.175 0 3.73.574 4.618 1.704.857 1.092 1.058 2.538.597 4.298a5.5 5.5 0 0 1-.109.426l-.002.009v.003c-.805 3.241-3.138 4.835-6.746 4.835H8.812a.77.77 0 0 0-.757.63l-.008.052-.856 5.378-.036.227a.641.641 0 0 1-.633.534h-.446z"/>
              </svg>
              PayPal @JoeProAI
            </a>
            <a 
              href="https://venmo.com/JoeProAI" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#3d95ce] text-white text-xs font-medium hover:bg-[#2d7ab0] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.5 3c.9 1.5 1.3 3 1.3 4.9 0 5.4-4.6 12.4-8.3 17.1H5.8L3 4.5l6.1-.6 1.5 12.2c1.4-2.2 3.1-5.7 3.1-8.1 0-1.8-.3-3-.8-4l6.6-1z"/>
              </svg>
              Venmo @JoeProAI
            </a>
          </div>
          <p className="text-xs text-muted">
            Every donation helps keep these tools free for the community.
          </p>
        </div>
      )}
    </div>
  )
}
