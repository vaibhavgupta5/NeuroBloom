import { create } from 'zustand'

const initialChild = {
  id: null,
  name: 'Arjun',
  age: 6,
  avatarIcon: 'child',
  streak: 0,
  stars: 0,
  dailyGoal: 4,
}

export const useChildStore = create((set, get) => ({
  child: initialChild,
  todayModules: [],
  todayCompletedCount: 0,
  hydrated: false,
  currentMood: null,
  activeScreen: 'home',
  activeGame: null,

  // Camera emotion mirrors (source of truth = CameraEmotionContext)
  cameraStatus: 'idle',
  emotion: null,

  // Realtime parent intervention state (applied locally via SSE parent-action events)
  activeSticker: null,
  remoteSpeedMultiplier: 1.0,
  remotePaused: false,

  displaySettings: {
    theme: 'default', // default, pastel, high-contrast, dark
    brightness: 100, // percentage (50 to 150)
    saturation: 100, // percentage (0 to 200)
    soundEnabled: true, // UI click sounds
    customBackgroundImage: null, // URL or ObjectURL
  },

  setDisplaySettings: (settings) => set((state) => ({
    displaySettings: { ...state.displaySettings, ...settings }
  })),
  setMood: (mood) => set({ currentMood: mood }),
  setCameraStatus: (status) => set({ cameraStatus: status }),
  setEmotion: (emotion) => set({ emotion }),

  // Hydrate from GET /api/child/state (or the response of POST /api/sessions)
  hydrateChildState: (data) => set({
    child: data.child || get().child,
    todayModules: data.todayModules ?? get().todayModules,
    todayCompletedCount: data.todayCompletedCount ?? get().todayCompletedCount,
    currentMood: data.currentMood !== undefined ? data.currentMood : get().currentMood,
    hydrated: true,
  }),

  // Optimistically mark a module complete; the caller persists via POST /api/sessions
  // and reconciles with hydrateChildState().
  completeModule: (moduleCode) =>
    set((state) => {
      const updated = state.todayModules.map((m) => {
        if (m.moduleCode === moduleCode || m.id === moduleCode) return { ...m, completed: true }
        // unlock next module
        const idx = state.todayModules.findIndex(
          (x) => x.moduleCode === moduleCode || x.id === moduleCode
        )
        if (state.todayModules.indexOf(m) === idx + 1) return { ...m, unlocked: true }
        return m
      })
      return {
        todayModules: updated,
        todayCompletedCount: state.todayCompletedCount + 1,
        activeGame: null,
      }
    }),

  setScreen: (screen) => set({ activeScreen: screen }),
  setActiveGame: (game) => set({ activeGame: game }),

  // Parent remote intervention action handler (fed by the SSE parent-action stream)
  receiveParentAction: (actionPayload) => {
    if (!actionPayload) return;
    const { actionType, payload } = actionPayload;

    if (actionType === 'SEND_STICKER') {
      set({ activeSticker: payload });
      setTimeout(() => {
        if (get().activeSticker?.id === payload.id) {
          set({ activeSticker: null });
        }
      }, 4000);
    } else if (actionType === 'SET_SPEED') {
      set({ remoteSpeedMultiplier: payload.speed });
    } else if (actionType === 'TOGGLE_PAUSE') {
      set((state) => ({ remotePaused: !state.remotePaused }));
    }
  },
}))
