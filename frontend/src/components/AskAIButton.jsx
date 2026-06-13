import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "../lib/utils.js";

const DIRECTIONS = ["TOP", "LEFT", "BOTTOM", "RIGHT"];
const ARC = {
  TOP:    "radial-gradient(20.7% 50% at 50% 0%,   hsl(0,0%,100%) 0%, rgba(255,255,255,0) 100%)",
  LEFT:   "radial-gradient(16.6% 43.1% at 0% 50%, hsl(0,0%,100%) 0%, rgba(255,255,255,0) 100%)",
  BOTTOM: "radial-gradient(20.7% 50% at 50% 100%, hsl(0,0%,100%) 0%, rgba(255,255,255,0) 100%)",
  RIGHT:  "radial-gradient(16.2% 41.2% at 100% 50%, hsl(0,0%,100%) 0%, rgba(255,255,255,0) 100%)",
};
const HIGHLIGHT = "radial-gradient(75% 181% at 50% 50%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 100%)";

const next = (dir, cw) => {
  const i = DIRECTIONS.indexOf(dir);
  return DIRECTIONS[cw ? (i - 1 + 4) % 4 : (i + 1) % 4];
};

/** Dark pill button with rotating white glow border — exact "Ask AI" style */
export function AskAIButton({ children, onClick, className, duration = 1.4, clockwise = true, disabled, as: Tag = "button" }) {
  const [hovered, setHovered]     = useState(false);
  const [direction, setDirection] = useState("TOP");

  useEffect(() => {
    if (hovered) return;
    const t = setInterval(() => setDirection(d => next(d, clockwise)), duration * 1000);
    return () => clearInterval(t);
  }, [hovered, duration, clockwise]);

  return (
    <Tag
      onClick={onClick}
      disabled={Tag === "button" ? disabled : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-full p-px",
        "bg-black/20 hover:bg-black/10 transition-all duration-300",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        className
      )}
    >
      {/* inner pill */}
      <div className="relative z-10 flex items-center gap-2 bg-[#0f0f0f] text-white rounded-full px-4 py-2 text-sm font-semibold tracking-tight select-none">
        {children}
      </div>

      {/* rotating glow */}
      <motion.div
        className="absolute inset-0 z-0 rounded-full"
        style={{ filter: "blur(3px)", width: "100%", height: "100%" }}
        initial={{ background: ARC[direction] }}
        animate={{ background: hovered ? [ARC[direction], HIGHLIGHT] : ARC[direction] }}
        transition={{ ease: "linear", duration }}
      />

      {/* inner bg to mask the blur outside pill */}
      <div className="absolute inset-[2px] z-[1] rounded-full bg-[#0f0f0f]" />
    </Tag>
  );
}