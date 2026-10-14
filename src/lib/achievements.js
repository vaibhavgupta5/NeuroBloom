import Achievement from "./models/Achievement";

export async function unlockAchievements(childId, rules) {
  if (!rules.length) return;
  await Achievement.updateMany(
    { childId, rule: { $in: rules }, unlocked: false },
    { unlocked: true, unlockedAt: new Date() }
  );
}
