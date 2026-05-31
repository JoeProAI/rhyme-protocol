import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Rhyme Protocol - AI Music Video Generator'
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
          justifyContent: 'space-between',
          background: 'linear-gradient(145deg, #06070b 0%, #101226 45%, #1a0f27 100%)',
          position: 'relative',
          padding: '56px 64px',
          overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute',
          top: -180,
          right: -160,
          width: 640,
          height: 640,
          background: 'radial-gradient(circle, rgba(0, 235, 255, 0.28) 0%, rgba(0, 235, 255, 0) 68%)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute',
          bottom: -180,
          left: -180,
          width: 640,
          height: 640,
          background: 'radial-gradient(circle, rgba(255, 30, 160, 0.24) 0%, rgba(255, 30, 160, 0) 70%)',
          borderRadius: '50%',
        }} />

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          zIndex: 2,
        }}>
          <div style={{
            fontSize: 82,
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-3px',
            lineHeight: 0.95,
            textTransform: 'uppercase',
          }}>
            RHYME PROTOCOL
          </div>
          <div style={{
            fontSize: 30,
            fontWeight: 600,
            color: '#b6c3ff',
            letterSpacing: '2px',
            textTransform: 'uppercase',
          }}>
            AI MUSIC VIDEO GENERATOR
          </div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 2,
        }}>
          <div style={{
            fontSize: 24,
            color: '#76f5ff',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            fontWeight: 700,
          }}>
            Cinematic Rap Visuals with AI
          </div>
          <div style={{
            fontSize: 22,
            color: '#e7e9ff',
            letterSpacing: '0.8px',
            opacity: 0.92,
          }}>
            rhymeprotocol.com
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
