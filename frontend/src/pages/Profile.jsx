import { useState } from "react";
import axios from "axios";
import { User, Mail, Shield, Bell, Globe, Save, CheckCircle, AlertCircle, Trash2, AlertTriangle, X } from "lucide-react";
import { useAuth } from "../App.jsx";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
const CURRENCIES = ["INR", "USD", "EUR", "GBP", "AED", "SGD", "CAD", "AUD"];

function Toast({ message, type }) {
  if (!message) return null;
  return (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${type === "success" ? "bg-green-500 text-white" : "bg-red-600 text-white"}`}>
      {type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
      {message}
    </div>
  );
}

export default function Profile() {
  const { user, persistAuth, logout } = useAuth();
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

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await axios.delete(`${API_BASE}/auth/account`);
      logout();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete account", "error");
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-5 max-w-3xl mx-auto animate-fade-in">
      <Toast {...toast} />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Profile Settings</h1>
        <p className="text-neutral-500 text-sm mt-0.5">Manage your account and preferences</p>
      </div>

      {/* Avatar section */}
      <div className="card-big flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-700 flex items-center justify-center text-white text-2xl font-black shrink-0">
          {user?.name?.[0]?.toUpperCase() || "U"}
        </div>
        <div>
          <p className="font-bold text-neutral-900 dark:text-neutral-100 text-lg">{user?.name}</p>
          <p className="text-neutral-500 text-sm">{user?.email}</p>
          <span className="inline-flex items-center gap-1 mt-1.5 text-xs bg-green-500/10 text-green-400 px-2.5 py-1 rounded-full font-medium">
            <CheckCircle size={11} /> Active Account
          </span>
        </div>
      </div>

      {/* Profile Form */}
      <div className="card-big">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 bg-green-500/10 rounded-xl flex items-center justify-center">
            <User size={16} className="text-green-500" />
          </div>
          <h2 className="font-semibold text-neutral-900 dark:text-neutral-100">Personal Information</h2>
        </div>

        <form onSubmit={handleProfileSave} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-1.5">Full Name</label>
            <input type="text" className="input" value={profileForm.name}
              onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))} required />
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-1.5">Email Address</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input type="email" className="input pl-9 bg-slate-50 cursor-not-allowed" value={user?.email} disabled />
            </div>
            <p className="text-xs text-neutral-400 mt-1">Email cannot be changed</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-1.5">Currency</label>
              <select className="input" value={profileForm.currency}
                onChange={e => setProfileForm(p => ({ ...p, currency: e.target.value }))}>
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-1.5">Monthly Budget Goal (₹)</label>
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
      <div className="card-big">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 bg-orange-50 rounded-xl flex items-center justify-center">
            <Shield size={16} className="text-orange-600" />
          </div>
          <h2 className="font-semibold text-neutral-900 dark:text-neutral-100">Change Password</h2>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          {["currentPassword", "newPassword", "confirmPassword"].map((field, i) => (
            <div key={field}>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-1.5">
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

      {/* Danger Zone — Delete Account */}
      <div className="card-big border-red-200 dark:border-red-500/20">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-red-50 dark:bg-red-500/10 rounded-xl flex items-center justify-center">
            <AlertTriangle size={16} className="text-red-500" />
          </div>
          <h2 className="font-semibold text-neutral-900 dark:text-neutral-100">Danger Zone</h2>
        </div>
        <p className="text-sm text-neutral-500 mb-4">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <button onClick={() => setShowDeleteConfirm(true)} className="btn-danger flex items-center gap-2">
          <Trash2 size={15} /> Delete Account
        </button>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={e => e.target === e.currentTarget && !deleteLoading && setShowDeleteConfirm(false)}>
          <div className="bg-white dark:bg-[#161616] border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">Delete Account</h2>
              <button onClick={() => setShowDeleteConfirm(false)} disabled={deleteLoading}
                className="w-8 h-8 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center transition-colors">
                <X size={16} className="text-neutral-500" />
              </button>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-4">
                <AlertTriangle size={22} className="text-red-500" />
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                Are you sure you want to delete your account? All your data — income, expenses, budgets, and goals — will be permanently removed.
              </p>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowDeleteConfirm(false)} disabled={deleteLoading} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button onClick={handleDeleteAccount} disabled={deleteLoading} className="btn-danger flex-1 flex items-center justify-center gap-2">
                  {deleteLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Trash2 size={15} />}
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}