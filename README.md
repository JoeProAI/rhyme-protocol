# Rhyme Protocol

AI tools for rap artists. Lyrics, covers, and cinematic music videos.

Live at [www.rhymeprotocol.com](https://www.rhymeprotocol.com)

---

## Studio

Four tools, one workflow.

- **Lyric Lab** — Write bars with AI assistance. Rhyme suggestions, verse continuation, fresh generation.
- **Cover Art** — Album covers and single artwork. Multiple styles and moods.
- **Video Gen** — Cinematic music videos from a prompt. Six rap-tuned style presets (Street, Trap, Luxury, Conscious, Old School, Storytelling).
- **Audio Lab** — Voice synthesis, sound effects, beat generation.

No sign-in. No credit gate. Free access while in early access.

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS, Geist Sans + Mono |
| Hosting | Vercel (Edge runtime where useful) |
| Auth | Anonymous sessions (cookie-based, optional Firebase) |
| Storage | Upstash Redis (graceful in-memory fallback) |
| Payments | Stripe (currently bypassed for free access) |

### AI providers

| Use | Provider |
|---|---|
| Lyrics | OpenAI GPT-4 class + xAI Grok |
| Cover art | OpenAI GPT-Image |
| Frame prediction | Google Gemini (Nano Banana) |
| Video generation | Luma Ray-2 |
| Voice | ElevenLabs |

---

## Local dev

```bash
git clone https://github.com/JoeProAI/rhyme-protocol.git
cd rhyme-protocol
npm install

# pull production env vars (requires `vercel login`)
vercel link
vercel env pull .env.local

npm run dev
```

Opens at `http://localhost:3000`.

### Required env vars

```
OPENAI_API_KEY
GEMINI_API_KEY
LUMA_API_KEY
XAI_API_KEY
```

Optional:

```
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
ELEVENLABS_API_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
FIREBASE_SERVICE_ACCOUNT
FREE_ACCESS_UNLIMITED   # default true, set "false" to re-enable usage limits
```

---

## API

### Generate rap video

```
POST /api/video-gen/rap-video
```

```json
{
  "prompt": "rapper in dark studio",
  "style": "trap",
  "lyrics": "First line\nSecond line",
  "lyricsFormat": "plain",
  "segmentDuration": 9,
  "targetDuration": 30
}
```

### Check job

```
GET /api/video-gen/rap-video?jobId=<id>
```

### Style presets

```
GET /api/video-gen/presets
GET /api/video-gen/presets?style=trap
```

### Usage

```
GET /api/usage/me            # current session usage
POST /api/usage/track        # increment a counter
POST /api/usage/can-use      # check before action
```

---

## Project layout

```
app/
  api/                  # all API routes (54 endpoints)
  studio/               # lyric / cover / video / audio UIs
  dashboard/            # usage overview
  layout.tsx            # SEO + chrome
  page.tsx              # home

components/             # FloatingChat, NeuralBackground, etc.
lib/
  llm/                  # OpenAI + Grok clients
  video-gen/            # rap pipeline + presets
  usage-system.ts       # gating (currently in unlimited mode)
  rate-limit.ts         # session-level limiter
  redis.ts              # Upstash + in-memory fallback
```

---

## Deploy

Pushes to `main` auto-deploy to production via Vercel.

```bash
git push origin main
# or, for an explicit production deploy:
vercel --prod
```

---

## License

MIT.
