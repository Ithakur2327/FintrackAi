import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  RefreshCw, TrendingUp, TrendingDown, AlertTriangle, Lightbulb,
  Shield, Info, Send, MessageSquare, User2, ChevronRight,
  Sparkles, PiggyBank, WifiOff, Bot,
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

// Map the AI's "type" field to real lucide icons — no emoji, theme-toned colors only
const INSIGHT_ICON = {
  spending: { Icon: TrendingDown, cls: "text-rose-500 bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20" },
  saving:   { Icon: PiggyBank,    cls: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20" },
  warning:  { Icon: AlertTriangle,cls: "text-amber-500 bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20" },
  tip:      { Icon: Lightbulb,    cls: "text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20" },
};
const DEFAULT_INSIGHT_ICON = { Icon: Sparkles, cls: "text-neutral-500 bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700" };

function ScoreGauge({ score }) {
  const R  = 54;
  const C  = 2 * Math.PI * R;
  const arc = C * 0.75;
  const offset = C * 0.125;
  const fill = (score / 100) * arc;
  // Theme-consistent palette: emerald (good) / amber (fair) / rose (needs work) — same accents used elsewhere in the app
  const color = score >= 70 ? "#10b981" : score >= 45 ? "#f59e0b" : "#f43f5e";
  const label = score >= 70 ? "Great" : score >= 45 ? "Fair" : "Needs work";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-28 h-24 sm:w-32 sm:h-28">
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
          <span className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-neutral-50 tabular-nums">{score}</span>
          <span className="text-[10px] text-neutral-400">/100</span>
        </div>
      </div>
      <span className="text-xs font-bold px-3 py-1 rounded-full border"
        style={{ color, borderColor: color+"40", background: color+"12" }}>
        {label}
      </span>
    </div>
  );
}

// Error state with helpful instructions
function AIErrorCard({ error, onRetry }) {
  const isApiKeyMissing = error.toLowerCase().includes("groq_api_key") ||
    error.toLowerCase().includes("anthropic_api_key") ||
    error.toLowerCase().includes("missing");

  return (
    <motion.div key="error" initial={{opacity:0,y:6}} animate={{opacity:1,y:0}}
      className="card border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/5">
      <div className="flex items-start gap-3">
        <AlertTriangle size={15} className="text-rose-500 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-rose-700 dark:text-rose-400 text-sm">Couldn't generate insights</p>
          <p className="text-xs text-rose-500/80 mt-1 break-words">{error}</p>

          {isApiKeyMissing && (
            <div className="mt-4 space-y-3">
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 text-xs space-y-2">
                <p className="font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                  <WifiOff size={12} /> API key missing — fix karo:
                </p>
                <ol className="space-y-1.5 text-neutral-500 dark:text-neutral-400 list-decimal list-inside">
                  <li>Get free Groq API key from <span className="font-mono text-indigo-600 dark:text-indigo-400">console.groq.com</span></li>
                  <li>Backend folder mein <span className="font-mono bg-neutral-100 dark:bg-neutral-800 px-1 rounded">.env</span> file banao</li>
                  <li>Add karo: <span className="font-mono bg-neutral-100 dark:bg-neutral-800 px-1 rounded">GROQ_API_KEY=gsk_...</span></li>
                  <li>Backend restart karo</li>
                </ol>
              </div>
            </div>
          )}

          <button onClick={onRetry} className="mt-3 btn-secondary text-xs px-3 py-1.5">Try again</button>
        </div>
      </div>
    </motion.div>
  );
}

// Markdown renderer for AI chat replies — styled like a chat assistant response, not a plain paragraph
function ChatMarkdown({ text }) {
  return (
    <div className="markdown-body text-sm leading-relaxed space-y-2.5">
      <ReactMarkdown
        components={{
          p:  ({ children }) => <p className="leading-relaxed">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-5 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          strong: ({ children }) => <strong className="font-bold text-neutral-900 dark:text-neutral-50">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          h1: ({ children }) => <p className="font-black text-base mt-1">{children}</p>,
          h2: ({ children }) => <p className="font-bold text-sm mt-1">{children}</p>,
          h3: ({ children }) => <p className="font-bold text-sm mt-1">{children}</p>,
          code: ({ children }) => <code className="font-mono text-xs bg-neutral-200/70 dark:bg-neutral-800 px-1 py-0.5 rounded">{children}</code>,
          blockquote: ({ children }) => <blockquote className="border-l-2 border-neutral-300 dark:border-neutral-700 pl-3 italic text-neutral-500">{children}</blockquote>,
          a: ({ children, href }) => <a href={href} target="_blank" rel="noreferrer" className="underline font-medium">{children}</a>,
          hr: () => <hr className="border-neutral-200 dark:border-neutral-800 my-2" />,
        }}
      >
        {text}
      </ReactMarkdown>
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
      setError(err.response?.data?.message || "Failed to generate insights. Check GROQ_API_KEY in backend .env");
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
      const msg = err.response?.data?.message || "Something went wrong. Check GROQ_API_KEY in backend .env";
      setChatMessages(p => [...p, { role: "ai", text: msg }]);
    } finally { setChatLoading(false); }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-1.5rem)] sm:h-[calc(100vh-2rem)] lg:h-[calc(100vh-3rem)] animate-fade-in">

      {/* Tabs — replaces the page header */}
      <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-1 w-fit max-w-full mb-4 shrink-0">
        {[
          { l: "Insights", v: "insights", icon: Lightbulb },
          { l: "AI Chat",  v: "chat",     icon: MessageSquare },
        ].map(t => (
          <button key={t.v} onClick={() => setActiveTab(t.v)}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              activeTab === t.v
                ? "bg-neutral-900 dark:bg-white text-white dark:text-black shadow-sm"
                : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            }`}>
            <t.icon size={12} /> {t.l}
          </button>
        ))}
      </div>

      {/* ── Insights Tab — scrollable content area ── */}
      {activeTab === "insights" && (
        <div className="flex-1 overflow-y-auto no-visible-scrollbar -mx-1 px-1 pb-4">
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div key="loading" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                className="card flex flex-col items-center py-12 sm:py-16 gap-5">
                <div className="w-14 h-14 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-center">
                  <Bot size={24} className="text-white" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-neutral-700 dark:text-neutral-300">Analyzing your finances…</p>
                  <p className="text-sm text-neutral-400 mt-1">AI is reviewing your transactions</p>
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
              <AIErrorCard error={error} onRetry={fetchInsights} />
            )}

            {insights && !loading && (
              <motion.div key="insights" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="space-y-4 sm:space-y-5">

                {/* Header row — refresh action lives here now */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">Financial Overview</h2>
                  <AskAIButton onClick={fetchInsights} disabled={loading} duration={1.6} className="shrink-0 text-xs sm:text-sm">
                    <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                    {loading ? "Analyzing…" : "Refresh"}
                  </AskAIButton>
                </div>

                {/* Score hero */}
                <div className="card-big">
                  <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                    <ScoreGauge score={insights.score} />
                    <div className="flex-1 text-center sm:text-left min-w-0">
                      <p className="section-label mb-2">Financial Health Score</p>
                      <p className="text-neutral-700 dark:text-neutral-300 text-sm leading-relaxed">{insights.summary}</p>
                      {insights.generatedAt && (
                        <p className="text-xs text-neutral-400 mt-3">
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
                        <span className="text-amber-800 dark:text-amber-300 text-xs sm:text-sm">{a.message}</span>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Key insights grid — real lucide icons, theme-toned */}
                {insights.insights?.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles size={13} className="text-indigo-500" />
                      <h3 className="font-bold text-sm text-neutral-800 dark:text-neutral-200">Key Insights</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {insights.insights.map((ins,i) => {
                        const { Icon, cls } = INSIGHT_ICON[ins.type] || DEFAULT_INSIGHT_ICON;
                        return (
                          <motion.div key={i} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}}
                            className="card p-3 sm:p-4 flex gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${cls}`}>
                              <Icon size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <p className="text-xs sm:text-sm font-bold text-neutral-800 dark:text-neutral-200 leading-tight">{ins.title}</p>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 font-bold border ${
                                  ins.impact === "High"   ? "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20" :
                                  ins.impact === "Medium" ? "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20" :
                                  "bg-neutral-100 text-neutral-500 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700"
                                }`}>{ins.impact}</span>
                              </div>
                              <p className="text-xs text-neutral-500 leading-relaxed">{ins.description}</p>
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
                          <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">{rec}</p>
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
                      <p className="text-xs sm:text-sm text-neutral-500">Suggested monthly savings</p>
                      <p className="text-lg sm:text-xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
                        ₹{(insights.monthlyTarget.savingsGoal||0).toLocaleString("en-IN")}
                      </p>
                    </div>
                    {insights.monthlyTarget.budgetCuts?.length > 0 && (
                      <div className="space-y-2">
                        <p className="section-label mb-2">Suggested cuts</p>
                        {insights.monthlyTarget.budgetCuts.map((cut,i) => (
                          <div key={i} className="flex items-center gap-3 bg-neutral-50 dark:bg-neutral-900 rounded-xl px-3 py-2.5 border border-neutral-200 dark:border-neutral-800">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300 truncate">{cut.category}</p>
                              <p className="text-xs text-neutral-400 truncate">{cut.reason}</p>
                            </div>
                            <p className="text-xs sm:text-sm font-black text-rose-600 dark:text-rose-400 shrink-0">
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
        </div>
      )}

      {/* ── Chat Tab — fills remaining viewport, only messages scroll ── */}
      {activeTab === "chat" && (
        <div className="card flex-1 flex flex-col overflow-hidden min-h-0">
          {/* Chat header */}
          <div className="flex items-center gap-3 pb-3 mb-3 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center">
              <Bot size={16} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">Assistant</p>
              <p className="text-xs text-neutral-400 mt-0.5">Ask anything about your finances</p>
            </div>
          </div>

          {/* Messages — only this scrolls */}
          <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1 no-visible-scrollbar min-h-0">
            {chatMessages.map((msg,i) => (
              <motion.div key={i} initial={{opacity:0,y:5}} animate={{opacity:1,y:0}}
                className={`flex gap-2 ${msg.role==="user"?"flex-row-reverse":""}`}>
                {/* Avatar */}
                <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  msg.role==="ai"
                    ? "bg-neutral-950 border border-neutral-800"
                    : "bg-neutral-200 dark:bg-neutral-800"
                }`}>
                  {msg.role==="ai"
                    ? <Bot size={13} className="text-white" />
                    : <User2 size={11} className="text-neutral-600 dark:text-neutral-400" />
                  }
                </div>
                {/* Bubble */}
                <div className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                  msg.role==="ai"
                    ? "bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 rounded-tl-none border border-neutral-200 dark:border-neutral-800"
                    : "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-tr-none text-sm leading-relaxed"
                }`}>
                  {msg.role === "ai" ? <ChatMarkdown text={msg.text} /> : msg.text}
                </div>
              </motion.div>
            ))}
            {chatLoading && (
              <div className="flex gap-2">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-neutral-950 border border-neutral-800 flex items-center justify-center">
                  <Bot size={13} className="text-white" />
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
          <div className="mb-3 shrink-0">
            <p className="text-[11px] text-neutral-400 mb-1.5 font-medium">Quick questions</p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_Q.map(q => (
                <button key={q} onClick={() => sendChat(q)} disabled={chatLoading}
                  className="text-[11px] px-2.5 py-1.5 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-full text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 transition-all flex items-center gap-1 disabled:opacity-40">
                  <ChevronRight size={8} />{q}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 border-t border-neutral-100 dark:border-neutral-800 pt-3 shrink-0">
            <input type="text" className="input flex-1 text-sm h-11" placeholder="Ask about your finances…"
              value={chatInput} onChange={e=>setChatInput(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&sendChat()} />
            <button onClick={()=>sendChat()} disabled={chatLoading||!chatInput.trim()}
              className="w-11 h-11 bg-neutral-900 dark:bg-white hover:bg-neutral-700 dark:hover:bg-neutral-100 disabled:opacity-40 rounded-xl flex items-center justify-center transition-all shrink-0"
              style={{boxShadow:"0 2px 0 #555"}}>
              <Send size={14} className="text-white dark:text-neutral-900" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
