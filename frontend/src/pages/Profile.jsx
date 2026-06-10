import { useState } from "react";
import axios from "axios";
import { User, Mail, Shield, Bell, Globe, Save, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "../App.jsx";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
const CURRENCIES = ["INR", "USD", "EUR", "GBP", "AED", "SGD", "CAD", "AUD"];

function Toast({ message, type }) {
  if (!message) return null;
  return (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${type === "success" ? "bg-teal-600 text-white" : "bg-red-600 text-white"}`}>
      {type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
      {message}
    </div>
  );
}

export default function Profile() {
  const { user, persistAuth } = useAuth();
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    currency: user?.currency || "INR",
    monthlyBudgetGoal: user?.monthlyBudgetGoal || "",
  });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3000);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const res = await axios.put(`${API_BASE}/auth/profile`, profileForm);
      persistAuth(res.data.user, null, true);
      showToast("Profile updated successfully!");
    } catch (err) {
      showToast(err.response?.data?.message || "Update failed", "error");
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }
    setPasswordLoading(true);
    try {
      await axios.put(`${API_BASE}/auth/change-password`, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      showToast("Password changed successfully!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      showToast(err.response?.data?.message || "Password change failed", "error");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-5 max-w-2xl animate-fade-in">
      <Toast {...toast} />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Profile Settings</h1>
        <p className="text-slate-500 text-sm mt-0.5">Manage your account and preferences</p>
      </div>

      {/* Avatar section */}
      <div className="card flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-700 flex items-center justify-center text-white text-2xl font-black shrink-0">
          {user?.name?.[0]?.toUpperCase() || "U"}
        </div>
        <div>
          <p className="font-bold text-slate-800 text-lg">{user?.name}</p>
          <p className="text-slate-500 text-sm">{user?.email}</p>
          <span className="inline-flex items-center gap-1 mt-1.5 text-xs bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full font-medium">
            <CheckCircle size={11} /> Active Account
          </span>
        </div>
      </div>

      {/* Profile Form */}
      <div className="card">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 bg-teal-50 rounded-xl flex items-center justify-center">
            <User size={16} className="text-teal-600" />
          </div>
          <h2 className="font-semibold text-slate-800">Personal Information</h2>
        </div>

        <form onSubmit={handleProfileSave} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">Full Name</label>
            <input type="text" className="input" value={profileForm.name}
              onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))} required />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">Email Address</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="email" className="input pl-9 bg-slate-50 cursor-not-allowed" value={user?.email} disabled />
            </div>
            <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Currency</label>
              <select className="input" value={profileForm.currency}
                onChange={e => setProfileForm(p => ({ ...p, currency: e.target.value }))}>
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Monthly Budget Goal (₹)</label>
              <input type="number" className="input" placeholder="e.g. 30000" min="0"
                value={profileForm.monthlyBudgetGoal}
                onChange={e => setProfileForm(p => ({ ...p, monthlyBudgetGoal: e.target.value }))} />
            </div>
          </div>

          <button type="submit" disabled={profileLoading} className="btn-primary flex items-center gap-2">
            {profileLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={15} />}
            Save Changes
          </button>
        </form>
      </div>

      {/* Password Form */}
      <div className="card">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 bg-orange-50 rounded-xl flex items-center justify-center">
            <Shield size={16} className="text-orange-600" />
          </div>
          <h2 className="font-semibold text-slate-800">Change Password</h2>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          {["currentPassword", "newPassword", "confirmPassword"].map((field, i) => (
            <div key={field}>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">
                {field === "currentPassword" ? "Current Password" : field === "newPassword" ? "New Password" : "Confirm New Password"}
              </label>
              <input type="password" className="input" placeholder="••••••••"
                value={passwordForm[field]}
                onChange={e => setPasswordForm(p => ({ ...p, [field]: e.target.value }))} required />
            </div>
          ))}

          <button type="submit" disabled={passwordLoading} className="btn-secondary flex items-center gap-2">
            {passwordLoading ? <span className="w-4 h-4 border-2 border-slate-400/30 border-t-slate-600 rounded-full animate-spin" /> : <Shield size={15} />}
            Update Password
          </button>
        </form>
      </div>

      {/* App Info */}
      <div className="card bg-gradient-to-br from-slate-900 to-teal-900 border-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <Globe size={18} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm">FinTrackAI v1.0</p>
            <p className="text-white/50 text-xs">Smart Personal Finance Tracker · Built with Claude AI</p>
          </div>
        </div>
      </div>
    </div>
  );
}
