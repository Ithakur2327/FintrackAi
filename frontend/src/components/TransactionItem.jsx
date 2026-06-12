import { useState } from "react";
import { Pencil, Trash2, ChevronDown, ChevronUp, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TransactionItem({ transaction, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isIncome = transaction.type === "income";
  const date     = new Date(transaction.date);
  const formattedDate = date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });

  const handleDelete = async () => {
    setDeleting(true);
    try { await onDelete(transaction._id || transaction.id, transaction.type); }
    finally { setDeleting(false); }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16 }}
      className="bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden hover:border-neutral-300 dark:hover:border-neutral-700 transition-all"
    >
      <div className="flex items-center gap-3 px-3.5 py-3">
        {/* Amount direction indicator */}
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
          isIncome
            ? "bg-neutral-900 dark:bg-white text-white dark:text-black"
            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700"
        }`}>
          {isIncome ? "+" : "−"}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">{transaction.description}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded-md font-medium border border-neutral-200 dark:border-neutral-700">
              {transaction.category}
            </span>
            <span className="text-[11px] text-neutral-400">{formattedDate}</span>
          </div>
        </div>

        <div className="text-right shrink-0 mr-1">
          <p className={`text-sm font-black tabular-nums ${
            isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-neutral-700 dark:text-neutral-300"
          }`}>
            {isIncome ? "+" : "−"}₹{Number(transaction.amount).toLocaleString("en-IN")}
          </p>
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          {(transaction.note || transaction.tags?.length > 0) && (
            <button onClick={() => setExpanded(p => !p)}
              className="w-7 h-7 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 flex items-center justify-center text-neutral-400 transition-colors">
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          )}
          <button onClick={() => onEdit(transaction)}
            className="w-7 h-7 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 flex items-center justify-center text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors">
            <Pencil size={11} />
          </button>
          <button onClick={handleDelete} disabled={deleting}
            className="w-7 h-7 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center justify-center text-neutral-400 hover:text-red-500 transition-colors disabled:opacity-40">
            <Trash2 size={11} />
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
            <div className="px-4 pb-3 pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-1.5">
              {transaction.note && (
                <p className="text-xs text-neutral-500"><span className="font-semibold">Note:</span> {transaction.note}</p>
              )}
              {transaction.tags?.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Tag size={10} className="text-neutral-400" />
                  {transaction.tags.map(tag => (
                    <span key={tag} className="text-[11px] bg-neutral-100 dark:bg-neutral-800 text-neutral-500 px-2 py-0.5 rounded-full border border-neutral-200 dark:border-neutral-700">{tag}</span>
                  ))}
                </div>
              )}
              {transaction.isRecurring && (
                <p className="text-xs text-neutral-500 font-medium">↺ Recurring · {transaction.recurringFrequency}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}