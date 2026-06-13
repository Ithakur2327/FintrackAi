import Expense from "../models/expenseModel.js";
import Income from "../models/incomeModel.js";

// Groq offers a free, OpenAI-compatible chat completions API.
// Supports either GROQ_API_KEY or ANTHROPIC_API_KEY (legacy name) env var.
const GROQ_API_KEY = process.env.GROQ_API_KEY || process.env.ANTHROPIC_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

async function callGroq({ system, prompt, maxTokens = 1500 }) {
  if (!GROQ_API_KEY) {
    throw new Error("Missing GROQ_API_KEY (or ANTHROPIC_API_KEY) in backend .env");
  }

  const messages = [];
  if (system) messages.push({ role: "system", content: system });
  messages.push({ role: "user", content: prompt });

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      max_tokens: maxTokens,
      messages,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new Error(`Groq API error (${res.status}): ${errBody.slice(0, 300)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || "";
}

export const getAIInsights = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const startOf3Months = new Date(now.getFullYear(), now.getMonth() - 3, 1);

    const [expenses, incomes] = await Promise.all([
      Expense.find({ userId, date: { $gte: startOf3Months } }).sort({ date: -1 }).limit(200),
      Income.find({ userId, date: { $gte: startOf3Months } }).sort({ date: -1 }).limit(100),
    ]);

    const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
    const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);

    const categoryTotals = {};
    for (const e of expenses) {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    }

    const summary = {
      period: "Last 3 months",
      totalIncome,
      totalExpense,
      netSavings: totalIncome - totalExpense,
      savingsRate: totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100).toFixed(1) : 0,
      categoryBreakdown: categoryTotals,
      transactionCount: expenses.length + incomes.length,
      topExpenseCategory: Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || "None",
      currency: req.user.currency || "INR",
    };

    const prompt = `You are FinTrackAI, a personal finance advisor. Analyze this user's financial data and give personalized, actionable insights.

Financial Summary (${summary.period}):
- Total Income: ${summary.currency} ${summary.totalIncome.toLocaleString()}
- Total Expenses: ${summary.currency} ${summary.totalExpense.toLocaleString()}
- Net Savings: ${summary.currency} ${summary.netSavings.toLocaleString()}
- Savings Rate: ${summary.savingsRate}%
- Top Expense Category: ${summary.topExpenseCategory}
- Expense Breakdown by Category: ${JSON.stringify(summary.categoryBreakdown, null, 2)}
- Total Transactions: ${summary.transactionCount}

Provide exactly this JSON structure (respond ONLY with valid JSON, no markdown, no code fences):
{
  "score": <financial health score 0-100>,
  "scoreLabel": "<Excellent|Good|Fair|Poor>",
  "summary": "<2-3 sentence personalized summary in simple language>",
  "insights": [
    {
      "type": "<spending|saving|warning|tip>",
      "icon": "<emoji>",
      "title": "<short title>",
      "description": "<actionable insight, 1-2 sentences>",
      "impact": "<High|Medium|Low>"
    }
  ],
  "recommendations": [
    "<actionable recommendation string>"
  ],
  "alerts": [
    {
      "level": "<danger|warning|info>",
      "message": "<alert message>"
    }
  ],
  "monthlyTarget": {
    "savingsGoal": <suggested monthly savings amount as number>,
    "budgetCuts": [{"category": "<name>", "suggestion": "<amount to cut>", "reason": "<why>"}]
  }
}

Provide 4-6 insights, 3-5 recommendations, and relevant alerts. Be specific with numbers. Keep language friendly and motivating.`;

    const responseText = await callGroq({ prompt, maxTokens: 1500 });
    let insights;

    try {
      insights = JSON.parse(responseText);
    } catch {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        insights = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse AI response");
      }
    }

    res.json({
      success: true,
      data: { ...insights, generatedAt: new Date(), financialSummary: summary },
    });
  } catch (err) {
    console.error("AI Insights error:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to generate AI insights. Please check your GROQ_API_KEY." });
  }
};

export const askAIQuestion = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ success: false, message: "Question is required" });

    const userId = req.user._id;
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const [expenses, incomes] = await Promise.all([
      Expense.find({ userId, date: { $gte: startOfMonth } }),
      Income.find({ userId, date: { $gte: startOfMonth } }),
    ]);

    const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
    const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);

    const context = `User's this month data: Income ₹${totalIncome}, Expenses ₹${totalExpense}, Savings ₹${totalIncome - totalExpense}. Top expenses: ${JSON.stringify(expenses.slice(0, 5).map(e => ({ category: e.category, amount: e.amount })))}`;

    const answer = await callGroq({
      system: `You are FinTrackAI, a helpful personal finance advisor. Be concise, friendly, and give actionable advice. Context: ${context}`,
      prompt: question,
      maxTokens: 500,
    });

    res.json({ success: true, data: { answer, question } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};