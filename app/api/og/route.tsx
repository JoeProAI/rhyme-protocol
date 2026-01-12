import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const title = searchParams.get('title') || 'Build Smarter with AI'
  const subtitle = searchParams.get('subtitle') || 'Ship AI apps 10x faster'

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

        {/* Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: 32,
        }}>
          <div style={{
            fontSize: 42,
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-1px',
          }}>
            JoePro
          </div>
          <div style={{
            fontSize: 42,
            fontWeight: 800,
            color: '#d4a017',
            letterSpacing: '-1px',
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
            fontSize: 52,
            fontWeight: 700,
            color: '#ffffff',
            textAlign: 'center',
            lineHeight: 1.15,
            marginBottom: 16,
            letterSpacing: '-1px',
          }}>
            {title}
          </div>
          <div style={{
            fontSize: 24,
            color: '#94a3b8',
            textAlign: 'center',
            maxWidth: '80%',
          }}>
            {subtitle}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          position: 'absolute',
          bottom: 32,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <div style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: '#d4a017',
          }} />
          <div style={{ 
            color: '#64748b', 
            fontSize: 16,
            fontWeight: 500,
          }}>
            joepro.ai
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
