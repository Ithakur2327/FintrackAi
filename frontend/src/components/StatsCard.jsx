import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function StatsCard({ title, value, change, icon: Icon, color = "orange", prefix = "₹", subtitle }) {
  const colors = {
    orange: { bg: "bg-orange-500/10 dark:bg-orange-500/15", icon: "text-orange-500" },
    green:  { bg: "bg-green-500/10 dark:bg-green-500/15",  icon: "text-green-500" },
    blue:   { bg: "bg-blue-500/10 dark:bg-blue-500/15",    icon: "text-blue-400" },
    purple: { bg: "bg-purple-500/10 dark:bg-purple-500/15", icon: "text-purple-400" },
    red:    { bg: "bg-red-500/10 dark:bg-red-500/15",      icon: "text-red-400" },
  };
  const c = colors[color] || colors.orange;
  const isPositive = change > 0;
  const isNeutral = change === 0 || change === undefined;

  const formatValue = (v) => {
    if (typeof v !== "number") return v;
    if (Math.abs(v) >= 10000000) return `${prefix}${(v / 10000000).toFixed(1)}Cr`;
    if (Math.abs(v) >= 100000)   return `${prefix}${(v / 100000).toFixed(1)}L`;
    if (Math.abs(v) >= 1000)     return `${prefix}${(v / 1000).toFixed(1)}K`;
    return `${prefix}${v.toLocaleString("en-IN")}`;
  };

  return (
    <div className="card-hover group">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-500 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1.5 tracking-tight">{formatValue(value)}</p>
          {subtitle && <p className="text-xs text-neutral-400 mt-0.5">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center shrink-0 ml-3`}>
            <Icon size={18} className={c.icon} />
          </div>
        )}
      </div>

      {change !== undefined && (
        <div className="flex items-center gap-1.5 mt-3">
          {isNeutral ? (
            <Minus size={13} className="text-neutral-400" />
          ) : isPositive ? (
            <TrendingUp size={13} className="text-green-500" />
          ) : (
            <TrendingDown size={13} className="text-red-400" />
          )}
          <span className={`text-xs font-semibold ${isNeutral ? "text-neutral-400" : isPositive ? "text-green-500" : "text-red-400"}`}>
            {isNeutral ? "No change" : `${isPositive ? "+" : ""}${change}%`}
          </span>
          <span className="text-xs text-neutral-400">vs last period</span>
        </div>
      )}
    </div>
  );
}