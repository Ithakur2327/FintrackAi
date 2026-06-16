import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, PiggyBank, AlertTriangle, X } from "lucide-react";
import { MOCK_MODE, mockBudgets } from "../mock/data.js";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
const EXPENSE_CATEGORIES = ["Food","Housing","Transport","Shopping","Entertainment","Utilities","Healthcare","Education","Travel","Other","Total"];
const CATEGORY_EMOJI = { Food:"🍔", Housing:"🏠", Transport:"🚗", Shopping:"🛍️", Entertainment:"🎬", Utilities:"⚡", Healthcare:"💊", Education:"📚", Travel:"✈️", Total:"💰", Other:"🎯" };

/* Progress bar — natural, not AI-generated */
function ProgressBar({ pct, isOver, isNear }) {
  const cls = isOver
    ? "progress-red"
    : isNear
    ? "progress-amber"
    : "progress-emerald";
  return (
    <div className="progress-track">
      <motion.div
        className={`progress-fill ${cls}`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(pct, 100)}%` }}
        transition={{ duration: 0.85, ease: [0.25, 0.8, 0.25, 1] }}
      />
    </div>
  );
}

function BudgetModal({ isOpen, onClose, onSave }) {
  const [form, setForm] = useState({ category: "Food", limit: "", alertAt: 80 });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { await onSave(form); onClose(); setForm({ category: "Food", limit: "", alertAt: 80 }); }
    finally { setLoading(false); }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backdropFilter: "blur(8px)", backgroundColor: "rgba(0,0,0,0.55)" }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={e => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            className="bg-white dark:bg-[#161616] border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-sm shadow-2xl flex flex-col"
            style={{ maxHeight: "90vh" }}
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-amber-50 dark:bg-amber-500/10 rounded-xl flex items-center justify-center">
                  <PiggyBank size={15} className="text-amber-600 dark:text-amber-400" />
                </div>
                <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">Set Budget Limit</h2>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center transition-colors">
                <X size={15} className="text-neutral-500" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto p-5 space-y-4 flex-1">
              <div>
                <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">Category</label>
                <div className="select-wrapper">
                  <select className="input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                    {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_EMOJI[c]} {c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">Monthly Limit (₹)</label>
                <input type="number" className="input" placeholder="e.g. 5000" min="0"
                  value={form.limit} onChange={e => setForm(p => ({ ...p, limit: e.target.value }))} required />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Alert threshold</label>
                  <span className="text-sm font-bold text-amber-500 tabular-nums">{form.alertAt}%</span>
                </div>
                <input type="range" min="50" max="95" step="5" value={form.alertAt}
                  onChange={e => setForm(p => ({ ...p, alertAt: Number(e.target.value) }))}
                  className="w-full accent-amber-500 cursor-pointer" />
                <div className="flex justify-between text-xs text-neutral-400 mt-1">
                  <span>50%</span><span>75%</span><span>95%</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-5 py-4 border-t border-neutral-100 dark:border-neutral-800 shrink-0">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-1.5">
                {loading
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <Plus size={15} />}
                Set Budget
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Budget() {
  const [budgets, setBudgets]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    try {
      if (MOCK_MODE) { setBudgets(mockBudgets); setLoading(false); return; }
      const res = await axios.get(`${API_BASE}/budget/get`);
      setBudgets(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchBudgets(); }, [fetchBudgets]);

  const handleSave   = async (form) => { await axios.post(`${API_BASE}/budget/set`, form); fetchBudgets(); };
  const handleDelete = async (id)   => { await axios.delete(`${API_BASE}/budget/${id}`); fetchBudgets(); };

  const totalBudget = budgets.reduce((s, b) => b.category !== "Total" ? s + b.limit : s, 0);
  const totalSpent  = budgets.reduce((s, b) => b.category !== "Total" ? s + b.spent : s, 0);
  const overBudget  = budgets.filter(b => b.isOverBudget);
  const nearLimit   = budgets.filter(b => b.isNearLimit && !b.isOverBudget);
  const overallPct  = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">Budget Planner</h1>
          <p className="text-neutral-500 text-sm mt-0.5">Set and track your monthly spending limits</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary shrink-0">
          <Plus size={15} /> Set Budget
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {[
          { label: "Total Budget", value: `₹${totalBudget.toLocaleString("en-IN")}`, cls: "text-neutral-900 dark:text-neutral-100" },
          { label: "Spent",        value: `₹${totalSpent.toLocaleString("en-IN")}`,   cls: "text-amber-600 dark:text-amber-400" },
          { label: "Remaining",    value: `₹${Math.abs(totalBudget - totalSpent).toLocaleString("en-IN")}`,
            cls: totalBudget - totalSpent >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500" },
        ].map(s => (
          <div key={s.label} className="card text-center py-3 sm:py-4 px-2">
            <p className="text-[10px] sm:text-xs text-neutral-500 mb-1 truncate">{s.label}</p>
            <p className={`text-sm sm:text-xl font-bold ${s.cls} tabular-nums truncate`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {overBudget.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={15} className="text-red-400 shrink-0" />
            <p className="text-sm font-semibold text-red-400">Over Budget!</p>
          </div>
          <p className="text-xs text-red-400/80">{overBudget.map(b => b.category).join(", ")} exceeded the limit.</p>
        </div>
      )}
      {nearLimit.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={15} className="text-amber-500 shrink-0" />
            <p className="text-sm font-semibold text-amber-500">Approaching Limit</p>
          </div>
          <p className="text-xs text-amber-500/80">{nearLimit.map(b => `${b.category} (${b.percent}%)`).join(", ")}</p>
        </div>
      )}

      {/* Overall progress */}
      {totalBudget > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Overall Budget Usage</p>
            <span className={`text-sm font-black tabular-nums ${
              overallPct > 100 ? "text-red-500" : overallPct > 80 ? "text-amber-500" : "text-emerald-600 dark:text-emerald-400"
            }`}>{overallPct}%</span>
          </div>
          <ProgressBar pct={overallPct} isOver={overallPct > 100} isNear={overallPct > 80 && overallPct <= 100} />
          <div className="flex justify-between text-xs text-neutral-400 mt-2">
            <span>₹{totalSpent.toLocaleString("en-IN")} spent</span>
            <span>₹{totalBudget.toLocaleString("en-IN")} total</span>
          </div>
        </div>
      )}

      {/* Budget cards */}
      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-36 rounded-2xl shimmer" />)}
        </div>
      ) : budgets.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-4">
          <AnimatePresence>
            {budgets.map((budget, idx) => {
              const pct    = Math.min(budget.percent || 0, 100);
              const isOver = budget.isOverBudget;
              const isNear = budget.isNearLimit && !isOver;
              return (
                <motion.div key={budget._id} layout
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.04 } }}
                  exit={{ opacity: 0, scale: 0.95 }} className="card">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl leading-none">{CATEGORY_EMOJI[budget.category] || "💰"}</span>
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
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-neutral-500 tabular-nums">₹{(budget.spent || 0).toLocaleString("en-IN")} spent</span>
                      <span className={`font-bold tabular-nums ${isOver ? "text-red-500" : isNear ? "text-amber-500" : "text-neutral-700 dark:text-neutral-300"}`}>
                        {budget.percent}%
                      </span>
                    </div>
                    <ProgressBar pct={pct} isOver={isOver} isNear={isNear} />
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400 tabular-nums">₹{budget.limit.toLocaleString("en-IN")} limit</span>
                    <span className={`font-semibold tabular-nums ${isOver ? "text-red-500" : "text-emerald-600 dark:text-emerald-400"}`}>
                      {isOver
                        ? `Over ₹${(budget.spent - budget.limit).toLocaleString("en-IN")}`
                        : `₹${budget.remaining.toLocaleString("en-IN")} left`}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="card text-center py-14">
          <PiggyBank size={44} className="mx-auto text-neutral-300 dark:text-neutral-700 mb-3" />
          <p className="font-semibold text-neutral-600 dark:text-neutral-400 mb-1">No budgets set yet</p>
          <p className="text-sm text-neutral-400 mb-5">Set spending limits to stay on track</p>
          <button onClick={() => setShowModal(true)} className="btn-primary text-sm">Set Your First Budget</button>
        </div>
      )}

      <BudgetModal isOpen={showModal} onClose={() => setShowModal(false)} onSave={handleSave} />
    </div>
  );
}