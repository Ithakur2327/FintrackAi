import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { GlowingEffect } from "./GlowingEffect.jsx";
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
      {/* Glowing border effect — white in dark mode, dark in light mode */}
      <GlowingEffect
        disabled={false}
        spread={24}
        glow={false}
        borderWidth={1.5}
        proximity={64}
        variant={isDark ? "white" : "dark"}
      />

      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
            {title}
          </p>
          <p className="text-2xl font-black text-neutral-900 dark:text-neutral-50 mt-1.5 tracking-tight tabular-nums">
            {formatValue(value)}
          </p>
          {subtitle && <p className="text-xs text-neutral-400 mt-0.5">{subtitle}</p>}
        </div>

        {Icon && (
          <div className="icon-box ml-3">
            <Icon size={17} className="text-neutral-600 dark:text-neutral-300" />
          </div>
        )}
      </div>

      {change !== undefined && (
        <div className="flex items-center gap-1.5 mt-3">
          {isNeutral ? (
            <Minus size={12} className="text-neutral-400" />
          ) : isPositive ? (
            <TrendingUp size={12} className="text-neutral-700 dark:text-neutral-300" />
          ) : (
            <TrendingDown size={12} className="text-neutral-500 dark:text-neutral-500" />
          )}
          <span className={`text-xs font-bold ${isNeutral ? "text-neutral-400" : isPositive ? "text-neutral-800 dark:text-neutral-200" : "text-neutral-500"}`}>
            {isNeutral ? "No change" : `${isPositive ? "+" : ""}${change}%`}
          </span>
          <span className="text-xs text-neutral-400">vs last period</span>
        </div>
      )}
    </div>
  );
}