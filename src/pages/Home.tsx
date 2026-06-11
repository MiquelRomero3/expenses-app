import { useState } from "react";
import { CATEGORIES, CAT_KEYS, MONTHS, getCfg } from "../constants";
import type { Expense, RecurringExpense } from "../constants";

type HomeProps = {
  expenses: Expense[];
  recurring: RecurringExpense[];
  budget: number;
  salary: number;
  savingsGoal: number;
  onAddExpense: (expense: Omit<Expense, "id" | "date">) => void;
  onDeleteExpense: (id: number) => void;
  onAddRecurring: (r: Omit<RecurringExpense, "id" | "lastTriggered">) => void;
  onDeleteRecurring: (id: number) => void;
};

function Home({ expenses, recurring, budget, salary, savingsGoal, onAddExpense, onDeleteExpense, onAddRecurring, onDeleteRecurring }: HomeProps) {

  const [selectedMonth, setSelectedMonth]         = useState(new Date().getMonth());
  const [showAllExpenses, setShowAllExpenses]     = useState(false);
  const [showAllCats, setShowAllCats]             = useState(false);
  const [fabOpen, setFabOpen]                     = useState(false);
  const [showForm, setShowForm]                   = useState(false);
  const [amount, setAmount]                       = useState("");
  const [category, setCategory]                   = useState("");
  const [note, setNote]                           = useState("");
  const [showRecurringForm, setShowRecurringForm] = useState(false);
  const [rAmount, setRAmount]                     = useState("");
  const [rCategory, setRCategory]                 = useState("");
  const [rNote, setRNote]                         = useState("");
  const [rDay, setRDay]                           = useState("1");

  const handleAddExpense = () => {
    if (!amount || !category) return;
    onAddExpense({ amount: parseFloat(amount), category, note: note || undefined });
    setAmount(""); setCategory(""); setNote("");
    setShowForm(false);
  };

  const handleAddRecurring = () => {
    if (!rAmount || !rCategory) return;
    onAddRecurring({ amount: parseFloat(rAmount), category: rCategory, note: rNote || undefined, dayOfMonth: parseInt(rDay, 10) });
    setRAmount(""); setRCategory(""); setRNote(""); setRDay("1");
    setShowRecurringForm(false);
  };

  const openPuntual   = () => { setFabOpen(false); setShowForm(true); };
  const openRecurring = () => { setFabOpen(false); setShowRecurringForm(true); };

  // ── Càlculs ──────────────────────────────────────────────────────────────
  const currentMonthIdx = new Date().getMonth();
  const isCurrentMonth  = selectedMonth === currentMonthIdx;
  const visibleMonths   = Array.from({ length: 6 }, (_, i) => (currentMonthIdx - 5 + i + 12) % 12);

  const monthExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() === selectedMonth && d.getFullYear() === new Date().getFullYear();
  });

  const total     = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const pct       = Math.min((total / budget) * 100, 100);
  const over      = total > budget;
  const remaining = budget - total;

  const todayStr   = new Date().toDateString();
  const todayTotal = expenses
    .filter((e) => new Date(e.date).toDateString() === todayStr)
    .reduce((s, e) => s + e.amount, 0);

  const dayOfMonth = isCurrentMonth
    ? new Date().getDate()
    : new Date(new Date().getFullYear(), selectedMonth + 1, 0).getDate();
  const dailyAvg = dayOfMonth > 0 ? total / dayOfMonth : 0;

  const currentSavings = salary > 0 ? salary - budget : null;
  const savingsOnTrack = currentSavings !== null && savingsGoal > 0 ? currentSavings >= savingsGoal : null;

  const catMap: Record<string, number> = {};
  monthExpenses.forEach((e) => { catMap[e.category] = (catMap[e.category] || 0) + e.amount; });
  const catTotals = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
  const maxCat    = catTotals[0]?.[1] || 1;

  const visibleExpenses = showAllExpenses ? monthExpenses : monthExpenses.slice(0, 6);

  return (
    <>
      {/* HEADER */}
      <div className="header">
        <div className="header-top-row">
          <div>
            <p className="header-eyebrow">Pressupost mensual</p>
            <p className="header-month">{MONTHS[selectedMonth]} 2026</p>
          </div>
        </div>
        <div className="header-balance">
          <div>
            <p className="header-balance-label">Total gastat</p>
            <p className="header-balance-amount">
              {total.toFixed(2)}€
              <span className="header-balance-budget"> / {budget}€</span>
            </p>
          </div>
        </div>
        <div className="progress-wrap">
          <div className="progress-bg">
            <div className={`progress-fill${over ? " over" : ""}`} style={{ width: `${pct}%` }} />
          </div>
          <div className="progress-labels">
            <span>{Math.round(pct)}% usat</span>
            <span className={over ? "over-text" : ""}>
              {over ? `${(total - budget).toFixed(2)}€ passat` : `${remaining.toFixed(2)}€ restants`}
            </span>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="body">

        {/* Month tabs */}
        <div className="month-scroll">
          {visibleMonths.map((m) => (
            <button key={m} className={`month-chip${m === selectedMonth ? " active" : ""}`} onClick={() => setSelectedMonth(m)}>
              {MONTHS[m]}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="stats-grid">
          {isCurrentMonth ? (
            <div className="stat-card">
              <div className="stat-header"><span className="stat-icon green">↓</span><span className="stat-label">Avui gastat</span></div>
              <p className="stat-value">{todayTotal.toFixed(2)}€</p>
            </div>
          ) : (
            <div className="stat-card">
              <div className="stat-header"><span className="stat-icon green">↓</span><span className="stat-label">Total del mes</span></div>
              <p className="stat-value">{total.toFixed(2)}€</p>
            </div>
          )}
          <div className="stat-card">
            <div className="stat-header"><span className="stat-icon orange">↑</span><span className="stat-label">Mitjana diària</span></div>
            <p className="stat-value">{dailyAvg.toFixed(2)}€</p>
          </div>
        </div>

        {/* Targeta estalvi */}
        {salary > 0 && savingsGoal > 0 && (
          <div className="section">
            <div className="savings-card">
              <div className="savings-row">
                <div className="savings-icon">🏦</div>
                <div className="savings-info">
                  <p className="savings-label">{isCurrentMonth ? "Estalvi previst aquest mes" : `Estalvi previst ${MONTHS[selectedMonth]}`}</p>
                  <p className="savings-amount">{currentSavings!.toFixed(2)}€</p>
                </div>
                <div className={`savings-badge ${savingsOnTrack ? "on-track" : "off-track"}`}>
                  {savingsOnTrack ? "✓ En camí" : "✗ Per sota"}
                </div>
              </div>
              <div className="savings-bar-bg">
                <div
                  className={`savings-bar-fill ${savingsOnTrack ? "on-track" : "off-track"}`}
                  style={{ width: `${Math.min((currentSavings! / savingsGoal) * 100, 100)}%` }}
                />
              </div>
              <div className="savings-bar-labels">
                <span>Objectiu: {savingsGoal}€</span>
                <span>{Math.round((currentSavings! / savingsGoal) * 100)}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Despeses programades */}
        {recurring.length > 0 && (
          <div className="section">
            <div className="section-header">
              <span className="section-title">Despeses programades</span>
            </div>
            <div className="expense-card">
              {recurring.map((r) => {
                const cfg = getCfg(r.category);
                return (
                  <div key={r.id} className="expense-row">
                    <div className="expense-icon" style={{ background: cfg.bg }}><span>{cfg.emoji}</span></div>
                    <div className="expense-info">
                      <p className="expense-name">{r.note || r.category}</p>
                      <p className="expense-date">Cada mes, dia {r.dayOfMonth}</p>
                    </div>
                    <div className="expense-right">
                      <span className="expense-amount">-{r.amount.toFixed(2)}€</span>
                      <button className="delete-btn" onClick={() => onDeleteRecurring(r.id)}>✕</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Categories */}
        {catTotals.length > 0 && (
          <div className="section">
            <div className="section-header">
              <span className="section-title">Per categories</span>
              <button className="section-link" onClick={() => setShowAllCats(!showAllCats)}>
                {showAllCats ? "Veure-ne menys ›" : "Veure-les totes ›"}
              </button>
            </div>
            <div className="cat-list">
              {(showAllCats ? catTotals : catTotals.slice(0, 4)).map(([cat, amt]) => {
                const cfg    = getCfg(cat);
                const barPct = Math.round((amt / maxCat) * 100);
                return (
                  <div key={cat} className="cat-row">
                    <div className="cat-icon" style={{ background: cfg.bg }}><span>{cfg.emoji}</span></div>
                    <div className="cat-info">
                      <div className="cat-labels">
                        <span className="cat-name">{cat}</span>
                        <span className="cat-amount">{amt.toFixed(2)}€</span>
                      </div>
                      <div className="cat-bar-bg">
                        <div className="cat-bar-fill" style={{ width: `${barPct}%`, background: cfg.color }} />
                      </div>
                    </div>
                    <span className="cat-pct">{Math.round((amt / total) * 100)}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Despeses recents */}
        <div className="section">
          <div className="section-header">
            <span className="section-title">Despeses recents</span>
            <button className="section-link" onClick={() => setShowAllExpenses(!showAllExpenses)}>
              {showAllExpenses ? "Veure-ne menys ›" : "Veure-les totes ›"}
            </button>
          </div>
          <div className="expense-card">
            {visibleExpenses.length === 0 && <p className="empty">Cap despesa aquest mes</p>}
            {visibleExpenses.map((e) => {
              const cfg = getCfg(e.category);
              return (
                <div key={e.id} className="expense-row">
                  <div className="expense-icon" style={{ background: cfg.bg }}><span>{cfg.emoji}</span></div>
                  <div className="expense-info">
                    <p className="expense-name">
                      {e.note || e.category}
                      {e.recurringId && <span className="recurring-badge">↻</span>}
                    </p>
                    <p className="expense-date">
                      {new Date(e.date).toLocaleDateString("ca-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div className="expense-right">
                    <span className="expense-amount">-{e.amount.toFixed(2)}€</span>
                    <button className="delete-btn" onClick={() => onDeleteExpense(e.id)}>✕</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* MODAL DESPESA PUNTUAL */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-card" onClick={(ev) => ev.stopPropagation()}>
            <div className="modal-handle" />
            <h2>Nova despesa</h2>
            <input type="number" placeholder="Import (€)" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <div className="cat-picker-grid">
              {CAT_KEYS.map((key) => (
                <button key={key} type="button" onClick={() => setCategory(key)} className={`cat-pill ${category === key ? "selected" : ""}`}>
                  <span>{CATEGORIES[key].emoji}</span><span>{key}</span>
                </button>
              ))}
            </div>
            <input type="text" placeholder="Nota (opcional)" value={note} onChange={(e) => setNote(e.target.value)} />
            <button className="btn-primary" onClick={handleAddExpense}>Afegir despesa</button>
            <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancel·lar</button>
          </div>
        </div>
      )}

      {/* MODAL DESPESA RECURRENT */}
      {showRecurringForm && (
        <div className="modal-overlay" onClick={() => setShowRecurringForm(false)}>
          <div className="modal-card" onClick={(ev) => ev.stopPropagation()}>
            <div className="modal-handle" />
            <h2>Despesa programada</h2>
            <input type="number" placeholder="Import (€)" value={rAmount} onChange={(e) => setRAmount(e.target.value)} />
            <div className="cat-picker-grid">
              {CAT_KEYS.map((key) => (
                <button key={key} type="button" onClick={() => setRCategory(key)} className={`cat-pill ${rCategory === key ? "selected" : ""}`}>
                  <span>{CATEGORIES[key].emoji}</span><span>{key}</span>
                </button>
              ))}
            </div>
            <input type="text" placeholder="Nota (ex: Netflix)" value={rNote} onChange={(e) => setRNote(e.target.value)} />
            <div className="day-picker-wrap">
              <label className="day-picker-label">Dia del mes que es cobra</label>
              <input type="number" min="1" max="28" placeholder="Dia (1-28)" value={rDay} onChange={(e) => setRDay(e.target.value)} />
            </div>
            <button className="btn-primary" onClick={handleAddRecurring}>Programar despesa</button>
            <button className="btn-secondary" onClick={() => setShowRecurringForm(false)}>Cancel·lar</button>
          </div>
        </div>
      )}

      {/* FAB MENU */}
      {fabOpen && (
        <div className="fab-menu-overlay" onClick={() => setFabOpen(false)}>
          <div className="fab-menu" onClick={(e) => e.stopPropagation()}>
            <button className="fab-menu-item" onClick={openRecurring}>
              <span className="fab-menu-icon">↻</span>
              <div>
                <p className="fab-menu-title">Despesa programada</p>
                <p className="fab-menu-sub">S'afegeix automàticament cada mes</p>
              </div>
            </button>
            <div className="fab-menu-divider" />
            <button className="fab-menu-item" onClick={openPuntual}>
              <span className="fab-menu-icon">+</span>
              <div>
                <p className="fab-menu-title">Despesa puntual</p>
                <p className="fab-menu-sub">Una despesa d'avui</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* FAB */}
      <button className={`fab${fabOpen ? " fab-open" : ""}`} onClick={() => setFabOpen(!fabOpen)}>
        {fabOpen ? "✕" : "+"}
      </button>
    </>
  );
}

export default Home;