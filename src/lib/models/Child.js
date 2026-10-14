import mongoose from "mongoose";

const AacTileSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    iconKey: { type: String, default: null },
    image: { type: String, default: null }, // small data URL
    category: { type: String, default: "custom" },
  },
  { _id: true }
);

const ChildSchema = new mongoose.Schema(
  {
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    therapistIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", index: true }],
    name: { type: String, required: true },
    age: { type: Number, required: true },
    avatarIcon: { type: String, default: "child" },
    streak: { type: Number, default: 0 },
    stars: { type: Number, default: 0 },
    dailyGoal: { type: Number, default: 4 },
    sensoryProfile: {
      motion: { type: String, enum: ["full", "reduced", "none"], default: "reduced" },
      sfx: { type: Boolean, default: true },
      voice: { type: Boolean, default: true },
      voiceRate: { type: Number, default: 0.9, min: 0.5, max: 1.5 },
      calmPalette: { type: Boolean, default: false },
      showTimer: { type: Boolean, default: false },
      sessionMinutes: { type: Number, default: 15 },
    },
    consent: {
      camera: { type: Boolean, default: false },
      liveFrames: { type: Boolean, default: false },
      dataSharing: { type: Boolean, default: false },
      grantedAt: { type: Date, default: null },
    },
    // per-skill difficulty level for the adaptive engine (1..3)
    levels: { type: Map, of: Number, default: {} },
    aacTiles: [AacTileSchema],
  },
  { timestamps: true }
);

export default mongoose.models.Child || mongoose.model("Child", ChildSchema);
