import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { GlowingEffect } from "./Glowingeffect.jsx";
import { useTheme } from "../App.jsx";

export default function StatsCard({ title, value, change, icon: Icon, prefix = "₹", subtitle }) {
  const { isDark } = useTheme();

  const formatValue = (v) => {
    if (typeof v !== "number") return v;
    if (Math.abs(v) >= 10000000) return `${prefix}${(v / 10000000).toFixed(1)}Cr`;
    if (Math.abs(v) >= 100000)   return `${prefix}${(v / 100000).toFixed(1)}L`;
    if (Math.abs(v) >= 1000)     return `${prefix}${(v / 1000).toFixed(1)}K`;
    return `${prefix}${v.toLocaleString("en-IN")}`;
  };

  const isPositive = change > 0;
  const isNeutral  = change === 0 || change === undefined;

  return (
    <div className="relative card group overflow-visible">
      <GlowingEffect
        disabled={false}
        spread={28}
        glow={false}
        borderWidth={1.5}
        proximity={72}
        variant={isDark ? "white" : "dark"}
      />

      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
            {title}
          </p>
          <p className="text-2xl font-black text-neutral-900 dark:text-neutral-50 mt-1.5 tracking-tight tabular-nums">
            {formatValue(value)}
          </p>
          {subtitle && <p className="text-xs text-neutral-400 mt-0.5">{subtitle}</p>}
        </div>

        {Icon && (
          <div className="icon-box ml-3">
            <Icon size={16} className="text-neutral-500 dark:text-neutral-400" />
          </div>
        )}
      </div>

      {change !== undefined && (
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
          {isNeutral ? (
            <Minus size={11} className="text-neutral-400" />
          ) : isPositive ? (
            <TrendingUp size={11} className="text-emerald-500" />
          ) : (
            <TrendingDown size={11} className="text-red-400" />
          )}
          <span className={`text-xs font-bold ${
            isNeutral ? "text-neutral-400" :
            isPositive ? "text-emerald-600 dark:text-emerald-400" :
            "text-red-500 dark:text-red-400"
          }`}>
            {isNeutral ? "No change" : `${isPositive ? "+" : ""}${change}%`}
          </span>
          <span className="text-xs text-neutral-400">vs last period</span>
        </div>
      )}
    </div>
  );
}