import { useState, useRef, useEffect, createContext, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, TrendingUp, TrendingDown, User,
  Sparkles, Target, PiggyBank, Menu, X, LogOut, Sun, Moon,
} from "lucide-react";
import { useAuth, useTheme } from "../App.jsx";

/* ─── Sidebar Context (exact pattern from spec) ───────────────────────── */
const SidebarContext = createContext(undefined);

const useSidebar = () => {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within a SidebarProvider");
  return ctx;
};

const SidebarProvider = ({ children, open: openProp, setOpen: setOpenProp, animate = true }) => {
  const [openState, setOpenState] = useState(false);
  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;
  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

/* ─── Desktop Sidebar (exact animate pattern from spec) ──────────────── */
const DesktopSidebar = ({ children }) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <motion.div
      className="h-full px-3 py-4 hidden md:flex md:flex-col bg-neutral-900 dark:bg-black border-r border-neutral-800 dark:border-neutral-900 shrink-0"
      animate={{ width: animate ? (open ? "240px" : "60px") : "240px" }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {children}
    </motion.div>
  );
};

/* ─── Mobile Sidebar (exact AnimatePresence pattern from spec) ───────── */
const MobileSidebar = ({ children }) => {
  const { open, setOpen } = useSidebar();
  return (
    <>
      <div className="h-14 px-4 flex md:hidden items-center justify-between bg-neutral-900 dark:bg-black border-b border-neutral-800 w-full">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
            <Sparkles size={13} className="text-white" />
          </div>
          <span className="font-bold text-white text-sm tracking-tight">FinTrackAI</span>
        </div>
        <button onClick={() => setOpen(!open)} className="w-9 h-9 rounded-xl flex items-center justify-center text-neutral-400 hover:bg-neutral-800 transition-colors">
          <Menu size={18} />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="fixed h-full w-72 inset-0 bg-neutral-900 dark:bg-black p-6 z-[100] flex flex-col border-r border-neutral-800"
          >
            <button
              className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 transition-colors"
              onClick={() => setOpen(false)}
            >
              <X size={15} />
            </button>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

/* ─── Sidebar Link (exact motion.span pattern from spec) ─────────────── */
const SidebarLink = ({ item, mobile = false, onClose }) => {
  const { open, animate } = useSidebar();
  const { pathname } = useLocation();
  const isActive = pathname === item.path;
  const Icon = item.icon;

  return (
    <Link
      to={item.path}
      onClick={() => { if (mobile && onClose) onClose(); }}
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
        ${isActive
          ? "bg-orange-500/15 text-orange-400"
          : "text-neutral-500 hover:bg-neutral-800 hover:text-neutral-200"
        }
      `}
    >
      <Icon
        size={18}
        className={`shrink-0 transition-all duration-200 ${isActive ? "text-orange-400" : "text-neutral-500 group-hover:text-neutral-200"}`}
      />

      <motion.span
        animate={{
          display: animate ? (open || mobile ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open || mobile ? 1 : 0) : 1,
        }}
        transition={{ duration: 0.15 }}
        className="text-sm font-medium whitespace-pre inline-block !p-0 !m-0 tracking-tight"
      >
        {item.label}
      </motion.span>

      {item.badge && (open || mobile) && (
        <motion.span
          animate={{ opacity: open || mobile ? 1 : 0 }}
          className="ml-auto text-[9px] font-bold bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded-full"
        >
          {item.badge}
        </motion.span>
      )}

      {/* Tooltip when collapsed */}
      {!mobile && (
        <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-neutral-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-neutral-700 shadow-xl">
          {item.label}
        </div>
      )}
    </Link>
  );
};

/* ─── Menu Items ─────────────────────────────────────────────────────── */
const MENU_ITEMS = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Income", path: "/income", icon: TrendingUp },
  { label: "Expenses", path: "/expense", icon: TrendingDown },
  { label: "Budget", path: "/budget", icon: PiggyBank },
  { label: "Goals", path: "/goals", icon: Target },
  { label: "AI Insights", path: "/ai-insights", icon: Sparkles, badge: "AI" },
  { label: "Profile", path: "/profile", icon: User },
];

/* ─── Sidebar Content ────────────────────────────────────────────────── */
const SidebarContent = ({ mobile = false, onClose }) => {
  const { open, animate } = useSidebar();
  const { user, logout } = useAuth();
  const { isDark, setIsDark } = useTheme();
  const showLabels = open || mobile;

  return (
    <div className="flex flex-col h-full gap-2">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-3 py-3 mb-1 ${!showLabels && !mobile ? "justify-center" : ""}`}>
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/25">
          <Sparkles size={14} className="text-white" />
        </div>
        <motion.div
          animate={{
            display: animate ? (showLabels ? "block" : "none") : "block",
            opacity: animate ? (showLabels ? 1 : 0) : 1,
          }}
          transition={{ duration: 0.15 }}
        >
          <p className="font-bold text-white text-sm leading-tight tracking-tight">FinTrackAI</p>
          <p className="text-[10px] text-neutral-500 tracking-wide">Smart Finance</p>
        </motion.div>
      </div>

      {/* User */}
      {user && showLabels && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="mx-1 px-3 py-2.5 bg-neutral-800 dark:bg-neutral-900 rounded-xl border border-neutral-700 dark:border-neutral-800 mb-1"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-neutral-200 truncate">{user.name}</p>
              <p className="text-[10px] text-neutral-500 truncate">{user.currency || "INR"}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto">
        {MENU_ITEMS.map((item) => (
          <SidebarLink key={item.path} item={item} mobile={mobile} onClose={onClose} />
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="space-y-1 border-t border-neutral-800 pt-3 mt-1">
        {/* Theme toggle */}
        <button
          onClick={() => setIsDark(p => !p)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-neutral-500 hover:bg-neutral-800 hover:text-neutral-200 transition-all duration-200 ${!showLabels ? "justify-center" : ""}`}
        >
          {isDark
            ? <Sun size={17} className="shrink-0 text-orange-400" />
            : <Moon size={17} className="shrink-0" />
          }
          <motion.span
            animate={{
              display: animate ? (showLabels ? "inline-block" : "none") : "inline-block",
              opacity: animate ? (showLabels ? 1 : 0) : 1,
            }}
            className="text-sm font-medium whitespace-pre !p-0 !m-0"
          >
            {isDark ? "Light mode" : "Dark mode"}
          </motion.span>
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-neutral-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 ${!showLabels ? "justify-center" : ""}`}
        >
          <LogOut size={17} className="shrink-0" />
          <motion.span
            animate={{
              display: animate ? (showLabels ? "inline-block" : "none") : "inline-block",
              opacity: animate ? (showLabels ? 1 : 0) : 1,
            }}
            className="text-sm font-medium whitespace-pre !p-0 !m-0"
          >
            Sign out
          </motion.span>
        </button>
      </div>
    </div>
  );
};

/* ─── Main Export ─────────────────────────────────────────────────────── */
export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <SidebarProvider animate={true}>
      {/* Desktop */}
      <DesktopSidebar>
        <SidebarContent />
      </DesktopSidebar>

      {/* Mobile */}
      <SidebarProvider open={mobileOpen} setOpen={setMobileOpen} animate={false}>
        <MobileSidebar>
          <SidebarContent mobile onClose={() => setMobileOpen(false)} />
        </MobileSidebar>
      </SidebarProvider>
    </SidebarProvider>
  );
}