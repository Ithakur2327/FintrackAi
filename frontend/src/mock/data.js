// ─── MOCK DATA ────────────────────────────────────────────────────────────────
// Set MOCK_MODE = false and delete this file when backend is ready.
// Each page imports { MOCK_MODE, mockXxx } from '../mock/data.js'
// ──────────────────────────────────────────────────────────────────────────────

export const MOCK_MODE = true;

// ─── Recent transactions (shared) ────────────────────────────────────────────
const recentTransactions = [
  { _id: "t1",  type: "income",  category: "Salary",        amount: 75000, description: "Monthly Salary — Infosys",   date: "2025-06-01", note: "June salary credited" },
  { _id: "t2",  type: "expense", category: "Housing",       amount: 18000, description: "Rent — Koramangala flat",    date: "2025-06-02" },
  { _id: "t3",  type: "expense", category: "Food",          amount: 3200,  description: "Big Basket groceries",       date: "2025-06-03" },
  { _id: "t4",  type: "income",  category: "Freelance",     amount: 12000, description: "UI Design project payment",  date: "2025-06-05", note: "Paytm Money client" },
  { _id: "t5",  type: "expense", category: "Transport",     amount: 1800,  description: "Ola rides — Jun week 1",     date: "2025-06-06" },
  { _id: "t6",  type: "expense", category: "Entertainment", amount: 999,   description: "Netflix subscription",       date: "2025-06-07" },
  { _id: "t7",  type: "expense", category: "Utilities",     amount: 2100,  description: "BESCOM electricity bill",    date: "2025-06-08" },
  { _id: "t8",  type: "expense", category: "Shopping",      amount: 4500,  description: "Myntra — Summer clothing",   date: "2025-06-09" },
  { _id: "t9",  type: "expense", category: "Healthcare",    amount: 800,   description: "Apollo pharmacy",            date: "2025-06-10" },
  { _id: "t10", type: "income",  category: "Investment",    amount: 3200,  description: "Zerodha — Dividend credited", date: "2025-06-10" },
  { _id: "t11", type: "expense", category: "Food",          amount: 1600,  description: "Swiggy — week orders",       date: "2025-06-11" },
  { _id: "t12", type: "expense", category: "Transport",     amount: 650,   description: "Metro card recharge",        date: "2025-06-12" },
];

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const mockDashboard = {
  monthly: {
    summary: {
      totalIncome: 90200,
      totalExpense: 33649,
      savings: 56551,
      savingsRate: 63,
      transactionCount: recentTransactions.length,
      incomeChange: 14.2,
      expenseChange: -5.8,
    },
    monthlyTrend: [
      { month: "Jan", income: 72000, expense: 41000 },
      { month: "Feb", income: 74000, expense: 38500 },
      { month: "Mar", income: 78000, expense: 44200 },
      { month: "Apr", income: 76500, expense: 35800 },
      { month: "May", income: 79000, expense: 31200 },
      { month: "Jun", income: 90200, expense: 33649 },
    ],
    recentTransactions,
    expenseDistribution: [
      { category: "Housing",       amount: 18000, percent: 54 },
      { category: "Food",          amount: 4800,  percent: 14 },
      { category: "Shopping",      amount: 4500,  percent: 13 },
      { category: "Utilities",     amount: 2100,  percent: 6  },
      { category: "Transport",     amount: 2450,  percent: 7  },
      { category: "Entertainment", amount: 999,   percent: 3  },
      { category: "Healthcare",    amount: 800,   percent: 2  },
    ],
  },
  weekly: {
    summary: {
      totalIncome: 22500,
      totalExpense: 8400,
      savings: 14100,
      savingsRate: 63,
      transactionCount: 8,
      incomeChange: 8.0,
      expenseChange: -2.0,
    },
    monthlyTrend: [
      { month: "Mon", income: 0,     expense: 1200 },
      { month: "Tue", income: 12000, expense: 3200 },
      { month: "Wed", income: 0,     expense: 800  },
      { month: "Thu", income: 0,     expense: 1100 },
      { month: "Fri", income: 10500, expense: 2100 },
      { month: "Sat", income: 0,     expense: 0    },
      { month: "Sun", income: 0,     expense: 0    },
    ],
    recentTransactions: recentTransactions.slice(0, 6),
    expenseDistribution: [
      { category: "Food",      amount: 3200, percent: 38 },
      { category: "Transport", amount: 1800, percent: 21 },
      { category: "Shopping",  amount: 2100, percent: 25 },
      { category: "Other",     amount: 1300, percent: 15 },
    ],
  },
  daily: {
    summary: {
      totalIncome: 75000,
      totalExpense: 3200,
      savings: 71800,
      savingsRate: 96,
      transactionCount: 3,
      incomeChange: 0,
      expenseChange: 0,
    },
    monthlyTrend: [],
    recentTransactions: recentTransactions.slice(0, 3),
    expenseDistribution: [{ category: "Food", amount: 3200, percent: 100 }],
  },
  yearly: {
    summary: {
      totalIncome: 924000,
      totalExpense: 388200,
      savings: 535800,
      savingsRate: 58,
      transactionCount: 142,
      incomeChange: 18.5,
      expenseChange: -1.2,
    },
    monthlyTrend: [
      { month: "Jul'24", income: 72000, expense: 38000 },
      { month: "Aug'24", income: 73000, expense: 36000 },
      { month: "Sep'24", income: 75000, expense: 40000 },
      { month: "Oct'24", income: 78000, expense: 35000 },
      { month: "Nov'24", income: 82000, expense: 39000 },
      { month: "Dec'24", income: 95000, expense: 48000 },
      { month: "Jan'25", income: 72000, expense: 41000 },
      { month: "Feb'25", income: 74000, expense: 38500 },
      { month: "Mar'25", income: 78000, expense: 44200 },
      { month: "Apr'25", income: 76500, expense: 35800 },
      { month: "May'25", income: 79000, expense: 31200 },
      { month: "Jun'25", income: 90200, expense: 33649 },
    ],
    recentTransactions,
    expenseDistribution: [
      { category: "Housing",       amount: 216000, percent: 56 },
      { category: "Food",          amount: 57600,  percent: 15 },
      { category: "Shopping",      amount: 38800,  percent: 10 },
      { category: "Transport",     amount: 27000,  percent: 7  },
      { category: "Entertainment", amount: 19400,  percent: 5  },
      { category: "Utilities",     amount: 15600,  percent: 4  },
      { category: "Healthcare",    amount: 13800,  percent: 4  },
    ],
  },
};

// ─── Incomes ──────────────────────────────────────────────────────────────────
export const mockIncomes = [
  { _id: "i1", description: "Monthly Salary — Infosys",    amount: 75000, category: "Salary",     date: "2025-06-01", type: "income", note: "June salary credited" },
  { _id: "i2", description: "UI Design project payment",   amount: 12000, category: "Freelance",  date: "2025-06-05", type: "income", note: "Paytm Money client" },
  { _id: "i3", description: "Zerodha — Dividend credited", amount: 3200,  category: "Investment", date: "2025-06-10", type: "income" },
  { _id: "i4", description: "Monthly Salary — Infosys",    amount: 75000, category: "Salary",     date: "2025-05-01", type: "income" },
  { _id: "i5", description: "Website redesign project",    amount: 18000, category: "Freelance",  date: "2025-05-14", type: "income" },
  { _id: "i6", description: "SGB Interest",                amount: 2800,  category: "Investment", date: "2025-05-20", type: "income" },
  { _id: "i7", description: "Monthly Salary — Infosys",    amount: 75000, category: "Salary",     date: "2025-04-01", type: "income" },
  { _id: "i8", description: "Referral bonus",              amount: 5000,  category: "Bonus",      date: "2025-04-18", type: "income" },
];

export const mockIncomeMeta = {
  total: mockIncomes.length,
  totalAmount: mockIncomes.reduce((s, i) => s + i.amount, 0),
};

// ─── Expenses ─────────────────────────────────────────────────────────────────
export const mockExpenses = [
  { _id: "e1",  description: "Rent — Koramangala flat",    amount: 18000, category: "Housing",       date: "2025-06-02", type: "expense" },
  { _id: "e2",  description: "Big Basket groceries",       amount: 3200,  category: "Food",          date: "2025-06-03", type: "expense" },
  { _id: "e3",  description: "Ola rides — Jun week 1",     amount: 1800,  category: "Transport",     date: "2025-06-06", type: "expense" },
  { _id: "e4",  description: "Netflix subscription",       amount: 999,   category: "Entertainment", date: "2025-06-07", type: "expense" },
  { _id: "e5",  description: "BESCOM electricity bill",    amount: 2100,  category: "Utilities",     date: "2025-06-08", type: "expense" },
  { _id: "e6",  description: "Myntra — Summer clothing",   amount: 4500,  category: "Shopping",      date: "2025-06-09", type: "expense" },
  { _id: "e7",  description: "Apollo pharmacy",            amount: 800,   category: "Healthcare",    date: "2025-06-10", type: "expense" },
  { _id: "e8",  description: "Swiggy — week orders",       amount: 1600,  category: "Food",          date: "2025-06-11", type: "expense" },
  { _id: "e9",  description: "Metro card recharge",        amount: 650,   category: "Transport",     date: "2025-06-12", type: "expense" },
  { _id: "e10", description: "Rent — Koramangala flat",    amount: 18000, category: "Housing",       date: "2025-05-02", type: "expense" },
  { _id: "e11", description: "Zomato orders",              amount: 2800,  category: "Food",          date: "2025-05-15", type: "expense" },
  { _id: "e12", description: "Amazon — Books",             amount: 1200,  category: "Education",     date: "2025-05-20", type: "expense" },
];

export const mockExpenseMeta = {
  total: mockExpenses.length,
  totalAmount: mockExpenses.reduce((s, e) => s + e.amount, 0),
};

// ─── Budgets ──────────────────────────────────────────────────────────────────
export const mockBudgets = [
  {
    _id: "b1", category: "Food",       limit: 8000,  spent: 4800,  remaining: 3200,
    percent: 60, alertAt: 80, isOverBudget: false, isNearLimit: false,
  },
  {
    _id: "b2", category: "Transport",  limit: 3000,  spent: 2450,  remaining: 550,
    percent: 82, alertAt: 80, isOverBudget: false, isNearLimit: true,
  },
  {
    _id: "b3", category: "Shopping",   limit: 3500,  spent: 4500,  remaining: -1000,
    percent: 129, alertAt: 80, isOverBudget: true,  isNearLimit: false,
  },
  {
    _id: "b4", category: "Entertainment", limit: 1500, spent: 999, remaining: 501,
    percent: 67, alertAt: 80, isOverBudget: false, isNearLimit: false,
  },
  {
    _id: "b5", category: "Healthcare", limit: 2000,  spent: 800,   remaining: 1200,
    percent: 40, alertAt: 80, isOverBudget: false, isNearLimit: false,
  },
];

// ─── Goals ────────────────────────────────────────────────────────────────────
export const mockGoals = [
  {
    _id: "g1",
    title: "Emergency Fund",
    description: "6 months of expenses as safety net",
    targetAmount: 200000,
    savedAmount: 87000,
    deadline: "2025-12-31",
    category: "Emergency Fund",
    emoji: "🛡️",
    color: "#0d9488",
    isCompleted: false,
    percent: 44,
    daysLeft: 202,
    monthlyNeeded: 18833,
  },
  {
    _id: "g2",
    title: "Goa Trip 2025",
    description: "End-of-year beach vacation with friends",
    targetAmount: 35000,
    savedAmount: 22000,
    deadline: "2025-11-15",
    category: "Vacation",
    emoji: "✈️",
    color: "#0891b2",
    isCompleted: false,
    percent: 63,
    daysLeft: 156,
    monthlyNeeded: 2600,
  },
  {
    _id: "g3",
    title: "MacBook Pro M4",
    description: "For freelance design work",
    targetAmount: 180000,
    savedAmount: 45000,
    deadline: "2026-03-31",
    category: "Electronics",
    emoji: "💻",
    color: "#8b5cf6",
    isCompleted: false,
    percent: 25,
    daysLeft: 292,
    monthlyNeeded: 14545,
  },
  {
    _id: "g4",
    title: "New Gaming PC",
    description: "RTX 4070 build",
    targetAmount: 120000,
    savedAmount: 120000,
    deadline: "2025-04-01",
    category: "Electronics",
    emoji: "🎮",
    color: "#f97316",
    isCompleted: true,
    percent: 100,
    daysLeft: 0,
    monthlyNeeded: 0,
  },
];