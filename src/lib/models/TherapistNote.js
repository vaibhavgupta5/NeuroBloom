import mongoose from "mongoose";

const TherapistNoteSchema = new mongoose.Schema(
  {
    childId: { type: mongoose.Schema.Types.ObjectId, ref: "Child", required: true, index: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    author: { type: String, required: true },
    content: { type: String, required: true },
  },
  { timestamps: false }
);

export default mongoose.models.TherapistNote || mongoose.model("TherapistNote", TherapistNoteSchema);
