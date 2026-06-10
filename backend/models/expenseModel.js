import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      required: true,
      enum: ["Food", "Housing", "Transport", "Shopping", "Entertainment", "Utilities", "Healthcare", "Education", "Travel", "Other"],
      default: "Other",
    },
    date: { type: Date, required: true, default: Date.now },
    note: { type: String, default: "" },
    tags: [{ type: String }],
    isRecurring: { type: Boolean, default: false },
    recurringFrequency: { type: String, enum: ["daily", "weekly", "monthly", "yearly", "none"], default: "none" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, default: "expense" },
  },
  { timestamps: true }
);

expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ userId: 1, category: 1 });

export default mongoose.model("Expense", expenseSchema);
