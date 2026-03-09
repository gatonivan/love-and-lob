import { create } from 'zustand'

type CameraMode = 'game' | 'birdseye' | 'referee' | 'umpire'

interface SceneState {
  soundEnabled: boolean
  reducedMotion: boolean
  cameraMode: CameraMode
  cameraSettled: boolean
  overlayScrolled: boolean

  toggleSound: () => void
  setReducedMotion: (reduced: boolean) => void
  setCameraMode: (mode: CameraMode) => void
  setCameraSettled: (settled: boolean) => void
  setOverlayScrolled: (scrolled: boolean) => void
}

export const useSceneStore = create<SceneState>((set) => ({
  soundEnabled: false,
  reducedMotion: false,
  cameraMode: 'game',
  cameraSettled: true,
  overlayScrolled: false,

  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  setReducedMotion: (reduced) => set({ reducedMotion: reduced }),
  setCameraMode: (mode) => set({ cameraMode: mode, cameraSettled: false }),
  setCameraSettled: (settled) => set({ cameraSettled: settled }),
  setOverlayScrolled: (scrolled) => set({ overlayScrolled: scrolled }),
}))
