export interface BeatMarker {
  time: number
  type: 'kick' | 'snare' | 'hihat' | 'beat'
  intensity: number
}

export interface BeatSyncEffect {
  type: 'flash' | 'zoom_pulse' | 'shake' | 'color_shift' | 'cut'
  duration: number
  intensity: number
}

export function generateBeatSyncFilter(
  beats: BeatMarker[],
  effect: BeatSyncEffect['type'] = 'zoom_pulse'
): string {
  const filters: string[] = []

  beats.forEach((beat) => {
    switch (effect) {
      case 'zoom_pulse': {
        const zoomAmount = 1 + (beat.intensity * 0.05)
        filters.push(
          `zoompan=z='if(between(t,${beat.time},${beat.time + 0.1}),${zoomAmount},1)':d=1:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'`
        )
        break
      }

      case 'flash':
        filters.push(
          `fade=t=in:st=${beat.time}:d=0.05:alpha=1,fade=t=out:st=${beat.time + 0.05}:d=0.1:alpha=1`
        )
        break

      case 'shake':
        filters.push(
          `crop=w=iw-20:h=ih-20:x='10+random(1)*10*if(between(t,${beat.time},${beat.time + 0.1}),1,0)':y='10+random(1)*10*if(between(t,${beat.time},${beat.time + 0.1}),1,0)'`
        )
        break

      case 'color_shift':
        filters.push(
          `hue=h='if(between(t,${beat.time},${beat.time + 0.15}),${beat.intensity * 30},0)'`
        )
        break
    }
  })

  return filters.join(',')
}

export function detectBeatsSimple(
  audioAnalysis: { tempo: number; duration: number }
): BeatMarker[] {
  const { tempo, duration } = audioAnalysis
  const beatInterval = 60 / tempo
  const beats: BeatMarker[] = []

  let currentTime = 0
  let beatCount = 0

  while (currentTime < duration) {
    beats.push({
      time: currentTime,
      type: beatCount % 4 === 0 ? 'kick' : beatCount % 2 === 0 ? 'snare' : 'hihat',
      intensity: beatCount % 4 === 0 ? 1 : beatCount % 2 === 0 ? 0.8 : 0.5
    })

    currentTime += beatInterval
    beatCount++
  }

  return beats
}

export function detectBeatsFromBPM(bpm: number, duration: number, offset: number = 0): BeatMarker[] {
  const beatInterval = 60 / bpm
  const beats: BeatMarker[] = []
  let currentTime = offset
  let beatCount = 0

  while (currentTime < duration) {
    const barPosition = beatCount % 4

    beats.push({
      time: currentTime,
      type: barPosition === 0 ? 'kick' : barPosition === 2 ? 'snare' : 'hihat',
      intensity: barPosition === 0 ? 1.0 : barPosition === 2 ? 0.9 : 0.4
    })

    currentTime += beatInterval
    beatCount++
  }

  return beats
}

export interface RhythmPattern {
  name: string
  pattern: ('kick' | 'snare' | 'hihat' | 'rest')[]
  subdivision: number
}

export const COMMON_PATTERNS: Record<string, RhythmPattern> = {
  boom_bap: {
    name: 'Boom Bap',
    pattern: ['kick', 'hihat', 'snare', 'hihat', 'kick', 'kick', 'snare', 'hihat'],
    subdivision: 8
  },
  trap: {
    name: 'Trap',
    pattern: ['kick', 'hihat', 'hihat', 'hihat', 'snare', 'hihat', 'hihat', 'hihat', 'kick', 'hihat', 'hihat', 'hihat', 'snare', 'hihat', 'hihat', 'hihat'],
    subdivision: 16
  },
  drill: {
    name: 'Drill',
    pattern: ['kick', 'rest', 'hihat', 'snare', 'kick', 'hihat', 'rest', 'snare'],
    subdivision: 8
  },
  four_on_floor: {
    name: 'Four on Floor',
    pattern: ['kick', 'hihat', 'kick', 'hihat', 'kick', 'hihat', 'kick', 'hihat'],
    subdivision: 8
  }
}

export function generateBeatsFromPattern(
  pattern: RhythmPattern,
  bpm: number,
  duration: number,
  offset: number = 0
): BeatMarker[] {
  const beatInterval = (60 / bpm) * (4 / pattern.subdivision)
  const beats: BeatMarker[] = []
  let currentTime = offset
  let patternIndex = 0

  while (currentTime < duration) {
    const beatType = pattern.pattern[patternIndex % pattern.pattern.length]

    if (beatType !== 'rest') {
      beats.push({
        time: currentTime,
        type: beatType,
        intensity: beatType === 'kick' ? 1.0 : beatType === 'snare' ? 0.9 : 0.5
      })
    }

    currentTime += beatInterval
    patternIndex++
  }

  return beats
}

export function generateCutPointsOnBeats(
  beats: BeatMarker[],
  minCutInterval: number = 2,
  preferKicks: boolean = true
): number[] {
  const cutPoints: number[] = []
  let lastCutTime = -minCutInterval

  for (const beat of beats) {
    if (beat.time - lastCutTime < minCutInterval) continue

    if (preferKicks && beat.type !== 'kick') continue

    cutPoints.push(beat.time)
    lastCutTime = beat.time
  }

  return cutPoints
}

export function generateVisualIntensityMap(
  beats: BeatMarker[],
  duration: number,
  resolution: number = 30
): number[] {
  const frameCount = Math.ceil(duration * resolution)
  const intensityMap: number[] = new Array(frameCount).fill(0)

  for (const beat of beats) {
    const frameIndex = Math.floor(beat.time * resolution)
    if (frameIndex < frameCount) {
      intensityMap[frameIndex] = Math.max(intensityMap[frameIndex], beat.intensity)

      for (let decay = 1; decay <= 3; decay++) {
        const decayIndex = frameIndex + decay
        if (decayIndex < frameCount) {
          const decayIntensity = beat.intensity * (1 - decay * 0.25)
          intensityMap[decayIndex] = Math.max(intensityMap[decayIndex], decayIntensity)
        }
      }
    }
  }

  return intensityMap
}

export function generateFFmpegBeatFilter(
  beats: BeatMarker[],
  effects: BeatSyncEffect['type'][] = ['zoom_pulse']
): string {
  const filterChains: string[] = []

  for (const effect of effects) {
    filterChains.push(generateBeatSyncFilter(beats, effect))
  }

  return filterChains.filter(f => f).join(',')
}
