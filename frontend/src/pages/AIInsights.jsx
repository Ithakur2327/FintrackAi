import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw, TrendingUp, AlertTriangle, Lightbulb,
  Shield, Info, Send, MessageSquare, User2, ChevronRight,
  Zap, BrainCircuit
} from "lucide-react";
import { AskAIButton } from "../components/AskAIButton.jsx";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

const QUICK_Q = [
  "How can I improve my savings?",
  "Which category am I overspending on?",
  "What's a good monthly budget for me?",
  "How long to build a 3-month emergency fund?",
  "Should I cut any subscriptions?",
];

function ScoreGauge({ score }) {
  const R  = 54;
  const C  = 2 * Math.PI * R;
  const arc = C * 0.75;
  const offset = C * 0.125;
  const fill = (score / 100) * arc;
  const color = score >= 70 ? "#10b981" : score >= 45 ? "#f59e0b" : "#f43f5e";
  const label = score >= 70 ? "Great" : score >= 45 ? "Fair" : "Needs work";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-32 h-28">
        <svg className="w-full h-full -rotate-[135deg]" viewBox="0 0 130 120">
          <circle cx="65" cy="65" r={R} fill="none" stroke="#27272a" strokeWidth="9"
            strokeDasharray={`${arc} ${C - arc}`} strokeLinecap="round"
            strokeDashoffset={`-${offset}`} />
          <motion.circle cx="65" cy="65" r={R} fill="none" stroke={color} strokeWidth="9"
            strokeDasharray={`${arc} ${C - arc}`} strokeLinecap="round"
            strokeDashoffset={`-${offset}`}
            initial={{ strokeDasharray:`0 ${C}` }}
            animate={{ strokeDasharray:`${fill} ${C - fill}` }}
            transition={{ duration: 1.4, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center translate-y-2">
          <span className="text-3xl font-black text-neutral-900 dark:text-neutral-50 tabular-nums">{score}</span>
          <span className="text-[11px] text-neutral-400">/100</span>
        </div>
      </div>
      <span className="text-xs font-bold px-3 py-1 rounded-full border"
        style={{ color, borderColor: color+"40", background: color+"12" }}>
        {label}
      </span>
    </div>
  );
}

export default function AIInsights() {
  const [insights, setInsights]     = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [activeTab, setActiveTab]   = useState("insights");
  const [chatMessages, setChatMessages] = useState([
    { role: "ai", text: "Hi! Ask me anything about your finances — spending patterns, savings tips, or budget advice." }
  ]);
  const [chatInput, setChatInput]   = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const bottomRef = useRef(null);

  const fetchInsights = async () => {
    setLoading(true); setError("");
    try {
      const res = await axios.get(`${API_BASE}/ai/insights`);
      setInsights(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate insights. Check ANTHROPIC_API_KEY in your backend .env");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchInsights(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages, chatLoading]);

  const sendChat = async (q) => {
    const text = q || chatInput.trim();
    if (!text) return;
    setChatInput("");
    setChatMessages(p => [...p, { role: "user", text }]);
    setChatLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/ai/ask`, { question: text });
      setChatMessages(p => [...p, { role: "ai", text: res.data.data.answer }]);
    } catch (err) {
      setChatMessages(p => [...p, { role: "ai", text: err.response?.data?.message || "Something went wrong. Please try again." }]);
    } finally { setChatLoading(false); }
  };

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-neutral-50">AI Insights</h1>
          <p className="text-sm text-neutral-400 mt-0.5">Powered by Claude — personalized financial analysis</p>
        </div>
        <AskAIButton onClick={fetchInsights} disabled={loading} duration={1.6}>
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          {loading ? "Analyzing…" : "Refresh"}
        </AskAIButton>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-1 w-fit">
        {[
          { l: "Insights", v: "insights", icon: Lightbulb },
          { l: "AI Chat",  v: "chat",     icon: MessageSquare },
        ].map(t => (
          <button key={t.v} onClick={() => setActiveTab(t.v)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === t.v
                ? "bg-neutral-900 dark:bg-white text-white dark:text-black shadow-sm"
                : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            }`}>
            <t.icon size={13} /> {t.l}
          </button>
        ))}
      </div>

      {/* ── Insights Tab ── */}
      {activeTab === "insights" && (
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div key="loading" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              className="card flex flex-col items-center py-16 gap-5">
              <div className="w-14 h-14 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-center">
                <span className="text-2xl font-black text-white">AI</span>
              </div>
              <div className="text-center">
                <p className="font-semibold text-neutral-700 dark:text-neutral-300">Analyzing your finances…</p>
                <p className="text-sm text-neutral-400 mt-1">Claude is reviewing your transactions</p>
              </div>
              <div className="flex gap-1.5">
                {[0,1,2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce"
                    style={{ animationDelay: `${i*0.15}s` }} />
                ))}
              </div>
            </motion.div>
          )}

          {error && !loading && (
            <motion.div key="error" initial={{opacity:0,y:6}} animate={{opacity:1,y:0}}
              className="card border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/5">
              <div className="flex items-start gap-3">
                <AlertTriangle size={15} className="text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-rose-700 dark:text-rose-400 text-sm">Couldn't generate insights</p>
                  <p className="text-xs text-rose-500/80 mt-1">{error}</p>
                  <button onClick={fetchInsights} className="mt-3 btn-secondary text-xs px-3 py-1.5">Try again</button>
                </div>
              </div>
            </motion.div>
          )}

          {insights && !loading && (
            <motion.div key="insights" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="space-y-5">

              {/* Score hero */}
              <div className="card bg-neutral-950 border-neutral-800">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <ScoreGauge score={insights.score} />
                  <div className="flex-1 text-center sm:text-left">
                    <p className="section-label text-neutral-600 mb-2">Financial Health Score</p>
                    <p className="text-neutral-200 text-sm leading-relaxed">{insights.summary}</p>
                    {insights.generatedAt && (
                      <p className="text-xs text-neutral-600 mt-3">
                        Updated {new Date(insights.generatedAt).toLocaleString("en-IN",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"})}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Alerts */}
              {insights.alerts?.length > 0 && (
                <div className="space-y-2">
                  {insights.alerts.map((a,i) => (
                    <motion.div key={i} initial={{opacity:0,x:-6}} animate={{opacity:1,x:0}} transition={{delay:i*0.07}}
                      className="flex items-start gap-3 px-4 py-3 rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/5 text-sm">
                      <Info size={14} className="text-amber-500 shrink-0 mt-0.5" />
                      <span className="text-amber-800 dark:text-amber-300">{a.message}</span>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Key insights grid */}
              {insights.insights?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Zap size={13} className="text-indigo-500" />
                    <h3 className="font-bold text-sm text-neutral-800 dark:text-neutral-200">Key Insights</h3>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {insights.insights.map((ins,i) => (
                      <motion.div key={i} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}}
                        className="card p-4 flex gap-3">
                        <div className="icon-box text-base shrink-0">{ins.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200 leading-tight">{ins.title}</p>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 font-bold border ${
                              ins.impact === "High"   ? "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20" :
                              ins.impact === "Medium" ? "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20" :
                              "bg-neutral-100 text-neutral-500 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700"
                            }`}>{ins.impact}</span>
                          </div>
                          <p className="text-xs text-neutral-500 leading-relaxed">{ins.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {insights.recommendations?.length > 0 && (
                <div className="card">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield size={13} className="text-emerald-500" />
                    <h3 className="font-bold text-sm text-neutral-800 dark:text-neutral-200">Recommendations</h3>
                  </div>
                  <ul className="space-y-3">
                    {insights.recommendations.map((rec,i) => (
                      <motion.li key={i} initial={{opacity:0,x:-4}} animate={{opacity:1,x:0}} transition={{delay:i*0.06}}
                        className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">{i+1}</span>
                        </div>
                        <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">{rec}</p>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Monthly target */}
              {insights.monthlyTarget && (
                <div className="card border border-indigo-200 dark:border-indigo-500/20">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={13} className="text-indigo-500" />
                    <h3 className="font-bold text-sm text-neutral-800 dark:text-neutral-200">Monthly Savings Target</h3>
                  </div>
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-100 dark:border-neutral-800">
                    <p className="text-sm text-neutral-500">Suggested monthly savings</p>
                    <p className="text-xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
                      ₹{(insights.monthlyTarget.savingsGoal||0).toLocaleString("en-IN")}
                    </p>
                  </div>
                  {insights.monthlyTarget.budgetCuts?.length > 0 && (
                    <div className="space-y-2">
                      <p className="section-label mb-2">Suggested cuts</p>
                      {insights.monthlyTarget.budgetCuts.map((cut,i) => (
                        <div key={i} className="flex items-center gap-3 bg-neutral-50 dark:bg-neutral-900 rounded-xl px-3 py-2.5 border border-neutral-200 dark:border-neutral-800">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">{cut.category}</p>
                            <p className="text-xs text-neutral-400">{cut.reason}</p>
                          </div>
                          <p className="text-sm font-black text-rose-600 dark:text-rose-400 shrink-0">
                            {typeof cut.suggestion==="number" ? `-₹${cut.suggestion.toLocaleString("en-IN")}` : cut.suggestion}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* ── Chat Tab ── */}
      {activeTab === "chat" && (
        <div className="card flex flex-col" style={{ minHeight: "70vh" }}>
          {/* Chat header */}
          <div className="flex items-center gap-3 pb-4 mb-4 border-b border-neutral-100 dark:border-neutral-800">
            <div className="w-9 h-9 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center">
              <span className="text-xs font-black text-white tracking-tight">AI</span>
            </div>
            <div>
              <p className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">Fintrack Assistant</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                <p className="text-xs text-neutral-400 font-medium">Online · Claude AI</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto mb-4 min-h-[300px] max-h-[440px] pr-1 no-visible-scrollbar">
            {chatMessages.map((msg,i) => (
              <motion.div key={i} initial={{opacity:0,y:5}} animate={{opacity:1,y:0}}
                className={`flex gap-2.5 ${msg.role==="user"?"flex-row-reverse":""}`}>
                {/* Avatar */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  msg.role==="ai"
                    ? "bg-neutral-950 border border-neutral-800"
                    : "bg-neutral-200 dark:bg-neutral-800"
                }`}>
                  {msg.role==="ai"
                    ? <span className="text-[9px] font-black text-white">AI</span>
                    : <User2 size={12} className="text-neutral-600 dark:text-neutral-400" />
                  }
                </div>
                {/* Bubble */}
                <div className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role==="ai"
                    ? "bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 rounded-tl-none border border-neutral-200 dark:border-neutral-800"
                    : "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-tr-none"
                }`}>
                  {msg.text}
                </div>
              </motion.div>
            ))}
            {chatLoading && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-neutral-950 border border-neutral-800 flex items-center justify-center">
                  <span className="text-[9px] font-black text-white">AI</span>
                </div>
                <div className="bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1.5 items-center">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-bounce"
                      style={{animationDelay:`${i*0.15}s`}} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick questions */}
          <div className="mb-3">
            <p className="text-xs text-neutral-400 mb-2 font-medium">Quick questions</p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_Q.map(q => (
                <button key={q} onClick={() => sendChat(q)} disabled={chatLoading}
                  className="text-xs px-3 py-1.5 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-full text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 transition-all flex items-center gap-1 disabled:opacity-40">
                  <ChevronRight size={9} />{q}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 border-t border-neutral-100 dark:border-neutral-800 pt-4">
            <input type="text" className="input flex-1 text-sm" placeholder="Ask about your finances…"
              value={chatInput} onChange={e=>setChatInput(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&sendChat()} />
            <button onClick={()=>sendChat()} disabled={chatLoading||!chatInput.trim()}
              className="w-9 h-9 bg-neutral-900 dark:bg-white hover:bg-neutral-700 dark:hover:bg-neutral-100 disabled:opacity-40 rounded-xl flex items-center justify-center transition-all shrink-0"
              style={{boxShadow:"0 2px 0 #555"}}>
              <Send size={13} className="text-white dark:text-neutral-900" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}