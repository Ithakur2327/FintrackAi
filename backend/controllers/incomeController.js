import Income from "../models/incomeModel.js";
import getDateRange from "../utils/dateFilter.js";

export const addIncome = async (req, res) => {
  try {
    const { description, amount, category, date, note, tags, isRecurring, recurringFrequency } = req.body;
    if (!description || !amount || !category)
      return res.status(400).json({ success: false, message: "Description, amount, and category are required" });

    const income = await Income.create({
      description, amount: Number(amount), category,
      date: date ? new Date(date) : new Date(),
      note, tags, isRecurring, recurringFrequency,
      userId: req.user._id,
    });

    res.status(201).json({ success: true, message: "Income added", data: income });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getIncomes = async (req, res) => {
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

    const [incomes, total] = await Promise.all([
      Income.find(filter).sort({ date: -1 }).skip(skip).limit(pageSize),
      Income.countDocuments(filter),
    ]);

    const totalAmount = incomes.reduce((sum, i) => sum + i.amount, 0);

    res.json({
      success: true,
      data: incomes,
      meta: { total, totalAmount, page: Number(page), pageSize },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateIncome = async (req, res) => {
  try {
    const income = await Income.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!income) return res.status(404).json({ success: false, message: "Income not found" });
    res.json({ success: true, message: "Income updated", data: income });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteIncome = async (req, res) => {
  try {
    const income = await Income.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!income) return res.status(404).json({ success: false, message: "Income not found" });
    res.json({ success: true, message: "Income deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
