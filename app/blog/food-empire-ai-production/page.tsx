'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, Calendar, Clock, Barcode, ShieldAlert, FileText, 
  MapPin, Music, DollarSign, Code, Lightbulb, Rocket, 
  RefreshCw, CheckCircle, ExternalLink, Sparkles
} from 'lucide-react'

// Section image component with generation capability
function SectionImage({ 
  prompt, 
  alt, 
  gradient 
}: { 
  prompt: string
  alt: string
  gradient: string 
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const generateImage = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/blog/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, style: 'tech' }),
      })
      const data = await res.json()
      if (data.image) {
        setImageUrl(data.image)
      } else {
        setError(data.error || 'Failed to generate')
      }
    } catch {
      setError('Generation failed')
    } finally {
      setLoading(false)
    }
  }

  if (imageUrl) {
    return (
      <div className="relative rounded-2xl overflow-hidden mb-8">
        <img src={imageUrl} alt={alt} className="w-full h-auto" />
        <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 bg-black/60 text-xs text-white rounded-full">
          <Sparkles className="w-3 h-3" /> GPT-Image-1
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`relative rounded-2xl overflow-hidden mb-8 h-64 md:h-80 ${gradient} flex items-center justify-center group cursor-pointer`}
      onClick={generateImage}
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-4 left-4 w-20 h-20 border border-white/30 rounded-lg animate-pulse" />
        <div className="absolute bottom-4 right-4 w-16 h-16 border border-white/30 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white/20 rounded-xl rotate-45" />
      </div>
      
      <div className="text-center z-10">
        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-white" />
            <span className="text-white/80 text-sm">Generating with GPT-Image-1...</span>
          </div>
        ) : error ? (
          <div className="text-red-300 text-sm">{error}</div>
        ) : (
          <div className="flex flex-col items-center gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
            <Sparkles className="w-8 h-8 text-white" />
            <span className="text-white text-sm">Click to generate AI image</span>
          </div>
        )}
      </div>
    </div>
  )
}

// Feature card component
function FeatureCard({ icon: Icon, title, description }: { 
  icon: React.ElementType
  title: string
  description: string 
}) {
  return (
    <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] hover:border-[var(--primary)] transition-colors">
      <Icon className="w-8 h-8 mb-4 text-[var(--primary)]" />
      <h4 className="font-bold text-lg mb-2">{title}</h4>
      <p className="text-[var(--text-muted)] text-sm">{description}</p>
    </div>
  )
}

// Cost comparison component
function CostComparison() {
  return (
    <div className="grid md:grid-cols-2 gap-6 my-8">
      <div className="p-6 rounded-xl border border-red-500/30 bg-red-500/10">
        <h4 className="font-bold text-red-400 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Before (Paid APIs)
        </h4>
        <ul className="space-y-2 text-sm">
          <li className="flex justify-between"><span>Barcode Lookup API</span><span className="text-red-400">$30/mo</span></li>
          <li className="flex justify-between"><span>UPC Database</span><span className="text-red-400">$30/mo</span></li>
          <li className="flex justify-between"><span>Nutritionix</span><span className="text-red-400">$50/mo</span></li>
          <li className="flex justify-between"><span>Google Vision</span><span className="text-red-400">$20/mo</span></li>
          <li className="flex justify-between border-t border-red-500/30 pt-2 mt-2 font-bold"><span>Total</span><span className="text-red-400">$130/month</span></li>
        </ul>
      </div>
      <div className="p-6 rounded-xl border border-green-500/30 bg-green-500/10">
        <h4 className="font-bold text-green-400 mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          After (Smart Free Tier)
        </h4>
        <ul className="space-y-2 text-sm">
          <li className="flex justify-between"><span>Open Food Facts</span><span className="text-green-400">FREE</span></li>
          <li className="flex justify-between"><span>USDA FoodData</span><span className="text-green-400">FREE</span></li>
          <li className="flex justify-between"><span>Google Vision (1k/mo)</span><span className="text-green-400">FREE</span></li>
          <li className="flex justify-between"><span>Nutritionix (200/day)</span><span className="text-green-400">FREE</span></li>
          <li className="flex justify-between border-t border-green-500/30 pt-2 mt-2 font-bold"><span>Total</span><span className="text-green-400">$0/month</span></li>
        </ul>
      </div>
    </div>
  )
}

export default function FoodEmpireAIBlog() {
  return (
    <main className="min-h-screen p-8 md:p-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-green-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#ffd700]/10 rounded-full blur-[120px]" />
      </div>

      <article className="max-w-4xl mx-auto">
        {/* Back Link */}
        <Link 
          href="/blog"
          className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--primary)] mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-4 text-sm text-[var(--text-muted)] mb-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              December 8, 2025
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              12 min read
            </span>
            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
              Case Study
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Building a Production-Quality Food Empire AI: 
            <span className="text-[var(--primary)]"> From Mock Data to Real APIs</span>
          </h1>
          
          <p className="text-xl text-[var(--text-muted)]">
            How I transformed a prototype with fake data into a production-ready food trading game 
            with intelligent APIs—while spending $0/month on external services.
          </p>
        </header>

        {/* Hero Image */}
        <SectionImage 
          prompt="Futuristic food trading game interface with holographic barcode scanner, floating food items, price data streams, and terminal aesthetic with green and gold neon accents"
          alt="Food Empire AI Hero"
          gradient="bg-gradient-to-br from-green-600/40 via-emerald-700/30 to-yellow-600/40"
        />

        {/* The Challenge */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Lightbulb className="w-8 h-8 text-yellow-500" />
            The Challenge
          </h2>
          <p className="text-lg text-gray-300 mb-4">
            When I started working on Food Empire AI, a food trading game with AI-powered features, 
            I faced a common problem: <strong className="text-white">mock data everywhere</strong>.
          </p>
          <ul className="space-y-2 text-gray-300 mb-6">
            <li className="flex items-start gap-2">
              <span className="text-red-400">✗</span>
              The barcode scanner returned fake prices
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400">✗</span>
              The invoice OCR showed hardcoded results
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400">✗</span>
              The supplier map displayed only NYC locations—no matter where you were
            </li>
          </ul>
          <div className="p-6 rounded-xl border-l-4 border-[var(--primary)] bg-[var(--card-bg)]">
            <p className="text-lg font-medium text-white">
              The goal: <span className="text-[var(--primary)]">Transform this prototype into a production-quality 
              application</span> with real data, intelligent APIs, and a seamless user experience.
            </p>
          </div>
        </section>

        {/* What We Built */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">What We Built</h2>
          
          {/* 1. Barcode Scanner */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <Barcode className="w-6 h-6 text-blue-400" />
              1. Intelligent Barcode Scanner (Vital Matrix Architecture)
            </h3>
            
            <SectionImage 
              prompt="High-tech barcode scanning interface with laser beams, product database visualization, price estimation algorithm display, dark terminal aesthetic with blue neon"
              alt="Barcode Scanner"
              gradient="bg-gradient-to-br from-blue-600/40 via-indigo-700/30 to-purple-600/40"
            />
            
            <p className="text-gray-300 mb-4">
              Instead of relying on expensive barcode lookup APIs, we implemented a <strong className="text-white">FREE solution</strong> using 
              Open Food Facts combined with intelligent price estimation.
            </p>
            
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <FeatureCard 
                icon={Barcode}
                title="Native Detection"
                description="BarcodeDetector API with ZXing fallback for universal support"
              />
              <FeatureCard 
                icon={DollarSign}
                title="Smart Pricing"
                description="70+ food categories with brand-aware price estimation"
              />
            </div>
            
            <div className="p-4 rounded-xl bg-black/50 border border-[var(--border)] font-mono text-sm overflow-x-auto">
              <div className="text-[var(--text-muted)]">// Example: Organic milk, 1 gallon</div>
              <div className="text-gray-300">Base price: $4.00 (dairy category)</div>
              <div className="text-green-400">× 1.3 (organic premium)</div>
              <div className="text-blue-400">× 1.0 (1 gallon quantity)</div>
              <div className="text-[var(--primary)] font-bold">= $5.20 estimated price</div>
            </div>
          </div>
          
          {/* 2. Food ID */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <ShieldAlert className="w-6 h-6 text-red-400" />
              2. Food ID with Allergen Detection
            </h3>
            
            <SectionImage 
              prompt="AI allergen detection system analyzing food, molecular structure visualization, warning symbols for nuts peanuts gluten floating in holographic display, medical tech aesthetic, dark with red and blue accents"
              alt="Allergen Detection"
              gradient="bg-gradient-to-br from-red-600/40 via-orange-700/30 to-yellow-600/40"
            />
            
            <p className="text-gray-300 mb-4">
              Multi-source food identification with comprehensive allergen warnings:
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {['USDA FoodData', 'Nutritionix', 'Google Vision', 'Open Food Facts'].map(source => (
                <div key={source} className="p-3 rounded-lg bg-[var(--card-bg)] border border-[var(--border)] text-center text-sm">
                  {source}
                </div>
              ))}
            </div>
            
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
              <h4 className="font-bold text-red-400 mb-2">⚠️ Example Alert</h4>
              <p className="text-sm text-gray-300">
                User scans protein bar → System detects: &quot;Contains peanuts, soy, dairy&quot; → 
                Displays nutritional breakdown → Shows HIGH RISK warning
              </p>
            </div>
          </div>
          
          {/* 3. Invoice OCR */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <FileText className="w-6 h-6 text-purple-400" />
              3. Invoice OCR with Zero Mock Data
            </h3>
            
            <SectionImage 
              prompt="Digital invoice being scanned by OCR AI, paper transforming into structured data streams, floating numbers and text extraction, tech corporate style, blue and purple with white data"
              alt="Invoice OCR"
              gradient="bg-gradient-to-br from-purple-600/40 via-violet-700/30 to-pink-600/40"
            />
            
            <div className="grid md:grid-cols-3 gap-4">
              <FeatureCard 
                icon={FileText}
                title="Google Vision OCR"
                description="Real text extraction, no fake fallbacks"
              />
              <FeatureCard 
                icon={Barcode}
                title="Price Validation"
                description="Integrates with barcode pricing system"
              />
              <FeatureCard 
                icon={DollarSign}
                title="$1.50/1K Invoices"
                description="First 1,000 free monthly"
              />
            </div>
          </div>
          
          {/* 4. Supplier Map */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <MapPin className="w-6 h-6 text-green-400" />
              4. Real-Time Supplier Map
            </h3>
            
            <SectionImage 
              prompt="Interactive 3D map showing supplier locations with glowing pins, food delivery trucks, warehouse icons, real-time tracking, satellite view with augmented reality overlay, green and gold"
              alt="Supplier Map"
              gradient="bg-gradient-to-br from-green-600/40 via-teal-700/30 to-cyan-600/40"
            />
            
            <p className="text-gray-300 mb-4">
              Replaced hardcoded NYC locations with <strong className="text-white">dynamic, location-aware</strong> supplier discovery 
              using Google Places API.
            </p>
            
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="font-bold text-green-400">Result</span>
              </div>
              <p className="text-gray-300 text-sm">
                Found 50+ real suppliers in Washington DC (vs 5 fake NYC locations before)
              </p>
            </div>
          </div>
          
          {/* 5. Music Player */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <Music className="w-6 h-6 text-pink-400" />
              5. Persistent Music Player
            </h3>
            
            <p className="text-gray-300 mb-4">
              Built a minimal, non-intrusive music experience with a ticker-style bar that plays 
              continuously through all navigation—even during full-screen camera scanning.
            </p>
          </div>
        </section>

        {/* Cost Breakdown */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-green-500" />
            The Cost Breakdown
          </h2>
          <CostComparison />
          <p className="text-center text-[var(--text-muted)]">
            <strong className="text-green-400">Upgrade path:</strong> As usage grows, estimated cost: $20-50/mo for production traffic
          </p>
        </section>

        {/* Tech Architecture */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Code className="w-8 h-8 text-blue-500" />
            Technical Architecture
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--card-bg)]">
              <h4 className="font-bold mb-4 text-[var(--primary)]">API Routes Created</h4>
              <ul className="space-y-3 text-sm font-mono">
                <li className="flex items-center gap-2">
                  <span className="text-green-400">/api/food-id</span>
                  <span className="text-[var(--text-muted)]">Multi-source food ID</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">/api/barcode-price</span>
                  <span className="text-[var(--text-muted)]">Smart pricing</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">/api/ocr</span>
                  <span className="text-[var(--text-muted)]">Invoice extraction</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">/api/suppliers/nearby</span>
                  <span className="text-[var(--text-muted)]">Location search</span>
                </li>
              </ul>
            </div>
            <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--card-bg)]">
              <h4 className="font-bold mb-4 text-[var(--primary)]">Tech Stack</h4>
              <div className="flex flex-wrap gap-2">
                {['Next.js 14', 'TypeScript', 'Tailwind CSS', 'ZXing', 'Google Cloud', 'USDA API'].map(tech => (
                  <span key={tech} className="px-3 py-1 bg-[var(--primary)]/20 text-[var(--primary)] text-sm rounded-full">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Lessons Learned */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Lightbulb className="w-8 h-8 text-yellow-500" />
            Lessons Learned
          </h2>
          
          <div className="space-y-4">
            {[
              { title: 'Free Doesn\'t Mean Low Quality', desc: 'Open Food Facts has 1.9M products. Combined with smart estimation, it rivals paid services.' },
              { title: 'UX > Feature Bloat', desc: 'A minimal ticker music player beats a large, intrusive one. Full-screen scanning is essential on mobile.' },
              { title: 'Progressive Enhancement Works', desc: 'Start with native APIs (BarcodeDetector), fall back gracefully (ZXing).' },
              { title: 'Smart Estimation Beats No Data', desc: '70% confidence pricing is better than "price not available".' },
              { title: 'Real-Time Data Changes Everything', desc: 'Users in different cities see different suppliers. That\'s the difference between demo and product.' },
            ].map((lesson, i) => (
              <div key={i} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card-bg)]">
                <h4 className="font-bold text-white mb-1">{i + 1}. {lesson.title}</h4>
                <p className="text-[var(--text-muted)] text-sm">{lesson.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Conclusion */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Rocket className="w-8 h-8 text-[var(--primary)]" />
            Conclusion
          </h2>
          
          <p className="text-lg text-gray-300 mb-6">
            Building Food Empire AI taught me that <strong className="text-white">production quality doesn&apos;t require 
            expensive APIs</strong>—it requires smart architecture. By combining free, high-quality data sources, 
            intelligent estimation algorithms, and user-centric design, we created a fully functional, 
            production-ready application with zero monthly costs for moderate usage.
          </p>
          
          <div className="p-6 rounded-xl border-2 border-[var(--primary)] bg-[var(--primary)]/10">
            <p className="text-xl font-bold text-center text-white">
              The key takeaway? <span className="text-[var(--primary)]">Don&apos;t pay for data you can estimate intelligently.</span>
            </p>
          </div>
        </section>

        {/* Stats Footer */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { label: 'Cost', value: '$0/mo', color: 'text-green-400' },
            { label: 'Lines of Code', value: '~3,000', color: 'text-blue-400' },
            { label: 'Mock Data', value: '0%', color: 'text-purple-400' },
            { label: 'Production Ready', value: '✓', color: 'text-[var(--primary)]' },
          ].map(stat => (
            <div key={stat.label} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] text-center">
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-[var(--text-muted)] text-sm">{stat.label}</div>
            </div>
          ))}
        </section>

        {/* CTA */}
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <a 
            href="https://github.com/JoeProAI/food-empire-ai" 
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg hover:border-[var(--primary)] transition-colors"
          >
            <Code className="w-5 h-5" />
            View on GitHub
          </a>
          <a 
            href="https://food-empire-ai.vercel.app" 
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center justify-center gap-2 px-6 py-3"
          >
            <ExternalLink className="w-5 h-5" />
            Try Live Demo
          </a>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-[var(--border)] text-center text-[var(--text-muted)] text-sm">
          <p>Built with Next.js, TypeScript, Google Cloud APIs, USDA FoodData, Open Food Facts</p>
        </footer>
      </article>
    </main>
  )
}
