import mongoose from "mongoose";

// One spoken AAC sentence from the Talk board.
const CommEventSchema = new mongoose.Schema(
  {
    childId: { type: mongoose.Schema.Types.ObjectId, ref: "Child", required: true },
    words: [{ type: String }],
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

CommEventSchema.index({ childId: 1, createdAt: -1 });

export default mongoose.models.CommEvent || mongoose.model("CommEvent", CommEventSchema);
