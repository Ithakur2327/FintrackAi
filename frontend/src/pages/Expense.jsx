import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { AnimatePresence } from "framer-motion";
import { Plus, Search, TrendingDown, RefreshCw } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid,
} from "recharts";
import TransactionItem from "../components/TransactionItem.jsx";
import AddTransaction from "../components/AddTransaction.jsx";
import { useTheme } from "../App.jsx";
import { MOCK_MODE, mockExpenses, mockExpenseMeta } from "../mock/data.js";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
const COLORS = ["#3b82f6","#6366f1","#0891b2","#8b5cf6","#ec4899","#eab308","#14b8a6"];
const CATEGORIES = ["All","Food","Housing","Transport","Shopping","Entertainment","Utilities","Healthcare","Education","Travel","Other"];

const RANGES = [
  { l: "Day",  v: "daily"   },
  { l: "Week", v: "weekly"  },
  { l: "Month",v: "monthly" },
  { l: "Year", v: "yearly"  },
];

function buildChartData(expenses, range) {
  const grouped = {};
  expenses.forEach(item => {
    const d = new Date(item.date);
    let key;
    if (range === "daily") {
      key = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    } else if (range === "weekly") {
      key = d.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit" });
    } else if (range === "monthly") {
      key = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    } else {
      key = d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
    }
    grouped[key] = (grouped[key] || 0) + item.amount;
  });
  return Object.entries(grouped).slice(-14).map(([date, amount]) => ({ date, amount }));
}

const CustomTooltip = ({ active, payload, label, isDark }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: isDark ? "#1c1c1e" : "#fff",
      border: `1px solid ${isDark ? "#3a3a3c" : "#e5e7eb"}`,
      borderRadius: 10,
      padding: "8px 12px",
      boxShadow: isDark ? "0 4px 16px rgba(0,0,0,0.5)" : "0 4px 16px rgba(0,0,0,0.1)",
      color: isDark ? "#f5f5f5" : "#111",
      fontSize: 12,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
    }}>
      <p style={{ color: isDark ? "#8e8e93" : "#6b7280", marginBottom: 2 }}>{label}</p>
      <p style={{ fontWeight: 700, color: "#3b82f6" }}>
        ₹{Number(payload[0].value).toLocaleString("en-IN")}
      </p>
    </div>
  );
};

const PieTooltip = ({ active, payload, isDark }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: isDark ? "#1c1c1e" : "#fff",
      border: `1px solid ${isDark ? "#3a3a3c" : "#e5e7eb"}`,
      borderRadius: 10,
      padding: "8px 12px",
      fontSize: 12,
      color: isDark ? "#f5f5f5" : "#111",
    }}>
      <p style={{ fontWeight: 600 }}>{payload[0].name}</p>
      <p style={{ color: "#3b82f6", fontWeight: 700 }}>₹{Number(payload[0].value).toLocaleString("en-IN")}</p>
    </div>
  );
};

export default function Expense() {
  const { isDark } = useTheme();
  const [expenses, setExpenses] = useState([]);
  const [meta, setMeta]         = useState({});
  const [loading, setLoading]   = useState(true);
  const [range, setRange]       = useState("monthly");
  const [category, setCategory] = useState("All");
  const [search, setSearch]     = useState("");
  const [showAdd, setShowAdd]   = useState(false);
  const [editTx, setEditTx]     = useState(null);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      if (MOCK_MODE) { setExpenses(mockExpenses); setMeta(mockExpenseMeta); setLoading(false); return; }
      const params = new URLSearchParams({ range });
      if (category !== "All") params.set("category", category);
      const res = await axios.get(`${API_BASE}/expense/get?${params}`);
      setExpenses(Array.isArray(res.data.data) ? res.data.data : []);
      setMeta(res.data.meta || {});
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [range, category]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const handleAdd    = async (tx) => { await axios.post(`${API_BASE}/expense/add`, tx); fetchExpenses(); };
  const handleEdit   = async (tx) => { await axios.put(`${API_BASE}/expense/update/${editTx._id}`, tx); setEditTx(null); fetchExpenses(); };
  const handleDelete = async (id) => { await axios.delete(`${API_BASE}/expense/delete/${id}`); fetchExpenses(); };

  const filtered = expenses.filter(e =>
    (category === "All" || e.category === category) &&
    (!search || e.description?.toLowerCase().includes(search.toLowerCase()))
  );

  const byCategory = Object.entries(expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount; return acc;
  }, {})).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  const chartData = buildChartData(expenses, range);
  const highestExpense = expenses.reduce((max, e) => e.amount > max ? e.amount : max, 0);
  const avgExpense = expenses.length > 0 ? Math.round((meta.totalAmount || 0) / expenses.length) : 0;

  const axisColor = isDark ? "#6b6b6b" : "#9ca3af";
  const gridColor = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";
  const chartLabel = range === "yearly" ? "Monthly Trend"
    : range === "weekly"  ? "Daily Trend (This Week)"
    : range === "daily"   ? "Daily View"
    : "Expenses Over Time";

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">Expenses</h1>
          <p className="text-neutral-500 text-sm mt-0.5">
            ₹{(meta.totalAmount || 0).toLocaleString("en-IN")} · {meta.total || 0} transactions
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary shrink-0">
          <Plus size={15} /> Add Expense
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {[
          { label: "Total Spent",   value: `₹${(meta.totalAmount || 0).toLocaleString("en-IN")}`, cls: "text-blue-500" },
          { label: "Highest Entry", value: `₹${highestExpense.toLocaleString("en-IN")}`,           cls: "text-red-500" },
          { label: "Average",       value: `₹${avgExpense.toLocaleString("en-IN")}`,               cls: "text-indigo-500 dark:text-indigo-400" },
        ].map(s => (
          <div key={s.label} className="card text-center py-3 sm:py-4 px-2">
            <p className="text-[10px] sm:text-xs text-neutral-500 mb-1 truncate">{s.label}</p>
            <p className={`text-sm sm:text-lg font-bold ${s.cls} tabular-nums truncate`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl p-1">
            {RANGES.map(t => (
              <button key={t.v} onClick={() => setRange(t.v)}
                className={`px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${range === t.v ? "bg-blue-500 text-white shadow-sm" : "text-neutral-500 hover:bg-white dark:hover:bg-neutral-700"}`}>
                {t.l}
              </button>
            ))}
          </div>
          <div className="relative flex-1 min-w-32">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            <input type="text" placeholder="Search…" className="input pl-8 text-sm h-9"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="select-wrapper">
            <select className="input h-9 text-sm w-auto min-w-[110px]" value={category} onChange={e => setCategory(e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button onClick={fetchExpenses}
            className="w-9 h-9 rounded-xl border border-neutral-200 dark:border-neutral-700 flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 shrink-0">
            <RefreshCw size={13} className={`text-neutral-500 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
        <div className="card-big">
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4 text-sm tracking-tight">{chartLabel}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barCategoryGap="30%">
              <CartesianGrid vertical={false} stroke={gridColor} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: axisColor, fontFamily: "-apple-system" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: axisColor, fontFamily: "-apple-system" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v >= 1000 ? (v/1000).toFixed(0)+"k" : v}`} />
              <Tooltip content={<CustomTooltip isDark={isDark} />} />
              <Bar dataKey="amount" fill="#3b82f6" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card-big">
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4 text-sm tracking-tight">By Category</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={byCategory} cx="50%" cy="50%" outerRadius={75} innerRadius={35}
                dataKey="value" nameKey="name">
                {byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip content={<PieTooltip isDark={isDark} />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
            {byCategory.slice(0,5).map((c,i) => (
              <div key={c.name} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i%COLORS.length] }} />
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TRANSACTION LIST — always visible ── */}
      <div className="card-big">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm tracking-tight">
            Transactions
            {filtered.length > 0 && <span className="ml-2 text-xs font-normal text-neutral-400">({filtered.length})</span>}
          </h3>
        </div>
        <div className="space-y-2">
          {loading ? (
            [...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-xl shimmer" />)
          ) : filtered.length > 0 ? (
            <AnimatePresence>
              {filtered.map(tx => (
                <TransactionItem key={tx._id} transaction={{ ...tx, type: "expense" }}
                  onEdit={t => setEditTx(t)} onDelete={handleDelete} />
              ))}
            </AnimatePresence>
          ) : (
            <div className="text-center py-10">
              <TrendingDown size={32} className="mx-auto text-neutral-300 dark:text-neutral-700 mb-3" />
              <p className="text-neutral-500 font-medium mb-1 text-sm">No expenses found</p>
              <p className="text-xs text-neutral-400 mb-4">Track your daily spending here</p>
              <button onClick={() => setShowAdd(true)} className="btn-primary text-sm">Add Expense</button>
            </div>
          )}
        </div>
      </div>

      <AddTransaction isOpen={showAdd} onClose={() => setShowAdd(false)} onSubmit={handleAdd} defaultType="expense" />
      {editTx && <AddTransaction isOpen={!!editTx} onClose={() => setEditTx(null)} onSubmit={handleEdit} editData={editTx} />}
    </div>
  );
}