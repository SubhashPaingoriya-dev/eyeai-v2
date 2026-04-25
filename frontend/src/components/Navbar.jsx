import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, History, Zap, ChevronDown, LogOut, User, Activity } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const STATUS_CONFIG = {
  ready:    { color: "text-brand-green", bg: "bg-brand-green/10 border-brand-green/30", dot: "bg-brand-green", label: "AI Ready" },
  warming:  { color: "text-brand-amber",  bg: "bg-brand-amber/10 border-brand-amber/30",  dot: "bg-brand-amber",  label: "Warming Up" },
  offline:  { color: "text-brand-rose",   bg: "bg-brand-rose/10 border-brand-rose/30",   dot: "bg-brand-rose",   label: "Offline" },
  checking: { color: "text-surface-5",    bg: "bg-surface-3/50 border-surface-3",         dot: "bg-surface-5",   label: "Checking..." },
};

export default function Navbar() {
  const { user, logout, backendStatus } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const handleLogout = () => {
    setDropOpen(false);
    logout();
    navigate("/login");
  };

  const st = STATUS_CONFIG[backendStatus] || STATUS_CONFIG.checking;

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-surface-0/90 backdrop-blur-xl border-b border-brand-cyan/10" : "bg-transparent"}`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-brand-cyan/10 border border-brand-cyan/40 flex items-center justify-center group-hover:bg-brand-cyan/20 transition-colors">
            <Eye size={18} className="text-brand-cyan" />
          </div>
          <span className="font-display font-bold text-lg gradient-text">EyeAI</span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {[
            { to: "/", label: "Analyze", icon: <Activity size={15} /> },
            { to: "/history", label: "History", icon: <History size={15} /> },
          ].map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-inter font-medium transition-all ${isActive ? "text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/20" : "text-surface-5 hover:text-white hover:bg-surface-2"}`
              }
            >
              {icon}{label}
            </NavLink>
          ))}

          {/* Status badge */}
          <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono-custom border ${st.bg} ${st.color} ml-2`}>
            <span className={`w-1.5 h-1.5 rounded-full ${st.dot} ${backendStatus === "checking" ? "animate-pulse" : ""}`} />
            {st.label}
          </div>
        </div>

        {/* User avatar + dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropOpen((p) => !p)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-2 border border-surface-3 hover:border-brand-cyan/30 transition-all"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-cyan to-brand-violet flex items-center justify-center text-xs font-display font-bold text-white">
              {user?.avatar || "?"}
            </div>
            <span className="text-sm font-inter text-white hidden sm:block max-w-[100px] truncate">{user?.name}</span>
            <ChevronDown size={14} className={`text-surface-5 transition-transform ${dropOpen ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {dropOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-56 bg-surface-2 border border-surface-3 rounded-2xl overflow-hidden shadow-xl z-50"
              >
                <div className="p-3 border-b border-surface-3">
                  <p className="text-sm font-inter font-medium text-white truncate">{user?.name}</p>
                  <p className="text-xs text-surface-5 truncate mt-0.5">{user?.email}</p>
                  <p className="text-xs text-brand-cyan mt-1 font-mono-custom">{user?.occupation}</p>
                </div>
                <div className="p-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-inter text-brand-rose hover:bg-brand-rose/10 transition-colors"
                  >
                    <LogOut size={15} />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.nav>
  );
}
