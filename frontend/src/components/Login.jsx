import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff, Sparkles, Mail, Lock, AlertCircle } from "lucide-react";
import { useAuth } from "../App.jsx";

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
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-500/8 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-green-500/8 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-xl shadow-orange-500/25 mb-4">
            <Sparkles size={24} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">FinTrackAI</h1>
          <p className="text-neutral-500 text-sm mt-1">Smart Personal Finance Tracker</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-neutral-100 mb-1">Welcome back</h2>
          <p className="text-neutral-500 text-sm mb-6">Sign in to your account</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-5">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-neutral-300 block mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input type="email" className="input pl-10" placeholder="you@example.com"
                  value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-300 block mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input type={showPass ? "text" : "password"} className="input pl-10 pr-10" placeholder="••••••••"
                  value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
                <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" checked={form.remember}
                onChange={e => setForm(p => ({ ...p, remember: e.target.checked }))}
                className="w-4 h-4 rounded accent-orange-500" />
              <label htmlFor="remember" className="text-sm text-neutral-500">Remember me for 7 days</label>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full text-center mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-neutral-500 mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-orange-500 font-semibold hover:text-orange-400">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}