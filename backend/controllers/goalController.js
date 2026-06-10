import Goal from "../models/goalModel.js";

export const createGoal = async (req, res) => {
  try {
    const goal = await Goal.create({ ...req.body, userId: req.user._id });
    res.status(201).json({ success: true, message: "Goal created", data: goal });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user._id }).sort({ createdAt: -1 });
    const goalsWithProgress = goals.map(g => {
      const percent = g.targetAmount === 0 ? 0 : Math.round((g.savedAmount / g.targetAmount) * 100);
      const daysLeft = g.deadline ? Math.ceil((new Date(g.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : null;
      const monthlyNeeded = daysLeft && daysLeft > 0
        ? Math.ceil((g.targetAmount - g.savedAmount) / (daysLeft / 30))
        : null;
      return { ...g.toObject(), percent, daysLeft, monthlyNeeded };
    });
    res.json({ success: true, data: goalsWithProgress });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateGoal = async (req, res) => {
  try {
    const { savedAmount, ...rest } = req.body;
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!goal) return res.status(404).json({ success: false, message: "Goal not found" });

    Object.assign(goal, rest);
    if (savedAmount !== undefined) goal.savedAmount = Number(savedAmount);
    if (goal.savedAmount >= goal.targetAmount && !goal.isCompleted) {
      goal.isCompleted = true;
      goal.completedAt = new Date();
    }
    await goal.save();
    res.json({ success: true, message: "Goal updated", data: goal });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteGoal = async (req, res) => {
  try {
    await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ success: true, message: "Goal deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const addToGoal = async (req, res) => {
  try {
    const { amount } = req.body;
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!goal) return res.status(404).json({ success: false, message: "Goal not found" });

    goal.savedAmount = Math.min(goal.savedAmount + Number(amount), goal.targetAmount);
    if (goal.savedAmount >= goal.targetAmount && !goal.isCompleted) {
      goal.isCompleted = true;
      goal.completedAt = new Date();
    }
    await goal.save();
    res.json({ success: true, message: "Amount added to goal", data: goal });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
