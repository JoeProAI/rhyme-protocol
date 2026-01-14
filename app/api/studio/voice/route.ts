import { NextRequest, NextResponse } from 'next/server'

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY

// Curated voices for rap/hip-hop content
const RAP_VOICES = [
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', style: 'Deep & Smooth' },
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', style: 'Clear & Confident' },
  { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', style: 'Young & Energetic' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', style: 'Soft & Expressive' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', style: 'Warm & Narrative' },
  { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', style: 'Youthful & Bright' },
  { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', style: 'Deep & Authoritative' },
  { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', style: 'Crisp & Strong' },
]

// Max chars per chunk (ElevenLabs limit is ~5000, but we use less for better quality)
const MAX_CHUNK_CHARS = 1000

/**
 * Preprocess lyrics for better rap/hip-hop pronunciation
 * Adds pauses, emphasizes rhymes, handles slang
 */
function preprocessLyrics(text: string): string {
  let processed = text
  
  // Add slight pauses at line breaks for flow
  processed = processed.replace(/\n/g, '... \n')
  
  // Emphasize words in ALL CAPS by adding slight pause before
  processed = processed.replace(/\b([A-Z]{2,})\b/g, '... $1')
  
  // Common rap pronunciation fixes (using simple string replace to avoid regex issues)
  const pronunciations: [string, string][] = [
    ["finna", "finna"],
    ["tryna", "tryna"], 
    ["gonna", "gonna"],
    ["gotta", "gotta"],
    ["wanna", "wanna"],
    ["aint", "ain't"],
    ["dont", "don't"],
    ["cant", "can't"],
    ["wont", "won't"],
    ["yall", "y'all"],
    ["wassup", "what's up"],
    ["whatchu", "what you"],
    ["lemme", "let me"],
    ["gimme", "give me"],
  ]
  
  for (const [slang, pronunciation] of pronunciations) {
    processed = processed.split(new RegExp(`\\b${slang}\\b`, 'gi')).join(pronunciation)
  }
  
  // Add emphasis markers for rhyming words at end of lines
  // (words before line breaks get slight emphasis)
  processed = processed.replace(/(\w+)(\.\.\.?\s*\n)/g, '$1$2')
  
  return processed
}

/**
 * Split text into chunks at natural break points
 */
function chunkText(text: string, maxChars: number): string[] {
  const lines = text.split('\n')
  const chunks: string[] = []
  let currentChunk = ''
  
  for (const line of lines) {
    if ((currentChunk + '\n' + line).length > maxChars && currentChunk) {
      chunks.push(currentChunk.trim())
      currentChunk = line
    } else {
      currentChunk += (currentChunk ? '\n' : '') + line
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim())
  }
  
  return chunks
}

export async function POST(req: NextRequest) {
  if (!ELEVENLABS_API_KEY) {
    return NextResponse.json(
      { error: 'ElevenLabs not configured' },
      { status: 500 }
    )
  }

  try {
    const { 
      text, 
      voiceId = 'pNInz6obpgDQGcFmaJgB',
      chunkIndex = 0,
      preprocessForRap = true,
      speed = 1.0
    } = await req.json()

    if (!text || text.length > 10000) {
      return NextResponse.json(
        { error: 'Text required (max 10000 chars)' },
        { status: 400 }
      )
    }

    // Preprocess for better rap pronunciation if enabled
    const processedText = preprocessForRap ? preprocessLyrics(text) : text
    
    // Split into chunks for longer content
    const chunks = chunkText(processedText, MAX_CHUNK_CHARS)
    const totalChunks = chunks.length
    
    // Validate chunk index
    if (chunkIndex >= totalChunks) {
      return NextResponse.json(
        { error: 'Invalid chunk index', totalChunks },
        { status: 400 }
      )
    }
    
    const chunkToGenerate = chunks[chunkIndex]

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: chunkToGenerate,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability: 0.4,
            similarity_boost: 0.85,
            style: 0.6,
            use_speaker_boost: true,
          },
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('ElevenLabs error:', error)
      return NextResponse.json(
        { error: 'Voice generation failed' },
        { status: response.status }
      )
    }

    const audioBuffer = await response.arrayBuffer()
    const base64Audio = Buffer.from(audioBuffer).toString('base64')
    const audioUrl = `data:audio/mpeg;base64,${base64Audio}`

    return NextResponse.json({ 
      audioUrl,
      chunkIndex,
      totalChunks,
      hasMore: chunkIndex < totalChunks - 1,
      chunkText: chunkToGenerate.substring(0, 50) + '...'
    })
  } catch (error: any) {
    console.error('Voice API error:', error)
    return NextResponse.json(
      { error: error.message || 'Voice generation failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Return curated rap voices (works without API key for selection)
  return NextResponse.json({ voices: RAP_VOICES })
}
