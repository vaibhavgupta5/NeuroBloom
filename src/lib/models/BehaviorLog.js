import mongoose from "mongoose";

const BehaviorLogSchema = new mongoose.Schema(
  {
    childId: { type: mongoose.Schema.Types.ObjectId, ref: "Child", required: true },
    date: { type: String, required: true }, // YYYY-MM-DD (local day)
    incidents: { type: Number, required: true, min: 0 },
    intensity: { type: Number, required: true, min: 0, max: 5 },
  },
  { timestamps: false }
);

BehaviorLogSchema.index({ childId: 1, date: 1 }, { unique: true });

export default mongoose.models.BehaviorLog || mongoose.model("BehaviorLog", BehaviorLogSchema);
