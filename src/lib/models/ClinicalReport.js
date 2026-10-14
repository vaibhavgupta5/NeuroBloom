import mongoose from "mongoose";

const ClinicalReportSchema = new mongoose.Schema(
  {
    childId: { type: mongoose.Schema.Types.ObjectId, ref: "Child", required: true, index: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    title: { type: String, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    type: { type: String, required: true }, // 'Progress' | 'Goals' | 'Behavioral'
    status: { type: String, enum: ["draft", "approved"], default: "approved" },
    periodStart: { type: String, default: null },
    periodEnd: { type: String, default: null },
    generatedBy: { type: String, enum: ["ai", "template", "manual"], default: "manual" },
    summary: { type: String, required: true },
    details: { type: String, required: true },
    metrics: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.ClinicalReport || mongoose.model("ClinicalReport", ClinicalReportSchema);
