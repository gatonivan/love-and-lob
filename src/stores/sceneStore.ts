import { create } from 'zustand'

type CameraMode = 'game' | 'birdseye' | 'referee'

interface SceneState {
  soundEnabled: boolean
  reducedMotion: boolean
  cameraMode: CameraMode
  cameraSettled: boolean

  toggleSound: () => void
  setReducedMotion: (reduced: boolean) => void
  setCameraMode: (mode: CameraMode) => void
  setCameraSettled: (settled: boolean) => void
}

export const useSceneStore = create<SceneState>((set) => ({
  soundEnabled: false,
  reducedMotion: false,
  cameraMode: 'game',
  cameraSettled: true,

  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  setReducedMotion: (reduced) => set({ reducedMotion: reduced }),
  setCameraMode: (mode) => set({ cameraMode: mode, cameraSettled: false }),
  setCameraSettled: (settled) => set({ cameraSettled: settled }),
}))
