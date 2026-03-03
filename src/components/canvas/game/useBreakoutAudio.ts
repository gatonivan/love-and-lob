import { useRef, useCallback } from 'react'
import { useSceneStore } from '../../../stores/sceneStore'

type SoundName = 'paddleHit' | 'wallBounce' | 'brickBreak' | 'levelUp' | 'gameOver'

const SOUND_CONFIG: Record<
  Exclude<SoundName, 'levelUp' | 'gameOver'>,
  { freq: number; duration: number; type: OscillatorType; gain: number }
> = {
  paddleHit: { freq: 440, duration: 0.08, type: 'sine', gain: 0.15 },
  wallBounce: { freq: 330, duration: 0.06, type: 'sine', gain: 0.12 },
  brickBreak: { freq: 880, duration: 0.12, type: 'square', gain: 0.15 },
}

export function useBreakoutAudio() {
  const contextRef = useRef<AudioContext | null>(null)

  const getContext = useCallback(() => {
    if (!contextRef.current) {
      contextRef.current = new AudioContext()
    }
    if (contextRef.current.state === 'suspended') {
      contextRef.current.resume()
    }
    return contextRef.current
  }, [])

  const playTone = useCallback(
    (freq: number, duration: number, type: OscillatorType, gain: number) => {
      const ctx = getContext()
      const osc = ctx.createOscillator()
      const gainNode = ctx.createGain()

      osc.type = type
      osc.frequency.setValueAtTime(freq, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(
        freq * 0.5,
        ctx.currentTime + duration
      )

      gainNode.gain.setValueAtTime(gain, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

      osc.connect(gainNode)
      gainNode.connect(ctx.destination)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + duration)
    },
    [getContext]
  )

  const play = useCallback(
    (name: SoundName) => {
      if (!useSceneStore.getState().soundEnabled) return

      if (name === 'levelUp') {
        // Ascending arpeggio
        const notes = [440, 554, 659, 880]
        notes.forEach((freq, i) => {
          setTimeout(() => playTone(freq, 0.15, 'sine', 0.12), i * 80)
        })
        return
      }

      if (name === 'gameOver') {
        // Descending tone
        const notes = [440, 330, 220, 110]
        notes.forEach((freq, i) => {
          setTimeout(() => playTone(freq, 0.2, 'triangle', 0.1), i * 120)
        })
        return
      }

      const config = SOUND_CONFIG[name]
      playTone(config.freq, config.duration, config.type, config.gain)
    },
    [playTone]
  )

  return { play, getContext }
}
