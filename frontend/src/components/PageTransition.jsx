import { motion } from "framer-motion";



const ease = [0.22, 1, 0.36, 1];

export function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.985, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.45, ease }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}