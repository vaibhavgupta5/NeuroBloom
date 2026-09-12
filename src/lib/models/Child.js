import mongoose from "mongoose";

const ChildSchema = new mongoose.Schema(
  {
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "Parent", required: true, index: true },
    name: { type: String, required: true },
    age: { type: Number, required: true },
    avatarIcon: { type: String, default: "child" },
    streak: { type: Number, default: 0 },
    stars: { type: Number, default: 0 },
    dailyGoal: { type: Number, default: 4 },
  },
  { timestamps: true }
);

export default mongoose.models.Child || mongoose.model("Child", ChildSchema);
