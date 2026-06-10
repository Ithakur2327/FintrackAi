import { useState } from "react";
import { Pencil, Trash2, ChevronDown, ChevronUp, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORY_EMOJI = {
  Food: "🍔", Housing: "🏠", Transport: "🚗", Shopping: "🛍️",
  Entertainment: "🎬", Utilities: "⚡", Healthcare: "💊", Education: "📚",
  Travel: "✈️", Other: "💰", Salary: "💼", Freelance: "💻",
  Investment: "📈", Business: "🏢", Gift: "🎁", Rental: "🏘️", Bonus: "🎉",
};

export default function TransactionItem({ transaction, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isIncome = transaction.type === "income";
  const date = new Date(transaction.date);
  const formattedDate = date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const emoji = CATEGORY_EMOJI[transaction.category] || (isIncome ? "💚" : "🔴");

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(transaction._id || transaction.id, transaction.type);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white border border-slate-100 rounded-xl overflow-hidden hover:shadow-sm transition-shadow"
    >
      <div className="flex items-center gap-3 p-4">
        {/* Emoji Icon */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${isIncome ? "bg-teal-50" : "bg-orange-50"}`}>
          {emoji}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">{transaction.description}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isIncome ? "bg-teal-50 text-teal-700" : "bg-orange-50 text-orange-700"}`}>
              {transaction.category}
            </span>
            <span className="text-xs text-slate-400">{formattedDate}</span>
          </div>
        </div>

        {/* Amount */}
        <div className="text-right shrink-0">
          <p className={`text-sm font-bold ${isIncome ? "text-teal-600" : "text-orange-600"}`}>
            {isIncome ? "+" : "-"}₹{Number(transaction.amount).toLocaleString("en-IN")}
          </p>
          <p className={`text-xs ${isIncome ? "text-teal-400" : "text-orange-400"}`}>
            {isIncome ? "Income" : "Expense"}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {(transaction.note || transaction.tags?.length > 0) && (
            <button onClick={() => setExpanded(p => !p)} className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
          <button onClick={() => onEdit(transaction)} className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors">
            <Pencil size={13} />
          </button>
          <button onClick={handleDelete} disabled={deleting} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 pt-0 border-t border-slate-50 space-y-2">
              {transaction.note && (
                <p className="text-xs text-slate-500"><span className="font-medium">Note:</span> {transaction.note}</p>
              )}
              {transaction.tags?.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Tag size={12} className="text-slate-400" />
                  {transaction.tags.map(tag => (
                    <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
              )}
              {transaction.isRecurring && (
                <p className="text-xs text-purple-600 font-medium">🔄 Recurring — {transaction.recurringFrequency}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
