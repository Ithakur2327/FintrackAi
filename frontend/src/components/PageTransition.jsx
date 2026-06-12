import { motion } from "framer-motion";

const appleEase = [0.25, 0.46, 0.45, 0.94];

export function PageTransition({ children, pageKey }) {
  return (
    <motion.div
      key={pageKey}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, scale: 0.99 }}
      transition={{ duration: 0.36, ease: appleEase }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}