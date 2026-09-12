import mongoose from "mongoose";

const AchievementSchema = new mongoose.Schema(
  {
    childId: { type: mongoose.Schema.Types.ObjectId, ref: "Child", required: true, index: true },
    iconKey: { type: String, required: true },  // 'flame' | 'puzzle' | 'happy' | 'speech' | 'star' | 'trophy' | 'award' | 'emotion'
    label: { type: String, required: true },
    rule: { type: String, default: null },      // e.g. 'streak-7', 'streak-30', 'stars-50'
    unlocked: { type: Boolean, default: false },
    unlockedAt: { type: Date, default: null },
  },
  { timestamps: false }
);

export default mongoose.models.Achievement || mongoose.model("Achievement", AchievementSchema);
