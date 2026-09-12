import mongoose from "mongoose";

const ParentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    avatarInitials: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Parent || mongoose.model("Parent", ParentSchema);
