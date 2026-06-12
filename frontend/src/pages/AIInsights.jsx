import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  BrainCircuit, RefreshCw, TrendingUp, TrendingDown,
  AlertTriangle, Lightbulb, Shield, Info, Send,
  MessageSquare, User2, ChevronRight, Zap
} from "lucide-react";
import { HoverBorderGradient } from "../components/HoverBorderGradient.jsx";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

const QUICK_QUESTIONS = [
  "How can I improve my savings?",
  "Which category am I overspending on?",
  "What's a good monthly budget for me?",
  "How long to build a 3-month emergency fund?",
  "Should I cut any subscriptions?",
];

function ScoreGauge({ score, label }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference * 0.75;
  const offset = circumference * 0.125;
  const isDark = document.documentElement.classList.contains("dark");

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-26">
        <svg className="w-full h-full -rotate-[135deg]" viewBox="0 0 130 120">
          <circle cx="65" cy="65" r={radius} fill="none"
            stroke={isDark ? "#262626" : "#e5e5e5"} strokeWidth="10"
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
            strokeLinecap="round" strokeDashoffset={offset} />
          <motion.circle cx="65" cy="65" r={radius} fill="none"
            stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="10"
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
            strokeLinecap="round" strokeDashoffset={offset}
            initial={{ strokeDasharray: `0 ${circumference}` }}
            animate={{ strokeDasharray: `${progress} ${circumference - progress}` }}
            transition={{ duration: 1.4, ease: "easeOut" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center translate-y-2">
          <span className="text-3xl font-black text-neutral-900 dark:text-neutral-50 tabular-nums">{score}</span>
          <span className="text-xs text-neutral-400">/100</span>
        </div>
      </div>
      <span className="text-xs font-bold px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 mt-1">
        {label}
      </span>
    </div>
  );
}

export default function AIInsights() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [activeTab, setActiveTab] = useState("insights");
  const [chatMessages, setChatMessages] = useState([
    { role: "ai", text: "Hi! Ask me anything about your finances — spending patterns, savings tips, or budget advice." }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef(null);

  const fetchInsights = async () => {
    setLoading(true); setError("");
    try {
      const res = await axios.get(`${API_BASE}/ai/insights`);
      setInsights(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate insights. Make sure ANTHROPIC_API_KEY is set in your backend .env");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchInsights(); }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatLoading]);

  const sendChat = async (question) => {
    const q = question || chatInput.trim();
    if (!q) return;
    setChatInput("");
    setChatMessages(p => [...p, { role: "user", text: q }]);
    setChatLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/ai/ask`, { question: q });
      setChatMessages(p => [...p, { role: "ai", text: res.data.data.answer }]);
    } catch (err) {
      const msg = err.response?.data?.message || "Couldn't process that. Make sure ANTHROPIC_API_KEY is configured.";
      setChatMessages(p => [...p, { role: "ai", text: msg }]);
    } finally { setChatLoading(false); }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-black dark:bg-white flex items-center justify-center">
              <BrainCircuit size={17} className="text-white dark:text-black" />
            </div>
            <h1 className="text-2xl font-black text-neutral-900 dark:text-neutral-50 tracking-tight">AI Insights</h1>
          </div>
          <p className="text-neutral-400 text-sm">Powered by Claude AI — personalized financial analysis</p>
        </div>
        <HoverBorderGradient containerClassName="rounded-full" duration={1.2}
          onClick={fetchInsights}>
          <span className="flex items-center gap-1.5 text-xs">
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            Refresh
          </span>
        </HoverBorderGradient>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-1 w-fit">
        {[{ l: "Insights", v: "insights", icon: BrainCircuit }, { l: "AI Chat", v: "chat", icon: MessageSquare }].map(t => (
          <button key={t.v} onClick={() => setActiveTab(t.v)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === t.v
                ? "bg-black dark:bg-white text-white dark:text-black shadow-sm"
                : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            }`}>
            <t.icon size={13} /> {t.l}
          </button>
        ))}
      </div>

      {/* ── Insights Tab ── */}
      {activeTab === "insights" && (
        <>
          {loading && (
            <div className="card flex flex-col items-center py-14 gap-4">
              <div className="w-14 h-14 bg-black dark:bg-white rounded-2xl flex items-center justify-center">
                <BrainCircuit size={24} className="text-white dark:text-black animate-pulse" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-neutral-700 dark:text-neutral-300">Analyzing your finances…</p>
                <p className="text-sm text-neutral-400 mt-1">Claude AI is reviewing your transactions</p>
              </div>
              <div className="flex gap-1.5">
                {[0,1,2].map(i => (
                  <div key={i} className="w-2 h-2 bg-neutral-800 dark:bg-neutral-200 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="card border border-neutral-200 dark:border-neutral-800">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center shrink-0">
                  <AlertTriangle size={15} className="text-neutral-600 dark:text-neutral-400" />
                </div>
                <div>
                  <p className="font-semibold text-neutral-800 dark:text-neutral-200 text-sm">Couldn't generate insights</p>
                  <p className="text-sm text-neutral-500 mt-1">{error}</p>
                  <button onClick={fetchInsights} className="mt-3 btn-secondary text-xs px-3 py-1.5">Try again</button>
                </div>
              </div>
            </div>
          )}

          {insights && !loading && (
            <div className="space-y-5">
              {/* Score card */}
              <div className="card bg-neutral-950 dark:bg-neutral-950 border-neutral-800">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <ScoreGauge score={insights.score} label={insights.scoreLabel} />
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Financial Health</p>
                    <p className="text-neutral-200 text-sm leading-relaxed">{insights.summary}</p>
                    {insights.generatedAt && (
                      <p className="text-xs text-neutral-600 mt-3">
                        Updated {new Date(insights.generatedAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Alerts */}
              {insights.alerts?.length > 0 && (
                <div className="space-y-2">
                  {insights.alerts.map((alert, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                      className="flex items-start gap-3 px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-sm">
                      <Info size={15} className="text-neutral-500 shrink-0 mt-0.5" />
                      <span className="text-neutral-700 dark:text-neutral-300">{alert.message}</span>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Key Insights grid */}
              {insights.insights?.length > 0 && (
                <div>
                  <h3 className="font-bold text-sm text-neutral-800 dark:text-neutral-200 mb-3 flex items-center gap-2">
                    <Zap size={14} className="text-neutral-600 dark:text-neutral-400" /> Key Insights
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {insights.insights.map((insight, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                        className="card p-4 flex gap-3">
                        <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center shrink-0 text-base">
                          {insight.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200">{insight.title}</p>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 font-semibold ${
                              insight.impact === "High" ? "bg-neutral-900 text-white dark:bg-white dark:text-black" :
                              insight.impact === "Medium" ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300" :
                              "bg-neutral-100 dark:bg-neutral-900 text-neutral-500"
                            }`}>{insight.impact}</span>
                          </div>
                          <p className="text-xs text-neutral-500 mt-1 leading-relaxed">{insight.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {insights.recommendations?.length > 0 && (
                <div className="card">
                  <h3 className="font-bold text-sm text-neutral-800 dark:text-neutral-200 mb-3 flex items-center gap-2">
                    <Shield size={14} className="text-neutral-600 dark:text-neutral-400" /> Recommendations
                  </h3>
                  <ul className="space-y-2.5">
                    {insights.recommendations.map((rec, i) => (
                      <motion.li key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                        className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[10px] font-black text-neutral-600 dark:text-neutral-400">{i + 1}</span>
                        </div>
                        <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">{rec}</p>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Monthly Target */}
              {insights.monthlyTarget && (
                <div className="card border border-neutral-300 dark:border-neutral-700">
                  <h3 className="font-bold text-sm text-neutral-800 dark:text-neutral-200 mb-3 flex items-center gap-2">
                    <TrendingUp size={14} className="text-neutral-600 dark:text-neutral-400" /> Monthly Savings Target
                  </h3>
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">
                    <p className="text-sm text-neutral-500">Suggested monthly savings</p>
                    <p className="text-xl font-black text-neutral-900 dark:text-neutral-50 tabular-nums">
                      ₹{(insights.monthlyTarget.savingsGoal || 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                  {insights.monthlyTarget.budgetCuts?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Suggested Cuts</p>
                      {insights.monthlyTarget.budgetCuts.map((cut, i) => (
                        <div key={i} className="flex items-center gap-3 bg-neutral-50 dark:bg-neutral-900 rounded-xl px-3 py-2.5 border border-neutral-200 dark:border-neutral-800">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">{cut.category}</p>
                            <p className="text-xs text-neutral-400">{cut.reason}</p>
                          </div>
                          <p className="text-sm font-black text-neutral-900 dark:text-neutral-100 shrink-0">
                            {typeof cut.suggestion === "number" ? `-₹${cut.suggestion.toLocaleString("en-IN")}` : cut.suggestion}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Chat Tab ── */}
      {activeTab === "chat" && (
        <div className="card flex flex-col" style={{ minHeight: "68vh" }}>
          {/* Chat header */}
          <div className="flex items-center gap-3 pb-4 border-b border-neutral-200 dark:border-neutral-800 mb-4">
            <div className="w-9 h-9 bg-black dark:bg-white rounded-xl flex items-center justify-center">
              <BrainCircuit size={16} className="text-white dark:text-black" />
            </div>
            <div>
              <p className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">Fintrack Assistant</p>
              <p className="text-xs text-neutral-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-500 inline-block" />
                AI-powered
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto mb-4 min-h-[280px] max-h-[420px] pr-1">
            {chatMessages.map((msg, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === "ai"
                    ? "bg-black dark:bg-white border border-neutral-800 dark:border-neutral-200"
                    : "bg-neutral-200 dark:bg-neutral-800"
                }`}>
                  {msg.role === "ai"
                    ? <BrainCircuit size={13} className="text-white dark:text-black" />
                    : <User2 size={13} className="text-neutral-600 dark:text-neutral-400" />
                  }
                </div>
                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "ai"
                    ? "bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 rounded-tl-none border border-neutral-200 dark:border-neutral-800"
                    : "bg-black dark:bg-white text-white dark:text-black rounded-tr-none"
                }`}>
                  {msg.text}
                </div>
              </motion.div>
            ))}
            {chatLoading && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-black dark:bg-white flex items-center justify-center">
                  <BrainCircuit size={13} className="text-white dark:text-black" />
                </div>
                <div className="bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1.5">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Quick questions */}
          <div className="mb-3">
            <p className="text-xs text-neutral-400 mb-2 font-medium">Quick questions:</p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_QUESTIONS.map(q => (
                <button key={q} onClick={() => sendChat(q)}
                  className="text-xs px-3 py-1.5 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-full text-neutral-600 dark:text-neutral-400 transition-all flex items-center gap-1 border border-neutral-200 dark:border-neutral-800">
                  <ChevronRight size={9} /> {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 border-t border-neutral-200 dark:border-neutral-800 pt-4">
            <input type="text" className="input flex-1" placeholder="Ask about your finances…"
              value={chatInput} onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendChat()} />
            <button onClick={() => sendChat()} disabled={chatLoading || !chatInput.trim()}
              className="w-10 h-10 bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-100 disabled:opacity-40 rounded-xl flex items-center justify-center transition-all shrink-0"
              style={{ boxShadow: "0 2px 0 #333" }}>
              <Send size={14} className="text-white dark:text-black" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}