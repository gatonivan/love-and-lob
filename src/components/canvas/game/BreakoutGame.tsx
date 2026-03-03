import { useRef, useCallback, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useBreakoutStore } from '../../../stores/breakoutStore'
import { Arena } from './Arena'
import { Paddle } from './Paddle'
import { Ball } from './Ball'
import { BrickGrid } from './BrickGrid'
import { TennisCourt } from './TennisCourt'
import { useBreakoutInput } from './useBreakoutInput'
import { useBreakoutAudio } from './useBreakoutAudio'
import {
  ARENA_HALF_W,
  ARENA_HALF_H,
  BALL_RADIUS,
  BALL_SPEEDS,
  PADDLE_Y,
  PADDLE_HEIGHT,
  PADDLE_HALF_W,
  BRICK_WIDTH,
  BRICK_HEIGHT,
  BRICK_GAP,
  BRICK_ROWS,
  BRICK_COLS,
  GRID_START_X,
  GRID_START_Y,
  WALL_THICKNESS,
} from './constants'

export function BreakoutGame() {
  const { paddleX, updateKeyboard } = useBreakoutInput()
  const { play } = useBreakoutAudio()

  // Ball physics in refs for 60fps updates
  const ballPos = useRef<[number, number]>([0, PADDLE_Y + PADDLE_HEIGHT / 2 + BALL_RADIUS + 0.05])
  const ballVel = useRef<[number, number]>([0, 0])
  const ballLaunched = useRef(false)
  const cooldown = useRef(false)

  const resetBall = useCallback(() => {
    ballPos.current = [0, PADDLE_Y + PADDLE_HEIGHT / 2 + BALL_RADIUS + 0.05]
    ballVel.current = [0, 0]
    ballLaunched.current = false
    cooldown.current = false
  }, [])

  // Listen for game status changes to reset ball
  useEffect(() => {
    const unsub = useBreakoutStore.subscribe((state, prev) => {
      if (state.gameStatus !== prev.gameStatus) {
        if (state.gameStatus === 'idle' || state.gameStatus === 'playing') {
          resetBall()
        }
      }
      // Reset ball position when a life is lost but game continues
      if (state.lives < prev.lives && state.gameStatus === 'playing') {
        resetBall()
      }
    })
    return unsub
  }, [resetBall])

  const launchBall = useCallback(() => {
    const level = useBreakoutStore.getState().level
    const speed = BALL_SPEEDS[level - 1]
    const angle = (Math.random() * 0.6 - 0.3) + Math.PI / 2
    ballVel.current = [Math.cos(angle) * speed, Math.sin(angle) * speed]
    ballLaunched.current = true
  }, [])

  // Launch ball on click/tap
  useEffect(() => {
    const handleClick = () => {
      const status = useBreakoutStore.getState().gameStatus

      if (status === 'idle') {
        useBreakoutStore.getState().startGame()
        // Start and launch in one click
        launchBall()
        return
      }

      if (status === 'levelComplete') {
        useBreakoutStore.getState().advanceLevel()
        launchBall()
        return
      }

      if (status === 'playing' && !ballLaunched.current) {
        launchBall()
      }
    }

    window.addEventListener('click', handleClick)
    window.addEventListener('touchstart', handleClick)
    return () => {
      window.removeEventListener('click', handleClick)
      window.removeEventListener('touchstart', handleClick)
    }
  }, [launchBall])

  useFrame((_, delta) => {
    const state = useBreakoutStore.getState()

    updateKeyboard(delta)

    // Stick ball to paddle when not launched (idle or pre-launch)
    if (!ballLaunched.current) {
      ballPos.current = [
        paddleX.current,
        PADDLE_Y + PADDLE_HEIGHT / 2 + BALL_RADIUS + 0.05,
      ]
      if (state.gameStatus !== 'playing') return
      return
    }

    if (state.gameStatus !== 'playing') return

    // Anti-tunneling: subdivide steps
    const speed = Math.sqrt(ballVel.current[0] ** 2 + ballVel.current[1] ** 2)
    const maxStep = BALL_RADIUS * 0.8
    const steps = Math.max(1, Math.ceil((speed * delta) / maxStep))
    const subDelta = delta / steps

    for (let step = 0; step < steps; step++) {
      let [bx, by] = ballPos.current
      let [vx, vy] = ballVel.current

      bx += vx * subDelta
      by += vy * subDelta

      // Wall collisions
      const wallInner = ARENA_HALF_W - WALL_THICKNESS / 2
      if (bx - BALL_RADIUS < -wallInner) {
        bx = -wallInner + BALL_RADIUS
        vx = Math.abs(vx)
        play('wallBounce')
      } else if (bx + BALL_RADIUS > wallInner) {
        bx = wallInner - BALL_RADIUS
        vx = -Math.abs(vx)
        play('wallBounce')
      }

      // Top wall
      const topInner = ARENA_HALF_H + WALL_THICKNESS / 2
      if (by + BALL_RADIUS > topInner) {
        by = topInner - BALL_RADIUS
        vy = -Math.abs(vy)
        play('wallBounce')
      }

      // Bottom: lose life
      if (by - BALL_RADIUS < -ARENA_HALF_H) {
        if (!cooldown.current) {
          cooldown.current = true
          state.loseLife()
          play('gameOver')
        }
        ballPos.current = [bx, by]
        ballVel.current = [vx, vy]
        return
      }

      // Paddle collision
      const paddleTop = PADDLE_Y + PADDLE_HEIGHT / 2
      const paddleBottom = PADDLE_Y - PADDLE_HEIGHT / 2
      const paddleLeft = paddleX.current - PADDLE_HALF_W
      const paddleRight = paddleX.current + PADDLE_HALF_W

      if (
        vy < 0 &&
        by - BALL_RADIUS <= paddleTop &&
        by + BALL_RADIUS >= paddleBottom &&
        bx + BALL_RADIUS >= paddleLeft &&
        bx - BALL_RADIUS <= paddleRight
      ) {
        by = paddleTop + BALL_RADIUS
        // Angle based on where ball hits paddle
        const hitPos = (bx - paddleX.current) / PADDLE_HALF_W // -1 to 1
        const angle = hitPos * (Math.PI / 3) + Math.PI / 2 // 60° to 120°
        const currentSpeed = BALL_SPEEDS[state.level - 1]
        vx = Math.cos(angle) * currentSpeed
        vy = Math.sin(angle) * currentSpeed

        play('paddleHit')
      }

      // Brick collisions
      const bricks = state.bricks
      for (let ri = 0; ri < BRICK_ROWS; ri++) {
        for (let ci = 0; ci < BRICK_COLS; ci++) {
          if (!bricks[ri][ci]) continue

          const brickX = GRID_START_X + ci * (BRICK_WIDTH + BRICK_GAP)
          const brickY = GRID_START_Y - ri * (BRICK_HEIGHT + BRICK_GAP)

          const brickLeft = brickX - BRICK_WIDTH / 2
          const brickRight = brickX + BRICK_WIDTH / 2
          const brickTop = brickY + BRICK_HEIGHT / 2
          const brickBottom = brickY - BRICK_HEIGHT / 2

          // AABB collision with ball
          if (
            bx + BALL_RADIUS > brickLeft &&
            bx - BALL_RADIUS < brickRight &&
            by + BALL_RADIUS > brickBottom &&
            by - BALL_RADIUS < brickTop
          ) {
            // Determine collision side
            const overlapLeft = bx + BALL_RADIUS - brickLeft
            const overlapRight = brickRight - (bx - BALL_RADIUS)
            const overlapTop = brickTop - (by - BALL_RADIUS)
            const overlapBottom = by + BALL_RADIUS - brickBottom

            const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom)

            if (minOverlap === overlapLeft || minOverlap === overlapRight) {
              vx = -vx
            } else {
              vy = -vy
            }

            state.breakBrick(ri, ci)
            play('brickBreak')

            // Only handle one brick collision per step
            break
          }
        }
        // Break outer loop if we hit a brick (status may have changed)
        if (useBreakoutStore.getState().gameStatus !== 'playing') break
      }

      ballPos.current = [bx, by]
      ballVel.current = [vx, vy]

      // Check if game ended this step
      if (useBreakoutStore.getState().gameStatus !== 'playing') return
    }
  })

  return (
    <group>
      <TennisCourt />
      <Arena />
      <Paddle paddleX={paddleX} />
      <Ball positionRef={ballPos} />
      <BrickGrid />
    </group>
  )
}
