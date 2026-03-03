import { create } from 'zustand'
import { BRICK_ROWS, BRICK_COLS, MAX_LEVEL, POINTS_PER_BRICK } from '../components/canvas/game/constants'

export type GameStatus = 'idle' | 'playing' | 'levelComplete' | 'won' | 'lost'

interface BreakoutState {
  gameStatus: GameStatus
  level: number
  lives: number
  score: number
  bricks: boolean[][] // true = alive

  startGame: () => void
  launchBall: () => void
  loseLife: () => void
  breakBrick: (row: number, col: number) => void
  advanceLevel: () => void
  resetGame: () => void
}

function createBrickGrid(): boolean[][] {
  return Array.from({ length: BRICK_ROWS }, () =>
    Array.from({ length: BRICK_COLS }, () => true)
  )
}

function allBricksDead(bricks: boolean[][]): boolean {
  return bricks.every((row) => row.every((alive) => !alive))
}

export const useBreakoutStore = create<BreakoutState>((set, get) => ({
  gameStatus: 'idle',
  level: 1,
  lives: 3,
  score: 0,
  bricks: createBrickGrid(),

  startGame: () =>
    set({
      gameStatus: 'playing',
      level: 1,
      lives: 3,
      score: 0,
      bricks: createBrickGrid(),
    }),

  launchBall: () => {
    if (get().gameStatus === 'idle') {
      get().startGame()
    }
  },

  loseLife: () => {
    const { lives } = get()
    if (lives <= 1) {
      set({ lives: 0, gameStatus: 'lost' })
    } else {
      set({ lives: lives - 1 })
    }
  },

  breakBrick: (row, col) => {
    const { bricks, score } = get()
    const newBricks = bricks.map((r) => [...r])
    newBricks[row][col] = false

    const newScore = score + POINTS_PER_BRICK

    if (allBricksDead(newBricks)) {
      const { level } = get()
      if (level >= MAX_LEVEL) {
        set({ bricks: newBricks, score: newScore, gameStatus: 'won' })
      } else {
        set({ bricks: newBricks, score: newScore, gameStatus: 'levelComplete' })
      }
    } else {
      set({ bricks: newBricks, score: newScore })
    }
  },

  advanceLevel: () => {
    const { level } = get()
    set({
      level: level + 1,
      bricks: createBrickGrid(),
      gameStatus: 'playing',
    })
  },

  resetGame: () =>
    set({
      gameStatus: 'idle',
      level: 1,
      lives: 3,
      score: 0,
      bricks: createBrickGrid(),
    }),
}))
