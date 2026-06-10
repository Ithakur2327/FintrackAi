import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function StatsCard({ title, value, change, icon: Icon, color = "teal", prefix = "₹", subtitle }) {
  const colors = {
    teal: { bg: "bg-teal-50", text: "text-teal-600", icon: "bg-teal-100 text-teal-600" },
    orange: { bg: "bg-orange-50", text: "text-orange-600", icon: "bg-orange-100 text-orange-600" },
    blue: { bg: "bg-blue-50", text: "text-blue-600", icon: "bg-blue-100 text-blue-600" },
    purple: { bg: "bg-purple-50", text: "text-purple-600", icon: "bg-purple-100 text-purple-600" },
    green: { bg: "bg-green-50", text: "text-green-600", icon: "bg-green-100 text-green-600" },
    red: { bg: "bg-red-50", text: "text-red-600", icon: "bg-red-100 text-red-600" },
  };

  const c = colors[color] || colors.teal;
  const isPositive = change > 0;
  const isNeutral = change === 0;

  const formatValue = (v) => {
    if (typeof v !== "number") return v;
    if (Math.abs(v) >= 10000000) return `${prefix}${(v / 10000000).toFixed(1)}Cr`;
    if (Math.abs(v) >= 100000) return `${prefix}${(v / 100000).toFixed(1)}L`;
    if (Math.abs(v) >= 1000) return `${prefix}${(v / 1000).toFixed(1)}K`;
    return `${prefix}${v.toLocaleString("en-IN")}`;
  };

  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{formatValue(value)}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl ${c.icon} flex items-center justify-center shrink-0`}>
            <Icon size={18} />
          </div>
        )}
      </div>

      {change !== undefined && (
        <div className="flex items-center gap-1.5 mt-3">
          {isNeutral ? (
            <Minus size={14} className="text-slate-400" />
          ) : isPositive ? (
            <TrendingUp size={14} className="text-green-500" />
          ) : (
            <TrendingDown size={14} className="text-red-500" />
          )}
          <span className={`text-xs font-semibold ${isNeutral ? "text-slate-400" : isPositive ? "text-green-600" : "text-red-600"}`}>
            {isNeutral ? "No change" : `${isPositive ? "+" : ""}${change}%`}
          </span>
          <span className="text-xs text-slate-400">vs last period</span>
        </div>
      )}
    </div>
  );
}
