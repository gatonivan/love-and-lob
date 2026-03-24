import { useMemo } from 'react'
import * as THREE from 'three'
import {
  ARENA_WIDTH,
  ARENA_HEIGHT,
} from './constants'

// Court colors
const LINE_COLOR = '#e8e8d8'   // court lines
const LINE_WIDTH = 0.04
const LINE_Z = -0.11  // lines sit on top of the surface

// Court proportions mapped to our arena (6w × 8h)
const HALF_W = ARENA_WIDTH / 2    // 3
const HALF_H = ARENA_HEIGHT / 2   // 4

// Singles sidelines inset from doubles sideline
const SINGLES_HALF_W = HALF_W * 0.75  // 2.25

// Service line distance from net (center)
const SERVICE_LINE_Y = 1.8

// Net position (center of court)
const NET_Y = 0

function CourtLine({ points }: { points: [number, number][] }) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape()
    if (points.length < 2) return new THREE.ShapeGeometry(new THREE.Shape())

    // Build a thick line as a series of quads
    const allShapes: THREE.Shape[] = []

    for (let i = 0; i < points.length - 1; i++) {
      const [x1, y1] = points[i]
      const [x2, y2] = points[i + 1]

      const dx = x2 - x1
      const dy = y2 - y1
      const len = Math.sqrt(dx * dx + dy * dy)
      if (len === 0) continue

      const nx = (-dy / len) * LINE_WIDTH / 2
      const ny = (dx / len) * LINE_WIDTH / 2

      const seg = new THREE.Shape()
      seg.moveTo(x1 + nx, y1 + ny)
      seg.lineTo(x2 + nx, y2 + ny)
      seg.lineTo(x2 - nx, y2 - ny)
      seg.lineTo(x1 - nx, y1 - ny)
      seg.closePath()
      allShapes.push(seg)
    }

    if (allShapes.length === 0) {
      return new THREE.ShapeGeometry(shape)
    }

    const geos = allShapes.map((s) => new THREE.ShapeGeometry(s))
    const merged = new THREE.BufferGeometry()
    const positions: number[] = []
    const indices: number[] = []
    let offset = 0

    for (const geo of geos) {
      const pos = geo.getAttribute('position')
      const idx = geo.getIndex()
      for (let i = 0; i < pos.count; i++) {
        positions.push(pos.getX(i), pos.getY(i), pos.getZ(i))
      }
      if (idx) {
        for (let i = 0; i < idx.count; i++) {
          indices.push(idx.array[i] + offset)
        }
      }
      offset += pos.count
      geo.dispose()
    }

    merged.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    merged.setIndex(indices)
    return merged
  }, [points])

  return (
    <mesh position={[0, 0, LINE_Z]} geometry={geometry}>
      <meshStandardMaterial color={LINE_COLOR} roughness={0.8} />
    </mesh>
  )
}

export function TennisCourt() {
  return (
    <group>
      {/* === Court lines === */}

      {/* Outer boundary (doubles sidelines + baselines) */}
      <CourtLine points={[
        [-HALF_W, -HALF_H], [-HALF_W, HALF_H],
      ]} />
      <CourtLine points={[
        [HALF_W, -HALF_H], [HALF_W, HALF_H],
      ]} />
      <CourtLine points={[
        [-HALF_W, -HALF_H], [HALF_W, -HALF_H],
      ]} />
      <CourtLine points={[
        [-HALF_W, HALF_H], [HALF_W, HALF_H],
      ]} />

      {/* Singles sidelines */}
      <CourtLine points={[
        [-SINGLES_HALF_W, -HALF_H], [-SINGLES_HALF_W, HALF_H],
      ]} />
      <CourtLine points={[
        [SINGLES_HALF_W, -HALF_H], [SINGLES_HALF_W, HALF_H],
      ]} />

      {/* Service lines (horizontal, both sides of net) */}
      <CourtLine points={[
        [-SINGLES_HALF_W, SERVICE_LINE_Y], [SINGLES_HALF_W, SERVICE_LINE_Y],
      ]} />
      <CourtLine points={[
        [-SINGLES_HALF_W, -SERVICE_LINE_Y], [SINGLES_HALF_W, -SERVICE_LINE_Y],
      ]} />

      {/* Center service line (vertical, between service boxes) */}
      <CourtLine points={[
        [0, -SERVICE_LINE_Y], [0, SERVICE_LINE_Y],
      ]} />

      {/* Center marks (short tick at each baseline) */}
      <CourtLine points={[
        [0, -HALF_H], [0, -HALF_H + 0.2],
      ]} />
      <CourtLine points={[
        [0, HALF_H], [0, HALF_H - 0.2],
      ]} />

      {/* === Net === */}
      <group position={[0, NET_Y, 0]}>
        {/* Net post left */}
        <mesh position={[-HALF_W - 0.1, 0, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.25, 8]} />
          <meshStandardMaterial color={LINE_COLOR} />
        </mesh>
        {/* Net post right */}
        <mesh position={[HALF_W + 0.1, 0, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.25, 8]} />
          <meshStandardMaterial color={LINE_COLOR} />
        </mesh>
        {/* Net cord (top) */}
        <mesh position={[0, 0, 0.22]}>
          <boxGeometry args={[ARENA_WIDTH + 0.4, 0.02, 0.015]} />
          <meshStandardMaterial color={LINE_COLOR} />
        </mesh>
        {/* Net mesh — semi-transparent, standing upright */}
        <mesh position={[0, 0, 0.11]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[ARENA_WIDTH + 0.3, 0.22]} />
          <meshStandardMaterial
            color={LINE_COLOR}
            transparent
            opacity={0.35}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </group>
  )
}
