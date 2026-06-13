import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "../lib/utils.js";
import { useTheme } from "../App.jsx";

const DIRECTIONS = ["TOP", "LEFT", "BOTTOM", "RIGHT"];

const makeArcs = (isDark) => {
  const w = isDark ? "rgba(255,255,255,0.95)" : "rgba(0,0,0,0.85)";
  const t = isDark ? "rgba(255,255,255,0)" : "rgba(0,0,0,0)";
  return {
    TOP:    `radial-gradient(22% 55% at 50% 0%,   ${w} 0%, ${t} 100%)`,
    LEFT:   `radial-gradient(17% 45% at 0% 50%,   ${w} 0%, ${t} 100%)`,
    BOTTOM: `radial-gradient(22% 55% at 50% 100%,  ${w} 0%, ${t} 100%)`,
    RIGHT:  `radial-gradient(17% 44% at 100% 50%,  ${w} 0%, ${t} 100%)`,
  };
};

const nextDir = (dir, cw) => {
  const i = DIRECTIONS.indexOf(dir);
  return DIRECTIONS[cw ? (i - 1 + 4) % 4 : (i + 1) % 4];
};

export function AskAIButton({
  children,
  onClick,
  className,
  duration = 1.4,
  clockwise = true,
  disabled,
  as: Tag = "button",
}) {
  const { isDark } = useTheme();
  const [direction, setDirection] = useState("TOP");

  useEffect(() => {
    const t = setInterval(() => setDirection(d => nextDir(d, clockwise)), duration * 1000);
    return () => clearInterval(t);
  }, [duration, clockwise]);

  const arcs = makeArcs(isDark);

  // Theme-dependent styles
  const innerBg  = isDark ? "#0d0d0d" : "#ffffff";
  const textCls  = isDark ? "text-white" : "text-neutral-900";
  const outerBg  = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";
  const shadow   = isDark
    ? "0 2px 0 rgba(255,255,255,0.08), 0 4px 12px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)"
    : "0 2px 0 rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.09), inset 0 1px 0 rgba(255,255,255,0.8)";

  return (
    <Tag
      onClick={onClick}
      disabled={Tag === "button" ? disabled : undefined}
      className={cn(
        "ask-ai-btn",
        "hover:scale-[1.02]",
        className
      )}
      style={{ background: outerBg, boxShadow: shadow }}
    >
      {/* Inner content */}
      <div
        className={cn("ask-ai-btn-inner", textCls)}
        style={{ background: innerBg }}
      >
        {children}
      </div>

      {/* Rotating moving border */}
      <motion.div
        className="absolute inset-0 z-0 rounded-2xl"
        style={{ filter: "blur(2.5px)", width: "100%", height: "100%" }}
        animate={{ background: arcs[direction] }}
        transition={{ ease: "linear", duration }}
      />

      {/* Mask inner area to only show border */}
      <div
        className="absolute inset-[2px] z-[1] rounded-[14px]"
        style={{ background: innerBg }}
      />
    </Tag>
  );
}