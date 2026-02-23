import { useRef, useLayoutEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { gsap } from 'gsap'
import { useSceneStore } from '../stores/sceneStore'
import { useWheelScroll } from './useWheelScroll'

type Section = 'hero' | 'court' | 'jumbotron' | 'shop-transition' | 'shop'

const SECTION_BOUNDARIES: [Section, number, number][] = [
  ['hero', 0, 0.2],
  ['court', 0.2, 0.4],
  ['jumbotron', 0.4, 0.65],
  ['shop-transition', 0.65, 0.85],
  ['shop', 0.85, 1.0],
]

function getSectionFromOffset(offset: number): Section {
  for (const [name, start, end] of SECTION_BOUNDARIES) {
    if (offset >= start && offset < end) return name
  }
  return 'shop'
}

export function useScrollAnimation() {
  const { camera } = useThree()
  const { getOffset } = useWheelScroll()
  const tl = useRef<gsap.core.Timeline | null>(null)

  const cameraPos = useRef({ x: 0, y: 0, z: 6 })
  const cameraLookAt = useRef({ x: 0, y: 0, z: 0 })
  const setCurrentSection = useSceneStore((s) => s.setCurrentSection)
  const setShopVisible = useSceneStore((s) => s.setShopVisible)
  const prevSection = useRef<string>('hero')

  useLayoutEffect(() => {
    const timeline = gsap.timeline({ paused: true })

    // Hero: ball front and center, close up
    timeline
      .set(cameraPos.current, { x: 0, y: 0, z: 6 }, 0)
      .set(cameraLookAt.current, { x: 0, y: 0, z: 0 }, 0)

    // Hero -> Court approach (pull up and push forward)
    timeline
      .to(cameraPos.current, { x: 0, y: 3, z: 5, duration: 1, ease: 'power2.inOut' }, 0)
      .to(cameraLookAt.current, { x: 0, y: -1, z: -5, duration: 1, ease: 'power2.inOut' }, 0)

    // Court section: overhead-ish view
    timeline
      .to(cameraPos.current, { x: 0, y: 5, z: 2, duration: 1, ease: 'power2.inOut' }, 1)
      .to(cameraLookAt.current, { x: 0, y: 0, z: -8, duration: 1, ease: 'power2.inOut' }, 1)

    // Court -> Jumbotron
    timeline
      .to(cameraPos.current, { x: 4, y: 3, z: -4, duration: 1, ease: 'power2.inOut' }, 2)
      .to(cameraLookAt.current, { x: 0, y: 2, z: -12, duration: 1, ease: 'power2.inOut' }, 2)

    // Jumbotron: viewing the screen
    timeline
      .to(cameraPos.current, { x: 0, y: 2.5, z: -6, duration: 1, ease: 'power2.inOut' }, 3)
      .to(cameraLookAt.current, { x: 0, y: 3, z: -15, duration: 1, ease: 'power2.inOut' }, 3)

    // Shop transition: pull back to ball
    timeline
      .to(cameraPos.current, { x: 0, y: 0, z: 4, duration: 1, ease: 'power2.inOut' }, 4)
      .to(cameraLookAt.current, { x: 0, y: 0, z: 0, duration: 1, ease: 'power2.inOut' }, 4)

    tl.current = timeline
    return () => { timeline.kill() }
  }, [])

  useFrame(() => {
    if (!tl.current) return

    const offset = getOffset()

    // Seek timeline to current scroll position
    tl.current.seek(offset * tl.current.duration())

    // Apply camera
    camera.position.set(cameraPos.current.x, cameraPos.current.y, cameraPos.current.z)
    camera.lookAt(cameraLookAt.current.x, cameraLookAt.current.y, cameraLookAt.current.z)

    // Update section
    const section = getSectionFromOffset(offset)
    if (section !== prevSection.current) {
      prevSection.current = section
      setCurrentSection(section)
    }

    setShopVisible(offset > 0.9)
  })
}
