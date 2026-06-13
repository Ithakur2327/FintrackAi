import { motion } from "framer-motion";

/*
  PAGE TRANSITION — Fixed version
  ─────────────────────────────────
  PURANI PROBLEM:
    AnimatePresence mode="wait" + Outlet combo broken tha. React Router ka Outlet
    route change pe turant update hota hai — iska matlab purani PageTransition ke
    andar naya page ka content fade-OUT hota tha, phir naya fade-IN. Result: glitchy
    double animation, aur lagta tha content nahi dikh rha.

  NAYA APPROACH:
    Sirf clean "enter" animation. AnimatePresence ki zaroorat nahi.
    Jab Layout mein `key={location.pathname}` change hota hai:
      1. React purani PageTransition unmount karta hai (instantly)
      2. Nayi PageTransition mount hoti hai opacity:0, y:14 se
      3. Smooth animation hoti hai opacity:1, y:0 tak
    Result: har page cleanly fade+slide-in karta hai, koi glitch nahi.
*/

const ease = [0.25, 0.46, 0.45, 0.94];

export function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}