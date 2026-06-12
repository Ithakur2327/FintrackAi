import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar.jsx";
import { PageTransition } from "./PageTransition.jsx";

export default function Layout() {
  const location = useLocation();
  return (
    <div className="flex h-screen bg-neutral-100 dark:bg-black overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-4 lg:p-6">
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