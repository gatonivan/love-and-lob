import { useBreakoutStore } from '../../../stores/breakoutStore'
import { Brick } from './Brick'
import {
  BRICK_WIDTH,
  BRICK_HEIGHT,
  BRICK_GAP,
  GRID_START_X,
  GRID_START_Y,
  BRICK_ROW_COLORS,
} from './constants'

export function BrickGrid() {
  const bricks = useBreakoutStore((s) => s.bricks)

  return (
    <group>
      {bricks.map((row, ri) =>
        row.map((alive, ci) => {
          const x = GRID_START_X + ci * (BRICK_WIDTH + BRICK_GAP)
          const y = GRID_START_Y - ri * (BRICK_HEIGHT + BRICK_GAP)

          return (
            <Brick
              key={`${ri}-${ci}`}
              position={[x, y, 0]}
              color={BRICK_ROW_COLORS[ri]}
              alive={alive}
            />
          )
        })
      )}
    </group>
  )
}
