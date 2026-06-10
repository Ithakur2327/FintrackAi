import mongoose from "mongoose";

const goalSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    targetAmount: { type: Number, required: true, min: 0 },
    savedAmount: { type: Number, default: 0, min: 0 },
    deadline: { type: Date },
    category: {
      type: String,
      enum: ["Emergency Fund", "Vacation", "Electronics", "Vehicle", "Home", "Education", "Investment", "Wedding", "Other"],
      default: "Other",
    },
    emoji: { type: String, default: "🎯" },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date },
    color: { type: String, default: "#0d9488" },
  },
  { timestamps: true }
);

export default mongoose.model("Goal", goalSchema);
