import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar.jsx";
import { PageTransition } from "./PageTransition.jsx";

export default function Layout() {
  const location = useLocation();
  return (
    <div className="flex h-screen bg-[#f5f5f7] dark:bg-[#0a0a0a] overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto relative">
        {/* Grid pattern */}
        <div className="absolute inset-0 grid-bg opacity-100 pointer-events-none z-0" />
        {/* Soft vignette — top fade only */}
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[#f5f5f7] dark:from-[#0a0a0a] to-transparent pointer-events-none z-0" />
        <div className="relative z-10 max-w-5xl mx-auto p-4 lg:p-6">
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname} pageKey={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}