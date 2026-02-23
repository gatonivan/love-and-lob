import { useMemo } from 'react'
import * as THREE from 'three'

// Real tennis court proportions (scaled down for scene)
const COURT_WIDTH = 10.97 * 0.3 // ~3.3 units
const COURT_LENGTH = 23.77 * 0.3 // ~7.1 units
const LINE_COLOR = '#ffffff'
const COURT_COLOR = '#2d5e3a' // classic green hard court

function CourtLines() {
  const lineGeometry = useMemo(() => {
    const points: THREE.Vector3[] = []

    const w = COURT_WIDTH / 2
    const l = COURT_LENGTH / 2
    const sw = (COURT_WIDTH * 0.75) / 2 // singles sideline

    // Baseline
    points.push(new THREE.Vector3(-w, 0.01, -l), new THREE.Vector3(w, 0.01, -l))
    points.push(new THREE.Vector3(-w, 0.01, l), new THREE.Vector3(w, 0.01, l))

    // Sidelines (doubles)
    points.push(new THREE.Vector3(-w, 0.01, -l), new THREE.Vector3(-w, 0.01, l))
    points.push(new THREE.Vector3(w, 0.01, -l), new THREE.Vector3(w, 0.01, l))

    // Singles sidelines
    points.push(new THREE.Vector3(-sw, 0.01, -l), new THREE.Vector3(-sw, 0.01, l))
    points.push(new THREE.Vector3(sw, 0.01, -l), new THREE.Vector3(sw, 0.01, l))

    // Service line
    const serviceZ = l * 0.56
    points.push(new THREE.Vector3(-sw, 0.01, -serviceZ), new THREE.Vector3(sw, 0.01, -serviceZ))
    points.push(new THREE.Vector3(-sw, 0.01, serviceZ), new THREE.Vector3(sw, 0.01, serviceZ))

    // Center service line
    points.push(new THREE.Vector3(0, 0.01, -serviceZ), new THREE.Vector3(0, 0.01, serviceZ))

    // Center mark
    points.push(new THREE.Vector3(0, 0.01, -l), new THREE.Vector3(0, 0.01, -l + 0.15))
    points.push(new THREE.Vector3(0, 0.01, l), new THREE.Vector3(0, 0.01, l - 0.15))

    return points
  }, [])

  return (
    <group>
      {Array.from({ length: lineGeometry.length / 2 }, (_, i) => {
        const start = lineGeometry[i * 2]
        const end = lineGeometry[i * 2 + 1]
        const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5)
        const length = start.distanceTo(end)
        const angle = Math.atan2(end.x - start.x, end.z - start.z)

        return (
          <mesh key={i} position={mid} rotation={[0, angle, 0]}>
            <boxGeometry args={[0.03, 0.005, length]} />
            <meshStandardMaterial color={LINE_COLOR} />
          </mesh>
        )
      })}
    </group>
  )
}

function Net() {
  return (
    <group position={[0, 0.45, 0]}>
      {/* Net mesh */}
      <mesh>
        <boxGeometry args={[COURT_WIDTH + 0.6, 0.9, 0.02]} />
        <meshStandardMaterial
          color="#e0e0e0"
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Net posts */}
      <mesh position={[-COURT_WIDTH / 2 - 0.3, -0.15, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.2, 8]} />
        <meshStandardMaterial color="#666666" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[COURT_WIDTH / 2 + 0.3, -0.15, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.2, 8]} />
        <meshStandardMaterial color="#666666" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Net cable */}
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[COURT_WIDTH + 0.6, 0.015, 0.015]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  )
}

export function Court() {
  return (
    <group position={[0, -2, -8]}>
      {/* Court surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[COURT_WIDTH + 2, COURT_LENGTH + 4]} />
        <meshStandardMaterial color={COURT_COLOR} roughness={0.85} />
      </mesh>

      {/* Surrounding ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#1a3a24" roughness={0.9} />
      </mesh>

      <CourtLines />
      <Net />
    </group>
  )
}
