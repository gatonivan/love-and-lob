import { useBreakoutStore } from '../../stores/breakoutStore'
import { SoundToggle } from './SoundToggle'
import './GameUI.css'

export function GameUI() {
  const gameStatus = useBreakoutStore((s) => s.gameStatus)
  const score = useBreakoutStore((s) => s.score)
  const level = useBreakoutStore((s) => s.level)
  const lives = useBreakoutStore((s) => s.lives)
  const resetGame = useBreakoutStore((s) => s.resetGame)
  const advanceLevel = useBreakoutStore((s) => s.advanceLevel)

  const playing = gameStatus === 'playing'

  return (
    <>
      {/* HUD — always rendered to keep flex layout stable */}
      <div className={`game-hud ${playing ? '' : 'game-hud--hidden'}`}>
        <span className="game-hud-item">Score: {score}</span>
        <span className="game-hud-item">Level {level}</span>
        <span className="game-hud-item">
          {'♥'.repeat(lives)}{'♡'.repeat(3 - lives)}
        </span>
        <SoundToggle />
      </div>

      {/* Idle prompt */}
      {gameStatus === 'idle' && (
        <div className="game-prompt">
          <span className="game-prompt-text">Click to Start</span>
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
