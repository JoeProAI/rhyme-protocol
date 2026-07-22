/**
 * ElevenLabs voice layer for dub mode.
 *
 * Voice consistency is solved by construction: one voice_id per character,
 * deterministic on every line. Seedance animates the mouth saying the line;
 * these functions produce the voice that gets dubbed over it.
 */

const EL_BASE = 'https://api.elevenlabs.io/v1'

function elKey(): string {
  const key = process.env.ELEVENLABS_API_KEY
  if (!key) throw new Error('ELEVENLABS_API_KEY is not configured')
  return key
}

export interface CastVoice {
  voiceId: string
  name: string
  labels?: string
}

/** Voices available for casting — shown in the board's cast panel. */
export async function listVoices(): Promise<CastVoice[]> {
  const res = await fetch(`${EL_BASE}/voices`, {
    headers: { 'xi-api-key': elKey() },
  })
  if (!res.ok) {
    throw new Error(`ElevenLabs voices ${res.status}: ${(await res.text()).slice(0, 200)}`)
  }
  const data = (await res.json()) as {
    voices?: { voice_id: string; name: string; labels?: Record<string, string> }[]
  }
  return (data.voices ?? []).map((v) => ({
    voiceId: v.voice_id,
    name: v.name,
    labels: v.labels ? Object.values(v.labels).filter(Boolean).join(', ') : undefined,
  }))
}

const TTS_MODEL = process.env.CLIPCHAIN_TTS_MODEL ?? 'eleven_multilingual_v2'

/** Render one line in a cast voice. Returns MP3 bytes. */
export async function ttsLine(voiceId: string, line: string): Promise<Buffer> {
  const res = await fetch(`${EL_BASE}/text-to-speech/${encodeURIComponent(voiceId)}`, {
    method: 'POST',
    headers: {
      'xi-api-key': elKey(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: line,
      model_id: TTS_MODEL,
      voice_settings: { stability: 0.5, similarity_boost: 0.8 },
    }),
  })
  if (!res.ok) {
    throw new Error(`ElevenLabs TTS ${res.status}: ${(await res.text()).slice(0, 200)}`)
  }
  return Buffer.from(await res.arrayBuffer())
}
