/**
 * Fetch video URLs from Luma API using generation IDs
 */

const LUMA_API_KEY = process.env.LUMA_API_KEY
const LUMA_API_BASE = 'https://api.lumalabs.ai/dream-machine/v1'

// Generation IDs from the Nano Banana test run
const generationIds = [
  '3c1a0dfe-dd81-4821-ad2a-d79c2df0075a', // Segment 1
  'b1c111b0-75f5-4444-9686-05de87b8cd55', // Segment 2
  '4e715c2a-6868-4a97-bedb-91d29740bda3', // Segment 4
]

async function fetchVideoUrls() {
  if (!LUMA_API_KEY) {
    console.error('LUMA_API_KEY not set')
    return
  }

  console.log('Fetching video URLs from Luma API...\n')

  for (const id of generationIds) {
    try {
      const response = await fetch(`${LUMA_API_BASE}/generations/${id}`, {
        headers: { 'Authorization': `Bearer ${LUMA_API_KEY}` },
      })

      if (!response.ok) {
        console.error(`Failed to fetch ${id}: ${response.status}`)
        continue
      }

      const data = await response.json()
      console.log(`Generation ${id}:`)
      console.log(`  Status: ${data.state}`)
      console.log(`  Video: ${data.assets?.video || 'N/A'}`)
      console.log(`  Thumbnail: ${data.assets?.thumbnail || 'N/A'}`)
      console.log('')
    } catch (error) {
      console.error(`Error fetching ${id}:`, error)
    }
  }
}

fetchVideoUrls()
