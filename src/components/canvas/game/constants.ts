// Arena dimensions (world units, centered at origin)
export const ARENA_WIDTH = 6
export const ARENA_HEIGHT = 8
export const ARENA_HALF_W = ARENA_WIDTH / 2
export const ARENA_HALF_H = ARENA_HEIGHT / 2

// Walls
export const WALL_THICKNESS = 0.1

// Paddle
export const PADDLE_WIDTH = 1.2
export const PADDLE_HEIGHT = 0.15
export const PADDLE_Y = -ARENA_HALF_H + 1.0
export const PADDLE_HALF_W = PADDLE_WIDTH / 2

// Ball
export const BALL_RADIUS = 0.1
export const BALL_SPEEDS = [4.0, 5.5, 7.0] // per level

// Bricks
export const BRICK_ROWS = 6
export const BRICK_COLS = 8
export const BRICK_WIDTH = 0.65
export const BRICK_HEIGHT = 0.25
export const BRICK_GAP = 0.06

// Brick grid positioning
export const GRID_WIDTH = BRICK_COLS * (BRICK_WIDTH + BRICK_GAP) - BRICK_GAP
export const GRID_START_X = -GRID_WIDTH / 2 + BRICK_WIDTH / 2
export const GRID_START_Y = ARENA_HALF_H - 1.5 // top of grid offset from arena top

// Colors
export const COLOR_ACCENT = '#d8e84d'
export const COLOR_TEXT = '#F1F0E2'
export const COLOR_BG = '#0a0a0a'
export const COLOR_WALL = '#1a1a1a'
export const COLOR_PADDLE = '#F1F0E2'

// Brick row colors — gradient from dark green to accent lime (top to bottom)
export const BRICK_ROW_COLORS = [
  '#004225', // row 0 (top) — dark green
  '#0d5a34',
  '#1a7243',
  '#2d8a52',
  '#6ab040',
  '#d8e84d', // row 5 (bottom) — accent lime
]

// Scoring
export const POINTS_PER_BRICK = 10

// Max levels
export const MAX_LEVEL = 3
