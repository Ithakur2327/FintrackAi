import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { AnimatePresence } from "framer-motion";
import { Plus, Search, TrendingDown, RefreshCw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import TransactionItem from "../components/TransactionItem.jsx";
import AddTransaction from "../components/AddTransaction.jsx";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
const COLORS = ["#f97316","#22c55e","#0891b2","#8b5cf6","#ec4899","#eab308","#14b8a6"];
const CATEGORIES = ["All","Food","Housing","Transport","Shopping","Entertainment","Utilities","Healthcare","Education","Travel","Other"];
const tooltipStyle = { borderRadius: 10, background: "#171717", border: "1px solid #404040", color: "#fafafa" };

export default function Expense() {
  const [expenses, setExpenses] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("monthly");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editTx, setEditTx] = useState(null);
  const [view, setView] = useState("list");

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ range });
      if (category !== "All") params.set("category", category);
      const res = await axios.get(`${API_BASE}/expense/get?${params}`);
      setExpenses(Array.isArray(res.data.data) ? res.data.data : []);
      setMeta(res.data.meta || {});
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [range, category]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const handleAdd = async (tx) => { await axios.post(`${API_BASE}/expense/add`, tx); fetchExpenses(); };
  const handleEdit = async (tx) => { await axios.put(`${API_BASE}/expense/update/${editTx._id}`, tx); setEditTx(null); fetchExpenses(); };
  const handleDelete = async (id) => { await axios.delete(`${API_BASE}/expense/delete/${id}`); fetchExpenses(); };

  const filtered = expenses.filter(e => !search || e.description?.toLowerCase().includes(search.toLowerCase()));
  const byCategory = Object.entries(expenses.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + e.amount; return acc; }, {}))
    .map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  const byDate = expenses.reduce((acc, e) => {
    const d = new Date(e.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    acc[d] = (acc[d] || 0) + e.amount; return acc;
  }, {});
  const chartData = Object.entries(byDate).slice(-10).map(([date, amount]) => ({ date, amount }));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">Expenses</h1>
          <p className="text-neutral-500 text-sm">Total: ₹{(meta.totalAmount || 0).toLocaleString("en-IN")} · {meta.total || 0} transactions</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Add Expense
        </button>
      </div>

      <div className="card flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl p-1">
          {[{ l: "Month", v: "monthly" }, { l: "Week", v: "weekly" }, { l: "Year", v: "yearly" }, { l: "All", v: "last90days" }].map(t => (
            <button key={t.v} onClick={() => setRange(t.v)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${range === t.v ? "bg-orange-500 text-white" : "text-neutral-500 hover:bg-white dark:hover:bg-neutral-700"}`}>
              {t.l}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-36">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input type="text" placeholder="Search..." className="input pl-8 text-sm h-9"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input h-9 text-sm w-auto" value={category} onChange={e => setCategory(e.target.value)}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <div className="flex rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700">
          {[{ icon: "☰", v: "list" }, { icon: "📊", v: "chart" }].map(b => (
            <button key={b.v} onClick={() => setView(b.v)}
              className={`px-3 py-1.5 text-xs transition-all ${view === b.v ? "bg-orange-500 text-white" : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}>
              {b.icon}
            </button>
          ))}
        </div>
        <button onClick={fetchExpenses} className="w-9 h-9 rounded-xl border border-neutral-200 dark:border-neutral-700 flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800">
          <RefreshCw size={14} className={`text-neutral-500 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {view === "chart" && (
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="card">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Spending by Category</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={byCategory} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => `₹${v.toLocaleString("en-IN")}`} contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Daily Spending</h3>
            <ResponsiveContainer width="100%" height={220}>
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

      <div className="flex flex-wrap gap-2">
        {byCategory.slice(0, 5).map((cat, i) => (
          <div key={cat.name} className="flex items-center gap-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
            <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">{cat.name}</span>
            <span className="text-xs font-bold text-orange-500">₹{cat.value.toLocaleString("en-IN")}</span>
          </div>
        ))}
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
          <div className="card text-center py-12">
            <TrendingDown size={40} className="mx-auto text-neutral-700 mb-3" />
            <p className="text-neutral-500 font-medium">No expenses found</p>
            <button onClick={() => setShowAdd(true)} className="mt-3 btn-primary text-sm">Add Expense</button>
          </div>
        )}
      </div>

      <AddTransaction isOpen={showAdd} onClose={() => setShowAdd(false)} onSubmit={handleAdd} defaultType="expense" />
      {editTx && <AddTransaction isOpen={!!editTx} onClose={() => setEditTx(null)} onSubmit={handleEdit} editData={editTx} />}
    </div>
  );
}