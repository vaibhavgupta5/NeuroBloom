import { create } from 'zustand'

// UI state + hydrated server data. All dashboard analytics arrive via
// GET /api/parent/dashboard and land here through hydrateDashboard().
export const useParentStore = create((set) => ({
  activeTab: 'overview',
  setActiveTab: (tab) => set({ activeTab: tab }),

  parent: { name: 'Priya', avatarInitials: 'PM' },
  child: { name: 'Arjun', age: 6, streak: 0, dailyGoal: 4 },
  stats: {
    todayMinutes: 0,
    todayMinutesDelta: 0,
    weeklyStreak: 0,
    totalModules: 0,
    avgMoodScore: 0,
    avgMoodDelta: 0,
    todayCompletedCount: 0,
    dailyGoal: 4,
  },
  hydrated: false,
  lastUpdatedAt: null,

  // Live Session Telemetry State (fed by the SSE telemetry stream)
  liveSession: {
    isLive: false,
    childName: 'Arjun',
    activeGame: null,
    gameTitle: null,
    status: 'idle',
    score: 0,
    targetScore: 0,
    elapsedSeconds: 0,
    focusScore: 0,
    focusStatus: null,
    trackingSmoothness: null,
    avgResponseMs: 0,
    frustrationLevel: null,
    liveCoordinates: { x: 50, y: 50 },
    tapRipples: [],
    speedMultiplier: 1.0,
    isPaused: false,
  },

  // ---- Dashboard datasets (all hydrated from /api/parent/dashboard) ----
  activeDaysStrip: [],
  weeklyMoodData: [],
  concentrationData: [],
  categoryTimeData: [],
  behavioralData: [],
  vocabularyData: [],
  completionData: [],
  sleepMoodData: [],
  promptDependency: [],
  skillProgress: [],
  sessionTimeline: [],
  therapistNotes: [],
  clinicalReports: [],
  achievements: [],
  upcomingModules: [],

  hydrateDashboard: (data) =>
    set({
      parent: data.parent || { name: 'Priya', avatarInitials: 'PM' },
      child: data.child || { name: 'Arjun', age: 6, streak: 0, dailyGoal: 4 },
      stats: data.stats || {
        todayMinutes: 0, todayMinutesDelta: 0, weeklyStreak: 0, totalModules: 0,
        avgMoodScore: 0, avgMoodDelta: 0, todayCompletedCount: 0, dailyGoal: 4,
      },
      activeDaysStrip: data.activeDaysStrip || [],
      weeklyMoodData: data.weeklyMoodData || [],
      concentrationData: data.concentrationData || [],
      categoryTimeData: data.categoryTimeData || [],
      behavioralData: data.behavioralData || [],
      vocabularyData: data.vocabularyData || [],
      completionData: data.completionData || [],
      sleepMoodData: data.sleepMoodData || [],
      promptDependency: data.promptDependency || [],
      skillProgress: data.skillProgress || [],
      sessionTimeline: data.sessionTimeline || [],
      therapistNotes: data.therapistNotes || [],
      clinicalReports: data.clinicalReports || [],
      achievements: data.achievements || [],
      upcomingModules: data.upcomingModules || [],
      hydrated: true,
      lastUpdatedAt: data.generatedAt ? new Date(data.generatedAt) : new Date(),
    }),

  markDataStale: () => set({ lastUpdatedAt: new Date() }),

  updateLiveTelemetry: (payload) =>
    set((state) => ({
      liveSession: {
        ...state.liveSession,
        ...payload,
        isLive: payload.status ? payload.status !== 'idle' : state.liveSession.isLive,
        isPaused: payload.status ? payload.status === 'paused' : state.liveSession.isPaused,
      },
    })),
}))
