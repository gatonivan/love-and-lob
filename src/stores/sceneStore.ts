import { create } from 'zustand'

type Section = 'hero' | 'court' | 'jumbotron' | 'shop-transition' | 'shop' | 'schedule-transition' | 'schedule'

interface SceneState {
  scrollProgress: number
  scrollVelocity: number
  currentSection: Section
  soundEnabled: boolean
  reducedMotion: boolean
  shopVisible: boolean
  scheduleVisible: boolean
  ballDeformAmount: number
  jumbotronFocused: boolean
  isTransitioningToShop: boolean
  isTransitioningFromShop: boolean
  isTransitioningToSchedule: boolean
  isTransitioningFromSchedule: boolean
  ballHovered: boolean

  setScrollProgress: (progress: number) => void
  setScrollVelocity: (velocity: number) => void
  setCurrentSection: (section: Section) => void
  toggleSound: () => void
  setReducedMotion: (reduced: boolean) => void
  setShopVisible: (visible: boolean) => void
  setScheduleVisible: (visible: boolean) => void
  setBallDeformAmount: (amount: number) => void
  setJumbotronFocused: (focused: boolean) => void
  setIsTransitioningToShop: (v: boolean) => void
  setIsTransitioningFromShop: (v: boolean) => void
  setIsTransitioningToSchedule: (v: boolean) => void
  setIsTransitioningFromSchedule: (v: boolean) => void
  setBallHovered: (hovered: boolean) => void
}

export const useSceneStore = create<SceneState>((set) => ({
  scrollProgress: 0,
  scrollVelocity: 0,
  currentSection: 'hero',
  soundEnabled: false,
  reducedMotion: false,
  shopVisible: false,
  scheduleVisible: false,
  ballDeformAmount: 0,
  jumbotronFocused: false,
  isTransitioningToShop: false,
  isTransitioningFromShop: false,
  isTransitioningToSchedule: false,
  isTransitioningFromSchedule: false,
  ballHovered: false,

  setScrollProgress: (progress) => set({ scrollProgress: progress }),
  setScrollVelocity: (velocity) => set({ scrollVelocity: velocity }),
  setCurrentSection: (section) => set({ currentSection: section }),
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  setReducedMotion: (reduced) => set({ reducedMotion: reduced }),
  setShopVisible: (visible) => set({ shopVisible: visible }),
  setScheduleVisible: (visible) => set({ scheduleVisible: visible }),
  setBallDeformAmount: (amount) => set({ ballDeformAmount: amount }),
  setJumbotronFocused: (focused) => set({ jumbotronFocused: focused }),
  setIsTransitioningToShop: (v) => set({ isTransitioningToShop: v }),
  setIsTransitioningFromShop: (v) => set({ isTransitioningFromShop: v }),
  setIsTransitioningToSchedule: (v) => set({ isTransitioningToSchedule: v }),
  setIsTransitioningFromSchedule: (v) => set({ isTransitioningFromSchedule: v }),
  setBallHovered: (hovered) => set({ ballHovered: hovered }),
}))
