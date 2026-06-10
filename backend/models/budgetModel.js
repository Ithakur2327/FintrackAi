import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: {
      type: String,
      required: true,
      enum: ["Food", "Housing", "Transport", "Shopping", "Entertainment", "Utilities", "Healthcare", "Education", "Travel", "Other", "Total"],
    },
    limit: { type: Number, required: true, min: 0 },
    period: { type: String, enum: ["monthly", "weekly", "yearly"], default: "monthly" },
    month: { type: Number, min: 1, max: 12 },
    year: { type: Number },
    alertAt: { type: Number, default: 80, min: 1, max: 100 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

budgetSchema.index({ userId: 1, category: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.model("Budget", budgetSchema);
