/**
 * Test script for Nano Banana Keyframe Pipeline
 * 
 * Run with: npx ts-node scripts/test-nano-banana.ts
 * Or via API: curl -X POST http://localhost:3000/api/video-gen/nano-banana -H "Content-Type: application/json" -d '{"prompt":"...", "duration":30}'
 */

const API_BASE = process.env.API_BASE || 'http://localhost:3000'

async function testNanoBananaPipeline() {
  console.log('🍌 Testing Nano Banana Keyframe Pipeline')
  console.log('=' .repeat(60))
  
  const payload = {
    prompt: 'A cat and a dragon in a magical forest. The cat is curious and approaches the friendly dragon. They become friends.',
    duration: 30,
    style: 'cinematic, Pixar-style animation, magical atmosphere, soft lighting',
    segmentDuration: '9s' // 4 segments of 9s = 36s (covers 30s target)
  }

  console.log('\n📋 Request:')
  console.log(JSON.stringify(payload, null, 2))
  console.log('\n⏳ Starting generation (this will take ~5-8 minutes)...\n')

  const startTime = Date.now()

  try {
    const response = await fetch(`${API_BASE}/api/video-gen/nano-banana`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const result = await response.json()
    const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1)

    if (!response.ok) {
      console.error('❌ Generation failed:')
      console.error(JSON.stringify(result, null, 2))
      return
    }

    console.log('✅ Generation complete!')
    console.log(`⏱️ Total time: ${elapsed} minutes`)
    console.log(`📊 Segments: ${result.segmentCount}`)
    console.log(`⏱️ Duration: ${result.totalDuration}s`)
    console.log(`💰 Cost: ${result.cost?.estimated}`)
    
    console.log('\n📹 Video Segments:')
    result.segments?.forEach((seg: any) => {
      console.log(`\n  Segment ${seg.index + 1} (${seg.duration}s):`)
      console.log(`    Video: ${seg.videoUrl}`)
      console.log(`    Start Frame: ${seg.startFrameUrl}`)
      console.log(`    End Frame: ${seg.endFrameUrl}`)
    })

    console.log('\n📝 To concatenate videos:')
    console.log('  1. Download all video segments')
    console.log('  2. Create list.txt with:')
    result.segments?.forEach((seg: any) => {
      console.log(`     file 'segment_${seg.index + 1}.mp4'`)
    })
    console.log('  3. Run: ffmpeg -f concat -safe 0 -i list.txt -c copy cat_dragon_30sec.mp4')

    // Save results to file
    const fs = await import('fs')
    const outputPath = `./temp_video_gen/nano_banana_test_${Date.now()}.json`
    fs.mkdirSync('./temp_video_gen', { recursive: true })
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2))
    console.log(`\n💾 Results saved to: ${outputPath}`)

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testNanoBananaPipeline()
