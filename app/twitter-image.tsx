import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Rhyme Protocol - Creator resources to make more from what you have'
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
          background: 'linear-gradient(140deg, #0d0f12 0%, #191d24 52%, #121412 100%)',
          position: 'relative',
          padding: '56px 64px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -140,
            right: -120,
            width: 540,
            height: 540,
            background: 'radial-gradient(circle, rgba(207, 181, 114, 0.28) 0%, rgba(207, 181, 114, 0) 68%)',
            borderRadius: '50%',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -180,
            left: -120,
            width: 560,
            height: 560,
            background: 'radial-gradient(circle, rgba(115, 157, 122, 0.24) 0%, rgba(115, 157, 122, 0) 70%)',
            borderRadius: '50%',
          }}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            zIndex: 2,
          }}
        >
          <div
            style={{
              fontSize: 86,
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '-3px',
              lineHeight: 0.92,
              textTransform: 'uppercase',
            }}
          >
            RHYME PROTOCOL
          </div>
          <div
            style={{
              fontSize: 26,
              color: '#f0e4c0',
              letterSpacing: '1.4px',
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
          >
            Resources for creators to earn more
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 2,
          }}
        >
          <div
            style={{
              fontSize: 22,
              color: '#f2f4ff',
              letterSpacing: '0.4px',
              opacity: 0.94,
            }}
          >
            Playbooks. Tools. Revenue systems.
          </div>
          <div
            style={{
              fontSize: 20,
              color: '#f2f4ff',
              letterSpacing: '0.8px',
              opacity: 0.9,
            }}
          >
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
