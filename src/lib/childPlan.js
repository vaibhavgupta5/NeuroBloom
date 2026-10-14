import Module from "./models/Module";
import Session from "./models/Session";
import { startOfLocalDay } from "./dayUtils";

export const CAMERA_MODULES = ["mirror-me"];

// Modules unlock in order: completed ones plus the first incomplete one are playable.
// Camera-only modules are left out unless a parent consented to the camera.
export async function buildTodayModules(child) {
  const childId = child._id;
  const [allModules, todaySessions] = await Promise.all([
    Module.find().sort({ order: 1 }).lean(),
    Session.find({ childId, outcome: "completed", completedAt: { $gte: startOfLocalDay() } }).select("moduleCode").lean(),
  ]);
  const doneCodes = new Set(todaySessions.map((s) => s.moduleCode));
  const modules = child.consent?.camera ? allModules : allModules.filter((m) => !CAMERA_MODULES.includes(m.code));

  let firstIncompleteSeen = false;
  return modules.map((m) => {
    const completed = doneCodes.has(m.code);
    let unlocked = completed;
    if (!completed && !firstIncompleteSeen) {
      unlocked = true;
      firstIncompleteSeen = true;
    }
    return {
      id: m.code,
      moduleCode: m.code,
      title: m.title,
      shortTitle: m.shortTitle,
      iconKey: m.iconKey,
      skill: m.skill,
      duration: `${m.durationMin} min`,
      durationSec: m.durationMin * 60,
      activeGameKey: m.activeGameKey,
      order: m.order,
      completed,
      unlocked,
    };
  });
}

export function publicChild(child) {
  const c = typeof child.toObject === "function" ? child.toObject() : child;
  return {
    id: String(c._id),
    name: c.name,
    age: c.age,
    avatarIcon: c.avatarIcon,
    streak: c.streak,
    stars: c.stars,
    dailyGoal: c.dailyGoal,
    sensoryProfile: c.sensoryProfile,
    consent: c.consent,
    levels: c.levels instanceof Map ? Object.fromEntries(c.levels) : c.levels || {},
    aacTiles: (c.aacTiles || []).map((t) => ({ id: String(t._id), label: t.label, iconKey: t.iconKey, image: t.image, category: t.category })),
  };
}
