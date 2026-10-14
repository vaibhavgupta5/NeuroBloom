import { create } from 'zustand'

const DEFAULT_SENSORY = { motion: 'reduced', sfx: true, voice: true, voiceRate: 0.9, calmPalette: false, showTimer: false, sessionMinutes: 15 }

export const useChildStore = create((set, get) => ({
  child: { id: null, name: '', age: null, streak: 0, stars: 0, dailyGoal: 4, sensoryProfile: DEFAULT_SENSORY, consent: { camera: false, liveFrames: false }, levels: {}, aacTiles: [] },
  childMode: false,
  todayModules: [],
  todayCompletedCount: 0,
  achievements: [],
  hydrated: false,
  loadError: null,
  currentMood: null,
  activeScreen: 'home',
  activeGame: null,

  // Parent interventions (SSE) and break offers
  activeSticker: null,
  remoteSpeedMultiplier: 1.0,
  remotePaused: false,
  breakOffer: null, // null | 'parent' | 'auto'

  setMood: (mood) => set({ currentMood: mood }),
  setScreen: (screen) => set({ activeScreen: screen, activeGame: null }),
  setActiveGame: (game) => set({ activeGame: game }),
  offerBreak: (source = 'auto') => set({ breakOffer: source }),
  dismissBreak: () => set({ breakOffer: null }),
  takeBreak: () => set({ breakOffer: null, activeGame: null, activeScreen: 'feel', calmRequested: true }),
  calmRequested: false,
  clearCalmRequest: () => set({ calmRequested: false }),

  hydrateChildState: (data) => set({
    child: { ...get().child, ...data.child, sensoryProfile: { ...DEFAULT_SENSORY, ...(data.child?.sensoryProfile || {}) } },
    childMode: data.childMode ?? get().childMode,
    todayModules: data.todayModules ?? get().todayModules,
    todayCompletedCount: data.todayModules ? data.todayModules.filter((m) => m.completed).length : get().todayCompletedCount,
    achievements: data.achievements ?? get().achievements,
    currentMood: data.currentMood !== undefined ? data.currentMood : get().currentMood,
    hydrated: true,
    loadError: null,
  }),
  setLoadError: (loadError) => set({ loadError }),

  // Optimistic completion; POST /api/sessions reconciles with hydrateChildState()
  completeModule: (moduleCode) =>
    set((state) => {
      const done = state.todayModules.find((m) => m.moduleCode === moduleCode || m.id === moduleCode)
      if (!done || done.completed) return {}
      const next = state.todayModules
        .filter((m) => !m.completed && m !== done && (m.order ?? 0) > (done.order ?? 0))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0]
      const updated = state.todayModules.map((m) => {
        if (m === done) return { ...m, completed: true }
        if (m === next) return { ...m, unlocked: true }
        return m
      })
      return { todayModules: updated, todayCompletedCount: updated.filter((m) => m.completed).length }
    }),

  receiveParentAction: (action) => {
    if (!action) return
    const { actionType, payload } = action
    if (actionType === 'SEND_STICKER') {
      const sticker = { ...payload, key: `${payload.id}-${get().stickerSeq + 1}` }
      set({ activeSticker: sticker, stickerSeq: get().stickerSeq + 1 })
      setTimeout(() => {
        if (get().activeSticker?.key === sticker.key) set({ activeSticker: null })
      }, 4500)
    } else if (actionType === 'SET_SPEED') {
      set({ remoteSpeedMultiplier: payload.speed })
    } else if (actionType === 'TOGGLE_PAUSE') {
      set({ remotePaused: typeof payload?.paused === 'boolean' ? payload.paused : !get().remotePaused })
    } else if (actionType === 'OFFER_BREAK') {
      set({ breakOffer: 'parent' })
    }
  },
  stickerSeq: 0,
}))
