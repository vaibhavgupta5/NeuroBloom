import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ["parent", "therapist"], required: true },
    avatarInitials: { type: String, default: "" },
    pinHash: { type: String, default: null }, // parent: unlocks child mode
    organization: { type: String, default: null }, // therapist: clinic name
    inviteCode: { type: String }, // therapist: shared with parents
  },
  { timestamps: true }
);

UserSchema.index({ inviteCode: 1 }, { unique: true, partialFilterExpression: { inviteCode: { $type: "string" } } });

export default mongoose.models.User || mongoose.model("User", UserSchema);
