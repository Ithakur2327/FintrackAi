import { useState, useEffect, createContext, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, TrendingUp, TrendingDown,
  User, BrainCircuit, Target, Wallet, Menu, X, LogOut, Sun, Moon,
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

const LogoMark = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
    <rect x="1" y="1" width="26" height="26" rx="7" className="fill-neutral-900 dark:fill-white" />
    <path d="M14 5L22 10V18L14 23L6 18V10L14 5Z" className="fill-white dark:fill-neutral-900" />
    <path d="M14 10L18 12.5V17.5L14 20L10 17.5V12.5L14 10Z" className="fill-neutral-900 dark:fill-white" />
  </svg>
);

const DesktopSidebar = ({ children }) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <motion.div
      className="h-full px-3 py-4 hidden md:flex md:flex-col bg-[#f5f5f7] dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-900 shrink-0"
      animate={{ width: animate ? (open ? "220px" : "60px") : "220px" }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {children}
    </motion.div>
  );
};

const MobileSidebar = ({ children }) => {
  const { open, setOpen } = useSidebar();
  return (
    <>
      {/* Top bar */}
      <div className="h-14 px-4 flex md:hidden items-center justify-between bg-[#f5f5f7] dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-900 w-full shrink-0">
        <div className="flex items-center gap-2.5">
          <LogoMark size={26} />
          <span className="font-bold text-neutral-900 dark:text-white text-sm tracking-tight">Fintrack</span>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
        >
          <Menu size={18} />
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ duration: 0.24, ease: "easeInOut" }}
            className="fixed h-full w-64 inset-0 bg-[#f5f5f7] dark:bg-neutral-950 p-5 z-[100] flex flex-col border-r border-neutral-200 dark:border-neutral-900"
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-xl bg-neutral-200 dark:bg-neutral-900 hover:bg-neutral-300 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 transition-colors"
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
      className={`sidebar-link group ${isActive ? "sidebar-link-active" : "sidebar-link-inactive"}`}
    >
      <Icon
        size={17}
        className={`shrink-0 transition-colors ${
          isActive
            ? "text-neutral-900 dark:text-white"
            : "text-neutral-400 dark:text-neutral-500"
        }`}
      />

      <motion.span
        animate={{
          display: animate ? (showLabel ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (showLabel ? 1 : 0) : 1,
        }}
        transition={{ duration: 0.1 }}
        className="text-sm font-medium whitespace-pre tracking-tight flex-1 text-neutral-700 dark:text-neutral-300"
      >
        {item.label}
      </motion.span>

      {item.badge && showLabel && (
        <motion.span
          animate={{ opacity: showLabel ? 1 : 0 }}
          className="text-[10px] font-bold bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 px-1.5 py-0.5 rounded-md"
        >
          {item.badge}
        </motion.span>
      )}

      {!mobile && !showLabel && (
        <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-neutral-900 dark:bg-neutral-800 border border-neutral-800 dark:border-neutral-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl transition-opacity">
          {item.label}
        </div>
      )}
    </Link>
  );
};

const MENU_ITEMS = [
  { label: "Dashboard",   path: "/",           icon: LayoutDashboard },
  { label: "Income",      path: "/income",      icon: TrendingUp },
  { label: "Expenses",    path: "/expense",     icon: TrendingDown },
  { label: "Budget",      path: "/budget",      icon: Wallet },
  { label: "Goals",       path: "/goals",       icon: Target },
  { label: "AI Insights", path: "/ai-insights", icon: BrainCircuit, badge: "AI" },
  { label: "Profile",     path: "/profile",     icon: User },
];

const SidebarContent = ({ mobile = false, onClose }) => {
  const { open, animate } = useSidebar();
  const { logout } = useAuth();
  const { isDark, setIsDark } = useTheme();
  const showLabels = open || mobile;

  return (
    <div className="flex flex-col h-full gap-1.5">
      {/* Logo */}
      <div className={`flex items-center gap-2.5 px-3 py-3 mb-3 ${!showLabels && !mobile ? "justify-center" : ""}`}>
        <LogoMark size={28} />
        <motion.div
          animate={{
            display: animate ? (showLabels ? "block" : "none") : "block",
            opacity: animate ? (showLabels ? 1 : 0) : 1,
          }}
          transition={{ duration: 0.1 }}
        >
          <p className="font-bold text-neutral-900 dark:text-white text-sm tracking-tight">Fintrack</p>
        </motion.div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto">
        {MENU_ITEMS.map((item) => (
          <SidebarLink key={item.path} item={item} mobile={mobile} onClose={onClose} />
        ))}
      </nav>

      {/* Bottom */}
      <div className="space-y-0.5 border-t border-neutral-200 dark:border-neutral-800 pt-3 mt-1">
        <button
          onClick={() => setIsDark(p => !p)}
          className={`sidebar-link sidebar-link-inactive w-full ${!showLabels && !mobile ? "justify-center" : ""}`}
        >
          {isDark
            ? <Sun size={16} className="shrink-0 text-neutral-400 dark:text-neutral-500" />
            : <Moon size={16} className="shrink-0 text-neutral-400 dark:text-neutral-500" />
          }
          <motion.span
            animate={{ display: animate ? (showLabels ? "inline-block" : "none") : "inline-block", opacity: animate ? (showLabels ? 1 : 0) : 1 }}
            className="text-sm font-medium whitespace-pre text-neutral-600 dark:text-neutral-400"
          >
            {isDark ? "Light mode" : "Dark mode"}
          </motion.span>
        </button>

        <button
          onClick={logout}
          className={`sidebar-link w-full text-neutral-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-all duration-150 ${!showLabels && !mobile ? "justify-center" : ""}`}
        >
          <LogOut size={16} className="shrink-0" />
          <motion.span
            animate={{ display: animate ? (showLabels ? "inline-block" : "none") : "inline-block", opacity: animate ? (showLabels ? 1 : 0) : 1 }}
            className="text-sm font-medium whitespace-pre"
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