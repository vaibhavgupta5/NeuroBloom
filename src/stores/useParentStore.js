import { create } from 'zustand'

const EMPTY_CHILD = { id: null, name: '', age: null, streak: 0, stars: 0, dailyGoal: 4, sensoryProfile: null, consent: null, aacTiles: [] }

// UI state + the child report from GET /api/parent/dashboard (lib/childReport.js).
export const useParentStore = create((set) => ({
  activeTab: 'overview',
  setActiveTab: (tab) => set({ activeTab: tab }),

  hydrated: false,
  loadError: null,
  lastUpdatedAt: null,
  reload: () => {},
  setReload: (fn) => set({ reload: fn }),

  parent: { name: '', avatarInitials: '' },
  child: EMPTY_CHILD,
  stats: { todayMinutes: 0, todayMinutesDelta: 0, weeklyStreak: 0, totalModules: 0, avgMoodScore: 0, avgMoodDelta: null, todayCompletedCount: 0, dailyGoal: 4 },
  activeDaysStrip: [],
  weeklyMoodData: [],
  concentrationData: [],
  categoryTimeData: [],
  behavioralData: [],
  behaviorEntries: [],
  vocabularyData: [],
  completionData: [],
  sleepMoodData: [],
  promptDependency: [],
  skillProgress: [],
  sessionTimeline: [],
  todayPlan: [],
  goals: [],
  routines: [],
  coaching: null,
  commSentences7d: 0,
  therapists: [],
  therapistNotes: [],
  clinicalReports: [],
  achievements: [],
  notifications: [],
  independenceThisWeek: null,

  liveSession: {
    isLive: false,
    childName: '',
    activeGame: null,
    gameTitle: null,
    status: 'idle',
    score: 0,
    targetScore: 0,
    elapsedSeconds: 0,
    focusScore: 0,
    avgResponseMs: 0,
    accuracy: null,
    promptLevel: 0,
    level: 1,
    liveCoordinates: { x: 50, y: 50 },
    speedMultiplier: 1.0,
    isPaused: false,
    emotion: null,
    emotionConfidence: 0,
    snapshotFrame: null,
  },

  hydrateDashboard: (data) =>
    set({
      ...data,
      parent: data.parent || { name: '', avatarInitials: '' },
      hydrated: true,
      loadError: null,
      lastUpdatedAt: data.generatedAt ? new Date(data.generatedAt) : new Date(),
    }),
  setLoadError: (loadError) => set({ loadError }),

  updateLiveTelemetry: (payload) =>
    set((state) => ({
      liveSession: {
        ...state.liveSession,
        ...payload,
        isLive: payload.status ? payload.status !== 'idle' : state.liveSession.isLive,
        isPaused: payload.status ? payload.status === 'paused' : state.liveSession.isPaused,
        ...(payload.status === 'idle' ? { snapshotFrame: null } : {}),
      },
    })),
}))
