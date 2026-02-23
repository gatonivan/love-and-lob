import { useSceneStore } from '../../stores/sceneStore'
import { useAudio } from '../../hooks/useAudio'
import './SoundToggle.css'

export function SoundToggle() {
  const soundEnabled = useSceneStore((s) => s.soundEnabled)
  const toggleSound = useSceneStore((s) => s.toggleSound)
  const { getContext } = useAudio()

  const handleClick = () => {
    // Ensure AudioContext is created on user gesture
    getContext()
    toggleSound()
  }

  return (
    <button
      className={`sound-toggle ${soundEnabled ? 'active' : ''}`}
      onClick={handleClick}
      aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
      title={soundEnabled ? 'Sound on' : 'Sound off'}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {soundEnabled ? (
          <>
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </>
        ) : (
          <>
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </>
        )}
      </svg>
    </button>
  )
}
