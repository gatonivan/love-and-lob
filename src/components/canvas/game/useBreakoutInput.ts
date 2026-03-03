import { useRef, useEffect, useCallback } from 'react'
import { useThree } from '@react-three/fiber'
import { Vector3, Plane, Raycaster, Vector2 } from 'three'
import { ARENA_HALF_W, PADDLE_HALF_W } from './constants'

const KEYBOARD_SPEED = 8 // world units per second

export function useBreakoutInput() {
  const paddleX = useRef(0)
  const keysPressed = useRef<Set<string>>(new Set())
  const { camera, gl } = useThree()

  // z=0 plane for raycasting pointer
  const plane = useRef(new Plane(new Vector3(0, 0, 1), 0))
  const raycaster = useRef(new Raycaster())
  const pointerNDC = useRef(new Vector2())
  const intersection = useRef(new Vector3())

  const clamp = useCallback((x: number) => {
    const max = ARENA_HALF_W - PADDLE_HALF_W
    return Math.max(-max, Math.min(max, x))
  }, [])

  // Pointer (mouse/touch) handler
  useEffect(() => {
    const canvas = gl.domElement

    const handlePointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      pointerNDC.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      pointerNDC.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.current.setFromCamera(pointerNDC.current, camera)
      raycaster.current.ray.intersectPlane(plane.current, intersection.current)

      if (intersection.current) {
        paddleX.current = clamp(intersection.current.x)
      }
    }

    canvas.addEventListener('pointermove', handlePointer)
    canvas.addEventListener('pointerdown', handlePointer)

    return () => {
      canvas.removeEventListener('pointermove', handlePointer)
      canvas.removeEventListener('pointerdown', handlePointer)
    }
  }, [camera, gl, clamp])

  // Keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        keysPressed.current.add(e.key)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // Called each frame to apply keyboard movement
  const updateKeyboard = useCallback(
    (delta: number) => {
      if (keysPressed.current.has('ArrowLeft')) {
        paddleX.current = clamp(paddleX.current - KEYBOARD_SPEED * delta)
      }
      if (keysPressed.current.has('ArrowRight')) {
        paddleX.current = clamp(paddleX.current + KEYBOARD_SPEED * delta)
      }
    },
    [clamp]
  )

  return { paddleX, updateKeyboard }
}
