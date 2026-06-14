import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Save } from "lucide-react";

const EXPENSE_CATEGORIES = ["Food","Housing","Transport","Shopping","Entertainment","Utilities","Healthcare","Education","Travel","Other"];
const INCOME_CATEGORIES  = ["Salary","Freelance","Investment","Business","Gift","Rental","Bonus","Other"];
const DEFAULT_FORM = {
  description: "", amount: "", category: "Food",
  date: new Date().toISOString().split("T")[0],
  type: "expense", note: "", tags: "", isRecurring: false, recurringFrequency: "none",
};

export default function AddTransaction({ isOpen, onClose, onSubmit, editData = null, defaultType = "expense" }) {
  const [form, setForm]     = useState({ ...DEFAULT_FORM, type: defaultType });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  useEffect(() => {
    if (editData) {
      setForm({
        description: editData.description || "",
        amount: editData.amount || "",
        category: editData.category || "Other",
        date: editData.date ? new Date(editData.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        type: editData.type || "expense",
        note: editData.note || "",
        tags: Array.isArray(editData.tags) ? editData.tags.join(", ") : "",
        isRecurring: editData.isRecurring || false,
        recurringFrequency: editData.recurringFrequency || "none",
      });
    } else {
      setForm({ ...DEFAULT_FORM, type: defaultType });
    }
    setError("");
  }, [editData, isOpen, defaultType]);

  const categories = form.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description || !form.amount || !form.category) { setError("Please fill all required fields"); return; }
    setError(""); setLoading(true);
    try {
      await onSubmit({ ...form, amount: Number(form.amount), tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [] });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save transaction");
    } finally { setLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          className="modal-card max-w-md max-h-[90vh]"
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 32, scale: 0.97 }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              {editData ? "Edit Transaction" : "New Transaction"}
            </h2>
            <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center transition-colors">
              <X size={15} className="text-neutral-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto no-visible-scrollbar">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            {/* Type toggle */}
            <div className="flex rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
              {["expense", "income"].map(t => (
                <button key={t} type="button"
                  onClick={() => setForm(p => ({ ...p, type: t, category: t === "income" ? "Salary" : "Food" }))}
                  className={`flex-1 py-2.5 text-sm font-semibold transition-all capitalize ${
                    form.type === t
                      ? "bg-neutral-900 dark:bg-white text-white dark:text-black"
                      : "text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">Description *</label>
              <input type="text" className="input" placeholder="e.g. Monthly rent" value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))} required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">Amount (₹) *</label>
                <input type="number" className="input" placeholder="0.00" min="0" step="0.01" value={form.amount}
                  onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} required />
              </div>
              <div>
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">Date</label>
                <input type="date" className="input" value={form.date}
                  onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">Category *</label>
              <select className="input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">Note</label>
              <textarea className="input resize-none" rows={2} placeholder="Optional note..." value={form.note}
                onChange={e => setForm(p => ({ ...p, note: e.target.value }))} />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">Tags</label>
              <input type="text" className="input" placeholder="work, urgent, monthly" value={form.tags}
                onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} />
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setForm(p => ({ ...p, isRecurring: !p.isRecurring }))}
                className={`w-9 h-5 rounded-full transition-colors relative ${form.isRecurring ? "bg-neutral-900 dark:bg-white" : "bg-neutral-200 dark:bg-neutral-700"}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white dark:bg-neutral-900 shadow transition-transform ${form.isRecurring ? "translate-x-4" : "translate-x-0.5"}`} />
              </div>
              <span className="text-sm text-neutral-600 dark:text-neutral-400 select-none">Recurring transaction</span>
            </label>

            {form.isRecurring && (
              <select className="input" value={form.recurringFrequency}
                onChange={e => setForm(p => ({ ...p, recurringFrequency: e.target.value }))}>
                <option value="none">Select frequency</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            )}

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading
                  ? <span className="w-4 h-4 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" />
                  : editData ? <Save size={14} /> : <Plus size={14} />
                }
                {loading ? "Saving…" : editData ? "Save" : "Add"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}