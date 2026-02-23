import { useRef, useLayoutEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { useSceneStore } from '../stores/sceneStore'

gsap.registerPlugin(useGSAP)

// Section boundaries (as fractions of total scroll 0-1)
const SECTIONS = {
  hero: [0, 0.2],
  court: [0.2, 0.4],
  jumbotron: [0.4, 0.65],
  shopTransition: [0.65, 0.85],
  shop: [0.85, 1.0],
} as const

type Section = keyof typeof SECTIONS

function getSectionFromOffset(offset: number): Section {
  for (const [name, [start, end]] of Object.entries(SECTIONS)) {
    if (offset >= start && offset < end) return name as Section
  }
  return 'shop'
}

export function useScrollAnimation() {
  const scroll = useScroll()
  const { camera } = useThree()
  const tl = useRef<gsap.core.Timeline | null>(null)

  const cameraPos = useRef({ x: 0, y: 0, z: 12 })
  const cameraLookAt = useRef({ x: 0, y: 0, z: 0 })
  const setCurrentSection = useSceneStore((s) => s.setCurrentSection)
  const setScrollProgress = useSceneStore((s) => s.setScrollProgress)
  const setShopVisible = useSceneStore((s) => s.setShopVisible)
  const prevSection = useRef<string>('hero')

  useLayoutEffect(() => {
    const timeline = gsap.timeline({ paused: true })

    // Hero section: ball front and center
    timeline
      .set(cameraPos.current, { x: 0, y: 0, z: 12 }, 0)
      .set(cameraLookAt.current, { x: 0, y: 0, z: 0 }, 0)

    // Transition: Hero -> Court approach
    timeline
      .to(cameraPos.current, { x: 0, y: 4, z: 8, duration: 1, ease: 'power2.inOut' }, 0)
      .to(cameraLookAt.current, { x: 0, y: -1, z: -5, duration: 1, ease: 'power2.inOut' }, 0)

    // Court section: overhead-ish view
    timeline
      .to(cameraPos.current, { x: 0, y: 6, z: 2, duration: 1, ease: 'power2.inOut' }, 1)
      .to(cameraLookAt.current, { x: 0, y: 0, z: -8, duration: 1, ease: 'power2.inOut' }, 1)

    // Transition: Court -> Jumbotron
    timeline
      .to(cameraPos.current, { x: 4, y: 3, z: -4, duration: 1, ease: 'power2.inOut' }, 2)
      .to(cameraLookAt.current, { x: 0, y: 2, z: -12, duration: 1, ease: 'power2.inOut' }, 2)

    // Jumbotron section: viewing the screen
    timeline
      .to(cameraPos.current, { x: 0, y: 2.5, z: -6, duration: 1, ease: 'power2.inOut' }, 3)
      .to(cameraLookAt.current, { x: 0, y: 3, z: -15, duration: 1, ease: 'power2.inOut' }, 3)

    // Shop transition: pull back, ball scales up
    timeline
      .to(cameraPos.current, { x: 0, y: 0, z: 5, duration: 1, ease: 'power2.inOut' }, 4)
      .to(cameraLookAt.current, { x: 0, y: 0, z: 0, duration: 1, ease: 'power2.inOut' }, 4)

    tl.current = timeline

    return () => {
      timeline.kill()
    }
  }, [])

  useFrame(() => {
    if (!tl.current) return

    const offset = scroll.offset

    // Seek timeline to current scroll position
    tl.current.seek(offset * tl.current.duration())

    // Apply camera position and lookAt
    camera.position.set(cameraPos.current.x, cameraPos.current.y, cameraPos.current.z)
    camera.lookAt(cameraLookAt.current.x, cameraLookAt.current.y, cameraLookAt.current.z)

    // Update store
    setScrollProgress(offset)

    const section = getSectionFromOffset(offset)
    if (section !== prevSection.current) {
      prevSection.current = section
      setCurrentSection(section === 'shopTransition' ? 'shop-transition' : section)
    }

    // Shop visibility
    setShopVisible(offset > 0.9)
  })
}
