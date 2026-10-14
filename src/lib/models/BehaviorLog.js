import mongoose from "mongoose";

// One ABC (antecedent–behaviour–consequence) entry per incident.
const BehaviorLogSchema = new mongoose.Schema(
  {
    childId: { type: mongoose.Schema.Types.ObjectId, ref: "Child", required: true },
    date: { type: String, required: true }, // YYYY-MM-DD (local day)
    incidents: { type: Number, default: 1, min: 0 },
    intensity: { type: Number, required: true, min: 0, max: 5 },
    antecedent: { type: String, default: "" },
    behavior: { type: String, default: "" },
    consequence: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

BehaviorLogSchema.index({ childId: 1, date: 1 });

export default mongoose.models.BehaviorLog || mongoose.model("BehaviorLog", BehaviorLogSchema);
