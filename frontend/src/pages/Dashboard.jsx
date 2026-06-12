import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import {
  TrendingUp, TrendingDown, Wallet, BarChart2,
  Plus, RefreshCw, BrainCircuit, ArrowUpRight, Activity
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth, useTheme } from "../App.jsx";
import StatsCard from "../components/StatsCard.jsx";
import TransactionItem from "../components/TransactionItem.jsx";
import AddTransaction from "../components/AddTransaction.jsx";
import { HoverBorderGradient } from "../components/HoverBorderGradient.jsx";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
const PIE_GRAY = ["#0a0a0a","#333","#555","#777","#999","#aaa","#ccc"];

const TimeBtn = ({ label, value, active, onClick }) => (
  <button onClick={() => onClick(value)}
    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
      active
        ? "bg-black text-white dark:bg-white dark:text-black shadow-sm"
        : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900"
    }`}>
    {label}
  </button>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-black dark:bg-neutral-950 border border-neutral-800 rounded-xl p-3 shadow-2xl text-xs">
      <p className="text-neutral-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-semibold text-white mt-0.5">
          {p.name}: ₹{Number(p.value).toLocaleString("en-IN")}
        </p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange]   = useState("monthly");
  const [showAdd, setShowAdd] = useState(false);
  const [editTx, setEditTx] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/dashboard?range=${range}`);
      setData(res.data.data);
    } catch (err) { console.error("Dashboard fetch error:", err); }
    finally { setLoading(false); }
  }, [range]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const handleAdd    = async (tx) => { await axios.post(`${API_BASE}/${tx.type === "income" ? "income/add" : "expense/add"}`, tx); fetchDashboard(); };
  const handleEdit   = async (tx) => { await axios.put(`${API_BASE}/${tx.type === "income" ? `income/update/${editTx._id}` : `expense/update/${editTx._id}`}`, tx); setEditTx(null); fetchDashboard(); };
  const handleDelete = async (id, type) => { await axios.delete(`${API_BASE}/${type === "income" ? `income/delete/${id}` : `expense/delete/${id}`}`); fetchDashboard(); };

  const summary    = data?.summary || {};
  const displayedTx = showAll ? data?.recentTransactions : data?.recentTransactions?.slice(0, 5);

  const chartStroke = isDark ? "#e5e5e5" : "#171717";
  const chartStroke2 = isDark ? "#737373" : "#a3a3a3";
  const axisColor   = isDark ? "#404040" : "#d4d4d8";

  if (loading && !data) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-neutral-50 tracking-tight">
            Hi, {user?.name?.split(" ")[0]}
          </h1>
          <p className="text-neutral-400 dark:text-neutral-500 text-sm mt-0.5">Your financial overview</p>
        </div>
        <div className="flex items-center gap-2">
          {/* AI Insights button — left of refresh+add */}
          <Link to="/ai-insights">
            <HoverBorderGradient containerClassName="rounded-full" duration={1.2}>
              <span className="flex items-center gap-1.5 text-xs">
                <BrainCircuit size={13} />
                AI Insights
              </span>
            </HoverBorderGradient>
          </Link>

          <button onClick={fetchDashboard} disabled={loading}
            className="w-9 h-9 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 flex items-center justify-center hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
            <RefreshCw size={14} className={`text-neutral-500 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button onClick={() => setShowAdd(true)}
            className="btn-primary flex items-center gap-1.5 text-sm">
            <Plus size={15} /> Add
          </button>
        </div>
      </div>

      {/* ── Time Range ── */}
      <div className="flex items-center gap-1 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl p-1 w-fit shadow-sm">
        {[
          { label: "Today", value: "daily" },
          { label: "Week",  value: "weekly" },
          { label: "Month", value: "monthly" },
          { label: "Year",  value: "yearly" },
        ].map(t => <TimeBtn key={t.value} {...t} active={range === t.value} onClick={setRange} />)}
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Income"       value={summary.totalIncome || 0}    change={summary.incomeChange}  icon={TrendingUp} />
        <StatsCard title="Expenses"     value={summary.totalExpense || 0}   change={summary.expenseChange} icon={TrendingDown} />
        <StatsCard title="Savings"      value={summary.savings || 0}        icon={Wallet}    subtitle={`${summary.savingsRate || 0}% rate`} />
        <StatsCard title="Transactions" value={summary.transactionCount || 0} icon={BarChart2} prefix="" />
      </div>

      {/* ── Charts ── */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Area chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-neutral-800 dark:text-neutral-200 tracking-tight">Monthly Trend</h3>
            <span className="text-xs text-neutral-400 font-medium">Income vs Expenses</span>
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={data?.monthlyTrend || []}>
              <defs>
                <linearGradient id="incG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={chartStroke} stopOpacity={0.12} />
                  <stop offset="95%" stopColor={chartStroke} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={chartStroke2} stopOpacity={0.1} />
                  <stop offset="95%" stopColor={chartStroke2} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: axisColor }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: axisColor }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="income"  stroke={chartStroke}  strokeWidth={2} fill="url(#incG)" name="Income" />
              <Area type="monotone" dataKey="expense" stroke={chartStroke2} strokeWidth={1.5} fill="url(#expG)" name="Expenses" strokeDasharray="4 2" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-neutral-800 dark:text-neutral-200 tracking-tight">Expense Categories</h3>
          </div>
          {data?.expenseDistribution?.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={170}>
                <PieChart>
                  <Pie data={data.expenseDistribution} cx="50%" cy="50%" innerRadius={46} outerRadius={76} dataKey="amount" paddingAngle={3}>
                    {data.expenseDistribution.map((_, i) => (
                      <Cell key={i} fill={PIE_GRAY[i % PIE_GRAY.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `₹${v.toLocaleString("en-IN")}`}
                    contentStyle={{ borderRadius: 10, background: "#000", border: "1px solid #222", color: "#fff", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {data.expenseDistribution.slice(0, 5).map((item, i) => (
                  <div key={item.category} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0 border border-neutral-300 dark:border-neutral-700"
                      style={{ backgroundColor: PIE_GRAY[i % PIE_GRAY.length] }} />
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 flex-1 truncate">{item.category}</span>
                    <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">{item.percent}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-44 flex items-center justify-center text-neutral-400 text-sm">No expense data</div>
          )}
        </div>
      </div>

      {/* ── Recent Transactions ── */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm text-neutral-800 dark:text-neutral-200 tracking-tight">Recent Transactions</h3>
          <span className="text-xs text-neutral-400 tabular-nums">{data?.recentTransactions?.length || 0} total</span>
        </div>
        {displayedTx?.length > 0 ? (
          <div className="space-y-2">
            {displayedTx.map(tx => (
              <TransactionItem key={tx._id || tx.id} transaction={tx} onEdit={t => setEditTx(t)} onDelete={handleDelete} />
            ))}
            {(data?.recentTransactions?.length || 0) > 5 && (
              <button onClick={() => setShowAll(p => !p)}
                className="w-full text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 font-medium py-2 text-center transition-colors">
                {showAll ? "Show less" : `Show all ${data.recentTransactions.length} transactions`}
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-10 text-neutral-400">
            <Activity size={28} className="mx-auto mb-2 opacity-20" />
            <p className="text-sm">No transactions yet</p>
            <button onClick={() => setShowAdd(true)} className="mt-3 btn-primary text-sm">Add your first</button>
          </div>
        )}
      </div>

      <AddTransaction isOpen={showAdd} onClose={() => setShowAdd(false)} onSubmit={handleAdd} />
      {editTx && <AddTransaction isOpen={!!editTx} onClose={() => setEditTx(null)} onSubmit={handleEdit} editData={editTx} />}
    </div>
  );
}