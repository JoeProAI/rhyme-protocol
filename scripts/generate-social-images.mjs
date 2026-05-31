import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import OpenAI from 'openai'

const outputDir = path.resolve(process.cwd(), 'public')
const ogPath = path.join(outputDir, 'og-image.png')
const twitterPath = path.join(outputDir, 'twitter-image.png')

function requireApiKey() {
  const key = process.env.OPENAI_API_KEY
  if (!key) {
    throw new Error('OPENAI_API_KEY is required')
  }
  return key
}

async function generateImage(openai, prompt) {
  const response = await openai.images.generate({
    model: 'gpt-image-2',
    prompt,
    size: '1536x1024',
    quality: 'high',
    response_format: 'b64_json',
  })

  const b64 = response.data?.[0]?.b64_json
  if (!b64) {
    throw new Error('No image data returned from gpt-image-2')
  }
  return Buffer.from(b64, 'base64')
}

async function main() {
  const openai = new OpenAI({ apiKey: requireApiKey() })

  const ogPrompt = [
    'Epic hero image for Rhyme Protocol, an AI music video generator for rap and hip-hop artists.',
    'Cinematic stage environment, volumetric haze, dramatic lens lighting, premium music-video mood.',
    'Futuristic AI motifs fused with street energy: waveform geometry, neural rhythm particles, camera rig silhouettes.',
    'Bold centered typography reading exactly: RHYME PROTOCOL.',
    'Optional smaller subtitle: AI MUSIC VIDEO GENERATOR.',
    'Obsidian black base with electric cyan and hot magenta highlights.',
    'High contrast, clean composition, social share safe margins, no clutter, no logos except the title text.',
    'Photorealistic digital artwork, polished brand look, 16:9.',
  ].join(' ')

  const twitterPrompt = [
    'Social promo image for Rhyme Protocol designed for X/Twitter summary_large_image cards.',
    'Explosive but premium rap visual language, cinematic movement trails, stage beams, modern AI energy.',
    'Text must read exactly: RHYME PROTOCOL.',
    'Include short support line: MAKE EPIC AI MUSIC VIDEOS.',
    'Dark luxury palette with neon cyan and magenta accents, ultra-sharp contrast, minimal composition.',
    'Photorealistic digital artwork, brand-safe, no extra logos, no watermark, 16:9.',
  ].join(' ')

  await fs.mkdir(outputDir, { recursive: true })

  const [ogBuffer, twitterBuffer] = await Promise.all([
    generateImage(openai, ogPrompt),
    generateImage(openai, twitterPrompt),
  ])

  await Promise.all([
    fs.writeFile(ogPath, ogBuffer),
    fs.writeFile(twitterPath, twitterBuffer),
  ])

  console.log(`Generated ${ogPath}`)
  console.log(`Generated ${twitterPath}`)
}

main().catch((error) => {
  console.error(error.message || error)
  process.exit(1)
})
