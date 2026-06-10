import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, TrendingDown, PiggyBank, Activity, Plus, RefreshCw, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../App.jsx";
import StatsCard from "../components/StatsCard.jsx";
import TransactionItem from "../components/TransactionItem.jsx";
import AddTransaction from "../components/AddTransaction.jsx";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
const PIE_COLORS = ["#0d9488", "#f97316", "#0891b2", "#8b5cf6", "#ec4899", "#eab308", "#14b8a6"];

const TimeBtn = ({ label, value, active, onClick }) => (
  <button onClick={() => onClick(value)}
    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${active ? "bg-teal-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}>
    {label}
  </button>
);

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
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
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
    setEditTx(null);
    fetchDashboard();
  };

  const handleDelete = async (id, type) => {
    const endpoint = type === "income" ? `income/delete/${id}` : `expense/delete/${id}`;
    await axios.delete(`${API_BASE}/${endpoint}`);
    fetchDashboard();
  };

  const fmt = (n) => {
    const abs = Math.abs(n || 0);
    if (abs >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    return `₹${(n || 0).toLocaleString("en-IN")}`;
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
          <div className="card h-64 shimmer" />
          <div className="card h-64 shimmer" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Hi, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Here's your financial overview</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchDashboard} disabled={loading} className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition-colors">
            <RefreshCw size={15} className={`text-slate-500 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> Add
          </button>
        </div>
      </div>

      {/* Time Range */}
      <div className="flex items-center gap-1 bg-white border border-slate-100 rounded-xl p-1 w-fit">
        {[{ label: "Today", value: "daily" }, { label: "Week", value: "weekly" }, { label: "Month", value: "monthly" }, { label: "Year", value: "yearly" }].map(t => (
          <TimeBtn key={t.value} {...t} active={range === t.value} onClick={setRange} />
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Income" value={summary.totalIncome || 0} change={summary.incomeChange} icon={TrendingUp} color="teal" />
        <StatsCard title="Expenses" value={summary.totalExpense || 0} change={summary.expenseChange} icon={TrendingDown} color="orange" />
        <StatsCard title="Savings" value={summary.savings || 0} icon={PiggyBank} color="blue" subtitle={`${summary.savingsRate || 0}% savings rate`} />
        <StatsCard title="Transactions" value={summary.transactionCount || 0} icon={Activity} color="purple" prefix="" />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Trend Chart */}
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-4">Monthly Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data?.monthlyTrend || []}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v, n) => [`₹${v.toLocaleString("en-IN")}`, n]} contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
              <Area type="monotone" dataKey="income" stroke="#0d9488" strokeWidth={2} fill="url(#incomeGrad)" name="Income" />
              <Area type="monotone" dataKey="expense" stroke="#f97316" strokeWidth={2} fill="url(#expenseGrad)" name="Expenses" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Expense Distribution */}
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-4">Expense Categories</h3>
          {data?.expenseDistribution?.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie data={data.expenseDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="amount" paddingAngle={3}>
                    {data.expenseDistribution.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `₹${v.toLocaleString("en-IN")}`} contentStyle={{ borderRadius: 10 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {data.expenseDistribution.slice(0, 5).map((item, i) => (
                  <div key={item.category} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-xs text-slate-600 flex-1 truncate">{item.category}</span>
                    <span className="text-xs font-semibold text-slate-700">{item.percent}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-44 flex items-center justify-center text-slate-400 text-sm">No expense data</div>
          )}
        </div>
      </div>

      {/* AI Insights Banner */}
      <Link to="/ai-insights" className="block card bg-gradient-to-r from-teal-600 to-teal-700 border-0 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-white text-sm">Get AI-Powered Insights</p>
              <p className="text-teal-100 text-xs mt-0.5">Personalized analysis of your spending & savings</p>
            </div>
          </div>
          <ArrowRight size={18} className="text-teal-200" />
        </div>
      </Link>

      {/* Recent Transactions */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">Recent Transactions</h3>
          <span className="text-xs text-slate-400">{data?.recentTransactions?.length || 0} total</span>
        </div>
        {displayedTx?.length > 0 ? (
          <div className="space-y-2">
            {displayedTx.map(tx => (
              <TransactionItem key={tx._id || tx.id} transaction={tx}
                onEdit={t => setEditTx(t)} onDelete={handleDelete} />
            ))}
            {(data?.recentTransactions?.length || 0) > 5 && (
              <button onClick={() => setShowAll(p => !p)} className="w-full text-sm text-teal-600 hover:text-teal-700 font-medium py-2 text-center transition-colors">
                {showAll ? "Show less" : `Show all ${data.recentTransactions.length} transactions`}
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-10 text-slate-400">
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
