import mongoose from "mongoose";

const incomeSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      required: true,
      enum: ["Salary", "Freelance", "Investment", "Business", "Gift", "Rental", "Bonus", "Other"],
      default: "Other",
    },
    date: { type: Date, required: true, default: Date.now },
    note: { type: String, default: "" },
    tags: [{ type: String }],
    isRecurring: { type: Boolean, default: false },
    recurringFrequency: { type: String, enum: ["daily", "weekly", "monthly", "yearly", "none"], default: "none" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, default: "income" },
  },
  { timestamps: true }
);

incomeSchema.index({ userId: 1, date: -1 });

export default mongoose.model("Income", incomeSchema);
