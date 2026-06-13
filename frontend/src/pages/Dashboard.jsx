import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import {
  TrendingUp, TrendingDown, Wallet, BarChart2,
  Plus, RefreshCw, BrainCircuit, Activity
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth, useTheme } from "../App.jsx";
import StatsCard from "../components/StatsCard.jsx";
import TransactionItem from "../components/TransactionItem.jsx";
import AddTransaction from "../components/AddTransaction.jsx";
// ── MOCK: delete this import + MOCK_MODE checks when backend is ready ──
import { MOCK_MODE, mockDashboard } from "../mock/data.js";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
const PIE_COLORS = ["#6366f1","#8b5cf6","#06b6d4","#10b981","#f59e0b","#f97316","#ef4444"];

const TimeBtn = ({ label, value, active, onClick }) => (
  <button
    onClick={() => onClick(value)}
    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 ${
      active
        ? "bg-neutral-900 text-white dark:bg-white dark:text-black shadow-sm"
        : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
    }`}
  >
    {label}
  </button>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 shadow-2xl text-xs">
      <p className="text-neutral-400 mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-semibold text-white mt-0.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: p.stroke }} />
          {p.name}: ₹{Number(p.value).toLocaleString("en-IN")}
        </p>
      ))}
    </div>
  );
};

const SectionHeader = ({ title, right }) => (
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 tracking-tight">{title}</h3>
    {right}
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange]     = useState("monthly");
  const [showAdd, setShowAdd] = useState(false);
  const [editTx, setEditTx]   = useState(null);
  const [showAll, setShowAll] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      // ── MOCK: delete the next 3 lines when backend is ready ──
      if (MOCK_MODE) { setData(mockDashboard[range] || mockDashboard.monthly); setLoading(false); return; }
      // ── END MOCK ──
      const res = await axios.get(`${API_BASE}/dashboard?range=${range}`);
      setData(res.data.data);
    } catch (err) { console.error("Dashboard fetch error:", err); }
    finally { setLoading(false); }
  }, [range]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const handleAdd    = async (tx) => { await axios.post(`${API_BASE}/${tx.type === "income" ? "income/add" : "expense/add"}`, tx); fetchDashboard(); };
  const handleEdit   = async (tx) => { await axios.put(`${API_BASE}/${tx.type === "income" ? `income/update/${editTx._id}` : `expense/update/${editTx._id}`}`, tx); setEditTx(null); fetchDashboard(); };
  const handleDelete = async (id, type) => { await axios.delete(`${API_BASE}/${type === "income" ? `income/delete/${id}` : `expense/delete/${id}`}`); fetchDashboard(); };

  const summary     = data?.summary || {};
  const displayedTx = showAll ? data?.recentTransactions : data?.recentTransactions?.slice(0, 5);

  const incomeStroke  = isDark ? "#a5b4fc" : "#6366f1";
  const expenseStroke = isDark ? "#94a3b8" : "#94a3b8";
  const axisColor     = isDark ? "#404040" : "#d4d4d8";

  if (loading && !data) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-56 shimmer rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="card h-28 shimmer" />)}
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="card h-64 shimmer" /><div className="card h-64 shimmer" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-neutral-50 tracking-tight">
            Hi, {user?.name?.split(" ")[0] || "there"} 👋
          </h1>
          <p className="text-neutral-400 dark:text-neutral-500 text-sm mt-0.5">
            Your financial overview
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link to="/ai-insights">
            <motion.div
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl
                bg-indigo-600 text-white border border-indigo-700
                cursor-pointer transition-colors"
              style={{ boxShadow: "0 1px 4px rgba(99,102,241,0.4)" }}
            >
              <BrainCircuit size={13} />
              <span className="hidden xs:inline">AI Insights</span>
              <span className="xs:hidden">AI</span>
            </motion.div>
          </Link>

          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="w-9 h-9 rounded-xl border border-neutral-200 dark:border-neutral-800
              bg-white dark:bg-neutral-900 flex items-center justify-center
              hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
            style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }}
          >
            <RefreshCw size={13} className={`text-neutral-500 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button onClick={() => setShowAdd(true)} className="btn-primary">
            <Plus size={14} /> <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>

      {/* ── Time range ── */}
      <div className="flex items-center gap-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-1 w-fit"
        style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
        {[
          { label: "Today", value: "daily"   },
          { label: "Week",  value: "weekly"  },
          { label: "Month", value: "monthly" },
          { label: "Year",  value: "yearly"  },
        ].map(t => <TimeBtn key={t.value} {...t} active={range === t.value} onClick={setRange} />)}
      </div>

      {/* ── Stats cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatsCard title="Income"       value={summary.totalIncome   || 0} change={summary.incomeChange}  icon={TrendingUp} />
        <StatsCard title="Expenses"     value={summary.totalExpense  || 0} change={summary.expenseChange} icon={TrendingDown} />
        <StatsCard title="Savings"      value={summary.savings       || 0} icon={Wallet}    subtitle={`${summary.savingsRate || 0}% rate`} />
        <StatsCard title="Transactions" value={summary.transactionCount || 0} icon={BarChart2} prefix="" />
      </div>

      {/* ── Charts ── */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Area chart */}
        <div className="card">
          <SectionHeader
            title="Monthly Trend"
            right={<span className="text-xs text-neutral-400">Income vs Expenses</span>}
          />
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={data?.monthlyTrend || []}>
              <defs>
                <linearGradient id="incG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={incomeStroke}  stopOpacity={0.15} />
                  <stop offset="95%" stopColor={incomeStroke}  stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={expenseStroke} stopOpacity={0.1} />
                  <stop offset="95%" stopColor={expenseStroke} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: axisColor }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: axisColor }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="income"  stroke={incomeStroke}  strokeWidth={2}   fill="url(#incG)" name="Income" />
              <Area type="monotone" dataKey="expense" stroke={expenseStroke} strokeWidth={1.5} fill="url(#expG)" name="Expenses" strokeDasharray="4 2" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="card">
          <SectionHeader title="Expense Breakdown" />
          {data?.expenseDistribution?.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={170}>
                <PieChart>
                  <Pie
                    data={data.expenseDistribution}
                    cx="50%" cy="50%"
                    innerRadius={46} outerRadius={74}
                    dataKey="amount" paddingAngle={2}
                  >
                    {data.expenseDistribution.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => `₹${v.toLocaleString("en-IN")}`}
                    contentStyle={{ borderRadius: 10, background: "#0a0a0a", border: "1px solid #262626", color: "#fff", fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {data.expenseDistribution.slice(0, 5).map((item, i) => (
                  <div key={item.category} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 flex-1 truncate">{item.category}</span>
                    <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 tabular-nums">{item.percent}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-44 flex items-center justify-center">
              <p className="text-neutral-400 text-sm">No expense data</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Savings rate bar ── */}
      {summary.savingsRate > 0 && (
        <div className="card">
          <SectionHeader
            title="Savings Rate"
            right={
              <span className={`text-sm font-black tabular-nums ${
                summary.savingsRate >= 20 ? "text-emerald-600 dark:text-emerald-400" :
                summary.savingsRate >= 10 ? "text-amber-500" : "text-red-500"
              }`}>
                {summary.savingsRate}%
              </span>
            }
          />
          <div className="h-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(summary.savingsRate, 100)}%` }}
              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
              className={`h-full rounded-full ${
                summary.savingsRate >= 20 ? "bg-emerald-500" :
                summary.savingsRate >= 10 ? "bg-amber-400" : "bg-neutral-500"
              }`}
            />
          </div>
          <p className="text-xs text-neutral-400 mt-2">
            {summary.savingsRate >= 20 ? "Great saving habit! 🎉" :
             summary.savingsRate >= 10 ? "You're on track 👍" :
             "Try to save more this period 💪"}
          </p>
        </div>
      )}

      {/* ── Recent transactions ── */}
      <div className="card">
        <SectionHeader
          title="Recent Transactions"
          right={<span className="text-xs text-neutral-400 tabular-nums">{data?.recentTransactions?.length || 0} total</span>}
        />
        {displayedTx?.length > 0 ? (
          <div className="space-y-2">
            {displayedTx.map(tx => (
              <TransactionItem
                key={tx._id || tx.id}
                transaction={tx}
                onEdit={t => setEditTx(t)}
                onDelete={handleDelete}
              />
            ))}
            {(data?.recentTransactions?.length || 0) > 5 && (
              <button
                onClick={() => setShowAll(p => !p)}
                className="w-full text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 font-semibold py-2.5 text-center transition-colors border-t border-neutral-100 dark:border-neutral-800 mt-2 pt-3"
              >
                {showAll ? "Show less ↑" : `Show all ${data.recentTransactions.length} transactions ↓`}
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <Activity size={28} className="mx-auto mb-3 text-neutral-300 dark:text-neutral-700" />
            <p className="text-sm text-neutral-400 mb-3">No transactions yet</p>
            <button onClick={() => setShowAdd(true)} className="btn-primary text-sm">
              Add your first
            </button>
          </div>
        )}
      </div>

      <AddTransaction isOpen={showAdd} onClose={() => setShowAdd(false)} onSubmit={handleAdd} />
      {editTx && <AddTransaction isOpen={!!editTx} onClose={() => setEditTx(null)} onSubmit={handleEdit} editData={editTx} />}
    </div>
  );
}