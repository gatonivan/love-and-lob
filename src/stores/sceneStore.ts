import { create } from 'zustand'

type CameraMode = 'game' | 'birdseye' | 'referee' | 'umpire' | 'shop'

interface SceneState {
  soundEnabled: boolean
  reducedMotion: boolean
  cameraMode: CameraMode
  cameraSettled: boolean
  overlayScrolled: boolean
  logoHidden: boolean
  pageExiting: boolean

  toggleSound: () => void
  setReducedMotion: (reduced: boolean) => void
  setCameraMode: (mode: CameraMode) => void
  setCameraSettled: (settled: boolean) => void
  setOverlayScrolled: (scrolled: boolean) => void
  setLogoHidden: (hidden: boolean) => void
  setPageExiting: (exiting: boolean) => void
}

export const useSceneStore = create<SceneState>((set) => ({
  soundEnabled: false,
  reducedMotion: false,
  cameraMode: 'game',
  cameraSettled: true,
  overlayScrolled: false,
  logoHidden: false,
  pageExiting: false,

  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  setReducedMotion: (reduced) => set({ reducedMotion: reduced }),
  setCameraMode: (mode) => set((state) =>
    state.cameraMode === mode ? state : { cameraMode: mode, cameraSettled: false }
  ),
  setCameraSettled: (settled) => set({ cameraSettled: settled }),
  setOverlayScrolled: (scrolled) => set({ overlayScrolled: scrolled }),
  setLogoHidden: (hidden) => set({ logoHidden: hidden }),
  setPageExiting: (exiting) => set({ pageExiting: exiting }),
}))
