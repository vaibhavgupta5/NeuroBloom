import mongoose from "mongoose";

// Singleton per child — the live snapshot of an in-progress game.
const LiveSessionSchema = new mongoose.Schema(
  {
    childId: { type: mongoose.Schema.Types.ObjectId, ref: "Child", required: true, unique: true },
    status: { type: String, enum: ["playing", "paused", "idle"], default: "idle" },
    activeGame: { type: String, default: null },
    gameTitle: { type: String, default: null },
    score: { type: Number, default: 0 },
    targetScore: { type: Number, default: 0 },
    elapsedSeconds: { type: Number, default: 0 },
    focusScore: { type: Number, default: 0 },
    focusStatus: { type: String, default: null },
    trackingSmoothness: { type: String, default: null },
    avgResponseMs: { type: Number, default: 0 },
    frustrationLevel: { type: String, default: null },
    liveCoordinates: { x: { type: Number, default: 50 }, y: { type: Number, default: 50 } },
    speedMultiplier: { type: Number, default: 1.0 },
    updatedAt: { type: Date, required: true },
  },
  { timestamps: false }
);

export default mongoose.models.LiveSession || mongoose.model("LiveSession", LiveSessionSchema);
