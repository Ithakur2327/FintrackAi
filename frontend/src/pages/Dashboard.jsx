import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, PiggyBank, Activity, Plus, RefreshCw, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../App.jsx";
import StatsCard from "../components/StatsCard.jsx";
import TransactionItem from "../components/TransactionItem.jsx";
import AddTransaction from "../components/AddTransaction.jsx";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
const PIE_COLORS = ["#f97316","#22c55e","#0891b2","#8b5cf6","#ec4899","#eab308","#14b8a6"];

const TimeBtn = ({ label, value, active, onClick }) => (
  <button onClick={() => onClick(value)}
    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${active ? "bg-orange-500 text-white shadow-sm" : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}>
    {label}
  </button>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-3 shadow-xl text-xs">
      <p className="text-neutral-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: ₹{Number(p.value).toLocaleString("en-IN")}
        </p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("monthly");
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

  const handleAdd = async (tx) => {
    const endpoint = tx.type === "income" ? "income/add" : "expense/add";
    await axios.post(`${API_BASE}/${endpoint}`, tx);
    fetchDashboard();
  };
  const handleEdit = async (tx) => {
    const endpoint = tx.type === "income" ? `income/update/${editTx._id}` : `expense/update/${editTx._id}`;
    await axios.put(`${API_BASE}/${endpoint}`, tx);
    setEditTx(null); fetchDashboard();
  };
  const handleDelete = async (id, type) => {
    const endpoint = type === "income" ? `income/delete/${id}` : `expense/delete/${id}`;
    await axios.delete(`${API_BASE}/${endpoint}`);
    fetchDashboard();
  };

  const summary = data?.summary || {};
  const displayedTx = showAll ? data?.recentTransactions : data?.recentTransactions?.slice(0, 5);

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
            Hi, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-neutral-500 text-sm mt-0.5">Here's your financial overview</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchDashboard} disabled={loading}
            className="w-9 h-9 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex items-center justify-center hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
            <RefreshCw size={15} className={`text-neutral-500 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> Add
          </button>
        </div>
      </div>

      {/* Time Range */}
      <div className="flex items-center gap-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-1 w-fit">
        {[{ label: "Today", value: "daily" }, { label: "Week", value: "weekly" }, { label: "Month", value: "monthly" }, { label: "Year", value: "yearly" }].map(t => (
          <TimeBtn key={t.value} {...t} active={range === t.value} onClick={setRange} />
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Income" value={summary.totalIncome || 0} change={summary.incomeChange} icon={TrendingUp} color="green" />
        <StatsCard title="Expenses" value={summary.totalExpense || 0} change={summary.expenseChange} icon={TrendingDown} color="orange" />
        <StatsCard title="Savings" value={summary.savings || 0} icon={PiggyBank} color="blue" subtitle={`${summary.savingsRate || 0}% savings rate`} />
        <StatsCard title="Transactions" value={summary.transactionCount || 0} icon={Activity} color="purple" prefix="" />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card">
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Monthly Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data?.monthlyTrend || []}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#737373" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#737373" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2} fill="url(#incomeGrad)" name="Income" />
              <Area type="monotone" dataKey="expense" stroke="#f97316" strokeWidth={2} fill="url(#expenseGrad)" name="Expenses" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Expense Categories</h3>
          {data?.expenseDistribution?.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie data={data.expenseDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="amount" paddingAngle={3}>
                    {data.expenseDistribution.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `₹${v.toLocaleString("en-IN")}`} contentStyle={{ borderRadius: 10, background: "#171717", border: "1px solid #404040", color: "#fafafa" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {data.expenseDistribution.slice(0, 5).map((item, i) => (
                  <div key={item.category} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-xs text-neutral-500 flex-1 truncate">{item.category}</span>
                    <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">{item.percent}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-44 flex items-center justify-center text-neutral-400 text-sm">No expense data</div>
          )}
        </div>
      </div>

      {/* AI Insights Banner */}
      <Link to="/ai-insights"
        className="block card bg-gradient-to-r from-neutral-900 to-neutral-800 dark:from-neutral-800 dark:to-neutral-900 border border-orange-500/20 hover:border-orange-500/40 hover:shadow-lg hover:shadow-orange-500/5 transition-all cursor-pointer">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500/15 rounded-xl flex items-center justify-center">
              <Sparkles size={18} className="text-orange-400" />
            </div>
            <div>
              <p className="font-semibold text-neutral-100 text-sm">Get AI-Powered Insights</p>
              <p className="text-neutral-400 text-xs mt-0.5">Personalized analysis of your spending & savings</p>
            </div>
          </div>
          <ArrowRight size={18} className="text-orange-400" />
        </div>
      </Link>

      {/* Recent Transactions */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Recent Transactions</h3>
          <span className="text-xs text-neutral-400">{data?.recentTransactions?.length || 0} total</span>
        </div>
        {displayedTx?.length > 0 ? (
          <div className="space-y-2">
            {displayedTx.map(tx => (
              <TransactionItem key={tx._id || tx.id} transaction={tx} onEdit={t => setEditTx(t)} onDelete={handleDelete} />
            ))}
            {(data?.recentTransactions?.length || 0) > 5 && (
              <button onClick={() => setShowAll(p => !p)} className="w-full text-sm text-orange-500 hover:text-orange-400 font-medium py-2 text-center transition-colors">
                {showAll ? "Show less" : `Show all ${data.recentTransactions.length} transactions`}
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-10 text-neutral-400">
            <Activity size={32} className="mx-auto mb-2 opacity-30" />
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