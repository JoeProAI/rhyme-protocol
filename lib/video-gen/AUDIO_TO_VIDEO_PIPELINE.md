# Audio-to-Video Pipeline

## Overview

This pipeline converts audio (speech, music, podcast) into coherent video with visual consistency using:
- **Whisper** - Audio transcription with timestamps
- **GPT-4** - Scene planning and narrative extraction
- **GPT-Image-1.5** - Keyframe generation with style consistency
- **Nano Banana (Gemini Vision)** - Motion prediction and visual continuity
- **Luma Ray-2** - Video segment generation

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        AUDIO-TO-VIDEO PIPELINE                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────┐    ┌──────────────┐    ┌───────────────┐                 │
│  │  Audio   │───▶│   Whisper    │───▶│ Timestamped   │                 │
│  │  Input   │    │ Transcription│    │  Transcript   │                 │
│  └──────────┘    └──────────────┘    └───────┬───────┘                 │
│                                              │                          │
│                                              ▼                          │
│                                    ┌─────────────────┐                  │
│                                    │   GPT-4 Scene   │                  │
│                                    │    Planner      │                  │
│                                    └────────┬────────┘                  │
│                                             │                           │
│                                             ▼                           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                      SCENE SEGMENTS                               │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐             │  │
│  │  │ Scene 1 │  │ Scene 2 │  │ Scene 3 │  │ Scene N │             │  │
│  │  │ 0:00-   │  │ 0:15-   │  │ 0:30-   │  │  ...    │             │  │
│  │  │ 0:15    │  │ 0:30    │  │ 0:45    │  │         │             │  │
│  │  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘             │  │
│  └───────┼───────────┼───────────┼───────────┼──────────────────────┘  │
│          │           │           │           │                          │
│          ▼           ▼           ▼           ▼                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    FOR EACH SCENE SEGMENT                         │  │
│  │                                                                   │  │
│  │  ┌────────────────┐    ┌────────────────┐    ┌────────────────┐  │  │
│  │  │ GPT-Image-1.5  │───▶│  Nano Banana   │───▶│   Luma Ray-2   │  │  │
│  │  │   Keyframe     │    │ Motion Predict │    │ Video Generate │  │  │
│  │  └────────────────┘    └────────────────┘    └────────────────┘  │  │
│  │         │                                            │            │  │
│  │         │              STYLE ANCHOR                  │            │  │
│  │         └────────────────────────────────────────────┘            │  │
│  │                   (maintains visual consistency)                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│                                    ▼                                    │
│                          ┌─────────────────┐                           │
│                          │  FFmpeg Concat  │                           │
│                          │  + Audio Merge  │                           │
│                          └────────┬────────┘                           │
│                                   │                                     │
│                                   ▼                                     │
│                          ┌─────────────────┐                           │
│                          │  Final Video    │                           │
│                          │  with Audio     │                           │
│                          └─────────────────┘                           │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Data Schema

### Input
```typescript
interface AudioToVideoInput {
  audioUrl: string;           // URL or base64 of audio file
  audioFormat: 'mp3' | 'wav' | 'webm' | 'm4a';
  style: string;              // Visual style description
  aspectRatio: '16:9' | '9:16' | '1:1';
  segmentDuration: '5s' | '9s';
  maxDuration?: number;       // Max output duration in seconds
  styleReferenceImage?: string; // Optional reference image for consistency
}
```

### Transcription Output
```typescript
interface TranscriptionSegment {
  start: number;              // Start time in seconds
  end: number;                // End time in seconds
  text: string;               // Transcribed text
  confidence: number;         // Whisper confidence score
}

interface TranscriptionResult {
  fullText: string;
  segments: TranscriptionSegment[];
  language: string;
  duration: number;
}
```

### Scene Planning Output
```typescript
interface ScenePlan {
  sceneIndex: number;
  startTime: number;
  endTime: number;
  duration: number;
  transcriptText: string;     // What's being said
  visualDescription: string;  // What to show
  mood: string;               // Emotional tone
  cameraMotion: string;       // Suggested camera movement
  transitionType: 'cut' | 'fade' | 'dissolve';
  keyElements: string[];      // Important visual elements to maintain
}

interface ScenePlanResult {
  scenes: ScenePlan[];
  styleAnchor: string;        // Consistent style description
  characterDescriptions: Record<string, string>; // Named characters
  settingDescriptions: Record<string, string>;   // Named locations
}
```

### Video Generation Output
```typescript
interface GeneratedSegment {
  sceneIndex: number;
  keyframeUrl: string;        // GPT-Image-1.5 output
  videoUrl: string;           // Luma Ray-2 output
  startTime: number;
  endTime: number;
  motionDescription: string;  // Nano Banana output
  cameraConcepts: string[];   // Luma camera concepts used
}

interface AudioToVideoResult {
  success: boolean;
  videoUrl: string;           // Final video with audio
  segments: GeneratedSegment[];
  totalDuration: number;
  transcription: TranscriptionResult;
  error?: string;
}
```

## Implementation Details

### Step 1: Audio Transcription (Whisper)

```typescript
async function transcribeAudio(audioUrl: string): Promise<TranscriptionResult> {
  // Use OpenAI Whisper API with timestamps
  const response = await openai.audio.transcriptions.create({
    file: audioFile,
    model: 'whisper-1',
    response_format: 'verbose_json',
    timestamp_granularities: ['segment']
  });
  
  return {
    fullText: response.text,
    segments: response.segments.map(s => ({
      start: s.start,
      end: s.end,
      text: s.text,
      confidence: s.avg_logprob
    })),
    language: response.language,
    duration: response.duration
  };
}
```

### Step 2: Scene Planning (GPT-4)

```typescript
async function planScenes(
  transcription: TranscriptionResult,
  style: string,
  segmentDuration: number
): Promise<ScenePlanResult> {
  const prompt = `You are a visual storyteller. Given this audio transcript, plan video scenes.

TRANSCRIPT:
${transcription.fullText}

TIMESTAMPS:
${transcription.segments.map(s => `[${s.start}s - ${s.end}s]: ${s.text}`).join('\n')}

STYLE: ${style}
TARGET SEGMENT DURATION: ${segmentDuration} seconds

Create a scene plan that:
1. Groups transcript segments into visual scenes (${segmentDuration}s each)
2. Describes what to SHOW (not just what's being said)
3. Maintains visual consistency across scenes
4. Suggests camera movements that match the audio energy
5. Identifies recurring characters/elements for consistency

Output JSON with:
- scenes: Array of scene plans
- styleAnchor: Consistent style description for all frames
- characterDescriptions: Named characters with detailed descriptions
- settingDescriptions: Named locations with detailed descriptions`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' }
  });
  
  return JSON.parse(response.choices[0].message.content);
}
```

### Step 3: Keyframe Generation (GPT-Image-1.5)

```typescript
async function generateKeyframe(
  scene: ScenePlan,
  styleAnchor: string,
  previousFrame?: string  // For consistency
): Promise<string> {
  const prompt = `${scene.visualDescription}

STYLE ANCHOR (MUST FOLLOW):
${styleAnchor}

MOOD: ${scene.mood}
KEY ELEMENTS: ${scene.keyElements.join(', ')}

CRITICAL: Photorealistic, cinematic quality. No cartoon/animation style.`;

  const input: any[] = [{ type: 'text', text: prompt }];
  
  // Add previous frame for visual consistency
  if (previousFrame) {
    input.push({
      type: 'image_url',
      image_url: { url: previousFrame, detail: 'high' }
    });
    input.push({
      type: 'text',
      text: 'REFERENCE: Match the visual style, color grading, and character appearance from this previous frame.'
    });
  }

  const response = await openai.responses.create({
    model: 'gpt-image-1.5',
    input,
    tools: [{ type: 'image_generation', quality: 'high', size: '1536x1024' }],
    tool_choice: { type: 'image_generation' }
  });

  return response.output[0].result;
}
```

### Step 4: Motion Prediction (Nano Banana)

```typescript
async function predictMotion(
  keyframe: string,
  scene: ScenePlan,
  transcriptText: string
): Promise<NanoBananaMotionOutput> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  
  const prompt = `Analyze this keyframe and describe the MOTION that should happen.

SCENE CONTEXT: ${scene.visualDescription}
AUDIO CONTENT: "${transcriptText}"
MOOD: ${scene.mood}
SUGGESTED CAMERA: ${scene.cameraMotion}

Describe:
1. What MOVEMENT/ACTION should occur (not end state)
2. Which Luma camera concepts to use: push_in, pull_out, orbit_left, orbit_right, pan_left, pan_right, crane_up, crane_down, handheld, static, dolly_zoom, etc.
3. How this advances the narrative

Output JSON:
{
  "motionDescription": "Continuous motion description...",
  "cameraConcepts": ["concept1", "concept2"],
  "narrativeProgression": "How story advances..."
}`;

  const result = await model.generateContent([
    { inlineData: { mimeType: 'image/png', data: keyframe } },
    prompt
  ]);

  return JSON.parse(result.response.text());
}
```

### Step 5: Video Generation (Luma Ray-2)

```typescript
async function generateVideo(
  keyframeUrl: string,
  motion: NanoBananaMotionOutput,
  duration: '5s' | '9s'
): Promise<string> {
  const response = await fetch(`${LUMA_API_BASE}/generations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.LUMA_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: motion.motionDescription,
      keyframes: {
        frame0: { type: 'image', url: keyframeUrl }
      },
      aspect_ratio: '16:9',
      duration,
      model: 'ray-2',
      concepts: motion.cameraConcepts
    })
  });

  const generation = await response.json();
  
  // Poll for completion
  return await pollForCompletion(generation.id);
}
```

### Step 6: Final Assembly (FFmpeg)

```typescript
async function assembleVideo(
  segments: GeneratedSegment[],
  originalAudio: string,
  outputPath: string
): Promise<string> {
  // Create concat file
  const concatFile = segments.map(s => `file '${s.videoUrl}'`).join('\n');
  await fs.writeFile('concat.txt', concatFile);
  
  // Concatenate videos and merge audio
  await execAsync(`
    ffmpeg -f concat -safe 0 -i concat.txt \
           -i ${originalAudio} \
           -c:v libx264 -c:a aac \
           -map 0:v -map 1:a \
           -shortest \
           ${outputPath}
  `);
  
  return outputPath;
}
```

## Consistency Mechanisms

### 1. Style Anchor
A detailed style description extracted during scene planning, applied to every keyframe:
```
"Photorealistic cinematic style, warm golden hour lighting, 
shallow depth of field, film grain, muted earth tones with 
occasional gold accents, professional color grading"
```

### 2. Character Consistency
Named characters with detailed descriptions maintained across scenes:
```typescript
characterDescriptions: {
  "narrator": "30-year-old man, short dark hair, stubble beard, 
               wearing navy blue sweater, warm brown eyes",
  "companion": "Golden retriever, fluffy coat, red collar"
}
```

### 3. Frame-to-Frame Reference
Each keyframe generation includes the previous frame as a reference image with explicit instructions to match style.

### 4. Motion Continuity
Nano Banana analyzes the actual rendered last frame (extracted via FFmpeg) to predict motion that continues naturally.

## API Endpoint

```typescript
// POST /api/video-gen/audio-to-video
interface AudioToVideoRequest {
  audioUrl: string;
  style?: string;
  aspectRatio?: '16:9' | '9:16' | '1:1';
  segmentDuration?: '5s' | '9s';
}

interface AudioToVideoResponse {
  success: boolean;
  videoUrl: string;
  duration: number;
  segments: number;
  transcription: string;
  error?: string;
}
```

## Cost Estimates

| Component | Cost per Unit | Typical Usage |
|-----------|---------------|---------------|
| Whisper | $0.006/min | 1x per audio |
| GPT-4 Scene Planning | ~$0.03 | 1x per audio |
| GPT-Image-1.5 | ~$0.08/image | 1x per segment |
| Gemini Flash | ~$0.001/call | 1x per segment |
| Luma Ray-2 | ~$0.32/5s, ~$0.50/9s | 1x per segment |

**Example: 60-second audio with 5s segments (12 segments)**
- Whisper: $0.006
- GPT-4: $0.03
- GPT-Image-1.5: $0.96 (12 × $0.08)
- Gemini: $0.012 (12 × $0.001)
- Luma: $3.84 (12 × $0.32)
- **Total: ~$4.85**

## Error Handling

1. **Transcription fails**: Return error, suggest checking audio format
2. **Scene planning fails**: Fallback to simple time-based segmentation
3. **Keyframe generation fails**: Retry with simplified prompt
4. **Motion prediction fails**: Use default camera concepts based on mood
5. **Video generation fails**: Retry, then skip segment if persistent
6. **Assembly fails**: Return individual segment URLs

## Future Enhancements

1. **Speaker diarization** - Different visuals for different speakers
2. **Music detection** - Adjust pacing based on beat/tempo
3. **Emotion detection** - Match visuals to audio emotion
4. **Lip sync** - Generate talking head videos
5. **B-roll insertion** - Add relevant stock footage
