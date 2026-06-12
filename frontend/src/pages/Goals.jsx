import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Target, Trash2, Pencil, X, PlusCircle, CheckCircle2 } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

const GOAL_CATEGORIES = ["Emergency Fund", "Vacation", "Electronics", "Vehicle", "Home", "Education", "Investment", "Wedding", "Other"];
const GOAL_EMOJIS = { "Emergency Fund": "🛡️", Vacation: "✈️", Electronics: "💻", Vehicle: "🚗", Home: "🏠", Education: "🎓", Investment: "📈", Wedding: "💍", Other: "🎯" };
const GOAL_COLORS = ["#0d9488", "#0891b2", "#8b5cf6", "#f97316", "#ec4899", "#eab308", "#10b981", "#ef4444"];

function GoalModal({ isOpen, onClose, onSave, editData }) {
  const [form, setForm] = useState({ title: "", description: "", targetAmount: "", savedAmount: "", deadline: "", category: "Other", emoji: "🎯", color: "#0d9488" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editData) {
      setForm({
        title: editData.title || "",
        description: editData.description || "",
        targetAmount: editData.targetAmount || "",
        savedAmount: editData.savedAmount || "",
        deadline: editData.deadline ? new Date(editData.deadline).toISOString().split("T")[0] : "",
        category: editData.category || "Other",
        emoji: editData.emoji || "🎯",
        color: editData.color || "#0d9488",
      });
    } else {
      setForm({ title: "", description: "", targetAmount: "", savedAmount: "0", deadline: "", category: "Other", emoji: "🎯", color: "#0d9488" });
    }
  }, [editData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({ ...form, targetAmount: Number(form.targetAmount), savedAmount: Number(form.savedAmount || 0) });
      onClose();
    } finally { setLoading(false); }
  };

  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={e => e.target === e.currentTarget && onClose()}>
        <motion.div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{editData ? "Edit Goal" : "New Goal"}</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center">
              <X size={16} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-1.5">Goal Title *</label>
              <input type="text" className="input" placeholder="e.g. Buy a new laptop" value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-1.5">Target Amount *</label>
                <input type="number" className="input" placeholder="50000" min="1" value={form.targetAmount}
                  onChange={e => setForm(p => ({ ...p, targetAmount: e.target.value }))} required />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-1.5">Already Saved</label>
                <input type="number" className="input" placeholder="0" min="0" value={form.savedAmount}
                  onChange={e => setForm(p => ({ ...p, savedAmount: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-1.5">Category</label>
                <select className="input" value={form.category}
                  onChange={e => setForm(p => ({ ...p, category: e.target.value, emoji: GOAL_EMOJIS[e.target.value] || "🎯" }))}>
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
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-1.5">Color</label>
              <div className="flex gap-2 flex-wrap">
                {GOAL_COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setForm(p => ({ ...p, color: c }))}
                    className={`w-8 h-8 rounded-full transition-all ${form.color === c ? "ring-2 ring-offset-2 ring-slate-400 scale-110" : ""}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-1.5">Description</label>
              <textarea className="input resize-none" rows={2} placeholder="Optional notes..." value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
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
    e.preventDefault();
    setLoading(true);
    try { await onAdd(goal._id, Number(amount)); onClose(); }
    finally { setLoading(false); }
  };

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={e => e.target === e.currentTarget && onClose()}>
        <motion.div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-sm shadow-2xl p-6"
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-1">Add to Goal</h2>
          <p className="text-sm text-neutral-500 mb-5">{goal.emoji} {goal.title} · ₹{remaining.toLocaleString("en-IN")} remaining</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-1.5">Amount to Add (₹)</label>
              <input type="number" className="input" placeholder={`Max ₹${remaining.toLocaleString("en-IN")}`}
                min="1" max={remaining} value={amount} onChange={e => setAmount(e.target.value)} required autoFocus />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
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

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const [addAmountGoal, setAddAmountGoal] = useState(null);
  const [filter, setFilter] = useState("all");

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/goals/get`);
      setGoals(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  const handleCreate = async (data) => { await axios.post(`${API_BASE}/goals/create`, data); fetchGoals(); };
  const handleUpdate = async (data) => { await axios.put(`${API_BASE}/goals/update/${editGoal._id}`, data); setEditGoal(null); fetchGoals(); };
  const handleDelete = async (id) => { await axios.delete(`${API_BASE}/goals/${id}`); fetchGoals(); };
  const handleAddAmount = async (id, amount) => { await axios.post(`${API_BASE}/goals/add-amount/${id}`, { amount }); fetchGoals(); };

  const filtered = goals.filter(g => {
    if (filter === "active") return !g.isCompleted;
    if (filter === "completed") return g.isCompleted;
    return true;
  });

  const totalTarget = goals.filter(g => !g.isCompleted).reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved = goals.filter(g => !g.isCompleted).reduce((s, g) => s + g.savedAmount, 0);
  const completedCount = goals.filter(g => g.isCompleted).length;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Savings Goals</h1>
          <p className="text-neutral-500 text-sm">Track your financial dreams</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> New Goal
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center py-4">
          <p className="text-xs text-neutral-500 mb-1">Active Goals</p>
          <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{goals.filter(g => !g.isCompleted).length}</p>
        </div>
        <div className="card text-center py-4">
          <p className="text-xs text-neutral-500 mb-1">Total Saved</p>
          <p className="text-xl font-bold text-green-500">₹{totalSaved.toLocaleString("en-IN")}</p>
        </div>
        <div className="card text-center py-4">
          <p className="text-xs text-neutral-500 mb-1">Completed 🎉</p>
          <p className="text-xl font-bold text-green-600">{completedCount}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {[{ l: "All", v: "all" }, { l: "Active", v: "active" }, { l: "Completed", v: "completed" }].map(f => (
          <button key={f.v} onClick={() => setFilter(f.v)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filter === f.v ? "bg-green-500 text-white" : "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900"}`}>
            {f.l}
          </button>
        ))}
      </div>

      {/* Goal Cards */}
      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-52 rounded-2xl shimmer" />)}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-4">
          <AnimatePresence>
            {filtered.map(goal => {
              const pct = Math.min(goal.percent || 0, 100);
              const isCompleted = goal.isCompleted;

              return (
                <motion.div key={goal._id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`card hover:shadow-md transition-shadow border-l-4 ${isCompleted ? "opacity-80" : ""}`}
                  style={{ borderLeftColor: goal.color || "#0d9488" }}>
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{goal.emoji}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">{goal.title}</p>
                          {isCompleted && <CheckCircle2 size={14} className="text-green-500" />}
                        </div>
                        <p className="text-xs text-neutral-400">{goal.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {!isCompleted && (
                        <button onClick={() => setAddAmountGoal(goal)}
                          className="w-7 h-7 rounded-lg hover:bg-green-500/10 flex items-center justify-center text-neutral-400 hover:text-green-500 transition-colors">
                          <PlusCircle size={14} />
                        </button>
                      )}
                      <button onClick={() => setEditGoal(goal)}
                        className="w-7 h-7 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-blue-600 transition-colors">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => handleDelete(goal._id)}
                        className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-neutral-400 hover:text-red-500 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-neutral-600 dark:text-neutral-400">₹{(goal.savedAmount || 0).toLocaleString("en-IN")}</span>
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100">₹{goal.targetAmount.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="h-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: goal.color || "#0d9488" }}
                      />
                    </div>
                    <p className="text-xs text-right mt-1" style={{ color: goal.color }}>{pct}% saved</p>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    {isCompleted ? (
                      <span className="text-green-600 font-semibold">🎉 Goal Completed!</span>
                    ) : (
                      <>
                        <span>₹{(goal.targetAmount - goal.savedAmount).toLocaleString("en-IN")} to go</span>
                        {goal.daysLeft !== null && (
                          <span className={`font-medium ${goal.daysLeft < 30 ? "text-orange-500" : ""}`}>
                            {goal.daysLeft > 0 ? `${goal.daysLeft}d left` : "Past deadline"}
                          </span>
                        )}
                        {goal.monthlyNeeded && goal.daysLeft > 0 && (
                          <span className="text-green-500 font-medium">₹{goal.monthlyNeeded.toLocaleString("en-IN")}/mo</span>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="card text-center py-14">
          <Target size={44} className="mx-auto text-neutral-700 mb-3" />
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