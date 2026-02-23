import { useRef, useCallback } from 'react'
import { useSceneStore } from '../stores/sceneStore'

type SoundName = 'grab' | 'pop' | 'swoosh' | 'thud'

// Synthesized sounds using Web Audio API oscillators — no audio files needed
const SOUND_CONFIG: Record<SoundName, { freq: number; duration: number; type: OscillatorType; gain: number }> = {
  grab: { freq: 220, duration: 0.08, type: 'sine', gain: 0.15 },
  pop: { freq: 660, duration: 0.12, type: 'sine', gain: 0.2 },
  swoosh: { freq: 180, duration: 0.25, type: 'sawtooth', gain: 0.08 },
  thud: { freq: 80, duration: 0.15, type: 'triangle', gain: 0.2 },
}

export function useAudio() {
  const contextRef = useRef<AudioContext | null>(null)
  const soundEnabled = useSceneStore((s) => s.soundEnabled)

  const getContext = useCallback(() => {
    if (!contextRef.current) {
      contextRef.current = new AudioContext()
    }
    // Resume if suspended (browser autoplay policy)
    if (contextRef.current.state === 'suspended') {
      contextRef.current.resume()
    }
    return contextRef.current
  }, [])

  const playSound = useCallback((name: SoundName) => {
    if (!soundEnabled) return

    const ctx = getContext()
    const config = SOUND_CONFIG[name]

    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.type = config.type
    oscillator.frequency.setValueAtTime(config.freq, ctx.currentTime)

    // Quick pitch sweep for more organic feel
    oscillator.frequency.exponentialRampToValueAtTime(
      config.freq * (name === 'pop' ? 1.5 : 0.5),
      ctx.currentTime + config.duration
    )

    gainNode.gain.setValueAtTime(config.gain, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + config.duration)

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + config.duration)
  }, [soundEnabled, getContext])

  return { playSound, getContext }
}
