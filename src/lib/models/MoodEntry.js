import mongoose from "mongoose";

const MoodEntrySchema = new mongoose.Schema(
  {
    childId: { type: mongoose.Schema.Types.ObjectId, ref: "Child", required: true },
    moodId: { type: String, required: true, enum: ["great", "good", "ok", "notgreat", "sad"] },
    score: { type: Number, required: true, min: 1, max: 5 }, // great=5 ... sad=1
    source: { type: String, enum: ["checkin", "session"], default: "checkin" },
    createdAt: { type: Date, required: true },
  },
  { timestamps: false }
);

MoodEntrySchema.index({ childId: 1, createdAt: -1 });

export default mongoose.models.MoodEntry || mongoose.model("MoodEntry", MoodEntrySchema);
