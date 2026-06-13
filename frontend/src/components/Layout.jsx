import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import { PageTransition } from "./PageTransition.jsx";

export default function Layout() {
  const location = useLocation();
  return (
    <div className="flex h-screen bg-[#f5f5f7] dark:bg-[#0a0a0a] overflow-hidden">
      <div className="relative z-20">
        <Sidebar />
      </div>
      <main className="flex-1 overflow-y-auto relative">
        {/* Grid pattern */}
        <div className="fixed inset-0 grid-bg opacity-100 pointer-events-none z-0" />
        {/* Soft vignette — top fade only */}
        <div className="fixed inset-x-0 top-0 h-48 bg-gradient-to-b from-[#f5f5f7] dark:from-[#0a0a0a] to-transparent pointer-events-none z-0" />
        <div className="relative z-10 max-w-5xl mx-auto p-3 sm:p-4 lg:p-6">
          {/*
            KEY FIX: AnimatePresence mode="wait" + React Router Outlet milke broken tha.
            Jab route change hota tha, Outlet TURANT naya content render karta tha —
            toh purani PageTransition ke andar naya page fade-out hota tha (glitch!).
            Ab sirf key={location.pathname} use karo: jab route badle, React
            purani PageTransition unmount karta hai aur nayi mount karta hai.
            Nayi motion.div apni enter animation khud chalati hai — clean aur smooth.
          */}
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </div>
      </main>
    </div>
  );
}