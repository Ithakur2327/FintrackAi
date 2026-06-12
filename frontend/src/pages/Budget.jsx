import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, PiggyBank, AlertTriangle, X } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
const EXPENSE_CATEGORIES = ["Food","Housing","Transport","Shopping","Entertainment","Utilities","Healthcare","Education","Travel","Other","Total"];
const CATEGORY_EMOJI = { Food:"🍔", Housing:"🏠", Transport:"🚗", Shopping:"🛍️", Entertainment:"🎬", Utilities:"⚡", Healthcare:"💊", Education:"📚", Travel:"✈️", Total:"💰", Other:"🎯" };

function BudgetModal({ isOpen, onClose, onSave }) {
  const [form, setForm] = useState({ category: "Food", limit: "", alertAt: 80 });
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try { await onSave(form); onClose(); setForm({ category: "Food", limit: "", alertAt: 80 }); }
    finally { setLoading(false); }
  };
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={e => e.target === e.currentTarget && onClose()}>
        <motion.div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-sm shadow-2xl p-6"
          initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Set Budget</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center">
              <X size={16} className="text-neutral-500" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-1.5">Category</label>
              <select className="input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_EMOJI[c]} {c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-1.5">Monthly Budget Limit (₹)</label>
              <input type="number" className="input" placeholder="e.g. 5000" min="0" value={form.limit}
                onChange={e => setForm(p => ({ ...p, limit: e.target.value }))} required />
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-1.5">Alert at {form.alertAt}% usage</label>
              <input type="range" min="50" max="95" step="5" value={form.alertAt}
                onChange={e => setForm(p => ({ ...p, alertAt: Number(e.target.value) }))} className="w-full accent-orange-500" />
              <div className="flex justify-between text-xs text-neutral-400 mt-1"><span>50%</span><span>75%</span><span>95%</span></div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={15} />}
                Set Budget
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function Budget() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    try { const res = await axios.get(`${API_BASE}/budget/get`); setBudgets(Array.isArray(res.data.data) ? res.data.data : []); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchBudgets(); }, [fetchBudgets]);
  const handleSave = async (form) => { await axios.post(`${API_BASE}/budget/set`, form); fetchBudgets(); };
  const handleDelete = async (id) => { await axios.delete(`${API_BASE}/budget/${id}`); fetchBudgets(); };

  const totalBudget = budgets.reduce((s, b) => b.category !== "Total" ? s + b.limit : s, 0);
  const totalSpent = budgets.reduce((s, b) => b.category !== "Total" ? s + b.spent : s, 0);
  const overBudget = budgets.filter(b => b.isOverBudget);
  const nearLimit = budgets.filter(b => b.isNearLimit && !b.isOverBudget);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">Budget Planner</h1>
          <p className="text-neutral-500 text-sm">Set and track your monthly spending limits</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Set Budget
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Budget", value: `₹${totalBudget.toLocaleString("en-IN")}`, cls: "text-neutral-900 dark:text-neutral-100" },
          { label: "Total Spent", value: `₹${totalSpent.toLocaleString("en-IN")}`, cls: "text-orange-500" },
          { label: "Remaining", value: `₹${Math.abs(totalBudget - totalSpent).toLocaleString("en-IN")}`, cls: totalBudget - totalSpent >= 0 ? "text-green-500" : "text-red-500" },
        ].map(s => (
          <div key={s.label} className="card text-center py-4">
            <p className="text-xs text-neutral-500 mb-1">{s.label}</p>
            <p className={`text-xl font-bold ${s.cls}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {overBudget.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={16} className="text-red-400" />
            <p className="text-sm font-semibold text-red-400">Over Budget!</p>
          </div>
          <p className="text-xs text-red-400/80">{overBudget.map(b => b.category).join(", ")} exceeded budget.</p>
        </div>
      )}
      {nearLimit.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={16} className="text-yellow-400" />
            <p className="text-sm font-semibold text-yellow-400">Approaching Limit</p>
          </div>
          <p className="text-xs text-yellow-400/80">{nearLimit.map(b => `${b.category} (${b.percent}%)`).join(", ")}</p>
        </div>
      )}

      {totalBudget > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Overall Budget Usage</p>
            <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{Math.round((totalSpent / totalBudget) * 100)}%</span>
          </div>
          <div className="h-4 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`h-full rounded-full ${totalSpent > totalBudget ? "bg-red-500" : totalSpent / totalBudget > 0.8 ? "bg-yellow-500" : "bg-green-500"}`}
            />
          </div>
          <div className="flex justify-between text-xs text-neutral-400 mt-2">
            <span>₹{totalSpent.toLocaleString("en-IN")} spent</span>
            <span>₹{totalBudget.toLocaleString("en-IN")} total</span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-40 rounded-2xl shimmer" />)}
        </div>
      ) : budgets.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-4">
          <AnimatePresence>
            {budgets.map(budget => {
              const pct = Math.min(budget.percent || 0, 100);
              const isOver = budget.isOverBudget;
              const isNear = budget.isNearLimit && !isOver;
              const barColor = isOver ? "bg-red-500" : isNear ? "bg-yellow-500" : "bg-green-500";
              return (
                <motion.div key={budget._id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }} className="card hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{CATEGORY_EMOJI[budget.category] || "💰"}</span>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">{budget.category}</p>
                        <p className="text-xs text-neutral-400">Monthly limit</p>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(budget._id)}
                      className="w-7 h-7 rounded-lg hover:bg-red-500/10 flex items-center justify-center text-neutral-400 hover:text-red-500 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-neutral-500">₹{(budget.spent || 0).toLocaleString("en-IN")} spent</span>
                      <span className={`font-semibold ${isOver ? "text-red-500" : "text-neutral-700 dark:text-neutral-300"}`}>{pct}%</span>
                    </div>
                    <div className="h-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }} className={`h-full rounded-full ${barColor}`} />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">Budget: ₹{budget.limit.toLocaleString("en-IN")}</span>
                    <span className={isOver ? "text-red-500 font-medium" : "text-green-500 font-medium"}>
                      {isOver ? `Over by ₹${(budget.spent - budget.limit).toLocaleString("en-IN")}` : `₹${budget.remaining.toLocaleString("en-IN")} left`}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="card text-center py-14">
          <PiggyBank size={44} className="mx-auto text-neutral-700 mb-3" />
          <p className="font-semibold text-neutral-500 mb-1">No budgets set yet</p>
          <p className="text-sm text-neutral-400 mb-5">Set spending limits to stay on track</p>
          <button onClick={() => setShowModal(true)} className="btn-primary text-sm">Set Your First Budget</button>
        </div>
      )}

      <BudgetModal isOpen={showModal} onClose={() => setShowModal(false)} onSave={handleSave} />
    </div>
  );
}