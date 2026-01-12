import { NextResponse } from 'next/server'

export const runtime = 'edge'

/**
 * GET /api/video-gen/test
 * Test endpoint to verify API keys are configured
 */
export async function GET() {
  const checks = {
    openai: !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here',
    getimg: !!process.env.GETIMG_API_KEY && process.env.GETIMG_API_KEY !== 'your_getimg_api_key_here',
    gemini: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here',
  }
  
  const allConfigured = Object.values(checks).every(v => v)
  
  return NextResponse.json({
    configured: allConfigured,
    services: {
      'OpenAI (GPT-Image-1)': checks.openai ? '✅ Configured' : '❌ Missing',
      'GetImg.ai (Video)': checks.getimg ? '✅ Configured' : '❌ Missing',
      'Gemini (Nano Banana Pro)': checks.gemini ? '✅ Configured' : '❌ Missing',
    },
    message: allConfigured 
      ? 'All APIs configured! Ready to generate videos.' 
      : 'Some API keys are missing. Add them to your Vercel environment variables.',
    instructions: {
      openai: 'https://platform.openai.com/api-keys',
      getimg: 'https://getimg.ai/dashboard',
      gemini: 'https://aistudio.google.com/app/apikey',
    }
  })
}
