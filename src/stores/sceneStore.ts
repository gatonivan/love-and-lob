import { create } from 'zustand'

interface SceneState {
  soundEnabled: boolean
  reducedMotion: boolean

  toggleSound: () => void
  setReducedMotion: (reduced: boolean) => void
}

export const useSceneStore = create<SceneState>((set) => ({
  soundEnabled: false,
  reducedMotion: false,

  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  setReducedMotion: (reduced) => set({ reducedMotion: reduced }),
}))
