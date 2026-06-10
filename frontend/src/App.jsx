import { useState, useEffect, createContext, useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import Layout from "./components/Layout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Expense from "./pages/Expense.jsx";
import Income from "./pages/Income.jsx";
import Profile from "./pages/Profile.jsx";
import AIInsights from "./pages/AIInsights.jsx";
import Budget from "./pages/Budget.jsx";
import Goals from "./pages/Goals.jsx";
import Login from "./components/Login.jsx";
import Signup from "./components/Signup.jsx";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
export const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const getStored = (key) => {
  try {
    return localStorage.getItem(key) || sessionStorage.getItem(key);
  } catch { return null; }
};

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = getStored("fintrack_token");
    const storedUser = getStored("fintrack_user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const persistAuth = (userObj, tokenStr, remember = false) => {
    const store = remember ? localStorage : sessionStorage;
    const clear = remember ? sessionStorage : localStorage;
    try {
      if (userObj) store.setItem("fintrack_user", JSON.stringify(userObj));
      if (tokenStr) store.setItem("fintrack_token", tokenStr);
      clear.removeItem("fintrack_user");
      clear.removeItem("fintrack_token");
      setUser(userObj || null);
      setToken(tokenStr || null);
    } catch (err) {
      console.error("persistAuth error:", err);
    }
  };

  const logout = () => {
    localStorage.removeItem("fintrack_token");
    localStorage.removeItem("fintrack_user");
    sessionStorage.removeItem("fintrack_token");
    sessionStorage.removeItem("fintrack_user");
    setUser(null);
    setToken(null);
  };

  // Axios interceptor for auth header
  useEffect(() => {
    const id = axios.interceptors.request.use((config) => {
      const t = getStored("fintrack_token");
      if (t) config.headers.Authorization = `Bearer ${t}`;
      return config;
    });
    return () => axios.interceptors.request.eject(id);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-teal-200 border-t-teal-600 animate-spin" />
          <p className="text-slate-500 font-medium">Loading FinTrackAI...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token, persistAuth, logout, apiBase: API_BASE }}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" />} />
          <Route
            path="/"
            element={user ? <Layout /> : <Navigate to="/login" />}
          >
            <Route index element={<Dashboard />} />
            <Route path="income" element={<Income />} />
            <Route path="expense" element={<Expense />} />
            <Route path="budget" element={<Budget />} />
            <Route path="goals" element={<Goals />} />
            <Route path="ai-insights" element={<AIInsights />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}
