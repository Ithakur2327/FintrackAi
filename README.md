# 🚀 FinTrackAI — Smart Personal Finance Tracker

A full-stack personal finance tracker powered by **Claude AI**, built with React + Node.js + MongoDB.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📊 Dashboard | Income, expenses, savings overview with charts |
| 💸 Expense Tracking | Add, edit, delete expenses by category |
| 💰 Income Tracking | Track all income sources |
| 📦 Budget Planner | Set monthly limits per category with alerts |
| 🎯 Savings Goals | Create goals, track progress, set deadlines |
| 🤖 AI Insights | Claude AI analyzes your finances & gives tips |
| 💬 AI Chat | Ask your AI financial assistant anything |
| 🔐 Auth | JWT-based signup/login with remember-me |

---

## 🛠️ Tech Stack

**Frontend:** React 19, Vite, Tailwind CSS, Recharts, Framer Motion, Axios  
**Backend:** Node.js, Express.js, MongoDB (Mongoose), JWT  
**AI:** Anthropic Claude (claude-sonnet-4-20250514)

---

## ⚡ Quick Setup

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Anthropic API key

---

### 1. Clone / Unzip the project

```bash
# If cloned from GitHub:
git clone https://github.com/yourusername/FinTrackAI.git
cd FinTrackAI
```

---

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env from example
cp .env.example .env
```

Now open `backend/.env` and fill in:

```env
MONGO_URI=mongodb://localhost:27017/fintrackAI
JWT_SECRET=your_super_secret_key_make_this_long_and_random
JWT_EXPIRES_IN=7d
PORT=5000
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxx
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

> **Get your Anthropic API key:** https://console.anthropic.com → API Keys

```bash
# Start backend in dev mode
npm run dev

# OR production
npm start
```

Backend will run on: `http://localhost:5000`

---

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env from example
cp .env.example .env
```

Open `frontend/.env` and set:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

```bash
# Start frontend dev server
npm run dev
```

Frontend will run on: `http://localhost:5173`

---

### 4. Open the app

Go to **http://localhost:5173** → Click **"Create one free"** → Sign up → Start tracking!

---

## 📁 Project Structure

```
FinTrackAI/
├── backend/
│   ├── controllers/
│   │   ├── authController.js       # Signup, login, profile
│   │   ├── expenseController.js    # CRUD expenses + stats
│   │   ├── incomeController.js     # CRUD income
│   │   ├── dashboardController.js  # Overview data + trends
│   │   ├── budgetController.js     # Budget limits + alerts
│   │   ├── goalController.js       # Savings goals
│   │   └── aiController.js         # Claude AI insights + chat
│   ├── middleware/
│   │   └── authMiddleware.js       # JWT protection
│   ├── models/
│   │   ├── userModel.js
│   │   ├── expenseModel.js
│   │   ├── incomeModel.js
│   │   ├── budgetModel.js
│   │   └── goalModel.js
│   ├── routes/                     # All API routes
│   ├── utils/
│   │   └── dateFilter.js           # Date range helper
│   ├── index.js                    # Express server entry
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   ├── Sidebar.jsx         # Collapsible sidebar
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── AddTransaction.jsx  # Add/Edit modal
│   │   │   ├── TransactionItem.jsx # Transaction row
│   │   │   └── StatsCard.jsx       # Stats widget
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx       # Main overview
│   │   │   ├── Expense.jsx         # Expense management
│   │   │   ├── Income.jsx          # Income management
│   │   │   ├── Budget.jsx          # Budget planner
│   │   │   ├── Goals.jsx           # Savings goals
│   │   │   ├── AIInsights.jsx      # AI analysis + chat
│   │   │   └── Profile.jsx         # Account settings
│   │   ├── App.jsx                 # Router + Auth context
│   │   ├── main.jsx
│   │   └── index.css
│   └── .env.example
│
└── README.md
```

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/signup | Register |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| PUT | /api/auth/profile | Update profile |
| PUT | /api/auth/change-password | Change password |

### Expenses / Income
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/expense/add | Add expense |
| GET | /api/expense/get | Get expenses (filterable) |
| PUT | /api/expense/update/:id | Edit expense |
| DELETE | /api/expense/delete/:id | Delete expense |
| GET | /api/expense/stats | Expense statistics |

*(Same pattern for /api/income)*

### Budget
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/budget/set | Set/update budget |
| GET | /api/budget/get | Get budgets with spend |
| DELETE | /api/budget/:id | Delete budget |

### Goals
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/goals/create | Create goal |
| GET | /api/goals/get | Get all goals |
| PUT | /api/goals/update/:id | Update goal |
| DELETE | /api/goals/:id | Delete goal |
| POST | /api/goals/add-amount/:id | Add money to goal |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/ai/insights | Full AI financial analysis |
| POST | /api/ai/ask | Ask AI a question |

---

## 🐙 GitHub Setup

```bash
# Initialize repo
git init
git add .
git commit -m "Initial commit: FinTrackAI v1.0"

# Create repo on GitHub, then:
git remote add origin https://github.com/yourusername/FinTrackAI.git
git branch -M main
git push -u origin main
```

> ⚠️ Make sure `.env` files are in `.gitignore` — NEVER push API keys to GitHub!

---

## 🔧 Common Issues

**MongoDB not connecting?**
```bash
# Make sure MongoDB is running locally:
sudo systemctl start mongod
# OR use MongoDB Atlas cloud connection string
```

**AI Insights not working?**
- Check `ANTHROPIC_API_KEY` in `backend/.env`
- Get key at: https://console.anthropic.com

**CORS error?**
- Check `FRONTEND_URL` in `backend/.env` matches your frontend URL

---

## 📄 License
MIT — Personal use project
