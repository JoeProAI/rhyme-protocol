import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Rhyme Protocol - AI tools for rap artists'
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
          background: 'linear-gradient(135deg, #07070d 0%, #11121f 46%, #17100d 100%)',
          position: 'relative',
          padding: '54px 62px',
          overflow: 'hidden',
          color: '#f8fafc',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 78% 22%, rgba(255, 180, 74, 0.36) 0%, rgba(255, 180, 74, 0) 30%), radial-gradient(circle at 20% 82%, rgba(45, 212, 191, 0.24) 0%, rgba(45, 212, 191, 0) 32%), radial-gradient(circle at 58% 52%, rgba(147, 51, 234, 0.18) 0%, rgba(147, 51, 234, 0) 36%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 36,
            border: '1px solid rgba(248, 250, 252, 0.14)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 760,
            right: 62,
            top: 314,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            opacity: 0.62,
          }}
        >
          {Array.from({ length: 24 }).map((_, index) => (
            <div
              key={index}
              style={{
                width: 11,
                height: 18 + ((index * 17) % 70),
                background:
                  index % 5 === 0
                    ? 'rgba(255, 180, 74, 0.92)'
                    : index % 3 === 0
                      ? 'rgba(45, 212, 191, 0.72)'
                      : 'rgba(248, 250, 252, 0.32)',
              }}
            />
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              fontSize: 22,
              letterSpacing: '4px',
              fontWeight: 800,
              color: '#facc6b',
            }}
          >
            <span>RHYME_PROTOCOL</span>
          </div>
          <div
            style={{
              display: 'flex',
              gap: 10,
              fontSize: 17,
              letterSpacing: '2px',
              color: '#a7f3d0',
              fontWeight: 700,
            }}
          >
            <span>LYRICS</span>
            <span>·</span>
            <span>COVERS</span>
            <span>·</span>
            <span>VIDEO</span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            maxWidth: 820,
          }}
        >
          <div
            style={{
              fontSize: 86,
              fontWeight: 900,
              letterSpacing: '-4px',
              lineHeight: 0.92,
              textTransform: 'uppercase',
            }}
          >
            AI TOOLS FOR RAP ARTISTS
          </div>
          <div
            style={{
              fontSize: 29,
              lineHeight: 1.25,
              color: '#d7e0ff',
              fontWeight: 600,
              maxWidth: 760,
            }}
          >
            Write sharper bars, generate cover art, and build cinematic music visuals from one studio.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 12,
            }}
          >
            {['SPAR_WITH_THE_STYLE', 'LYRIC_LAB', 'VIDEO_GEN'].map((label) => (
              <div
                key={label}
                style={{
                  border: '1px solid rgba(250, 204, 107, 0.44)',
                  background: 'rgba(7, 7, 13, 0.62)',
                  padding: '13px 16px',
                  fontSize: 16,
                  letterSpacing: '1.4px',
                  color: '#f8fafc',
                  fontWeight: 800,
                }}
              >
                {label}
              </div>
            ))}
          </div>
          <div
            style={{
              fontSize: 22,
              color: '#facc6b',
              letterSpacing: '1px',
              fontWeight: 800,
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
