import mongoose from "mongoose";

// Queue of parent → child interventions, drained by the child's SSE stream.
const ParentActionSchema = new mongoose.Schema(
  {
    childId: { type: mongoose.Schema.Types.ObjectId, ref: "Child", required: true, index: true },
    actionType: { type: String, required: true, enum: ["SEND_STICKER", "SET_SPEED", "TOGGLE_PAUSE"] },
    payload: { type: mongoose.Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, required: true },
    consumedAt: { type: Date, default: null },
  },
  { timestamps: false }
);

ParentActionSchema.index({ childId: 1, consumedAt: 1, createdAt: 1 });

export default mongoose.models.ParentAction || mongoose.model("ParentAction", ParentActionSchema);
