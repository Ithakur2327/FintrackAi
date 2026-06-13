import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { AnimatePresence } from "framer-motion";
import { Plus, Search, TrendingDown, RefreshCw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import TransactionItem from "../components/TransactionItem.jsx";
import AddTransaction from "../components/AddTransaction.jsx";
// ── MOCK: delete this import + MOCK_MODE checks when backend is ready ──
import { MOCK_MODE, mockExpenses, mockExpenseMeta } from "../mock/data.js";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
const COLORS = ["#f97316","#6366f1","#0891b2","#8b5cf6","#ec4899","#eab308","#14b8a6"];
const CATEGORIES = ["All","Food","Housing","Transport","Shopping","Entertainment","Utilities","Healthcare","Education","Travel","Other"];
const tooltipStyle = { borderRadius: 10, background: "var(--tooltip-bg, #171717)", border: "1px solid #404040", color: "#fafafa", fontSize: 12 };

export default function Expense() {
  const [expenses, setExpenses]   = useState([]);
  const [meta, setMeta]           = useState({});
  const [loading, setLoading]     = useState(true);
  const [range, setRange]         = useState("monthly");
  const [category, setCategory]   = useState("All");
  const [search, setSearch]       = useState("");
  const [showAdd, setShowAdd]     = useState(false);
  const [editTx, setEditTx]       = useState(null);
  const [view, setView]           = useState("list");

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      // ── MOCK: delete the next 3 lines when backend is ready ──
      if (MOCK_MODE) { setExpenses(mockExpenses); setMeta(mockExpenseMeta); setLoading(false); return; }
      // ── END MOCK ──
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

  const chartData = Object.entries(
    expenses.reduce((acc, e) => {
      const d = new Date(e.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      acc[d] = (acc[d] || 0) + e.amount; return acc;
    }, {})
  ).slice(-10).map(([date, amount]) => ({ date, amount }));

  const highestExpense = expenses.reduce((max, e) => e.amount > max ? e.amount : max, 0);
  const avgExpense = expenses.length > 0 ? Math.round((meta.totalAmount || 0) / expenses.length) : 0;

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
          { label: "Total Spent",   value: `₹${(meta.totalAmount || 0).toLocaleString("en-IN")}`, cls: "text-orange-500" },
          { label: "Highest Entry", value: `₹${highestExpense.toLocaleString("en-IN")}`,          cls: "text-red-500" },
          { label: "Average",       value: `₹${avgExpense.toLocaleString("en-IN")}`,              cls: "text-indigo-500 dark:text-indigo-400" },
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
            {[{ l: "Month", v: "monthly" }, { l: "Week", v: "weekly" }, { l: "Year", v: "yearly" }, { l: "All", v: "last90days" }].map(t => (
              <button key={t.v} onClick={() => setRange(t.v)}
                className={`px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${range === t.v ? "bg-orange-500 text-white" : "text-neutral-500 hover:bg-white dark:hover:bg-neutral-700"}`}>
                {t.l}
              </button>
            ))}
          </div>
          <div className="relative flex-1 min-w-32">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input type="text" placeholder="Search..." className="input pl-8 text-sm h-9"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input h-9 text-sm w-auto" value={category} onChange={e => setCategory(e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="flex rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 shrink-0">
            {[{ l: "List", v: "list" }, { l: "Chart", v: "chart" }].map(b => (
              <button key={b.v} onClick={() => setView(b.v)}
                className={`px-3 py-1.5 text-xs font-semibold transition-all ${view === b.v ? "bg-orange-500 text-white" : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}>
                {b.l}
              </button>
            ))}
          </div>
          <button onClick={fetchExpenses}
            className="w-9 h-9 rounded-xl border border-neutral-200 dark:border-neutral-700 flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 shrink-0">
            <RefreshCw size={13} className={`text-neutral-500 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Charts */}
      {view === "chart" && (
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
          <div className="card-big">
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4 text-sm">Spending by Category</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={byCategory} cx="50%" cy="50%" outerRadius={75} dataKey="value" nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => `₹${v.toLocaleString("en-IN")}`} contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="card-big">
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4 text-sm">Daily Spending</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#737373" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#737373" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={v => `₹${v.toLocaleString("en-IN")}`} contentStyle={tooltipStyle} />
                <Bar dataKey="amount" fill="#f97316" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Category pills */}
      {byCategory.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {byCategory.slice(0, 5).map((cat, i) => (
            <div key={cat.name} className="flex items-center gap-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
              <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">{cat.name}</span>
              <span className="text-xs font-bold text-orange-500">₹{cat.value.toLocaleString("en-IN")}</span>
            </div>
          ))}
        </div>
      )}

      {/* List */}
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
          <div className="card text-center py-12">
            <TrendingDown size={36} className="mx-auto text-neutral-300 dark:text-neutral-700 mb-3" />
            <p className="text-neutral-500 font-medium mb-1">No expenses found</p>
            <p className="text-xs text-neutral-400 mb-4">Track your daily spending here</p>
            <button onClick={() => setShowAdd(true)} className="btn-primary text-sm">Add Expense</button>
          </div>
        )}
      </div>

      <AddTransaction isOpen={showAdd} onClose={() => setShowAdd(false)} onSubmit={handleAdd} defaultType="expense" />
      {editTx && <AddTransaction isOpen={!!editTx} onClose={() => setEditTx(null)} onSubmit={handleEdit} editData={editTx} />}
    </div>
  );
}