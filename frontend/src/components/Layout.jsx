import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar.jsx";
import { PageTransition } from "./PageTransition.jsx";

export default function Layout() {
  const location = useLocation();
  return (
    <div className="flex h-screen bg-white dark:bg-black overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto relative">
        {/* Grid background */}
        <div
          className="fixed inset-0 pointer-events-none z-0 grid-bg"
          style={{ left: 0 }}
        />
        {/* Radial fade overlay */}
        <div className="fixed inset-0 pointer-events-none z-0 bg-white dark:bg-black [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,transparent_40%,black)]" />
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