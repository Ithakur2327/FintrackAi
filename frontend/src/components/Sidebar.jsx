import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, TrendingUp, TrendingDown, User,
  Sparkles, Target, PiggyBank, ChevronLeft, Menu, X, LogOut,
} from "lucide-react";
import { useAuth } from "../App.jsx";

const MENU_ITEMS = [
  { text: "Dashboard", path: "/", icon: LayoutDashboard },
  { text: "Income", path: "/income", icon: TrendingUp },
  { text: "Expenses", path: "/expense", icon: TrendingDown },
  { text: "Budget", path: "/budget", icon: PiggyBank },
  { text: "Goals", path: "/goals", icon: Target },
  { text: "AI Insights", path: "/ai-insights", icon: Sparkles, badge: "AI" },
  { text: "Profile", path: "/profile", icon: User },
];

export default function Sidebar({ isCollapsed, setIsCollapsed }) {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebarRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const MenuItem = ({ item, mobile = false }) => {
    const Icon = item.icon;
    const isActive = pathname === item.path;
    return (
      <Link
        to={item.path}
        onClick={() => mobile && setMobileOpen(false)}
        className={`
          flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
          ${isActive
            ? "bg-teal-600 text-white shadow-md shadow-teal-200"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }
          ${isCollapsed && !mobile ? "justify-center" : ""}
        `}
      >
        <Icon size={18} className="shrink-0" />
        {(!isCollapsed || mobile) && (
          <span className="text-sm font-medium truncate">{item.text}</span>
        )}
        {item.badge && (!isCollapsed || mobile) && (
          <span className="ml-auto text-[10px] font-bold bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded-full">
            {item.badge}
          </span>
        )}
        {isCollapsed && !mobile && (
          <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            {item.text}
          </div>
        )}
      </Link>
    );
  };

  const SidebarContent = ({ mobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-slate-100 ${isCollapsed && !mobile ? "justify-center" : ""}`}>
        <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl flex items-center justify-center shrink-0">
          <Sparkles size={14} className="text-white" />
        </div>
        {(!isCollapsed || mobile) && (
          <div>
            <p className="font-bold text-slate-800 text-base leading-tight">FinTrackAI</p>
            <p className="text-[10px] text-slate-400">Smart Finance</p>
          </div>
        )}
      </div>

      {/* User brief */}
      {(!isCollapsed || mobile) && user && (
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {user.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
              <p className="text-xs text-slate-400 truncate">{user.currency || "INR"}</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {MENU_ITEMS.map((item) => (
          <MenuItem key={item.path} item={item} mobile={mobile} />
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-slate-100">
        <button
          onClick={logout}
          className={`
            flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200
            ${isCollapsed && !mobile ? "justify-center" : ""}
          `}
        >
          <LogOut size={18} className="shrink-0" />
          {(!isCollapsed || mobile) && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`
        hidden lg:flex flex-col bg-white border-r border-slate-100 h-screen sticky top-0 transition-all duration-300
        ${isCollapsed ? "w-16" : "w-60"}
      `}>
        <SidebarContent />
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all z-10"
        >
          <ChevronLeft size={12} className={`text-slate-500 transition-transform ${isCollapsed ? "rotate-180" : ""}`} />
        </button>
      </aside>

      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-md"
      >
        <Menu size={18} className="text-slate-600" />
      </button>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div className="lg:hidden fixed inset-0 z-50 flex" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            />
            <motion.div
              ref={sidebarRef}
              className="relative w-72 bg-white h-full shadow-2xl overflow-y-auto"
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors">
                <X size={16} className="text-slate-600" />
              </button>
              <SidebarContent mobile />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
