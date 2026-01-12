import { exec } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs'
import * as path from 'path'

const execAsync = promisify(exec)

export interface LyricLine {
  text: string
  startTime: number
  endTime: number
}

export interface LyricOverlayOptions {
  fontFamily?: string
  fontSize?: number
  fontColor?: string
  outlineColor?: string
  outlineWidth?: number
  position?: 'bottom' | 'center' | 'top'
  animation?: 'fade' | 'typewriter' | 'none'
  shadowColor?: string
  shadowOffset?: number
}

const DEFAULT_OPTIONS: LyricOverlayOptions = {
  fontFamily: 'Arial Black',
  fontSize: 48,
  fontColor: 'white',
  outlineColor: 'black',
  outlineWidth: 3,
  position: 'bottom',
  animation: 'fade',
  shadowColor: 'black@0.5',
  shadowOffset: 4
}

export async function addLyricOverlays(
  inputVideoPath: string,
  outputVideoPath: string,
  lyrics: LyricLine[],
  options: LyricOverlayOptions = {}
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  const yPosition = {
    'top': '50',
    'center': '(h-text_h)/2',
    'bottom': 'h-100'
  }[opts.position || 'bottom']

  const drawTextFilters = lyrics.map((line) => {
    const escapedText = line.text
      .replace(/'/g, "\\'")
      .replace(/:/g, "\\:")
      .replace(/\\/g, "\\\\")

    const fadeIn = line.startTime
    const fadeOut = line.endTime - 0.3
    const alphaExpr = opts.animation === 'fade'
      ? `:alpha='if(lt(t,${fadeIn}),0,if(lt(t,${fadeIn + 0.3}),(t-${fadeIn})/0.3,if(lt(t,${fadeOut}),1,if(lt(t,${line.endTime}),(${line.endTime}-t)/0.3,0))))'`
      : ''

    return `drawtext=text='${escapedText}':fontsize=${opts.fontSize}:fontcolor=${opts.fontColor}:borderw=${opts.outlineWidth}:bordercolor=${opts.outlineColor}:x=(w-text_w)/2:y=${yPosition}:enable='between(t,${line.startTime},${line.endTime})'${alphaExpr}`
  }).join(',')

  const ffmpegCommand = `ffmpeg -i "${inputVideoPath}" -vf "${drawTextFilters}" -codec:a copy -y "${outputVideoPath}"`

  try {
    await execAsync(ffmpegCommand)
    return outputVideoPath
  } catch (error) {
    console.error('FFmpeg lyric overlay error:', error)
    throw error
  }
}

export function parseLRC(lrcContent: string): LyricLine[] {
  const lines: LyricLine[] = []
  const regex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/g
  let match

  const timestamps: { time: number; text: string }[] = []

  while ((match = regex.exec(lrcContent)) !== null) {
    const minutes = parseInt(match[1])
    const seconds = parseInt(match[2])
    const milliseconds = parseInt(match[3].padEnd(3, '0'))
    const time = minutes * 60 + seconds + milliseconds / 1000
    const text = match[4].trim()

    if (text) {
      timestamps.push({ time, text })
    }
  }

  for (let i = 0; i < timestamps.length; i++) {
    const endTime = i < timestamps.length - 1
      ? timestamps[i + 1].time
      : timestamps[i].time + 3

    lines.push({
      text: timestamps[i].text,
      startTime: timestamps[i].time,
      endTime: endTime
    })
  }

  return lines
}

export function parseTimedText(text: string, audioDuration: number): LyricLine[] {
  const lines = text.split('\n').filter(line => line.trim())
  const timePerLine = audioDuration / lines.length

  return lines.map((text, index) => ({
    text: text.trim(),
    startTime: index * timePerLine,
    endTime: (index + 1) * timePerLine - 0.2
  }))
}

export function parseSRT(srtContent: string): LyricLine[] {
  const lines: LyricLine[] = []
  const blocks = srtContent.trim().split(/\n\n+/)

  for (const block of blocks) {
    const blockLines = block.split('\n')
    if (blockLines.length < 3) continue

    const timeLine = blockLines[1]
    const timeMatch = timeLine.match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/)

    if (!timeMatch) continue

    const startTime = 
      parseInt(timeMatch[1]) * 3600 +
      parseInt(timeMatch[2]) * 60 +
      parseInt(timeMatch[3]) +
      parseInt(timeMatch[4]) / 1000

    const endTime = 
      parseInt(timeMatch[5]) * 3600 +
      parseInt(timeMatch[6]) * 60 +
      parseInt(timeMatch[7]) +
      parseInt(timeMatch[8]) / 1000

    const text = blockLines.slice(2).join(' ').trim()

    if (text) {
      lines.push({ text, startTime, endTime })
    }
  }

  return lines
}

export interface KaraokeOptions extends LyricOverlayOptions {
  highlightColor?: string
  wordsPerLine?: number
}

export function generateKaraokeFilter(
  lyrics: LyricLine[],
  options: KaraokeOptions = {}
): string {
  const opts = {
    fontSize: 56,
    fontColor: 'white',
    highlightColor: 'yellow',
    outlineColor: 'black',
    outlineWidth: 4,
    position: 'bottom' as const,
    ...options
  }

  const yPosition = {
    'top': '80',
    'center': '(h-text_h)/2',
    'bottom': 'h-120'
  }[opts.position]

  const filters = lyrics.map((line) => {
    const escapedText = line.text
      .replace(/'/g, "\\'")
      .replace(/:/g, "\\:")

    return `drawtext=text='${escapedText}':fontsize=${opts.fontSize}:fontcolor=${opts.fontColor}:borderw=${opts.outlineWidth}:bordercolor=${opts.outlineColor}:x=(w-text_w)/2:y=${yPosition}:enable='between(t,${line.startTime},${line.endTime})'`
  })

  return filters.join(',')
}

export async function burnLyricsToVideo(
  inputVideo: string,
  outputVideo: string,
  lyrics: string,
  format: 'plain' | 'lrc' | 'srt' = 'plain',
  videoDuration: number = 60,
  options: LyricOverlayOptions = {}
): Promise<string> {
  let parsedLyrics: LyricLine[]

  switch (format) {
    case 'lrc':
      parsedLyrics = parseLRC(lyrics)
      break
    case 'srt':
      parsedLyrics = parseSRT(lyrics)
      break
    default:
      parsedLyrics = parseTimedText(lyrics, videoDuration)
  }

  return addLyricOverlays(inputVideo, outputVideo, parsedLyrics, options)
}
