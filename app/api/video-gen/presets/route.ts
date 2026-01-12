import { NextRequest, NextResponse } from 'next/server'
import { getAllPresets, loadPreset, RapStyle, STYLE_METADATA } from '@/lib/video-gen/presets'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const style = searchParams.get('style') as RapStyle | null

  if (style) {
    const preset = loadPreset(style)
    if (!preset) {
      return NextResponse.json({ error: `Style not found: ${style}` }, { status: 404 })
    }

    const metadata = STYLE_METADATA[style]
    return NextResponse.json({
      ...preset,
      icon: metadata?.icon,
      color: metadata?.color
    })
  }

  const presets = getAllPresets()
  const presetsWithMetadata = presets.map(preset => ({
    id: preset.id,
    name: preset.name,
    description: preset.description,
    tags: preset.tags,
    icon: STYLE_METADATA[preset.id as RapStyle]?.icon,
    color: STYLE_METADATA[preset.id as RapStyle]?.color
  }))

  return NextResponse.json({
    presets: presetsWithMetadata,
    count: presetsWithMetadata.length
  })
}
