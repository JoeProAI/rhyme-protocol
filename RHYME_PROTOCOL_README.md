# Rhyme Protocol - AI Music Video Generator

Forked from Neural Salvage with rap-specific video generation features.

## New Features

### Rap Style Presets

Six visual styles optimized for hip-hop/rap music videos:

| Style | Description | Aesthetic |
|-------|-------------|-----------|
| **Street** | Urban, gritty, authentic | Orange/teal split toning, harsh shadows, documentary feel |
| **Trap** | Dark, moody, hypnotic | Neon accents, crushed blacks, slow hypnotic motion |
| **Luxury** | High-end, flashy | Golden hour, warm tones, smooth elegant motion |
| **Conscious** | Thoughtful, artistic | Natural tones, film-like, peaceful intentional movement |
| **Old School** | 90s golden era | Film grain, warm browns, handheld energy |
| **Storytelling** | Cinematic narrative | Movie-like color grading, character-focused |

### Lyric Overlay System

- Supports plain text, LRC, and SRT formats
- Fade animations for smooth text transitions
- Customizable font size, position, and colors
- FFmpeg-based text burning

### Beat Sync Effects

- Zoom pulse on beat
- Flash effects
- Camera shake
- Color shift
- Pre-built patterns: Boom Bap, Trap, Drill, Four on Floor

## API Endpoints

### Generate Rap Video

```
POST /api/video-gen/rap-video
```

**Request:**
```json
{
  "prompt": "rapper in dark studio",
  "style": "trap",
  "lyrics": "First line\nSecond line",
  "lyricsFormat": "plain",
  "lyricOptions": {
    "fontSize": 48,
    "position": "bottom",
    "animation": "fade"
  },
  "segmentDuration": 9,
  "targetDuration": 30
}
```

**Response:**
```json
{
  "success": true,
  "jobId": "rap_123456_abc",
  "status": "processing",
  "estimatedTime": "135 seconds"
}
```

### Check Job Status

```
GET /api/video-gen/rap-video?jobId=rap_123456_abc
```

**Response:**
```json
{
  "jobId": "rap_123456_abc",
  "status": "completed",
  "progress": { "currentSegment": 4, "totalSegments": 4 },
  "segments": [
    { "index": 0, "videoUrl": "https://..." },
    { "index": 1, "videoUrl": "https://..." }
  ],
  "totalDuration": 36,
  "totalCost": 1.32
}
```

### Get Style Presets

```
GET /api/video-gen/presets
GET /api/video-gen/presets?style=trap
```

## UI

Access the video studio at `/studio/video`

## File Structure

```
lib/video-gen/
├── presets/
│   ├── index.ts              # Preset loader utilities
│   └── styles/
│       ├── street.json
│       ├── trap.json
│       ├── luxury.json
│       ├── conscious.json
│       ├── oldschool.json
│       └── storytelling.json
├── lyric-overlay.ts          # Text overlay system
├── beat-sync.ts              # Beat-synchronized effects
└── unified-video-pipeline-v5.ts  # Core pipeline (inherited)

app/
├── api/video-gen/
│   ├── rap-video/route.ts    # Main rap video API
│   └── presets/route.ts      # Presets API
└── studio/video/page.tsx     # Video generator UI
```

## Integration with Claude Code Terminal

This video engine is designed to be called from Claude Code Terminal's API routes.

**Data Contract:**
```typescript
// Request
POST /api/video-gen/rap-video
{
  audioUrl: string;
  style: 'street' | 'trap' | 'luxury' | 'conscious' | 'oldschool' | 'storytelling';
  lyrics?: string;
  lyricsFormat?: 'plain' | 'lrc' | 'srt';
}

// Response
{
  jobId: string;
  status: 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  progress?: { currentSegment: number; totalSegments: number };
}
```

## Environment Variables

Inherited from Neural Salvage:
- `OPENAI_API_KEY` - GPT-Image-1.5 frame generation
- `GEMINI_API_KEY` - Nano Banana motion prediction  
- `LUMA_API_KEY` - Luma Ray-2 video generation
- `UPSTASH_REDIS_REST_URL` - Rate limiting
- `UPSTASH_REDIS_REST_TOKEN` - Rate limiting

## Running

```bash
cd c:\Projects\The Machine\rhyme-protocol-app
npm run dev
```

Access at http://localhost:3000/studio/video
