import { useState, useEffect } from "react";
import homeIcon from "./assets/home.svg";
import grafIcon from "./assets/graf.svg";
import settingsIcon from "./assets/settings.svg";
import "./App.css";
import Home from "./pages/Home";
import Settings from "./pages/Settings";
import type { UserProfile } from "./pages/Settings";
import type { Expense, RecurringExpense } from "./constants";

// ─── Lògica d'injecció de recurrents ─────────────────────────────────────────
function processPendingRecurring(
  recurring: RecurringExpense[],
  expenses: Expense[]
): { newExpenses: Expense[]; updatedRecurring: RecurringExpense[] } {
  const now       = new Date();
  const today     = now.getDate();
  const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const newExpenses: Expense[] = [];
  const updatedRecurring = recurring.map((r) => {
    if (r.lastTriggered === yearMonth) return r;
    if (today < r.dayOfMonth) return r;
    const expense: Expense = {
      id: Date.now() + Math.random(),
      amount: r.amount,
      category: r.category,
      date: new Date(now.getFullYear(), now.getMonth(), r.dayOfMonth).toISOString(),
      note: r.note,
    };
    newExpenses.push(expense);
    return { ...r, lastTriggered: yearMonth };
  });

  return { newExpenses, updatedRecurring };
}

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  const [tab, setTab] = useState<"home" | "history" | "settings">("home");

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem("expenses");
    return saved ? JSON.parse(saved) : [];
  });

  const [recurring, setRecurring] = useState<RecurringExpense[]>(() => {
    const saved = localStorage.getItem("recurring");
    return saved ? JSON.parse(saved) : [];
  });

  const [budget, setBudget] = useState<number>(() => {
    const saved = localStorage.getItem("budget");
    return saved ? parseFloat(saved) : 400;
  });

  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem("profile");
    return saved ? JSON.parse(saved) : { name: "", email: "" };
  });

  // En muntar l'app, comprova recurrents pendents
  useEffect(() => {
    if (recurring.length === 0) return;
    const { newExpenses, updatedRecurring } = processPendingRecurring(recurring, expenses);
    if (newExpenses.length === 0) return;
    const updatedExpenses = [...newExpenses, ...expenses];
    setExpenses(updatedExpenses);
    setRecurring(updatedRecurring);
    localStorage.setItem("expenses",  JSON.stringify(updatedExpenses));
    localStorage.setItem("recurring", JSON.stringify(updatedRecurring));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addExpense = (newExpense: Omit<Expense, "id" | "date">) => {
    const expense: Expense = {
      id: Date.now(),
      amount: newExpense.amount,
      category: newExpense.category,
      date: new Date().toISOString(),
      note: newExpense.note,
    };
    const updated = [expense, ...expenses];
    setExpenses(updated);
    localStorage.setItem("expenses", JSON.stringify(updated));
  };

  const deleteExpense = (id: number) => {
    const updated = expenses.filter((e) => e.id !== id);
    setExpenses(updated);
    localStorage.setItem("expenses", JSON.stringify(updated));
  };

  const addRecurring = (r: Omit<RecurringExpense, "id" | "lastTriggered">) => {
    const newR: RecurringExpense = { ...r, id: Date.now() };
    const updated = [...recurring, newR];
    setRecurring(updated);
    localStorage.setItem("recurring", JSON.stringify(updated));
  };

  const deleteRecurring = (id: number) => {
    const updated = recurring.filter((r) => r.id !== id);
    setRecurring(updated);
    localStorage.setItem("recurring", JSON.stringify(updated));
  };

  const handleBudgetChange = (val: number) => {
    setBudget(val);
    localStorage.setItem("budget", String(val));
  };

  const handleProfileChange = (p: UserProfile) => {
    setProfile(p);
    localStorage.setItem("profile", JSON.stringify(p));
  };

  return (
    <div className="app">
      <div className="container">

        {tab === "home" && (
          <Home
            expenses={expenses}
            recurring={recurring}
            budget={budget}
            onAddExpense={addExpense}
            onDeleteExpense={deleteExpense}
            onAddRecurring={addRecurring}
            onDeleteRecurring={deleteRecurring}
          />
        )}
        {tab === "history" && (
          <div className="body" style={{ padding: "2rem", textAlign: "center" }}>
            <p>Historial (pròximament)</p>
          </div>
        )}
        {tab === "settings" && (
          <Settings
            budget={budget}
            onBudgetChange={handleBudgetChange}
            profile={profile}
            onProfileChange={handleProfileChange}
            expenses={expenses}
          />
        )}

        <nav className="nav-bar">
          <button className={`nav-item${tab === "home" ? " active" : ""}`} onClick={() => setTab("home")}>
            <img src={homeIcon} className="nav-icon" alt="inici" />
            <span>Inici</span>
          </button>
          <button className={`nav-item${tab === "history" ? " active" : ""}`} onClick={() => setTab("history")}>
            <img src={grafIcon} className="nav-icon" alt="historial" />
            <span>Historial</span>
          </button>
          <button className={`nav-item${tab === "settings" ? " active" : ""}`} onClick={() => setTab("settings")}>
            <img src={settingsIcon} className="nav-icon" alt="configuració" />
            <span>Config.</span>
          </button>
        </nav>

      </div>
    </div>
  );
}

export default App;