import { useRef, useCallback } from 'react'
import { Html } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { gsap } from 'gsap'
import * as THREE from 'three'
import { useSceneStore } from '../../../stores/sceneStore'

function JumbotronContent() {
  return (
    <div
      style={{
        width: 400,
        padding: '2rem',
        background: 'rgba(10, 10, 10, 0.95)',
        color: 'white',
        fontFamily: '-apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif',
        borderRadius: 4,
        backdropFilter: 'blur(8px)',
      }}
    >
      <h2
        style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          marginBottom: '1rem',
          textTransform: 'uppercase',
        }}
      >
        Upcoming Events
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {[
          { date: 'MAR 15', name: 'Spring Open', location: 'Los Angeles, CA' },
          { date: 'APR 02', name: 'Love & Lob Invitational', location: 'Miami, FL' },
          { date: 'MAY 18', name: 'Summer Series', location: 'New York, NY' },
          { date: 'JUN 07', name: 'Championship Final', location: 'London, UK' },
        ].map((event) => (
          <div
            key={event.name}
            style={{
              display: 'flex',
              gap: '1rem',
              alignItems: 'baseline',
              padding: '0.5rem 0',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                color: '#c4d82e',
                minWidth: 60,
                fontWeight: 600,
              }}
            >
              {event.date}
            </span>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{event.name}</div>
              <div style={{ fontSize: '0.75rem', color: '#888' }}>{event.location}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Jumbotron() {
  const groupRef = useRef<THREE.Group>(null)
  const { camera } = useThree()
  const jumbotronFocused = useSceneStore((s) => s.jumbotronFocused)
  const setJumbotronFocused = useSceneStore((s) => s.setJumbotronFocused)

  const savedCamera = useRef({ pos: new THREE.Vector3(), target: new THREE.Vector3() })

  const handleClick = useCallback(() => {
    if (jumbotronFocused) {
      // Return to scroll-driven position
      gsap.to(camera.position, {
        x: savedCamera.current.pos.x,
        y: savedCamera.current.pos.y,
        z: savedCamera.current.pos.z,
        duration: 0.8,
        ease: 'power2.inOut',
      })
      setJumbotronFocused(false)
    } else {
      // Save current camera position
      savedCamera.current.pos.copy(camera.position)

      // Snap to front-facing orthographic-like view
      gsap.to(camera.position, {
        x: 0,
        y: 3,
        z: -8,
        duration: 0.8,
        ease: 'power2.inOut',
      })
      setJumbotronFocused(true)
    }
  }, [camera, jumbotronFocused, setJumbotronFocused])

  return (
    <group ref={groupRef} position={[0, 3, -15]}>
      {/* Screen frame */}
      <mesh onClick={handleClick}>
        <boxGeometry args={[6, 3.5, 0.3]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Screen surface */}
      <mesh position={[0, 0, 0.16]}>
        <planeGeometry args={[5.6, 3.1]} />
        <meshStandardMaterial color="#0a0a0a" emissive="#111111" emissiveIntensity={0.5} />
      </mesh>

      {/* Html content on screen face */}
      <Html
        position={[0, 0, 0.2]}
        transform
        occlude
        scale={0.4}
        style={{ pointerEvents: 'none' }}
      >
        <JumbotronContent />
      </Html>

      {/* Support posts */}
      <mesh position={[-2.5, -3, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 6, 8]} />
        <meshStandardMaterial color="#333333" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[2.5, -3, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 6, 8]} />
        <meshStandardMaterial color="#333333" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  )
}
