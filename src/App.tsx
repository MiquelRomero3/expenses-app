import { useState, useEffect } from "react";
import homeIcon     from "./assets/home.svg";
import grafIcon     from "./assets/graf.svg";
import settingsIcon from "./assets/settings.svg";
import "./App.css";
import Home         from "./pages/Home";
import Settings     from "./pages/Settings";
import Auth         from "./pages/Auth";
import type { UserProfile } from "./pages/Settings";
import type { Expense, RecurringExpense } from "./constants";
import { supabase } from "./supabase";
import type { Session } from "@supabase/supabase-js";

// ─── DB mappers ───────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbToExpense(row: any): Expense {
  return {
    id:          row.id,
    amount:      parseFloat(row.amount),
    category:    row.category,
    note:        row.note ?? undefined,
    date:        row.date,
    recurringId: row.recurring_id ?? undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbToRecurring(row: any): RecurringExpense {
  return {
    id:            row.id,
    amount:        parseFloat(row.amount),
    category:      row.category,
    note:          row.note ?? undefined,
    dayOfMonth:    row.day_of_month,
    lastTriggered: row.last_triggered ?? undefined,
  };
}

function currentYearMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

// ─── App ─────────────────────────────────────────────────────────────────────
function App() {
  const [session,     setSession]     = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  const [tab, setTab] = useState<"home" | "history" | "settings">("home");

  const [expenses,    setExpenses]    = useState<Expense[]>([]);
  const [recurring,   setRecurring]   = useState<RecurringExpense[]>([]);
  const [budget,      setBudget]      = useState(400);
  const [salary,      setSalary]      = useState(0);
  const [savingsGoal, setSavingsGoal] = useState(0);
  const [profile,     setProfile]     = useState<UserProfile>({ name: "", email: "" });

  // ── Auth listener ──────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // ── Carregar dades quan hi ha sessió ───────────────────────────────────────
  useEffect(() => {
    if (!session) return;
    loadAll(session.user.id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const loadAll = async (userId: string) => {
    setDataLoading(true);

    const [{ data: recData }, { data: setData }] = await Promise.all([
      supabase.from("recurring_expenses").select("*").eq("user_id", userId),
      supabase.from("user_settings").select("*").eq("user_id", userId).single(),
    ]);

    const loadedRecurring = (recData ?? []).map(dbToRecurring);
    setRecurring(loadedRecurring);

    if (setData) {
      setBudget(parseFloat(setData.budget));
      setSalary(parseFloat(setData.salary));
      setSavingsGoal(parseFloat(setData.savings_goal));
      setProfile({ name: setData.profile_name, email: setData.profile_email });
    }

    // Si hi ha recurrents pendents aquest mes, processar-les ara (fallback del cron)
    const yearMonth = currentYearMonth();
    const hasPending = loadedRecurring.some(
      (r) => r.dayOfMonth <= new Date().getDate() && r.lastTriggered !== yearMonth
    );
    if (hasPending) {
      await supabase.rpc("process_recurring_expenses");
    }

    // Carregar despeses (ja inclou les recurrents acabades de generar)
    const { data: expData } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    setExpenses((expData ?? []).map(dbToExpense));
    setDataLoading(false);
  };

  // ── Helpers settings ───────────────────────────────────────────────────────
  const upsertSettings = async (patch: Record<string, unknown>) => {
    if (!session) return;
    await supabase.from("user_settings").upsert({
      user_id:       session.user.id,
      budget,
      salary,
      savings_goal:  savingsGoal,
      profile_name:  profile.name,
      profile_email: profile.email,
      ...patch,
    });
  };

  // ── Handlers ───────────────────────────────────────────────────────────────
  const addExpense = async (newExpense: Omit<Expense, "id" | "date">) => {
    if (!session) return;
    const { data } = await supabase
      .from("expenses")
      .insert({
        user_id:  session.user.id,
        amount:   newExpense.amount,
        category: newExpense.category,
        note:     newExpense.note ?? null,
        date:     new Date().toISOString(),
      })
      .select()
      .single();
    if (data) setExpenses((prev) => [dbToExpense(data), ...prev]);
  };

  const deleteExpense = async (id: number) => {
    await supabase.from("expenses").delete().eq("id", id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const addRecurring = async (r: Omit<RecurringExpense, "id" | "lastTriggered">) => {
    if (!session) return;
    const { data } = await supabase
      .from("recurring_expenses")
      .insert({
        user_id:      session.user.id,
        amount:       r.amount,
        category:     r.category,
        note:         r.note ?? null,
        day_of_month: r.dayOfMonth,
      })
      .select()
      .single();
    if (data) {
      const newRecurring = dbToRecurring(data);
      setRecurring((prev) => [...prev, newRecurring]);

      // Si el dia ja ha passat aquest mes, generar la despesa immediatament
      const yearMonth = currentYearMonth();
      if (newRecurring.dayOfMonth <= new Date().getDate() && newRecurring.lastTriggered !== yearMonth) {
        await supabase.rpc("process_recurring_expenses");
        const { data: freshExp } = await supabase
          .from("expenses")
          .select("*")
          .eq("user_id", session.user.id)
          .order("date", { ascending: false });
        if (freshExp) setExpenses(freshExp.map(dbToExpense));
      }
    }
  };

  const deleteRecurring = async (id: number) => {
    await supabase.from("recurring_expenses").delete().eq("id", id);
    setRecurring((prev) => prev.filter((r) => r.id !== id));
  };

  const handleBudgetChange = async (val: number) => {
    setBudget(val);
    await upsertSettings({ budget: val });
  };

  const handleSalaryChange = async (val: number) => {
    setSalary(val);
    await upsertSettings({ salary: val });
  };

  const handleSavingsGoalChange = async (val: number) => {
    setSavingsGoal(val);
    await upsertSettings({ savings_goal: val });
  };

  const handleProfileChange = async (p: UserProfile) => {
    setProfile(p);
    await upsertSettings({ profile_name: p.name, profile_email: p.email });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setExpenses([]);
    setRecurring([]);
    setBudget(400);
    setSalary(0);
    setSavingsGoal(0);
    setProfile({ name: "", email: "" });
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="app">
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh" }}>
          <p style={{ color: "#9ca3af" }}>Carregant...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="app">
        <div className="container">
          <Auth />
        </div>
      </div>
    );
  }

  if (dataLoading) {
    return (
      <div className="app">
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh" }}>
          <p style={{ color: "#9ca3af" }}>Carregant dades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="container">

        {tab === "home" && (
          <Home
            expenses={expenses}
            recurring={recurring}
            budget={budget}
            salary={salary}
            savingsGoal={savingsGoal}
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
            recurring={recurring}
            salary={salary}
            onSalaryChange={handleSalaryChange}
            savingsGoal={savingsGoal}
            onSavingsGoalChange={handleSavingsGoalChange}
            onLogout={handleLogout}
          />
        )}

        <nav className="nav-bar">
          <button className={`nav-item${tab === "home"     ? " active" : ""}`} onClick={() => setTab("home")}>
            <img src={homeIcon}     className="nav-icon" alt="inici" />
            <span>Inici</span>
          </button>
          <button className={`nav-item${tab === "history"  ? " active" : ""}`} onClick={() => setTab("history")}>
            <img src={grafIcon}     className="nav-icon" alt="historial" />
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