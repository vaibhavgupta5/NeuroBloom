// Day-boundary helpers. Streaks and "today" are computed in server local time.
// The whole app currently assumes one family in one timezone; when real auth
// lands, move this to per-child timezone stored on the Child document.

export function localDayKey(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function daysAgoKey(n, from = new Date()) {
  const d = new Date(from);
  d.setDate(d.getDate() - n);
  return localDayKey(d);
}

// Start of local day as a Date
export function startOfLocalDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Consecutive days (ending today or yesterday) present in the given set of day keys
export function currentStreak(dayKeys, todayKey = localDayKey(new Date())) {
  const set = new Set(dayKeys);
  let streak = 0;
  const cursor = new Date();

  // If nothing today, streak may still count up to yesterday
  if (!set.has(todayKey)) cursor.setDate(cursor.getDate() - 1);

  while (set.has(localDayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
