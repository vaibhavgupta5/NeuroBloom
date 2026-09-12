import mongoose from "mongoose";

// Catalog of therapy modules; today's plan for a child is this catalog in order.
const ModuleSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true }, // e.g. 'ball-tracker'
    title: { type: String, required: true },              // 'Focus Ball'
    shortTitle: { type: String, required: true },         // 'Focus'
    iconKey: { type: String, required: true },            // 'emotion' | 'word' | 'puzzle' | 'focus'
    skill: { type: String, required: true },              // 'Emotions' | 'Communication' | 'Cognitive' | 'Attention' | 'Social'
    durationMin: { type: Number, required: true },
    order: { type: Number, required: true },
    activeGameKey: { type: String, required: true },      // maps to child games: 'emotion-match' | 'word-match' | 'puzzle' | 'ball-tracker'
  },
  { timestamps: true }
);

export default mongoose.models.Module || mongoose.model("Module", ModuleSchema);
