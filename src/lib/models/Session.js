import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema(
  {
    childId: { type: mongoose.Schema.Types.ObjectId, ref: "Child", required: true },
    moduleCode: { type: String, required: true },
    gameTitle: { type: String, required: true },
    skill: { type: String, required: true },
    startedAt: { type: Date, required: true },
    completedAt: { type: Date, required: true },
    durationSec: { type: Number, required: true },
    score: { type: Number, default: 0 },
    maxScore: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 }, // 0-100
    focusScore: { type: Number, default: 0 },
    avgResponseMs: { type: Number, default: 0 },
    outcome: { type: String, enum: ["completed", "abandoned"], default: "completed" },
    moodBefore: { type: String, default: null }, // moodId at session start
    wordsLearned: { type: Number, default: 0 },  // word-match only
  },
  { timestamps: true }
);

SessionSchema.index({ childId: 1, completedAt: -1 });
SessionSchema.index({ childId: 1, moduleCode: 1 });

export default mongoose.models.Session || mongoose.model("Session", SessionSchema);
