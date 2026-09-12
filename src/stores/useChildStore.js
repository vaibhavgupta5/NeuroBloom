import { create } from 'zustand'

export const useChildStore = create((set, get) => ({
  child: { name: 'Arjun', avatarIcon: 'child', streak: 7, stars: 34 },
  todayModules: [
    { id: 'm1', iconKey: 'emotion', emoji: '🎭', title: 'Feelings Game',       shortTitle: 'Feelings', duration: '8 min',  skill: 'Social',        unlocked: true,  completed: false },
    { id: 'm2', iconKey: 'word',    emoji: '🔤', title: 'Word Match',           shortTitle: 'Words',    duration: '6 min',  skill: 'Communication', unlocked: false, completed: false },
    { id: 'm3', iconKey: 'puzzle',  emoji: '🧩', title: 'Puzzle Time',          shortTitle: 'Puzzles',  duration: '7 min',  skill: 'Cognitive',     unlocked: false, completed: false },
    { id: 'm4', iconKey: 'focus',   emoji: '🎯', title: 'Focus Ball',           shortTitle: 'Focus',    duration: '5 min',  skill: 'Attention',     unlocked: false, completed: false },
  ],
  completedModuleIds: [],
  currentMood: null,
  activeScreen: 'home',
  activeGame: null,
  
  // Realtime parent intervention state
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
  
  completeModule: (id) =>
    set((state) => {
      const newCompleted = [...state.completedModuleIds, id]
      const updated = state.todayModules.map((m, i) => {
        if (m.id === id) return { ...m, completed: true }
        // unlock next module
        const idx = state.todayModules.findIndex((x) => x.id === id)
        if (i === idx + 1) return { ...m, unlocked: true }
        return m
      })
      return { completedModuleIds: newCompleted, todayModules: updated, activeGame: null }
    }),

  setScreen: (screen) => set({ activeScreen: screen }),
  setActiveGame: (game) => set({ activeGame: game }),

  // Parent remote intervention action handler
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
