import mongoose from "mongoose";

const SleepLogSchema = new mongoose.Schema(
  {
    childId: { type: mongoose.Schema.Types.ObjectId, ref: "Child", required: true },
    date: { type: String, required: true }, // YYYY-MM-DD (local day)
    hours: { type: Number, required: true, min: 0, max: 24 },
  },
  { timestamps: false }
);

SleepLogSchema.index({ childId: 1, date: 1 }, { unique: true });

export default mongoose.models.SleepLog || mongoose.model("SleepLog", SleepLogSchema);
