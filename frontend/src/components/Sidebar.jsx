import { useState, useEffect, createContext, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, TrendingUp, TrendingDown, User,
  BrainCircuit, Target, Wallet, Menu, X, LogOut, Sun, Moon,
} from "lucide-react";
import { useAuth, useTheme } from "../App.jsx";

const SidebarContext = createContext(undefined);
const useSidebar = () => {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
};
const SidebarProvider = ({ children, open: openProp, setOpen: setOpenProp, animate = true }) => {
  const [openState, setOpenState] = useState(false);
  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;
  return <SidebarContext.Provider value={{ open, setOpen, animate }}>{children}</SidebarContext.Provider>;
};

/* ── Logo mark — geometric B&W diamond ─────────────────────── */
const LogoMark = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
    <rect x="1" y="1" width="26" height="26" rx="7" fill="white" />
    <path d="M14 5L22 10V18L14 23L6 18V10L14 5Z" fill="black" />
    <path d="M14 10L18 12.5V17.5L14 20L10 17.5V12.5L14 10Z" fill="white" />
  </svg>
);

/* ── Desktop Sidebar ────────────────────────────────────────── */
const DesktopSidebar = ({ children }) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <motion.div
      className="h-full px-3 py-4 hidden md:flex md:flex-col bg-black border-r border-neutral-900 shrink-0"
      animate={{ width: animate ? (open ? "220px" : "60px") : "220px" }}
      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {children}
    </motion.div>
  );
};

/* ── Mobile Sidebar ─────────────────────────────────────────── */
const MobileSidebar = ({ children }) => {
  const { open, setOpen } = useSidebar();
  return (
    <>
      <div className="h-14 px-4 flex md:hidden items-center justify-between bg-black border-b border-neutral-900 w-full">
        <div className="flex items-center gap-2.5">
          <LogoMark size={26} />
          <span className="font-bold text-white text-sm tracking-tight">Fintrack</span>
        </div>
        <button onClick={() => setOpen(!open)}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-neutral-400 hover:bg-neutral-800 transition-colors">
          <Menu size={18} />
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ duration: 0.26, ease: "easeInOut" }}
            className="fixed h-full w-68 inset-0 bg-black p-5 z-[100] flex flex-col border-r border-neutral-900"
          >
            <button onClick={() => setOpen(false)}
              className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 transition-colors">
              <X size={15} />
            </button>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

/* ── Sidebar Link ───────────────────────────────────────────── */
const SidebarLink = ({ item, mobile = false, onClose }) => {
  const { open, animate } = useSidebar();
  const { pathname } = useLocation();
  const isActive = pathname === item.path;
  const Icon = item.icon;
  const showLabel = open || mobile;

  return (
    <Link
      to={item.path}
      onClick={() => { if (mobile && onClose) onClose(); }}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
        ${isActive
          ? "bg-white text-black"
          : "text-neutral-500 hover:bg-neutral-900 hover:text-neutral-200"
        }`}
    >
      <Icon size={17} className={`shrink-0 ${isActive ? "text-black" : "text-neutral-500 group-hover:text-neutral-200"}`} />

      <motion.span
        animate={{
          display: animate ? (showLabel ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (showLabel ? 1 : 0) : 1,
        }}
        transition={{ duration: 0.12 }}
        className="text-sm font-medium whitespace-pre inline-block !p-0 !m-0 tracking-tight flex-1"
      >
        {item.label}
      </motion.span>

      {item.badge && showLabel && (
        <motion.span animate={{ opacity: showLabel ? 1 : 0 }}
          className="text-[9px] font-bold bg-white/20 text-white px-1.5 py-0.5 rounded-full">
          {item.badge}
        </motion.span>
      )}

      {/* Tooltip when collapsed */}
      {!mobile && (
        <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl transition-opacity">
          {item.label}
        </div>
      )}
    </Link>
  );
};

const MENU_ITEMS = [
  { label: "Dashboard",  path: "/",            icon: LayoutDashboard },
  { label: "Income",     path: "/income",       icon: TrendingUp },
  { label: "Expenses",   path: "/expense",      icon: TrendingDown },
  { label: "Budget",     path: "/budget",       icon: Wallet },
  { label: "Goals",      path: "/goals",        icon: Target },
  { label: "AI Insights",path: "/ai-insights",  icon: BrainCircuit, badge: "AI" },
  { label: "Profile",    path: "/profile",      icon: User },
];

/* ── Sidebar Content ────────────────────────────────────────── */
const SidebarContent = ({ mobile = false, onClose }) => {
  const { open, animate } = useSidebar();
  const { user, logout } = useAuth();
  const { isDark, setIsDark } = useTheme();
  const showLabels = open || mobile;

  return (
    <div className="flex flex-col h-full gap-2">
      {/* Logo */}
      <div className={`flex items-center gap-2.5 px-3 py-3 mb-2 ${!showLabels && !mobile ? "justify-center" : ""}`}>
        <LogoMark size={28} />
        <motion.div
          animate={{
            display: animate ? (showLabels ? "block" : "none") : "block",
            opacity: animate ? (showLabels ? 1 : 0) : 1,
          }}
          transition={{ duration: 0.12 }}
        >
          <p className="font-bold text-white text-sm leading-tight tracking-tight">Fintrack</p>
        </motion.div>
      </div>

      {/* User pill */}
      {user && showLabels && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="mx-1 px-3 py-2.5 bg-neutral-900 rounded-xl border border-neutral-800 mb-1">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-black text-xs font-black shrink-0">
              {user.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-neutral-200 truncate">{user.name}</p>
              <p className="text-[10px] text-neutral-600 truncate">{user.currency || "INR"}</p>
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

      {/* Bottom */}
      <div className="space-y-1 border-t border-neutral-900 pt-3 mt-1">
        <button onClick={() => setIsDark(p => !p)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-neutral-500 hover:bg-neutral-900 hover:text-neutral-200 transition-all duration-200 ${!showLabels ? "justify-center" : ""}`}>
          {isDark ? <Sun size={16} className="shrink-0 text-neutral-400" /> : <Moon size={16} className="shrink-0" />}
          <motion.span
            animate={{ display: animate ? (showLabels ? "inline-block" : "none") : "inline-block", opacity: animate ? (showLabels ? 1 : 0) : 1 }}
            className="text-sm font-medium whitespace-pre !p-0 !m-0"
          >
            {isDark ? "Light mode" : "Dark mode"}
          </motion.span>
        </button>

        <button onClick={logout}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-neutral-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 ${!showLabels ? "justify-center" : ""}`}>
          <LogOut size={16} className="shrink-0" />
          <motion.span
            animate={{ display: animate ? (showLabels ? "inline-block" : "none") : "inline-block", opacity: animate ? (showLabels ? 1 : 0) : 1 }}
            className="text-sm font-medium whitespace-pre !p-0 !m-0"
          >
            Sign out
          </motion.span>
        </button>
      </div>
    </div>
  );
};

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <SidebarProvider animate={true}>
      <DesktopSidebar><SidebarContent /></DesktopSidebar>
      <SidebarProvider open={mobileOpen} setOpen={setMobileOpen} animate={false}>
        <MobileSidebar><SidebarContent mobile onClose={() => setMobileOpen(false)} /></MobileSidebar>
      </SidebarProvider>
    </SidebarProvider>
  );
}