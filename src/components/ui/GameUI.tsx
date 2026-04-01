import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router'
import { useBreakoutStore } from '../../stores/breakoutStore'
import { useSceneStore } from '../../stores/sceneStore'
import { SoundToggle } from './SoundToggle'
import './GameUI.css'

export function GameUI() {
  const pathname = useLocation().pathname
  const cameraMode = useSceneStore((s) => s.cameraMode)
  const cameraSettled = useSceneStore((s) => s.cameraSettled)
  const gameStatus = useBreakoutStore((s) => s.gameStatus)
  const score = useBreakoutStore((s) => s.score)
  const level = useBreakoutStore((s) => s.level)
  const lives = useBreakoutStore((s) => s.lives)
  const resetGame = useBreakoutStore((s) => s.resetGame)
  const advanceLevel = useBreakoutStore((s) => s.advanceLevel)
  const prevMode = useRef(cameraMode)

  // Reset game to idle when returning from another section
  useEffect(() => {
    if (prevMode.current !== 'game' && cameraMode === 'game') {
      const { gameStatus } = useBreakoutStore.getState()
      if (gameStatus === 'won' || gameStatus === 'lost') {
        useBreakoutStore.getState().resetGame()
      }
    }
    prevMode.current = cameraMode
  }, [cameraMode])

  if (pathname !== '/' || cameraMode !== 'game' || !cameraSettled) return null

  const playing = gameStatus === 'playing'

  return (
    <>
      {/* HUD — always rendered to keep flex layout stable */}
      <div
        className={`game-hud ${playing ? '' : 'game-hud--hidden'}`}
        role="status"
        aria-live="polite"
        aria-label={`Score: ${score}, Level ${level}, ${lives} lives remaining`}
      >
        <span className="game-hud-item">Score: {score}</span>
        <span className="game-hud-item">Level {level}</span>
        <span className="game-hud-item" aria-label={`${lives} of 3 lives remaining`}>
          {'♥'.repeat(lives)}{'♡'.repeat(3 - lives)}
        </span>
        <SoundToggle />
      </div>

      {/* Idle prompt */}
      {gameStatus === 'idle' && (
        <div className="game-prompt" role="alert">
          <span className="game-prompt-text">Tap / Click to Start</span>
          <span className="game-prompt-hint">Arrow keys or mouse to move paddle</span>
        </div>
      )}

      {/* Level complete */}
      {gameStatus === 'levelComplete' && (
        <div className="game-prompt">
          <div className="game-prompt-title">Level {level} Complete!</div>
          <button className="game-prompt-btn" onClick={() => advanceLevel()}>
            Next Level
          </button>
        </div>
      )}

      {/* Won */}
      {gameStatus === 'won' && (
        <div className="game-prompt">
          <div className="game-prompt-title">You Win!</div>
          <div className="game-prompt-score">Final Score: {score}</div>
          <div className="game-prompt-subtitle">Come back for more levels.</div>
          <button className="game-prompt-btn" onClick={resetGame}>
            Play Again
          </button>
        </div>
      )}

      {/* Lost */}
      {gameStatus === 'lost' && (
        <div className="game-prompt">
          <div className="game-prompt-title">Game Over</div>
          <div className="game-prompt-score">Score: {score}</div>
          <button className="game-prompt-btn" onClick={resetGame}>
            Try Again
          </button>
        </div>
      )}
    </>
  )
}
