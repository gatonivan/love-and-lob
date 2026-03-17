import { create } from 'zustand'

type CameraMode = 'game' | 'birdseye' | 'referee' | 'umpire' | 'shop'

interface SceneState {
  soundEnabled: boolean
  reducedMotion: boolean
  cameraMode: CameraMode
  cameraSettled: boolean
  overlayScrolled: boolean
  logoHidden: boolean

  toggleSound: () => void
  setReducedMotion: (reduced: boolean) => void
  setCameraMode: (mode: CameraMode) => void
  setCameraSettled: (settled: boolean) => void
  setOverlayScrolled: (scrolled: boolean) => void
  setLogoHidden: (hidden: boolean) => void
}

export const useSceneStore = create<SceneState>((set) => ({
  soundEnabled: false,
  reducedMotion: false,
  cameraMode: 'game',
  cameraSettled: true,
  overlayScrolled: false,
  logoHidden: false,

  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  setReducedMotion: (reduced) => set({ reducedMotion: reduced }),
  setCameraMode: (mode) => set({ cameraMode: mode, cameraSettled: false }),
  setCameraSettled: (settled) => set({ cameraSettled: settled }),
  setOverlayScrolled: (scrolled) => set({ overlayScrolled: scrolled }),
  setLogoHidden: (hidden) => set({ logoHidden: hidden }),
}))
