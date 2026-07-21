/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Enable instrumentation for PostHog
  experimental: {
    instrumentationHook: true,
    // Ensure the platform ffmpeg binary ships with the clipchain functions
    outputFileTracingIncludes: {
      '/api/clipchain/**': ['./node_modules/ffmpeg-static/**'],
    },
    // Keep ffmpeg-static un-bundled: webpack rewrites its __dirname-based
    // binary path to the chunks dir, which doesn't contain the binary.
    serverComponentsExternalPackages: ['ffmpeg-static'],
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/prompt-racer',
        destination: 'https://prompt-racer.vercel.app/',
        permanent: false,
      },
    ];
  },
  
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [],
  },
  
  // Environment variables exposed to the browser
  env: {
    NEXT_PUBLIC_APP_NAME: 'Rhyme Protocol',
  },
  
  // Headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
        ],
      },
    ];
  },
};

export default nextConfig;
