/**
 * Generate a 30-second video from two source videos using keyframing
 * Uses Nano Banana for motion prediction and Luma AI for video generation
 */

import * as fs from 'fs';
import * as path from 'path';

const LUMA_API_KEY = process.env.LUMA_API_KEY;
const LUMA_API_BASE = 'https://api.lumalabs.ai/dream-machine/v1';

interface VideoSegment {
  id: string;
  url: string;
  prompt: string;
}

async function uploadImageToImgBB(imagePath: string): Promise<string> {
  // Use imgbb free API for temporary image hosting
  const imageData = fs.readFileSync(imagePath);
  const base64 = imageData.toString('base64');
  
  const formData = new FormData();
  formData.append('image', base64);
  
  const response = await fetch('https://api.imgbb.com/1/upload?key=free', {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error(`Failed to upload image: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.data.url;
}

async function generateVideoWithKeyframe(
  keyframeUrl: string,
  prompt: string
): Promise<VideoSegment> {
  console.log(`🎬 Generating video with keyframe...`);
  console.log(`   Prompt: ${prompt.substring(0, 100)}...`);
  
  const response = await fetch(`${LUMA_API_BASE}/generations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LUMA_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      model: 'ray-2',
      aspect_ratio: '16:9',
      resolution: '720p',
      duration: '5s',
      loop: false,
      keyframes: {
        frame0: {
          type: 'image',
          url: keyframeUrl,
        }
      }
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Luma API error: ${error}`);
  }
  
  const data = await response.json();
  console.log(`   Generation started: ${data.id}`);
  
  // Poll for completion
  return await pollForCompletion(data.id, prompt);
}

async function generateVideoFromPrompt(prompt: string): Promise<VideoSegment> {
  console.log(`🎬 Generating video from prompt...`);
  console.log(`   Prompt: ${prompt.substring(0, 100)}...`);
  
  const response = await fetch(`${LUMA_API_BASE}/generations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LUMA_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      model: 'ray-2',
      aspect_ratio: '16:9',
      resolution: '720p',
      duration: '5s',
      loop: false,
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Luma API error: ${error}`);
  }
  
  const data = await response.json();
  console.log(`   Generation started: ${data.id}`);
  
  return await pollForCompletion(data.id, prompt);
}

async function pollForCompletion(generationId: string, prompt: string): Promise<VideoSegment> {
  const maxAttempts = 60;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const response = await fetch(`${LUMA_API_BASE}/generations/${generationId}`, {
      headers: {
        'Authorization': `Bearer ${LUMA_API_KEY}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to check status: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`   Status: ${data.state} (${attempt + 1}/${maxAttempts})`);
    
    if (data.state === 'completed') {
      console.log(`   ✓ Completed: ${data.assets?.video}`);
      return {
        id: generationId,
        url: data.assets?.video,
        prompt,
      };
    }
    
    if (data.state === 'failed') {
      throw new Error(`Generation failed: ${data.failure_reason}`);
    }
  }
  
  throw new Error('Generation timeout');
}

async function main() {
  if (!LUMA_API_KEY) {
    console.error('LUMA_API_KEY not set');
    process.exit(1);
  }
  
  console.log('🎥 Starting 30-second video generation...\n');
  
  // Source video URLs (already generated)
  const sourceVideos = {
    video1: 'https://storage.cdn-luma.com/dream_machine/08de0403-eced-422b-b9f2-10437fb4c84e/7e344261-f8be-4208-912f-949f4c71dc27_result176ded5febbf77ac.mp4',
    video2: 'https://storage.cdn-luma.com/dream_machine/eeb10d2d-b050-4ebb-b48c-8776142bb0ec/7e0bd841-c466-42c4-85bc-e5ed720af398_resultf754482774c06474.mp4',
  };
  
  // Segment prompts for the story continuation
  const segmentPrompts = [
    // Segment 3: After dragon reveal - tension builds
    `The massive dragon and small cat face each other in a tense standoff on the grassy field. The dragon's yellow eyes narrow as it studies the tiny feline. The cat's fur bristles, standing its ground bravely. Cinematic wide shot, dramatic lighting, slight camera push-in. Pixar-quality animation.`,
    
    // Segment 4: Dragon reacts
    `The dragon slowly lowers its head closer to the brave cat, steam rising from its nostrils. The cat doesn't flinch, its glowing orange eyes meeting the dragon's gaze. A moment of mutual respect forms between predator and prey. Cinematic close-up, golden hour lighting.`,
    
    // Segment 5: Unexpected friendship
    `The dragon gently nudges the cat with its snout, and the cat responds by rubbing against the dragon's scaled face. An unlikely friendship forms. The dragon's expression softens. Heartwarming moment, soft lighting, camera slowly pulls back to reveal the peaceful scene.`,
    
    // Segment 6: Epic finale
    `The cat climbs onto the dragon's head as the dragon spreads its massive wings. They prepare to take flight together into the sunset. Epic wide shot, golden sky, dramatic orchestral moment. The dragon launches into the air with the cat riding proudly. Cinematic finale.`,
  ];
  
  const generatedSegments: VideoSegment[] = [];
  
  // Generate each new segment
  for (let i = 0; i < segmentPrompts.length; i++) {
    console.log(`\n📹 Generating segment ${i + 3} of 6...`);
    try {
      const segment = await generateVideoFromPrompt(segmentPrompts[i]);
      generatedSegments.push(segment);
    } catch (error) {
      console.error(`Failed to generate segment ${i + 3}:`, error);
    }
  }
  
  // Output results
  console.log('\n\n========================================');
  console.log('🎬 VIDEO GENERATION COMPLETE');
  console.log('========================================\n');
  
  console.log('Original segments:');
  console.log(`  1. ${sourceVideos.video1}`);
  console.log(`  2. ${sourceVideos.video2}`);
  
  console.log('\nGenerated segments:');
  generatedSegments.forEach((seg, i) => {
    console.log(`  ${i + 3}. ${seg.url}`);
  });
  
  console.log('\n\nTo concatenate, use ffmpeg:');
  console.log('ffmpeg -f concat -safe 0 -i filelist.txt -c copy final_30sec.mp4');
  
  // Save URLs to file
  const allUrls = [
    sourceVideos.video1,
    sourceVideos.video2,
    ...generatedSegments.map(s => s.url),
  ];
  
  fs.writeFileSync('temp_video_gen/segment_urls.txt', allUrls.join('\n'));
  console.log('\nURLs saved to temp_video_gen/segment_urls.txt');
}

main().catch(console.error);
