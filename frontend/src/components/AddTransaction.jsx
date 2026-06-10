import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Save } from "lucide-react";

const EXPENSE_CATEGORIES = ["Food", "Housing", "Transport", "Shopping", "Entertainment", "Utilities", "Healthcare", "Education", "Travel", "Other"];
const INCOME_CATEGORIES = ["Salary", "Freelance", "Investment", "Business", "Gift", "Rental", "Bonus", "Other"];

const DEFAULT_FORM = {
  description: "",
  amount: "",
  category: "Food",
  date: new Date().toISOString().split("T")[0],
  type: "expense",
  note: "",
  tags: "",
  isRecurring: false,
  recurringFrequency: "none",
};

export default function AddTransaction({ isOpen, onClose, onSubmit, editData = null, defaultType = "expense" }) {
  const [form, setForm] = useState({ ...DEFAULT_FORM, type: defaultType });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    if (!form.description || !form.amount || !form.category) {
      setError("Please fill all required fields");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await onSubmit({
        ...form,
        amount: Number(form.amount),
        tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save transaction");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800">
              {editData ? "Edit Transaction" : "Add Transaction"}
            </h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors">
              <X size={16} className="text-slate-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</div>}

            {/* Type Toggle */}
            <div className="flex rounded-xl overflow-hidden border border-slate-200">
              {["expense", "income"].map(t => (
                <button key={t} type="button"
                  onClick={() => setForm(p => ({ ...p, type: t, category: t === "income" ? "Salary" : "Food" }))}
                  className={`flex-1 py-2.5 text-sm font-semibold transition-all capitalize ${form.type === t ? (t === "income" ? "bg-teal-600 text-white" : "bg-orange-500 text-white") : "text-slate-500 hover:bg-slate-50"}`}>
                  {t === "income" ? "💚 Income" : "🔴 Expense"}
                </button>
              ))}
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Description *</label>
              <input type="text" className="input" placeholder="e.g. Lunch at restaurant" value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))} required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">Amount *</label>
                <input type="number" className="input" placeholder="0.00" min="0" step="0.01" value={form.amount}
                  onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} required />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">Date *</label>
                <input type="date" className="input" value={form.date}
                  onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Category *</label>
              <select className="input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Note</label>
              <textarea className="input resize-none" rows={2} placeholder="Optional note..." value={form.note}
                onChange={e => setForm(p => ({ ...p, note: e.target.value }))} />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Tags <span className="text-slate-400 font-normal">(comma separated)</span></label>
              <input type="text" className="input" placeholder="e.g. work, personal, urgent" value={form.tags}
                onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} />
            </div>

            <div className="flex items-center gap-3">
              <input type="checkbox" id="recurring" checked={form.isRecurring}
                onChange={e => setForm(p => ({ ...p, isRecurring: e.target.checked }))}
                className="w-4 h-4 accent-teal-600" />
              <label htmlFor="recurring" className="text-sm font-medium text-slate-700">Recurring Transaction</label>
            </div>

            {form.isRecurring && (
              <select className="input" value={form.recurringFrequency}
                onChange={e => setForm(p => ({ ...p, recurringFrequency: e.target.value }))}>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            )}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : editData ? <Save size={16} /> : <Plus size={16} />}
                {loading ? "Saving..." : editData ? "Update" : "Add"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
