import * as fs from 'fs'
import * as path from 'path'

export interface RapStylePreset {
  id: string
  name: string
  description: string
  basePrompt: string
  negativePrompt: string
  tags: string[]
  subjects: string[]
  environments: string[]
  cameraMovements: string[]
  lighting: string[]
  colorGrade: string
  motionStyle: string
}

export type RapStyle = 'street' | 'trap' | 'luxury' | 'conscious' | 'oldschool' | 'storytelling'

const presetCache: Map<string, RapStylePreset> = new Map()

export function loadPreset(style: RapStyle): RapStylePreset | null {
  if (presetCache.has(style)) {
    return presetCache.get(style)!
  }

  const presetPath = path.join(process.cwd(), 'lib/video-gen/presets/styles', `${style}.json`)
  
  try {
    if (fs.existsSync(presetPath)) {
      const preset = JSON.parse(fs.readFileSync(presetPath, 'utf-8')) as RapStylePreset
      presetCache.set(style, preset)
      return preset
    }
  } catch (error) {
    console.error(`Failed to load preset ${style}:`, error)
  }
  
  return null
}

export function getAllPresets(): RapStylePreset[] {
  const styles: RapStyle[] = ['street', 'trap', 'luxury', 'conscious', 'oldschool', 'storytelling']
  return styles.map(style => loadPreset(style)).filter((p): p is RapStylePreset => p !== null)
}

export function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function enhancePromptWithPreset(
  basePrompt: string,
  preset: RapStylePreset,
  options: {
    includeSubject?: boolean
    includeEnvironment?: boolean
    includeLighting?: boolean
  } = {}
): string {
  const {
    includeSubject = true,
    includeEnvironment = true,
    includeLighting = true
  } = options

  const parts: string[] = [basePrompt]

  if (includeSubject && preset.subjects.length > 0) {
    parts.push(getRandomElement(preset.subjects))
  }

  if (includeEnvironment && preset.environments.length > 0) {
    parts.push(getRandomElement(preset.environments))
  }

  if (includeLighting && preset.lighting.length > 0) {
    parts.push(`${getRandomElement(preset.lighting)} lighting`)
  }

  parts.push(preset.basePrompt)
  parts.push(`Style: ${preset.colorGrade}`)
  parts.push(`Negative: ${preset.negativePrompt}`)

  return parts.join('. ')
}

export function getPresetCameraMovement(preset: RapStylePreset): string {
  return getRandomElement(preset.cameraMovements)
}

export function buildSceneDescription(
  preset: RapStylePreset,
  customSubject?: string,
  customEnvironment?: string
): string {
  const subject = customSubject || getRandomElement(preset.subjects)
  const environment = customEnvironment || getRandomElement(preset.environments)
  const lighting = getRandomElement(preset.lighting)

  return `${subject}, ${environment}, ${lighting} lighting. ${preset.basePrompt}. Motion: ${preset.motionStyle}. Color grade: ${preset.colorGrade}`
}

export function mapPresetToLumaConcepts(preset: RapStylePreset): string[] {
  const conceptMap: Record<string, string> = {
    'handheld_shake': 'handheld',
    'slow_tracking': 'push_in',
    'push_in': 'push_in',
    'static_wide': 'static',
    'slow_rotation': 'orbit_left',
    'drift': 'pan_left',
    'zoom_pulse': 'zoom_in',
    'orbital_float': 'orbit_right',
    'slow_dolly': 'push_in',
    'crane_up': 'crane_up',
    'smooth_glide': 'push_in',
    'reveal_pan': 'pan_right',
    'static_contemplative': 'static',
    'slow_push': 'push_in',
    'gentle_drift': 'pan_left',
    'reveal': 'pull_out',
    'handheld_authentic': 'handheld',
    'slow_pan': 'pan_right',
    'low_angle': 'low_angle',
    'dolly_in_emotional': 'push_in',
    'crane_establishing': 'crane_up',
    'tracking_follow': 'push_in',
    'close_up_reaction': 'push_in'
  }

  return preset.cameraMovements
    .map(cam => conceptMap[cam] || 'push_in')
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 2)
}

export const STYLE_METADATA: Record<RapStyle, { icon: string; color: string }> = {
  street: { icon: 'building', color: '#F97316' },
  trap: { icon: 'moon', color: '#8B5CF6' },
  luxury: { icon: 'gem', color: '#EAB308' },
  conscious: { icon: 'brain', color: '#22C55E' },
  oldschool: { icon: 'radio', color: '#A16207' },
  storytelling: { icon: 'film', color: '#3B82F6' }
}
