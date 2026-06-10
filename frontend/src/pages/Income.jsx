import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { AnimatePresence } from "framer-motion";
import { Plus, Search, TrendingUp, RefreshCw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import TransactionItem from "../components/TransactionItem.jsx";
import AddTransaction from "../components/AddTransaction.jsx";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
const COLORS = ["#0d9488", "#14b8a6", "#0891b2", "#8b5cf6", "#10b981", "#0e7490", "#34d399"];
const CATEGORIES = ["All", "Salary", "Freelance", "Investment", "Business", "Gift", "Rental", "Bonus", "Other"];

export default function Income() {
  const [incomes, setIncomes] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("monthly");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editTx, setEditTx] = useState(null);
  const [view, setView] = useState("list");

  const fetchIncomes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ range });
      if (category !== "All") params.set("category", category);
      const res = await axios.get(`${API_BASE}/income/get?${params}`);
      const arr = Array.isArray(res.data.data) ? res.data.data : [];
      setIncomes(arr);
      setMeta(res.data.meta || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [range, category]);

  useEffect(() => { fetchIncomes(); }, [fetchIncomes]);

  const handleAdd = async (tx) => { await axios.post(`${API_BASE}/income/add`, tx); fetchIncomes(); };
  const handleEdit = async (tx) => { await axios.put(`${API_BASE}/income/update/${editTx._id}`, tx); setEditTx(null); fetchIncomes(); };
  const handleDelete = async (id) => { await axios.delete(`${API_BASE}/income/delete/${id}`); fetchIncomes(); };

  const filtered = incomes.filter(e => !search || e.description?.toLowerCase().includes(search.toLowerCase()));

  const byCategory = Object.entries(
    incomes.reduce((acc, i) => { acc[i.category] = (acc[i.category] || 0) + i.amount; return acc; }, {})
  ).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  const byDate = incomes.reduce((acc, i) => {
    const d = new Date(i.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    acc[d] = (acc[d] || 0) + i.amount;
    return acc;
  }, {});
  const chartData = Object.entries(byDate).slice(-10).map(([date, amount]) => ({ date, amount }));

  const highestIncome = incomes.reduce((max, i) => i.amount > max ? i.amount : max, 0);
  const avgIncome = incomes.length > 0 ? (meta.totalAmount / incomes.length) : 0;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Income</h1>
          <p className="text-slate-500 text-sm">Total: ₹{(meta.totalAmount || 0).toLocaleString("en-IN")} · {meta.total || 0} records</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Add Income
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Earned", value: `₹${(meta.totalAmount || 0).toLocaleString("en-IN")}`, color: "bg-teal-50 text-teal-700" },
          { label: "Highest Entry", value: `₹${highestIncome.toLocaleString("en-IN")}`, color: "bg-green-50 text-green-700" },
          { label: "Average", value: `₹${Math.round(avgIncome).toLocaleString("en-IN")}`, color: "bg-blue-50 text-blue-700" },
        ].map(s => (
          <div key={s.label} className="card text-center py-4">
            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
            <p className={`text-lg font-bold ${s.color.split(" ")[1]}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
          {[{ l: "Month", v: "monthly" }, { l: "Week", v: "weekly" }, { l: "Year", v: "yearly" }, { l: "All", v: "last90days" }].map(t => (
            <button key={t.v} onClick={() => setRange(t.v)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${range === t.v ? "bg-teal-600 text-white" : "text-slate-600 hover:bg-white"}`}>
              {t.l}
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-w-36">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search..." className="input pl-8 text-sm h-9"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <select className="input h-9 text-sm w-auto" value={category} onChange={e => setCategory(e.target.value)}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <div className="flex rounded-xl overflow-hidden border border-slate-200">
          {[{ icon: "☰", v: "list" }, { icon: "📊", v: "chart" }].map(b => (
            <button key={b.v} onClick={() => setView(b.v)}
              className={`px-3 py-1.5 text-xs transition-all ${view === b.v ? "bg-teal-600 text-white" : "text-slate-500 hover:bg-slate-100"}`}>
              {b.icon}
            </button>
          ))}
        </div>

        <button onClick={fetchIncomes} className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50">
          <RefreshCw size={14} className={`text-slate-500 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Charts */}
      {view === "chart" && (
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="card">
            <h3 className="font-semibold text-slate-800 mb-4">Income by Category</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={byCategory} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => `₹${v.toLocaleString("en-IN")}`} contentStyle={{ borderRadius: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <h3 className="font-semibold text-slate-800 mb-4">Daily Income</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={v => `₹${v.toLocaleString("en-IN")}`} contentStyle={{ borderRadius: 10 }} />
                <Bar dataKey="amount" fill="#0d9488" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Category chips */}
      <div className="flex flex-wrap gap-2">
        {byCategory.slice(0, 5).map((cat, i) => (
          <div key={cat.name} className="flex items-center gap-2 bg-white border border-slate-100 rounded-xl px-3 py-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
            <span className="text-xs font-medium text-slate-700">{cat.name}</span>
            <span className="text-xs font-bold text-teal-700">₹{cat.value.toLocaleString("en-IN")}</span>
          </div>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2">
        {loading ? (
          [...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-xl shimmer" />)
        ) : filtered.length > 0 ? (
          <AnimatePresence>
            {filtered.map(tx => (
              <TransactionItem key={tx._id} transaction={{ ...tx, type: "income" }}
                onEdit={t => setEditTx(t)} onDelete={handleDelete} />
            ))}
          </AnimatePresence>
        ) : (
          <div className="card text-center py-12">
            <TrendingUp size={40} className="mx-auto text-slate-200 mb-3" />
            <p className="text-slate-500 font-medium">No income records found</p>
            <button onClick={() => setShowAdd(true)} className="mt-3 btn-primary text-sm">Add Income</button>
          </div>
        )}
      </div>

      <AddTransaction isOpen={showAdd} onClose={() => setShowAdd(false)} onSubmit={handleAdd} defaultType="income" />
      {editTx && <AddTransaction isOpen={!!editTx} onClose={() => setEditTx(null)} onSubmit={handleEdit} editData={editTx} />}
    </div>
  );
}
