/**
 * Facial-emotion utilities — blendshape → emotion interpretation and
 * emotion → game-difficulty adjustment. Pure functions, client-safe.
 *
 * Blendshape names come from MediaPipe FaceLandmarker's 52-shape set.
 */

export const EMOTIONS = [
  "happy",
  "neutral",
  "sad",
  "angry",
  "stressed",
  "frustrated",
  "surprised",
];

// Display metadata. These are camera *expression estimates*, not feelings:
// copy must never claim to know how the child feels.
export const EMOTION_META = {
  happy: { label: "Smiling", color: "#17977F", iconKey: "happy", parentText: "Expression looked like smiling" },
  neutral: { label: "Calm face", color: "#2B6CB0", iconKey: "neutral", parentText: "Expression looked calm or neutral" },
  sad: { label: "Downturned", color: "#7C66D9", iconKey: "sad", parentText: "Expression looked downturned" },
  angry: { label: "Tense brow", color: "#D9603F", iconKey: "alert", parentText: "Brow looked tense — worth checking in" },
  stressed: { label: "Strained", color: "#D9603F", iconKey: "alert", parentText: "Expression looked strained — a break may help" },
  frustrated: { label: "Frowning", color: "#D9603F", iconKey: "sad", parentText: "Expression looked like frowning — a break may help" },
  surprised: { label: "Surprised", color: "#E59400", iconKey: "star", parentText: "Expression looked surprised" },
};

/** Expressions that suggest offering a break (soft signal only). */
export const TENSE_EXPRESSIONS = ["angry", "stressed", "frustrated"];

function shape(map, blendshapes) {
  const byName = new Map(
    (blendshapes || []).map((b) => [b.categoryName, b.score])
  );
  const avg = (...names) => {
    const vals = names.map((n) => byName.get(n) || 0);
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  };
  return {
    smile: avg("mouthSmileLeft", "mouthSmileRight"),
    cheek: avg("cheekSquintLeft", "cheekSquintRight"),
    browDown: avg("browDownLeft", "browDownRight"),
    noseSneer: byName.get("noseSneer") || 0,
    mouthPress: avg("mouthPressLeft", "mouthPressRight"),
    frown: avg("mouthFrownLeft", "mouthFrownRight"),
    browInnerUp: byName.get("browInnerUp") || 0,
    jawOpen: byName.get("jawOpen") || 0,
    mouthShrugLower: byName.get("mouthShrugLower") || 0,
    eyeSquint: avg("eyeSquintLeft", "eyeSquintRight"),
    browOuterUp: avg("browOuterUpLeft", "browOuterUpRight"),
    jawForward: byName.get("jawForward") || 0,
    eyeWide: avg("eyeWideLeft", "eyeWideRight"),
  };
}

/**
 * Interpret MediaPipe blendshapes as one of the app's emotions.
 * @param {Array<{categoryName: string, score: number}>} blendshapes
 * @returns {{ emotion: string, confidence: number, scores: Record<string, number> }}
 */
export function interpretBlendshapes(blendshapes) {
  const s = shape(null, blendshapes);

  // Weighted combos, each roughly 0–1
  const scores = {
    happy: clamp01(s.smile * 1.4 + s.cheek * 0.6),
    angry: clamp01(s.browDown * 1.2 + s.noseSneer * 0.8 + s.mouthPress * 0.5),
    sad: clamp01(s.frown * 1.3 + s.browInnerUp * 0.7),
    frustrated: clamp01(
      s.browDown * 0.9 + s.jawOpen * 0.4 + s.mouthShrugLower * 0.7
    ),
    stressed: clamp01(s.eyeSquint * 0.8 + s.browOuterUp * 0.5 + s.jawForward * 0.7),
    surprised: clamp01(s.browOuterUp * 0.8 + s.jawOpen * 0.7 + s.eyeWide * 0.8),
  };
  scores.neutral = clamp01(
    1 - Math.max(scores.happy, scores.angry, scores.sad, scores.frustrated, scores.stressed, scores.surprised) * 1.2
  );

  // Pick the strongest non-neutral emotion only if it clears a small floor,
  // otherwise neutral — avoids flickery misreads on resting faces.
  let emotion = "neutral";
  let confidence = scores.neutral;
  for (const e of EMOTIONS) {
    if (e === "neutral") continue;
    if (scores[e] > confidence && scores[e] >= 0.28) {
      emotion = e;
      confidence = scores[e];
    }
  }

  return { emotion, confidence: Math.round(confidence * 100) / 100, scores };
}

/**
 * Emotion → difficulty adjustment for the games.
 * @param {string|null} emotion  current (camera) emotion, or null in auto mode
 * @param {number|null} gameplayAccuracy  0–100 from gameplay, or null
 * @returns {{ speedMultiplier: number, hintLevel: number }} speedMultiplier
 *   clamped to [0.6, 1.15] (< 1 = easier); hintLevel 0 = none, 1 = light,
 *   2 = remove/grey one wrong option.
 */
export function computeDifficultyAdjust(emotion, gameplayAccuracy = null) {
  let speedMultiplier = 1.0;
  let hintLevel = 0;

  switch (emotion) {
    case "frustrated":
    case "angry":
      speedMultiplier = 0.75;
      hintLevel = 2;
      break;
    case "stressed":
      speedMultiplier = 0.85;
      hintLevel = 2;
      break;
    case "sad":
      speedMultiplier = 0.9;
      hintLevel = 1;
      break;
    case "surprised":
      // keep current difficulty
      break;
    case "happy":
    case "neutral":
    default:
      speedMultiplier = 1.05;
      hintLevel = 0;
      break;
  }

  // Gameplay-only signal (auto mode, or blended in when available)
  if (gameplayAccuracy != null && Number.isFinite(gameplayAccuracy)) {
    if (gameplayAccuracy < 40) {
      speedMultiplier = Math.min(speedMultiplier, 0.75);
      hintLevel = Math.max(hintLevel, 2);
    } else if (gameplayAccuracy < 65) {
      speedMultiplier = Math.min(speedMultiplier, 0.9);
      hintLevel = Math.max(hintLevel, 1);
    } else if (gameplayAccuracy >= 85 && (!emotion || emotion === "happy" || emotion === "neutral")) {
      speedMultiplier = Math.max(speedMultiplier, 1.15);
    }
  }

  return {
    speedMultiplier: Math.round(clamp(speedMultiplier, 0.6, 1.15) * 100) / 100,
    hintLevel,
  };
}

/**
 * Build the after-game emotion summary for a Session record.
 * @param {Array<{t: number, emotion: string}>} timeline
 * @returns {{dominant: string, avgConfidence: number, timeline: Array}|null}
 */
export function summarizeEmotionTimeline(timeline) {
  if (!Array.isArray(timeline) || timeline.length === 0) return null;
  const counts = {};
  for (const p of timeline) counts[p.emotion] = (counts[p.emotion] || 0) + 1;
  const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  const confs = timeline.map((p) => p.confidence).filter((c) => Number.isFinite(c));
  return {
    dominant,
    avgConfidence: confs.length ? Math.round((confs.reduce((a, b) => a + b, 0) / confs.length) * 100) / 100 : 0,
    timeline: timeline.slice(-20).map(({ t, emotion }) => ({ t, emotion })),
  };
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}
function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}
