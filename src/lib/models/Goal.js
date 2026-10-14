import mongoose from "mongoose";

// IEP-style target with a mastery criterion evaluated against session trials.
const GoalSchema = new mongoose.Schema(
  {
    childId: { type: mongoose.Schema.Types.ObjectId, ref: "Child", required: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    skill: { type: String, required: true },
    moduleCode: { type: String, required: true },
    title: { type: String, required: true },
    criterion: {
      independentPct: { type: Number, default: 80 }, // % trials correct with no prompt
      sessions: { type: Number, default: 3 },        // consecutive sessions meeting it
    },
    status: { type: String, enum: ["active", "mastered", "paused"], default: "active" },
    masteredAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Goal || mongoose.model("Goal", GoalSchema);
