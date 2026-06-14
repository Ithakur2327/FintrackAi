import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Target, Trash2, Pencil, X, PlusCircle, CheckCircle2,
  Shield, Plane, Laptop, Car, Home, GraduationCap, TrendingUp,
  Heart, Wallet, Trophy, Flag,
} from "lucide-react";
import { GlowingEffect } from "../components/Glowingeffect.jsx";
import { useTheme } from "../App.jsx";
import { MOCK_MODE, mockGoals } from "../mock/data.js";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
const GOAL_CATEGORIES = ["Emergency Fund","Vacation","Electronics","Vehicle","Home","Education","Investment","Wedding","Other"];
const GOAL_EMOJIS     = { "Emergency Fund":"🛡️", Vacation:"✈️", Electronics:"💻", Vehicle:"🚗", Home:"🏠", Education:"🎓", Investment:"📈", Wedding:"💍", Other:"🎯" };
const GOAL_COLORS     = ["#0d9488","#0891b2","#8b5cf6","#f97316","#ec4899","#eab308","#10b981","#ef4444"];

const GOAL_ICONS = {
  "Emergency Fund": Shield,
  Vacation: Plane,
  Electronics: Laptop,
  Vehicle: Car,
  Home: Home,
  Education: GraduationCap,
  Investment: TrendingUp,
  Wedding: Heart,
  Other: Target,
};

const ICON_BG = {
  "Emergency Fund": "bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400",
  Vacation: "bg-sky-50 dark:bg-sky-500/10 border-sky-100 dark:border-sky-500/20 text-sky-600 dark:text-sky-400",
  Electronics: "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400",
  Vehicle: "bg-orange-50 dark:bg-orange-500/10 border-orange-100 dark:border-orange-500/20 text-orange-600 dark:text-orange-400",
  Home: "bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20 text-amber-600 dark:text-amber-400",
  Education: "bg-purple-50 dark:bg-purple-500/10 border-purple-100 dark:border-purple-500/20 text-purple-600 dark:text-purple-400",
  Investment: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
  Wedding: "bg-pink-50 dark:bg-pink-500/10 border-pink-100 dark:border-pink-500/20 text-pink-600 dark:text-pink-400",
  Other: "bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400",
};

function GoalModal({ isOpen, onClose, onSave, editData }) {
  const [form, setForm] = useState({ title:"", description:"", targetAmount:"", savedAmount:"0", deadline:"", category:"Other", color:"#0d9488" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editData) {
      setForm({
        title: editData.title || "", description: editData.description || "",
        targetAmount: editData.targetAmount || "", savedAmount: editData.savedAmount || "0",
        deadline: editData.deadline ? new Date(editData.deadline).toISOString().split("T")[0] : "",
        category: editData.category || "Other", color: editData.color || "#0d9488",
      });
    } else {
      setForm({ title:"", description:"", targetAmount:"", savedAmount:"0", deadline:"", category:"Other", color:"#0d9488" });
    }
  }, [editData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try { await onSave({ ...form, targetAmount: Number(form.targetAmount), savedAmount: Number(form.savedAmount || 0), emoji: GOAL_EMOJIS[form.category] || "🎯" }); onClose(); }
    finally { setLoading(false); }
  };

  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div className="modal-overlay"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={e => e.target === e.currentTarget && onClose()}>
        <motion.div className="modal-card max-w-md max-h-[90vh]"
          initial={{ opacity: 0, y: 32, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 32, scale: 0.97 }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">{editData ? "Edit Goal" : "New Goal"}</h2>
            <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center transition-colors">
              <X size={15} className="text-neutral-500" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto no-visible-scrollbar">
            <div>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-1.5">Goal Title *</label>
              <input type="text" className="input" placeholder="e.g. Buy a new laptop" value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-1.5">Target (₹) *</label>
                <input type="number" className="input" placeholder="50000" min="1" value={form.targetAmount}
                  onChange={e => setForm(p => ({ ...p, targetAmount: e.target.value }))} required />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-1.5">Saved so far (₹)</label>
                <input type="number" className="input" placeholder="0" min="0" value={form.savedAmount}
                  onChange={e => setForm(p => ({ ...p, savedAmount: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-1.5">Category</label>
                <select className="input" value={form.category}
                  onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                  {GOAL_CATEGORIES.map(c => <option key={c} value={c}>{GOAL_EMOJIS[c]} {c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-1.5">Deadline</label>
                <input type="date" className="input" value={form.deadline}
                  onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))}
                  min={new Date().toISOString().split("T")[0]} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-2">Color</label>
              <div className="flex gap-2 flex-wrap">
                {GOAL_COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setForm(p => ({ ...p, color: c }))}
                    className={`w-8 h-8 rounded-full transition-all ${form.color === c ? "ring-2 ring-offset-2 ring-neutral-400 scale-110" : "hover:scale-105"}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-1.5">Notes</label>
              <textarea className="input resize-none" rows={2} placeholder="Optional notes..." value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={15} />}
                {editData ? "Update" : "Create Goal"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function AddAmountModal({ goal, onClose, onAdd }) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const remaining = goal.targetAmount - goal.savedAmount;
  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try { await onAdd(goal._id, Number(amount)); onClose(); }
    finally { setLoading(false); }
  };
  return (
    <AnimatePresence>
      <motion.div className="modal-overlay"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={e => e.target === e.currentTarget && onClose()}>
        <motion.div className="modal-card max-w-sm max-h-[90vh] p-6"
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
          <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mb-1">Add to Goal</h2>
          <p className="text-sm text-neutral-500 mb-5">{goal.emoji} {goal.title} · ₹{remaining.toLocaleString("en-IN")} remaining</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-1.5">Amount (₹)</label>
              <input type="number" className="input" placeholder={`Up to ₹${remaining.toLocaleString("en-IN")}`}
                min="1" max={remaining} value={amount} onChange={e => setAmount(e.target.value)} required autoFocus />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={loading} className="btn-green flex-1">
                {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <PlusCircle size={15} />}
                Add
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function GoalCard({ goal, onEdit, onDelete, onAddAmount }) {
  const { isDark } = useTheme();
  const pct = Math.min(goal.percent || 0, 100);
  const isCompleted = goal.isCompleted;
  const Icon = GOAL_ICONS[goal.category] || Target;
  const iconCls = ICON_BG[goal.category] || ICON_BG.Other;

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`card-big relative overflow-hidden ${isCompleted ? "opacity-80" : ""}`}>
      <GlowingEffect spread={30} glow={false} disabled={false} proximity={60}
        variant={isDark ? "white" : "dark"} borderWidth={1} />

      <div>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${iconCls}`}>
              <Icon size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm truncate">{goal.title}</p>
                {isCompleted && <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />}
              </div>
              <p className="text-xs text-neutral-400">{goal.category}</p>
            </div>
          </div>
          <div className="flex items-center gap-0.5 shrink-0 ml-2">
            {!isCompleted && (
              <button onClick={() => onAddAmount(goal)}
                className="w-7 h-7 rounded-lg hover:bg-emerald-500/10 flex items-center justify-center text-neutral-400 hover:text-emerald-500 transition-colors">
                <PlusCircle size={14} />
              </button>
            )}
            <button onClick={() => onEdit(goal)}
              className="w-7 h-7 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-indigo-500 transition-colors">
              <Pencil size={13} />
            </button>
            <button onClick={() => onDelete(goal._id)}
              className="w-7 h-7 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center justify-center text-neutral-400 hover:text-red-500 transition-colors">
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between mb-1.5">
            <span className="text-xs text-neutral-500 tabular-nums">₹{(goal.savedAmount || 0).toLocaleString("en-IN")}</span>
            <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">₹{goal.targetAmount.toLocaleString("en-IN")}</span>
          </div>
          <div className="progress-track h-2">
            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="progress-fill" style={{ backgroundColor: goal.color || "#0d9488" }} />
          </div>
          <p className="text-xs text-right mt-1.5 font-semibold tabular-nums" style={{ color: goal.color }}>{pct}%</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          {isCompleted ? (
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <Trophy size={13} />
              Goal Completed!
            </div>
          ) : (
            <>
              <div className="flex items-center gap-1 text-xs text-neutral-400">
                <Flag size={11} />
                <span>₹{(goal.targetAmount - goal.savedAmount).toLocaleString("en-IN")} to go</span>
              </div>
              {goal.daysLeft !== null && goal.daysLeft !== undefined && (
                <span className={`text-xs font-medium ${goal.daysLeft < 30 ? "text-orange-500" : "text-neutral-400"}`}>
                  {goal.daysLeft > 0 ? `${goal.daysLeft}d left` : "Past deadline"}
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function Goals() {
  const { isDark } = useTheme();
  const [goals, setGoals]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showModal, setShowModal]     = useState(false);
  const [editGoal, setEditGoal]       = useState(null);
  const [addAmountGoal, setAddAmountGoal] = useState(null);
  const [filter, setFilter]           = useState("all");

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    try {
      if (MOCK_MODE) { setGoals(mockGoals); setLoading(false); return; }
      const res = await axios.get(`${API_BASE}/goals/get`);
      setGoals(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  const handleCreate    = async (data) => { await axios.post(`${API_BASE}/goals/create`, data); fetchGoals(); };
  const handleUpdate    = async (data) => { await axios.put(`${API_BASE}/goals/update/${editGoal._id}`, data); setEditGoal(null); fetchGoals(); };
  const handleDelete    = async (id)   => { await axios.delete(`${API_BASE}/goals/${id}`); fetchGoals(); };
  const handleAddAmount = async (id, amount) => { await axios.post(`${API_BASE}/goals/add-amount/${id}`, { amount }); fetchGoals(); };

  const filtered       = goals.filter(g => filter === "active" ? !g.isCompleted : filter === "completed" ? g.isCompleted : true);
  const totalSaved     = goals.filter(g => !g.isCompleted).reduce((s, g) => s + g.savedAmount, 0);
  const totalTarget    = goals.filter(g => !g.isCompleted).reduce((s, g) => s + g.targetAmount, 0);
  const completedCount = goals.filter(g => g.isCompleted).length;
  const overallPct     = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">Savings Goals</h1>
          <p className="text-neutral-500 text-sm mt-0.5">Track your financial milestones</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary shrink-0">
          <Plus size={15} /> New Goal
        </button>
      </div>

      {/* Summary stats — same style as Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Active Goals",   value: String(goals.filter(g => !g.isCompleted).length), cls: "text-neutral-900 dark:text-neutral-100", Icon: Target },
          { label: "Total Saved",    value: `₹${totalSaved.toLocaleString("en-IN")}`,         cls: "text-emerald-600 dark:text-emerald-400", Icon: Wallet },
          { label: "Completed",      value: String(completedCount),                            cls: "text-indigo-600 dark:text-indigo-400",  Icon: Trophy },
          { label: "Overall Progress",value: `${overallPct}%`,                                cls: "text-orange-500",                        Icon: Flag },
        ].map(s => {
          const SI = s.Icon;
          return (
            <div key={s.label} className="card-big relative overflow-hidden">
              <GlowingEffect spread={28} glow={false} disabled={false} proximity={72}
                variant={isDark ? "white" : "dark"} borderWidth={1.5} />
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center border bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                  <SI size={16} className="text-neutral-500 dark:text-neutral-400" />
                </div>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1 tracking-tight">{s.label}</p>
              <p className={`text-xl font-bold tabular-nums tracking-tight ${s.cls}`}>{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[{ l: "All", v: "all" }, { l: "Active", v: "active" }, { l: "Completed", v: "completed" }].map(f => (
          <button key={f.v} onClick={() => setFilter(f.v)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              filter === f.v
                ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                : "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800"
            }`}>
            {f.l}
          </button>
        ))}
      </div>

      {/* Goal cards */}
      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-52 rounded-2xl shimmer" />)}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-4">
          <AnimatePresence>
            {filtered.map(goal => (
              <GoalCard key={goal._id} goal={goal}
                onEdit={setEditGoal} onDelete={handleDelete} onAddAmount={setAddAmountGoal} />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="card-big text-center py-14">
          <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center mx-auto mb-4">
            <Target size={24} className="text-neutral-400" />
          </div>
          <p className="font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
            {filter === "completed" ? "No completed goals yet" : "No goals yet"}
          </p>
          <p className="text-sm text-neutral-400 mb-5">Set a savings goal to get started</p>
          {filter !== "completed" && (
            <button onClick={() => setShowModal(true)} className="btn-primary text-sm">Create Your First Goal</button>
          )}
        </div>
      )}

      <GoalModal isOpen={showModal} onClose={() => setShowModal(false)} onSave={handleCreate} />
      {editGoal && <GoalModal isOpen={!!editGoal} onClose={() => setEditGoal(null)} onSave={handleUpdate} editData={editGoal} />}
      {addAmountGoal && <AddAmountModal goal={addAmountGoal} onClose={() => setAddAmountGoal(null)} onAdd={handleAddAmount} />}
    </div>
  );
}