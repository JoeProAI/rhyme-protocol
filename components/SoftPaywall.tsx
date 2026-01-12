'use client'

import { useState, useEffect } from 'react'
import { CreditCard, X, Zap } from 'lucide-react'

/**
 * Soft Paywall - Non-annoying payment prompt
 * Shows after free tier is used, but not pushy
 */
export default function SoftPaywall() {
  const [usage, setUsage] = useState<any>(null)
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  
  useEffect(() => {
    // Check if user already dismissed this session
    if (sessionStorage.getItem('paywall_dismissed')) {
      setDismissed(true)
      return
    }
    
    fetch('/api/usage/me')
      .then(r => r.json())
      .then(data => {
        setUsage(data.usage)
        
        // Show after 3 free uses, but only if they don't have a card
        if (data.usage.builds >= 3 && !data.usage.hasCard) {
          // Delay showing by 2 seconds to not be annoying
          setTimeout(() => setShow(true), 2000)
        }
      })
      .catch(err => console.error('Failed to fetch usage:', err))
  }, [])
  
  const handleDismiss = () => {
    setShow(false)
    setDismissed(true)
    // Remember dismissal for this session
    sessionStorage.setItem('paywall_dismissed', 'true')
  }
  
  if (!show || !usage || dismissed) return null
  
  return (
    <div className="fixed bottom-6 right-6 max-w-md bg-[var(--card-bg)] border-2 border-[var(--primary)] rounded-xl p-6 shadow-2xl z-50 animate-slide-up">
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
        aria-label="Dismiss"
      >
        <X size={18} />
      </button>
      
      <div className="flex items-start gap-4">
        <div className="p-3 bg-[var(--primary)]/10 rounded-lg">
          <Zap className="text-[var(--primary)]" size={24} />
        </div>
        
        <div className="flex-1">
          <h3 className="font-bold text-lg text-foreground mb-2">
            Enjoying Grok Builder?
          </h3>
          
          <p className="text-sm text-[var(--text-muted)] mb-1">
            You've built <span className="text-[var(--primary)] font-semibold">{usage.builds} apps</span> so far. 
          </p>
          
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Add a card to keep building.
            <br />
            <span className="text-[var(--primary)] font-medium">
              Pay only for what you use.
            </span>
          </p>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.location.href = '/add-card'}
              className="flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-xl"
            >
              <CreditCard size={16} />
              Add Card
            </button>
            
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-sm text-[var(--text-muted)] hover:text-foreground transition-colors"
            >
              Remind Me Later
            </button>
          </div>
          
          <p className="text-xs text-[var(--text-muted)] mt-3">
            $0.25/build • First 3 free • No subscription
          </p>
        </div>
      </div>
    </div>
  )
}
