import mongoose from "mongoose";

const ClinicalReportSchema = new mongoose.Schema(
  {
    childId: { type: mongoose.Schema.Types.ObjectId, ref: "Child", required: true, index: true },
    title: { type: String, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    type: { type: String, required: true }, // 'Progress' | 'Category' | 'Behavioral'
    summary: { type: String, required: true },
    details: { type: String, required: true },
  },
  { timestamps: false }
);

export default mongoose.models.ClinicalReport || mongoose.model("ClinicalReport", ClinicalReportSchema);
