import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";
import { useAuth } from "../App.jsx";

const LogoMark = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="12" className="fill-neutral-900 dark:fill-white" />
    <path d="M20 6L32 13V27L20 34L8 27V13L20 6Z" className="fill-white dark:fill-neutral-950" />
    <path d="M20 14L26 17.5V24.5L20 28L14 24.5V17.5L20 14Z" className="fill-neutral-900 dark:fill-white" />
  </svg>
);

export default function Login() {
  const { persistAuth, apiBase } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const { data } = await axios.post(`${apiBase}/auth/login`, { email: form.email, password: form.password });
      persistAuth(data.user, data.token, form.remember);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 grid-bg opacity-100 dark:opacity-40" />
      <div className="absolute inset-0 bg-[#f5f5f7] dark:bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <LogoMark />
          </div>
          <h1 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">Fintrack</h1>
          <p className="text-neutral-500 text-sm mt-1">Personal Finance Intelligence</p>
        </div>

        <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl p-6 sm:p-8"
          style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.05), 0 40px 80px rgba(0,0,0,0.6)" }}>
          <h2 className="text-xl font-black text-neutral-900 dark:text-neutral-50 mb-1">Welcome back</h2>
          <p className="text-neutral-500 text-sm mb-6">Sign in to your account</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-neutral-900 border border-red-200 dark:border-neutral-700 text-red-600 dark:text-neutral-300 text-sm px-4 py-3 rounded-xl mb-5">
              <AlertCircle size={15} className="shrink-0" />{error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-neutral-400 block mb-1.5">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-600" />
                <input type="email" className="input pl-10" placeholder="you@example.com"
                  value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-neutral-400 block mb-1.5">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-600" />
                <input type={showPass ? "text" : "password"} className="input pl-10 pr-10" placeholder="••••••••"
                  value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" checked={form.remember}
                onChange={e => setForm(p => ({ ...p, remember: e.target.checked }))}
                className="w-4 h-4 rounded accent-white" />
              <label htmlFor="remember" className="text-sm text-neutral-500 cursor-pointer">Remember me</label>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full text-center mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black dark:border-white/30 dark:border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-neutral-600 mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-neutral-900 dark:text-white font-semibold hover:text-neutral-300 transition-colors">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}