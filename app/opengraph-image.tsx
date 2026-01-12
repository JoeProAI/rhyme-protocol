import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'JoePro.ai – Build Smarter with AI'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a1628 0%, #1a0a28 50%, #0a1628 100%)',
          position: 'relative',
        }}
      >
        {/* Subtle gradient orbs */}
        <div style={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 400,
          height: 400,
          background: 'radial-gradient(circle, rgba(212,160,23,0.15) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute',
          bottom: -100,
          left: -100,
          width: 300,
          height: 300,
          background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />

        {/* Lightning bolt icon */}
        <svg width="120" height="120" viewBox="0 0 512 512" style={{ marginBottom: '24px' }}>
          <defs>
            <linearGradient id="boltGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#00F0FF' }} />
              <stop offset="50%" style={{ stopColor: '#A855F7' }} />
              <stop offset="100%" style={{ stopColor: '#FF10F0' }} />
            </linearGradient>
          </defs>
          <path d="M 300 80 L 180 250 L 260 250 L 200 430 L 340 220 L 260 220 L 300 80" 
                fill="url(#boltGrad)" />
        </svg>

        {/* Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: 32,
        }}>
          <div style={{
            fontSize: 64,
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-2px',
          }}>
            JoePro
          </div>
          <div style={{
            fontSize: 64,
            fontWeight: 800,
            color: '#d4a017',
            letterSpacing: '-2px',
          }}>
            .ai
          </div>
        </div>

        {/* Title */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: '85%',
        }}>
          <div style={{
            fontSize: 48,
            fontWeight: 700,
            color: '#ffffff',
            textAlign: 'center',
            lineHeight: 1.2,
            marginBottom: 16,
            letterSpacing: '-1px',
          }}>
            Build Smarter with AI
          </div>
          <div style={{
            fontSize: 24,
            color: '#94a3b8',
            textAlign: 'center',
            maxWidth: '80%',
          }}>
            Custom AI agents, video generation, and instant dev environments
          </div>
        </div>

        {/* Bottom accent */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          background: 'linear-gradient(to right, transparent, #d4a017, transparent)',
          opacity: 0.5,
        }} />
      </div>
    ),
    {
      ...size,
    }
  )
}
