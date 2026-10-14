import mongoose from "mongoose";

const CoachingLogSchema = new mongoose.Schema(
  {
    childId: { type: mongoose.Schema.Types.ObjectId, ref: "Child", required: true, index: true },
    activityId: { type: String, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

CoachingLogSchema.index({ childId: 1, date: 1, activityId: 1 }, { unique: true });

export default mongoose.models.CoachingLog || mongoose.model("CoachingLog", CoachingLogSchema);
