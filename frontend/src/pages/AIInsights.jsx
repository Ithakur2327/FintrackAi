import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, RefreshCw, TrendingUp, TrendingDown, AlertTriangle,
  Lightbulb, Shield, Info, Send, Bot, User, Zap, ChevronRight
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

const INSIGHT_ICONS = {
  spending: TrendingDown,
  saving: TrendingUp,
  warning: AlertTriangle,
  tip: Lightbulb,
};

const INSIGHT_COLORS = {
  spending: { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-200" },
  saving: { bg: "bg-teal-50", text: "text-teal-600", border: "border-teal-200" },
  warning: { bg: "bg-red-50", text: "text-red-600", border: "border-red-200" },
  tip: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
};

const ALERT_STYLES = {
  danger: "bg-red-50 border-red-200 text-red-700",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-700",
  info: "bg-blue-50 border-blue-200 text-blue-700",
};

const SCORE_COLORS = {
  Excellent: { color: "#0d9488", bg: "bg-teal-50", text: "text-teal-700" },
  Good: { color: "#0891b2", bg: "bg-blue-50", text: "text-blue-700" },
  Fair: { color: "#eab308", bg: "bg-yellow-50", text: "text-yellow-700" },
  Poor: { color: "#ef4444", bg: "bg-red-50", text: "text-red-700" },
};

const QUICK_QUESTIONS = [
  "How can I improve my savings rate?",
  "Which category should I cut spending in?",
  "Am I spending too much on food?",
  "What's a good monthly budget for me?",
  "How long to build a 3-month emergency fund?",
];

function ScoreGauge({ score, label }) {
  const config = SCORE_COLORS[label] || SCORE_COLORS.Fair;
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference * 0.75;
  const offset = circumference * 0.125;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-28">
        <svg className="w-full h-full -rotate-[135deg]" viewBox="0 0 140 120">
          <circle cx="70" cy="70" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="12"
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`} strokeLinecap="round" strokeDashoffset={offset} />
          <motion.circle cx="70" cy="70" r={radius} fill="none" stroke={config.color} strokeWidth="12"
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`} strokeLinecap="round"
            strokeDashoffset={offset}
            initial={{ strokeDasharray: `0 ${circumference}` }}
            animate={{ strokeDasharray: `${progress} ${circumference - progress}` }}
            transition={{ duration: 1.2, ease: "easeOut" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center translate-y-2">
          <span className="text-3xl font-black text-slate-800">{score}</span>
          <span className="text-xs text-slate-400">/100</span>
        </div>
      </div>
      <span className={`text-sm font-bold px-3 py-1 rounded-full ${config.bg} ${config.text}`}>{label}</span>
    </div>
  );
}

export default function AIInsights() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { role: "ai", text: "Hi! I'm your FinTrackAI assistant. Ask me anything about your finances — spending patterns, savings tips, or budget advice! 💡" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("insights");

  const fetchInsights = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_BASE}/ai/insights`);
      setInsights(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate insights. Make sure ANTHROPIC_API_KEY is set in backend .env");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInsights(); }, []);

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
      setChatMessages(p => [...p, { role: "ai", text: "Sorry, I couldn't process that. Please try again." }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center">
              <Sparkles size={14} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">AI Insights</h1>
          </div>
          <p className="text-slate-500 text-sm">Powered by Claude AI — personalized financial analysis</p>
        </div>
        <button onClick={fetchInsights} disabled={loading}
          className="flex items-center gap-2 btn-secondary text-sm">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {[{ l: "Insights", v: "insights", icon: Sparkles }, { l: "AI Chat", v: "chat", icon: Bot }].map(t => (
          <button key={t.v} onClick={() => setActiveTab(t.v)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-px ${activeTab === t.v ? "border-teal-600 text-teal-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
            <t.icon size={15} /> {t.l}
          </button>
        ))}
      </div>

      {activeTab === "insights" ? (
        <>
          {loading ? (
            <div className="space-y-4">
              {/* Loading state */}
              <div className="card flex flex-col items-center py-12 gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl flex items-center justify-center">
                  <Sparkles size={28} className="text-white animate-pulse" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-slate-700">Analyzing your finances...</p>
                  <p className="text-sm text-slate-400 mt-1">Claude AI is reviewing your transactions</p>
                </div>
                <div className="flex gap-1.5">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="card border border-red-200 bg-red-50">
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-700">Couldn't generate insights</p>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                  <button onClick={fetchInsights} className="mt-3 text-sm text-red-700 font-semibold underline hover:no-underline">
                    Try again
                  </button>
                </div>
              </div>
            </div>
          ) : insights ? (
            <div className="space-y-5">
              {/* Score + Summary */}
              <div className="card bg-gradient-to-br from-slate-900 to-teal-900 text-white border-0">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <ScoreGauge score={insights.score} label={insights.scoreLabel} />
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-sm font-semibold text-teal-300 uppercase tracking-wide mb-2">Financial Health Score</p>
                    <p className="text-white/90 text-sm leading-relaxed">{insights.summary}</p>
                    {insights.generatedAt && (
                      <p className="text-xs text-white/40 mt-3">
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
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                      className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm ${ALERT_STYLES[alert.level] || ALERT_STYLES.info}`}>
                      {alert.level === "danger" ? <AlertTriangle size={16} className="shrink-0 mt-0.5" /> :
                        alert.level === "warning" ? <AlertTriangle size={16} className="shrink-0 mt-0.5" /> :
                          <Info size={16} className="shrink-0 mt-0.5" />}
                      {alert.message}
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Insights Grid */}
              {insights.insights?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Zap size={16} className="text-teal-600" /> Key Insights
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {insights.insights.map((insight, i) => {
                      const Icon = INSIGHT_ICONS[insight.type] || Lightbulb;
                      const c = INSIGHT_COLORS[insight.type] || INSIGHT_COLORS.tip;
                      return (
                        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                          className={`flex gap-3 p-4 rounded-xl border ${c.bg} ${c.border}`}>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${c.bg}`}>
                            <span className="text-lg">{insight.icon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-sm font-semibold ${c.text}`}>{insight.title}</p>
                              <span className={`text-xs px-1.5 py-0.5 rounded-full shrink-0 ${
                                insight.impact === "High" ? "bg-red-100 text-red-600" :
                                  insight.impact === "Medium" ? "bg-yellow-100 text-yellow-600" :
                                    "bg-slate-100 text-slate-600"
                              }`}>{insight.impact}</span>
                            </div>
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{insight.description}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {insights.recommendations?.length > 0 && (
                <div className="card">
                  <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Shield size={16} className="text-teal-600" /> Recommendations
                  </h3>
                  <ul className="space-y-2.5">
                    {insights.recommendations.map((rec, i) => (
                      <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                        className="flex items-start gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-teal-700">{i + 1}</span>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed">{rec}</p>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Monthly Target */}
              {insights.monthlyTarget && (
                <div className="card border border-teal-100 bg-teal-50/50">
                  <h3 className="font-semibold text-teal-800 mb-3 flex items-center gap-2">
                    <TrendingUp size={16} className="text-teal-600" /> Monthly Savings Target
                  </h3>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-teal-700">Suggested monthly savings</p>
                    <p className="text-xl font-black text-teal-700">
                      ₹{(insights.monthlyTarget.savingsGoal || 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                  {insights.monthlyTarget.budgetCuts?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide">Suggested Budget Cuts</p>
                      {insights.monthlyTarget.budgetCuts.map((cut, i) => (
                        <div key={i} className="flex items-center gap-3 bg-white rounded-xl px-3 py-2.5 border border-teal-100">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-700">{cut.category}</p>
                            <p className="text-xs text-slate-500">{cut.reason}</p>
                          </div>
                          <p className="text-sm font-bold text-orange-600 shrink-0">
                            {typeof cut.suggestion === "number" ? `-₹${cut.suggestion.toLocaleString("en-IN")}` : cut.suggestion}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : null}
        </>
      ) : (
        /* AI Chat Tab */
        <div className="card flex flex-col" style={{ minHeight: "70vh" }}>
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-4">
            <div className="w-9 h-9 bg-gradient-to-br from-teal-400 to-teal-700 rounded-xl flex items-center justify-center">
              <Bot size={18} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">FinTrackAI Assistant</p>
              <p className="text-xs text-green-500 font-medium">● Online</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto mb-4 min-h-[300px] max-h-[450px] pr-1">
            {chatMessages.map((msg, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${msg.role === "ai" ? "bg-teal-100" : "bg-slate-200"}`}>
                  {msg.role === "ai" ? <Bot size={14} className="text-teal-600" /> : <User size={14} className="text-slate-600" />}
                </div>
                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.role === "ai"
                  ? "bg-slate-100 text-slate-800 rounded-tl-none"
                  : "bg-teal-600 text-white rounded-tr-none"}`}>
                  {msg.text}
                </div>
              </motion.div>
            ))}
            {chatLoading && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center">
                  <Bot size={14} className="text-teal-600" />
                </div>
                <div className="bg-slate-100 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Questions */}
          <div className="mb-3">
            <p className="text-xs text-slate-400 mb-2 font-medium">Quick questions:</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_QUESTIONS.map(q => (
                <button key={q} onClick={() => sendChat(q)}
                  className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 rounded-full text-slate-600 transition-all flex items-center gap-1">
                  <ChevronRight size={10} /> {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 border-t border-slate-100 pt-4">
            <input type="text" className="input flex-1" placeholder="Ask about your finances..."
              value={chatInput} onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendChat()} />
            <button onClick={() => sendChat()} disabled={chatLoading || !chatInput.trim()}
              className="w-10 h-10 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-xl flex items-center justify-center transition-all shrink-0">
              <Send size={15} className="text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
