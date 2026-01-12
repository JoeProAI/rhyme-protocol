'use client'

import { useState } from 'react'
import { CreditCard, Lock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function AddCard() {
  const [loading, setLoading] = useState(false)
  
  const handleAddCard = async () => {
    setLoading(true)
    
    try {
      // TODO: Integrate with Stripe Checkout
      // const response = await fetch('/api/checkout/create-session', {
      //   method: 'POST',
      // })
      // const { url } = await response.json()
      // window.location.href = url
      
      alert('Stripe integration coming soon! For now, this is just a demo.')
    } catch (error) {
      console.error('Failed to start checkout:', error)
      alert('Failed to start checkout. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen relative z-10 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Link 
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
        
        <div className="glass card-border p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--primary)]/10 rounded-full mb-4">
              <CreditCard className="text-[var(--primary)]" size={32} />
            </div>
            
            <h1 className="text-3xl font-bold mb-2">
              <span className="text-white">Add</span>
              <span className="text-[var(--primary)]"> Payment Method</span>
            </h1>
            
            <p className="text-sm text-[var(--text-muted)]">
              Start using JoePro.ai without limits
            </p>
          </div>
          
          {/* Benefits */}
          <div className="space-y-3 mb-8">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[var(--primary)] text-xs">✓</span>
              </div>
              <div>
                <p className="text-sm font-medium">Pay only for what you use</p>
                <p className="text-xs text-[var(--text-muted)]">No subscriptions or hidden fees</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[var(--primary)] text-xs">✓</span>
              </div>
              <div>
                <p className="text-sm font-medium">Unlimited builds & sandboxes</p>
                <p className="text-xs text-[var(--text-muted)]">Create as many apps as you need</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[var(--primary)] text-xs">✓</span>
              </div>
              <div>
                <p className="text-sm font-medium">Billed monthly</p>
                <p className="text-xs text-[var(--text-muted)]">See exactly what you're paying for</p>
              </div>
            </div>
          </div>
          
          {/* Pricing Preview */}
          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-4 mb-6">
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-3">Pricing</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">AI Build</span>
                <span className="font-mono text-[var(--primary)]">$0.25</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Sandbox</span>
                <span className="font-mono text-[var(--primary)]">$0.10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Runtime/hour</span>
                <span className="font-mono text-[var(--primary)]">$0.02</span>
              </div>
            </div>
          </div>
          
          {/* CTA Button */}
          <button
            onClick={handleAddCard}
            disabled={loading}
            className="w-full px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Add Payment Method'}
          </button>
          
          {/* Security Notice */}
          <div className="flex items-center justify-center gap-2 mt-6 text-xs text-[var(--text-muted)]">
            <Lock size={12} />
            <span>Secured by Stripe • Cancel anytime</span>
          </div>
        </div>
      </div>
    </div>
  )
}
