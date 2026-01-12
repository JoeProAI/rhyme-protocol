/**
 * Generate a 30-second video from two source videos
 * Calls the deployed joepro.ai API which has the LUMA_API_KEY
 */

import * as fs from 'fs';

const API_BASE = 'https://joepro.ai/api/video-gen';

interface VideoSegment {
  id: string;
  url: string;
  prompt: string;
}

async function generateVideoSegment(prompt: string): Promise<VideoSegment> {
  console.log(`🎬 Generating video...`);
  console.log(`   Prompt: ${prompt.substring(0, 80)}...`);
  
  const response = await fetch(`${API_BASE}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      segments: 1,
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error: ${error}`);
  }
  
  const data = await response.json();
  console.log(`   ✓ Generated: ${data.segments?.[0]?.url || data.videoUrl}`);
  
  return {
    id: data.jobId || 'unknown',
    url: data.segments?.[0]?.url || data.videoUrl,
    prompt,
  };
}

async function main() {
  console.log('🎥 Starting 30-second video generation...\n');
  
  // Source video URLs (already generated)
  const sourceVideos = {
    video1: 'https://storage.cdn-luma.com/dream_machine/08de0403-eced-422b-b9f2-10437fb4c84e/7e344261-f8be-4208-912f-949f4c71dc27_result176ded5febbf77ac.mp4',
    video2: 'https://storage.cdn-luma.com/dream_machine/eeb10d2d-b050-4ebb-b48c-8776142bb0ec/7e0bd841-c466-42c4-85bc-e5ed720af398_resultf754482774c06474.mp4',
  };
  
  // Segment prompts continuing the cat & dragon story
  const segmentPrompts = [
    // Segment 3: Tension builds
    `A massive dark dragon and a small brave cat face each other in a tense standoff on a grassy field. The dragon's yellow eyes narrow studying the tiny feline. The cat stands its ground, fur bristling. Cinematic wide shot, dramatic lighting, slow camera push-in. Pixar-quality 3D animation, photorealistic.`,
    
    // Segment 4: Dragon reacts
    `The dragon slowly lowers its massive head closer to the brave cat, steam rising from its nostrils. The cat doesn't flinch, glowing orange eyes meeting the dragon's gaze. A moment of mutual respect. Cinematic close-up, golden hour lighting, photorealistic 3D animation.`,
    
    // Segment 5: Friendship forms
    `The dragon gently nudges the cat with its snout. The cat responds by rubbing against the dragon's scaled face affectionately. An unlikely friendship forms. The dragon's expression softens with warmth. Heartwarming moment, soft golden lighting, camera slowly pulls back. Pixar-quality animation.`,
    
    // Segment 6: Epic finale
    `The small cat climbs onto the dragon's head as the dragon spreads its massive wings against a sunset sky. They prepare to take flight together. Epic wide shot, golden orange sky, dramatic moment. The dragon launches into the air with the cat riding proudly. Cinematic finale, photorealistic.`,
  ];
  
  const generatedSegments: VideoSegment[] = [];
  
  // Generate each segment sequentially
  for (let i = 0; i < segmentPrompts.length; i++) {
    console.log(`\n📹 Generating segment ${i + 3} of 6...`);
    try {
      const segment = await generateVideoSegment(segmentPrompts[i]);
      generatedSegments.push(segment);
      
      // Wait a bit between requests to avoid rate limiting
      if (i < segmentPrompts.length - 1) {
        console.log('   Waiting 5 seconds before next segment...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    } catch (error) {
      console.error(`Failed to generate segment ${i + 3}:`, error);
    }
  }
  
  // Output results
  console.log('\n\n========================================');
  console.log('🎬 VIDEO GENERATION COMPLETE');
  console.log('========================================\n');
  
  console.log('All segments for 30-second video:');
  console.log(`  1. ${sourceVideos.video1}`);
  console.log(`  2. ${sourceVideos.video2}`);
  generatedSegments.forEach((seg, i) => {
    console.log(`  ${i + 3}. ${seg.url}`);
  });
  
  // Save all URLs
  const allUrls = [
    sourceVideos.video1,
    sourceVideos.video2,
    ...generatedSegments.map(s => s.url),
  ];
  
  fs.writeFileSync('temp_video_gen/segment_urls.txt', allUrls.join('\n'));
  console.log('\n✓ URLs saved to temp_video_gen/segment_urls.txt');
  
  // Create ffmpeg concat file
  const concatContent = allUrls.map(url => `file '${url}'`).join('\n');
  fs.writeFileSync('temp_video_gen/concat_list.txt', concatContent);
  console.log('✓ FFmpeg concat list saved to temp_video_gen/concat_list.txt');
  
  console.log('\nTo create final video, download all segments and run:');
  console.log('ffmpeg -f concat -safe 0 -i concat_list.txt -c copy final_30sec.mp4');
}

main().catch(console.error);
