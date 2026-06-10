import Expense from "../models/expenseModel.js";
import Income from "../models/incomeModel.js";
import getDateRange from "../utils/dateFilter.js";

export const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const { range = "monthly" } = req.query;
    const { start, end } = getDateRange(range);

    // Previous period for comparison
    const periodMs = end.getTime() - start.getTime();
    const prevStart = new Date(start.getTime() - periodMs);
    const prevEnd = new Date(start.getTime() - 1);

    const [incomes, expenses, prevIncomes, prevExpenses] = await Promise.all([
      Income.find({ userId, date: { $gte: start, $lte: end } }).sort({ date: -1 }),
      Expense.find({ userId, date: { $gte: start, $lte: end } }).sort({ date: -1 }),
      Income.find({ userId, date: { $gte: prevStart, $lte: prevEnd } }),
      Expense.find({ userId, date: { $gte: prevStart, $lte: prevEnd } }),
    ]);

    const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
    const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);
    const savings = totalIncome - totalExpense;
    const savingsRate = totalIncome === 0 ? 0 : Math.round((savings / totalIncome) * 100);

    const prevIncome = prevIncomes.reduce((s, i) => s + i.amount, 0);
    const prevExpense = prevExpenses.reduce((s, e) => s + e.amount, 0);

    const incomeChange = prevIncome === 0 ? 0 : Math.round(((totalIncome - prevIncome) / prevIncome) * 100);
    const expenseChange = prevExpense === 0 ? 0 : Math.round(((totalExpense - prevExpense) / prevExpense) * 100);

    // Category breakdown
    const spendByCategory = {};
    for (const exp of expenses) {
      const cat = exp.category || "Other";
      spendByCategory[cat] = (spendByCategory[cat] || 0) + exp.amount;
    }

    const expenseDistribution = Object.entries(spendByCategory).map(([category, amount]) => ({
      category,
      amount,
      percent: totalExpense === 0 ? 0 : Math.round((amount / totalExpense) * 100),
    })).sort((a, b) => b.amount - a.amount);

    // Monthly trend (last 6 months)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      const mStart = new Date(d.getFullYear(), d.getMonth() - i, 1);
      const mEnd = new Date(d.getFullYear(), d.getMonth() - i + 1, 0);
      const mLabel = mStart.toLocaleString("default", { month: "short" });

      const mIncome = incomes.filter(t => new Date(t.date) >= mStart && new Date(t.date) <= mEnd).reduce((s, t) => s + t.amount, 0);
      const mExpense = expenses.filter(t => new Date(t.date) >= mStart && new Date(t.date) <= mEnd).reduce((s, t) => s + t.amount, 0);

      monthlyTrend.push({ month: mLabel, income: mIncome, expense: mExpense, savings: mIncome - mExpense });
    }

    // Recent transactions
    const recentTransactions = [
      ...incomes.map(i => ({ ...i.toObject(), type: "income" })),
      ...expenses.map(e => ({ ...e.toObject(), type: "expense" })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

    res.json({
      success: true,
      data: {
        summary: {
          totalIncome, totalExpense, savings, savingsRate,
          incomeChange, expenseChange,
          transactionCount: incomes.length + expenses.length,
        },
        expenseDistribution,
        recentTransactions,
        monthlyTrend,
        period: { start, end, range },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
