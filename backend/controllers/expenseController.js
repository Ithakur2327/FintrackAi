import Expense from "../models/expenseModel.js";
import getDateRange from "../utils/dateFilter.js";

export const addExpense = async (req, res) => {
  try {
    const { description, amount, category, date, note, tags, isRecurring, recurringFrequency } = req.body;
    if (!description || !amount || !category)
      return res.status(400).json({ success: false, message: "Description, amount, and category are required" });

    const expense = await Expense.create({
      description, amount: Number(amount), category,
      date: date ? new Date(date) : new Date(),
      note, tags, isRecurring, recurringFrequency,
      userId: req.user._id,
    });

    res.status(201).json({ success: true, message: "Expense added", data: expense });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getExpenses = async (req, res) => {
  try {
    const { range = "monthly", category, startDate, endDate, limit, page = 1 } = req.query;
    let dateFilter = {};

    if (startDate && endDate) {
      dateFilter = { date: { $gte: new Date(startDate), $lte: new Date(endDate) } };
    } else {
      const { start, end } = getDateRange(range);
      dateFilter = { date: { $gte: start, $lte: end } };
    }

    const filter = { userId: req.user._id, ...dateFilter };
    if (category && category !== "all") filter.category = category;

    const pageSize = limit ? Number(limit) : 50;
    const skip = (Number(page) - 1) * pageSize;

    const [expenses, total] = await Promise.all([
      Expense.find(filter).sort({ date: -1 }).skip(skip).limit(pageSize),
      Expense.countDocuments(filter),
    ]);

    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
    const avgAmount = expenses.length > 0 ? totalAmount / expenses.length : 0;

    res.json({
      success: true,
      data: expenses,
      meta: { total, totalAmount, avgAmount, page: Number(page), pageSize },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!expense) return res.status(404).json({ success: false, message: "Expense not found" });
    res.json({ success: true, message: "Expense updated", data: expense });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!expense) return res.status(404).json({ success: false, message: "Expense not found" });
    res.json({ success: true, message: "Expense deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getExpenseStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [thisMonth, lastMonth, byCategory] = await Promise.all([
      Expense.aggregate([
        { $match: { userId, date: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
      ]),
      Expense.aggregate([
        { $match: { userId, date: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
        { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
      ]),
      Expense.aggregate([
        { $match: { userId, date: { $gte: startOfMonth } } },
        { $group: { _id: "$category", total: { $sum: "$amount" }, count: { $sum: 1 } } },
        { $sort: { total: -1 } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        thisMonth: thisMonth[0] || { total: 0, count: 0 },
        lastMonth: lastMonth[0] || { total: 0, count: 0 },
        byCategory,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
