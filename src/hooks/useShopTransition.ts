import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { gsap } from 'gsap'
import * as THREE from 'three'
import { useSceneStore } from '../stores/sceneStore'

const HERO_CAMERA = { x: 0, y: 0, z: 6, fov: 45 }
const SHOP_CAMERA = { x: 0, y: 0, z: 0.3, fov: 15 }

export function useShopTransition() {
  const { camera } = useThree()
  const tl = useRef<gsap.core.Timeline | null>(null)
  const cameraState = useRef({ ...HERO_CAMERA })

  const isTransitioningToShop = useSceneStore((s) => s.isTransitioningToShop)
  const isTransitioningFromShop = useSceneStore((s) => s.isTransitioningFromShop)

  // Forward transition: hero -> shop
  useEffect(() => {
    if (!isTransitioningToShop) return
    tl.current?.kill()

    const timeline = gsap.timeline({
      onComplete: () => {
        useSceneStore.getState().setIsTransitioningToShop(false)
        useSceneStore.getState().setShopVisible(true)
        useSceneStore.getState().setCurrentSection('shop')
      },
    })

    timeline.to(cameraState.current, {
      z: SHOP_CAMERA.z,
      fov: SHOP_CAMERA.fov,
      duration: 1.2,
      ease: 'power3.inOut',
    })

    tl.current = timeline
    return () => { timeline.kill() }
  }, [isTransitioningToShop])

  // Reverse transition: shop -> hero
  useEffect(() => {
    if (!isTransitioningFromShop) return
    tl.current?.kill()

    const timeline = gsap.timeline({
      onComplete: () => {
        useSceneStore.getState().setIsTransitioningFromShop(false)
        useSceneStore.getState().setCurrentSection('hero')
      },
    })

    timeline.to(cameraState.current, {
      z: HERO_CAMERA.z,
      fov: HERO_CAMERA.fov,
      duration: 1.0,
      ease: 'power2.inOut',
    })

    tl.current = timeline
    return () => { timeline.kill() }
  }, [isTransitioningFromShop])

  // Apply camera state every frame
  useFrame(() => {
    camera.position.set(cameraState.current.x, cameraState.current.y, cameraState.current.z)
    const cam = camera as THREE.PerspectiveCamera
    cam.fov = cameraState.current.fov
    cam.updateProjectionMatrix()
    camera.lookAt(0, 0, 0)
  })
}
