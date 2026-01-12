# Unified Video Pipeline - Status Document

**Last Updated:** December 18, 2025  
**Current Version:** V4 (implemented, ready for testing)  
**Budget Status:** ~$7 Luma credits remaining

---

## Pipeline Evolution

### V1 - Basic Chaining
- GPT-Image-1.5 for frames
- Nano Banana for predictions
- Luma Ray-2 for video
- **Issue:** Segments internally consistent but visually different from each other

### V2 - Dual Keyframes
- Added end frame generation with GPT-Image-1.5
- Luma uses both start AND end keyframes
- **Issue:** Luma doesn't always land on target end frame, causing jumps

### V3 - Actual Frame Extraction ✅
- Extract ACTUAL last frame from rendered video using ffmpeg
- Use that real frame as next segment's start
- **Result:** Better continuity at segment boundaries
- **Remaining Issues:**
  - Style drift (hyper real → animation style)
  - Robotic movement
  - Static prompt limits narrative

### V4 - Enhanced (Current) 🆕
- **Style Anchoring:** Keep original frame as style reference
- **Motion Prompts:** Specific motion descriptors for Luma
- **Narrative Evolution:** Nano Banana expands the story
- **Negative Prompts:** Explicitly avoid cartoon/animated styles
- **Cumulative Context:** Build story across segments

---

## Files

| File | Purpose |
|------|---------|
| `lib/video-gen/unified-video-pipeline.ts` | V3 pipeline (working) |
| `lib/video-gen/unified-video-pipeline-v4.ts` | V4 pipeline (new) |
| `app/api/video-gen/unified/route.ts` | V3 API endpoint |
| `app/api/video-gen/unified-v4/route.ts` | V4 API endpoint |

---

## V4 Technical Details

### Style Anchoring
```typescript
// Original frame saved as style reference
styleAnchorBase64 = currentFrameBase64

// Passed to every subsequent generation
generateEndFrameWithReference(
  currentFrameBase64,    // Current state
  styleAnchorBase64,     // Style reference (original)
  ...
)
```

### Negative Prompts
```typescript
const STYLE_NEGATIVE_PROMPTS = `
ABSOLUTELY AVOID:
- Cartoon or animated style
- Stylized or artistic rendering
- Pixar/Disney animation aesthetic
- Flat colors or cel shading
- Exaggerated proportions
- Fantasy illustration style`
```

### Motion Keywords
```typescript
const MOTION_KEYWORDS = {
  natural: 'fluid natural movement, organic motion, realistic physics',
  cinematic: 'cinematic camera movement, professional cinematography, smooth dolly',
  environmental: 'subtle wind effects, atmospheric particles, ambient motion',
  character: 'natural breathing, micro-expressions, realistic body language'
}
```

### Nano Banana V4 Output
```typescript
interface NanoBananaOutput {
  visualPrediction: string   // What scene looks like
  narrativeEvolution: string // How story progresses
  motionDescription: string  // Specific movements for Luma
}
```

---

## API Usage

### V4 Endpoint
```bash
POST /api/video-gen/unified-v4

{
  "prompt": "A cat and a dragon in a magical forest...",
  "duration": 30,
  "style": "hyper realistic, photorealistic, cinematic lighting",
  "segmentDuration": "9s"
}
```

### Cost Estimate
- Per segment: ~$0.41 (2x GPT-Image-1.5 @ $0.08 + Luma @ $0.25)
- 30 second video (4 segments): ~$1.64

---

## Test Results

### V3 Test (Completed)
- **Prompt:** Cat and dragon in magical forest
- **Style:** Hyper realistic
- **Duration:** 36 seconds (4 x 9s segments)
- **Output:** `temp_video_gen/unified_v3_test/cat_dragon_v3_36sec.mp4`
- **Result:** Better continuity, but style drift and robotic movement

### V4 Test (Pending)
- Awaiting budget replenishment
- Expected improvements: Style consistency, natural motion, evolving narrative

---

## Future Enhancements

### Planned
1. **Kling AI Integration** - Alternative video generator with extend feature
2. **Runway Gen-3** - Another option for video generation
3. **Multi-provider fallback** - Use cheapest available provider

### Potential
1. **Audio sync** - Add music/sound effects
2. **Voice narration** - ElevenLabs integration
3. **Longer durations** - 60s, 90s, 2min+ videos
4. **Style presets** - Quick selection of visual styles

---

## To Resume Development

1. Add Luma credits
2. Run V4 test:
   ```powershell
   $body = @{
     prompt='A cat and a dragon in a magical forest. The cat is curious and approaches the friendly dragon. They become friends.'
     duration=30
     style='hyper realistic, photorealistic, cinematic lighting'
     segmentDuration='9s'
   } | ConvertTo-Json
   
   Invoke-RestMethod -Uri 'http://localhost:3000/api/video-gen/unified-v4' -Method POST -ContentType 'application/json' -Body $body
   ```
3. Compare V4 output to V3
4. Iterate based on results
5. Deploy when satisfactory

---

## Known Limitations

1. **Luma Ray-2 duration:** Only 5s or 9s per segment
2. **Image hosting:** Relies on freeimage.host/imgbb (may have rate limits)
3. **Processing time:** ~3-4 minutes per segment
4. **Style consistency:** Still challenging across many segments
5. **Motion interpolation:** Luma's interpretation may vary

---

## Contact Points

- **Luma API:** https://api.lumalabs.ai/dream-machine/v1
- **OpenAI API:** GPT-Image-1.5, GPT-4o Responses API
- **Gemini API:** gemini-2.0-flash-exp for Nano Banana
