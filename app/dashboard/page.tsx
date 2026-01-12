'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { DollarSign, Zap, Database, Clock, CreditCard, MessageSquare, Video, Image, Bot, CheckCircle } from 'lucide-react'

function DashboardContent() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const searchParams = useSearchParams()
  const setupSuccess = searchParams.get('setup') === 'success'
  
  useEffect(() => {
    fetch('/api/usage/me')
      .then(r => r.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch usage:', err)
        setLoading(false)
      })
  }, [])

  const handleAddCard = async () => {
    setCheckoutLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnUrl: window.location.href }),
      })
      const { url, error } = await res.json()
      if (error) {
        alert(error)
        setCheckoutLoading(false)
        return
      }
      if (url) {
        window.location.href = url
      }
    } catch (err) {
      console.error('Checkout error:', err)
      alert('Failed to start checkout. Please try again.')
      setCheckoutLoading(false)
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto mb-4"></div>
          <p className="text-[var(--text-muted)]">Loading usage data...</p>
        </div>
      </div>
    )
  }
  
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--text-muted)]">Unable to load usage data</p>
        </div>
      </div>
    )
  }
  
  const { usage, breakdown, daily, limits, pricing, month, storage_configured } = data
  
  return (
    <div className="min-h-screen relative z-10">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Success Banner */}
        {setupSuccess && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3">
            <CheckCircle className="text-green-500" size={24} />
            <span className="text-green-400">Payment method added successfully! You now have unlimited access.</span>
          </div>
        )}

        <h1 className="text-4xl font-bold mb-2">
          <span className="text-white">Usage</span>
          <span className="text-[var(--primary)]"> Dashboard</span>
        </h1>
        
        <p className="text-[var(--text-muted)] mb-8">
          {month} • {usage?.hasCard ? 'Unlimited Access' : 'Free Tier'} • Daily limits reset at midnight UTC
        </p>
        
        {/* Current Month Cost */}
        <div className="glass card-border p-8 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 to-transparent"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text-muted)] mb-2 uppercase tracking-wide">
                Current Month Total
              </p>
              <p className="text-5xl font-bold text-[var(--primary)] mb-1">
                ${usage.totalCost.toFixed(2)}
              </p>
              {!usage.hasCard && usage.totalCost === 0 && (
                <p className="text-sm text-[var(--text-muted)]">
                  {usage.freeUsesLeft} free builds remaining
                </p>
              )}
            </div>
            <div className="p-4 bg-[var(--primary)]/10 rounded-xl">
              <DollarSign size={48} className="text-[var(--primary)]" />
            </div>
          </div>
        </div>
        
        {/* Daily Usage - Free Tier Limits */}
        {daily && !usage?.hasCard && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-white">Today's Usage</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <DailyUsageCard
                icon={<MessageSquare className="text-[var(--primary)]" size={20} />}
                label="Chat Messages"
                used={daily.chat_messages?.used || 0}
                limit={limits?.chat_messages || 20}
              />
              <DailyUsageCard
                icon={<Video className="text-[var(--primary)]" size={20} />}
                label="Video Generations"
                used={daily.video_generations?.used || 0}
                limit={limits?.video_generations || 2}
              />
              <DailyUsageCard
                icon={<Image className="text-[var(--primary)]" size={20} />}
                label="Image Edits"
                used={daily.image_edits?.used || 0}
                limit={limits?.image_edits || 10}
              />
              <DailyUsageCard
                icon={<Bot className="text-[var(--primary)]" size={20} />}
                label="Agent Calls"
                used={daily.agent_calls?.used || 0}
                limit={limits?.agent_calls || 10}
              />
              <DailyUsageCard
                icon={<Zap className="text-[var(--primary)]" size={20} />}
                label="AI Assists"
                used={daily.ai_assists?.used || 0}
                limit={limits?.ai_assists || 20}
              />
              <DailyUsageCard
                icon={<Clock className="text-[var(--primary)]" size={20} />}
                label="Sandbox Hours"
                used={daily.sandbox_hours?.used || 0}
                limit={limits?.sandbox_hours || 1}
              />
            </div>
          </div>
        )}

        {/* Usage Breakdown - For paying users */}
        {usage?.hasCard && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <UsageCard
              icon={<MessageSquare className="text-[var(--primary)]" size={24} />}
              label="Chat Messages"
              value={daily?.chat_messages?.used || 0}
              unitPrice={pricing?.chat_message || 0.01}
              total={(daily?.chat_messages?.used || 0) * (pricing?.chat_message || 0.01)}
            />
            
            <UsageCard
              icon={<Video className="text-[var(--primary)]" size={24} />}
              label="Video Segments"
              value={daily?.video_generations?.used || 0}
              unitPrice={pricing?.video_segment || 0.50}
              total={(daily?.video_generations?.used || 0) * (pricing?.video_segment || 0.50)}
            />
            
            <UsageCard
              icon={<Bot className="text-[var(--primary)]" size={24} />}
              label="Agent Calls"
              value={daily?.agent_calls?.used || 0}
              unitPrice={pricing?.agent_call || 0.01}
              total={(daily?.agent_calls?.used || 0) * (pricing?.agent_call || 0.01)}
            />
            
            <UsageCard
              icon={<Zap className="text-[var(--primary)]" size={24} />}
              label="AI Assists"
              value={daily?.ai_assists?.used || 0}
              unitPrice={pricing?.ai_assist || 0.01}
              total={(daily?.ai_assists?.used || 0) * (pricing?.ai_assist || 0.01)}
            />
          </div>
        )}
        
        {/* Payment Status */}
        {!usage.hasCard && (
          <div className="glass card-border border-2 border-[var(--primary)] p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[var(--primary)]/10 rounded-lg">
                <CreditCard className="text-[var(--primary)]" size={24} />
              </div>
              
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">Add a card to continue</h3>
                <p className="text-sm text-[var(--text-muted)] mb-4">
                  You'll be billed monthly for your usage. No subscription required.
                  <br />
                  <span className="text-[var(--primary)]">Pay only for what you use.</span>
                </p>
                <button 
                  onClick={handleAddCard}
                  disabled={checkoutLoading}
                  className="px-6 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {checkoutLoading ? 'Loading...' : 'Add Payment Method'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {usage.hasCard && (
          <div className="glass card-border p-6">
            <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
              <CreditCard size={16} className="text-[var(--primary)]" />
              <span>Payment method added • Billed monthly</span>
            </div>
          </div>
        )}
        
        {/* Pricing Info */}
        <div className="mt-12 glass card-border p-6">
          <h3 className="font-bold text-lg mb-4">Pricing</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between py-2 border-b border-[var(--border)]">
              <span className="text-[var(--text-muted)]">AI App Build</span>
              <span className="font-mono text-[var(--primary)]">$0.25</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[var(--border)]">
              <span className="text-[var(--text-muted)]">Sandbox Create</span>
              <span className="font-mono text-[var(--primary)]">$0.10</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[var(--border)]">
              <span className="text-[var(--text-muted)]">Runtime Hour</span>
              <span className="font-mono text-[var(--primary)]">$0.02</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[var(--border)]">
              <span className="text-[var(--text-muted)]">API Call</span>
              <span className="font-mono text-[var(--primary)]">$0.01</span>
            </div>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-4">
            First 3 builds are free. No subscriptions. No hidden fees.
          </p>
        </div>
      </div>
    </div>
  )
}

interface UsageCardProps {
  icon: React.ReactNode
  label: string
  value: number
  unitPrice: number
  total: number
}

function UsageCard({ icon, label, value, unitPrice, total }: UsageCardProps) {
  return (
    <div className="glass card-border p-5 hover:border-[var(--primary)] transition-all">
      <div className="flex items-center gap-3 mb-3">
        {icon}
        <span className="text-sm text-[var(--text-muted)] font-medium">{label}</span>
      </div>
      <p className="text-3xl font-bold text-foreground mb-1">{value}</p>
      <p className="text-xs text-[var(--text-muted)]">
        ${unitPrice.toFixed(2)} each • <span className="text-[var(--primary)]">${total.toFixed(2)}</span> total
      </p>
    </div>
  )
}

interface DailyUsageCardProps {
  icon: React.ReactNode
  label: string
  used: number
  limit: number
}

function DailyUsageCard({ icon, label, used, limit }: DailyUsageCardProps) {
  const percentage = Math.min((used / limit) * 100, 100)
  const remaining = Math.max(limit - used, 0)
  const isNearLimit = percentage >= 80
  const isAtLimit = percentage >= 100
  
  return (
    <div className={`glass card-border p-4 transition-all ${isAtLimit ? 'border-red-500/50' : isNearLimit ? 'border-yellow-500/50' : ''}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-sm text-[var(--text-muted)] font-medium">{label}</span>
      </div>
      <div className="flex items-baseline gap-2 mb-2">
        <span className={`text-2xl font-bold ${isAtLimit ? 'text-red-400' : 'text-white'}`}>{used}</span>
        <span className="text-sm text-[var(--text-muted)]">/ {limit}</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-1.5 mb-1">
        <div 
          className={`h-1.5 rounded-full transition-all ${isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-yellow-500' : 'bg-[var(--primary)]'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-[var(--text-muted)]">
        {remaining} remaining today
      </p>
    </div>
  )
}

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto mb-4"></div>
          <p className="text-[var(--text-muted)]">Loading dashboard...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
