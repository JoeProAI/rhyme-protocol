import VoiceIsolator from '@/components/VoiceIsolator'

export const metadata = {
  title: 'Voice Cleaner, Free Vocal Isolation | Rhyme Protocol',
  description:
    'Free AI vocal isolation for rappers and producers. Strip beats, room noise, and background bleed from any audio. Powered by ElevenLabs. Up to 25MB, 30 free isolations a day.',
}

export default function VoiceCleanPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <div className="mb-10">
        <div className="text-[10px] font-mono tracking-widest text-accent mb-3">
          STUDIO · VOICE CLEANER
        </div>
        <h1 className="text-4xl sm:text-5xl font-display tracking-tight text-text mb-4">
          Pull the vocals out of any clip.
        </h1>
        <p className="text-base text-text-secondary leading-relaxed max-w-xl">
          Phone recording over a beat, voice memo on a noisy bus, rough demo
          you cut on the train, drop it in. We strip the music and the room
          and hand back the acapella. Free. No login. 30 a day per session.
        </p>
      </div>

      <div className="border border-border-subtle bg-surface p-5 sm:p-6 mb-8">
        <VoiceIsolator />
      </div>

      <div className="grid sm:grid-cols-2 gap-4 text-sm">
        <div className="border border-border-subtle bg-surface p-4">
          <div className="text-[10px] font-mono tracking-widest text-accent mb-2">
            WHAT IT'S GOOD FOR
          </div>
          <ul className="space-y-1.5 text-text-secondary leading-relaxed">
            <li>· Pulling vocals off a leaked phone recording</li>
            <li>· Cleaning a freestyle you cut over YouTube</li>
            <li>· Sampling acapellas from your own old tracks</li>
            <li>· Demo-quality vocal stems for mixing practice</li>
          </ul>
        </div>
        <div className="border border-border-subtle bg-surface p-4">
          <div className="text-[10px] font-mono tracking-widest text-accent mb-2">
            HONEST LIMITS
          </div>
          <ul className="space-y-1.5 text-text-secondary leading-relaxed">
            <li>· Studio-grade stems still need pro tools</li>
            <li>· Heavy autotune can make isolation sound thin</li>
            <li>· Only use on audio you have rights to</li>
            <li>· Max 25MB per upload, ~10 minutes per clip</li>
          </ul>
        </div>
      </div>

      <p className="mt-8 text-xs text-muted leading-relaxed">
        Audio runs through ElevenLabs Audio Isolation. We don't store the file
        on our servers, it's processed and returned. If you publish anything
        derived from copyrighted material, that's on you.
      </p>
    </div>
  )
}
