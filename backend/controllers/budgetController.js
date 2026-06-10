import Budget from "../models/budgetModel.js";
import Expense from "../models/expenseModel.js";

export const setBudget = async (req, res) => {
  try {
    const { category, limit, period, alertAt } = req.body;
    const now = new Date();

    const budget = await Budget.findOneAndUpdate(
      { userId: req.user._id, category, month: now.getMonth() + 1, year: now.getFullYear() },
      { limit, period: period || "monthly", alertAt: alertAt || 80, isActive: true },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ success: true, message: "Budget set", data: budget });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: "Budget already exists for this category/month" });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getBudgets = async (req, res) => {
  try {
    const now = new Date();
    const month = Number(req.query.month) || now.getMonth() + 1;
    const year = Number(req.query.year) || now.getFullYear();

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    const [budgets, expenses] = await Promise.all([
      Budget.find({ userId: req.user._id, isActive: true }),
      Expense.aggregate([
        { $match: { userId: req.user._id, date: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: "$category", spent: { $sum: "$amount" } } },
      ]),
    ]);

    const spentMap = {};
    for (const e of expenses) spentMap[e._id] = e.spent;

    const budgetsWithSpent = budgets.map(b => {
      const spent = spentMap[b.category] || 0;
      const percent = b.limit === 0 ? 0 : Math.round((spent / b.limit) * 100);
      return {
        ...b.toObject(),
        spent,
        remaining: Math.max(0, b.limit - spent),
        percent,
        isOverBudget: spent > b.limit,
        isNearLimit: percent >= b.alertAt,
      };
    });

    res.json({ success: true, data: budgetsWithSpent });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteBudget = async (req, res) => {
  try {
    await Budget.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ success: true, message: "Budget deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
