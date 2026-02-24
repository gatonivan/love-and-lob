import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { gsap } from 'gsap'
import * as THREE from 'three'
import { useSceneStore } from '../stores/sceneStore'

const HERO_CAMERA = { x: 0, y: 0, z: 6, fov: 45 }
const SHOP_CAMERA = { x: 0, y: 0, z: 0.3, fov: 15 }
const SCHEDULE_CAMERA = { x: 0, y: 0, z: 2.5, fov: 30 }

export function useShopTransition() {
  const { camera } = useThree()
  const tl = useRef<gsap.core.Timeline | null>(null)
  const cameraState = useRef({ ...HERO_CAMERA })

  const isTransitioningToShop = useSceneStore((s) => s.isTransitioningToShop)
  const isTransitioningFromShop = useSceneStore((s) => s.isTransitioningFromShop)
  const isTransitioningToSchedule = useSceneStore((s) => s.isTransitioningToSchedule)
  const isTransitioningFromSchedule = useSceneStore((s) => s.isTransitioningFromSchedule)
  const isTransitioningToWords = useSceneStore((s) => s.isTransitioningToWords)
  const isTransitioningFromWords = useSceneStore((s) => s.isTransitioningFromWords)

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

  // Forward transition: hero -> schedule
  // Show overlay at 60% of zoom for a fluid overlap
  useEffect(() => {
    if (!isTransitioningToSchedule) return
    tl.current?.kill()

    const store = useSceneStore.getState()
    const timeline = gsap.timeline({
      onComplete: () => {
        store.setIsTransitioningToSchedule(false)
        store.setCurrentSection('schedule')
      },
    })

    timeline.to(cameraState.current, {
      z: SCHEDULE_CAMERA.z,
      fov: SCHEDULE_CAMERA.fov,
      duration: 1.0,
      ease: 'power3.inOut',
      onUpdate: function (this: gsap.core.Tween) {
        if (this.progress() >= 0.6 && !useSceneStore.getState().scheduleVisible) {
          useSceneStore.getState().setScheduleVisible(true)
        }
      },
    })

    tl.current = timeline
    return () => { timeline.kill() }
  }, [isTransitioningToSchedule])

  // Reverse transition: schedule -> hero
  // Overlay is already fading out; start zoom after brief delay
  useEffect(() => {
    if (!isTransitioningFromSchedule) return
    tl.current?.kill()

    const timeline = gsap.timeline({
      onComplete: () => {
        useSceneStore.getState().setIsTransitioningFromSchedule(false)
        useSceneStore.getState().setCurrentSection('hero')
      },
    })

    timeline.to(cameraState.current, {
      z: HERO_CAMERA.z,
      fov: HERO_CAMERA.fov,
      duration: 0.8,
      delay: 0.15,
      ease: 'power2.inOut',
    })

    tl.current = timeline
    return () => { timeline.kill() }
  }, [isTransitioningFromSchedule])

  // Forward transition: hero -> words
  useEffect(() => {
    if (!isTransitioningToWords) return
    tl.current?.kill()

    const store = useSceneStore.getState()
    const timeline = gsap.timeline({
      onComplete: () => {
        store.setIsTransitioningToWords(false)
        store.setCurrentSection('words')
      },
    })

    timeline.to(cameraState.current, {
      z: SCHEDULE_CAMERA.z,
      fov: SCHEDULE_CAMERA.fov,
      duration: 1.0,
      ease: 'power3.inOut',
      onUpdate: function (this: gsap.core.Tween) {
        if (this.progress() >= 0.6 && !useSceneStore.getState().wordsVisible) {
          useSceneStore.getState().setWordsVisible(true)
        }
      },
    })

    tl.current = timeline
    return () => { timeline.kill() }
  }, [isTransitioningToWords])

  // Reverse transition: words -> hero
  useEffect(() => {
    if (!isTransitioningFromWords) return
    tl.current?.kill()

    const timeline = gsap.timeline({
      onComplete: () => {
        useSceneStore.getState().setIsTransitioningFromWords(false)
        useSceneStore.getState().setCurrentSection('hero')
      },
    })

    timeline.to(cameraState.current, {
      z: HERO_CAMERA.z,
      fov: HERO_CAMERA.fov,
      duration: 0.8,
      delay: 0.15,
      ease: 'power2.inOut',
    })

    tl.current = timeline
    return () => { timeline.kill() }
  }, [isTransitioningFromWords])

  // Apply camera state every frame
  useFrame(() => {
    camera.position.set(cameraState.current.x, cameraState.current.y, cameraState.current.z)
    const cam = camera as THREE.PerspectiveCamera
    cam.fov = cameraState.current.fov
    cam.updateProjectionMatrix()
    camera.lookAt(0, 0, 0)
  })
}
