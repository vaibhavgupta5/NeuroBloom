import mongoose from "mongoose";

// Visual schedule authored by a parent or therapist.
const RoutineSchema = new mongoose.Schema(
  {
    childId: { type: mongoose.Schema.Types.ObjectId, ref: "Child", required: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    steps: [
      {
        label: { type: String, required: true },
        iconKey: { type: String, default: "star" },
        durationMin: { type: Number, default: null },
      },
    ],
    // step _ids completed on a given local day
    progress: { day: { type: String, default: null }, doneStepIds: [{ type: String }] },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Routine || mongoose.model("Routine", RoutineSchema);
