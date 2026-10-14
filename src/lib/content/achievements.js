// Every achievement unlocks by a rule checked server-side (see lib/achievements.js).
export const DEFAULT_ACHIEVEMENTS = [
  { iconKey: "star", label: "First Game", rule: "first-session" },
  { iconKey: "flame", label: "3-Day Streak", rule: "streak-3" },
  { iconKey: "flame", label: "7-Day Streak", rule: "streak-7" },
  { iconKey: "speech", label: "First Words", rule: "first-sentence" },
  { iconKey: "happy", label: "Calm Breather", rule: "calm-corner" },
  { iconKey: "trophy", label: "Goal Reached", rule: "goal-mastered" },
  { iconKey: "star", label: "50 Stars", rule: "stars-50" },
  { iconKey: "award", label: "30-Day Streak", rule: "streak-30" },
];
