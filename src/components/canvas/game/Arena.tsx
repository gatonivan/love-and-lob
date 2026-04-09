import {
  ARENA_HALF_W,
  ARENA_HALF_H,
  ARENA_HEIGHT,
  WALL_THICKNESS,
  ARENA_WIDTH,
} from './constants'

export function Arena() {
  return (
    <group>
      {/* Top wall */}
      <mesh position={[0, ARENA_HALF_H + WALL_THICKNESS / 2, 0]} visible={false}>
        <boxGeometry args={[ARENA_WIDTH + WALL_THICKNESS * 2, WALL_THICKNESS, 0.2]} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-ARENA_HALF_W - WALL_THICKNESS / 2, 0, 0]} visible={false}>
        <boxGeometry args={[WALL_THICKNESS, ARENA_HEIGHT + WALL_THICKNESS * 2, 0.2]} />
      </mesh>

      {/* Right wall */}
      <mesh position={[ARENA_HALF_W + WALL_THICKNESS / 2, 0, 0]} visible={false}>
        <boxGeometry args={[WALL_THICKNESS, ARENA_HEIGHT + WALL_THICKNESS * 2, 0.2]} />
      </mesh>
    </group>
  )
}
