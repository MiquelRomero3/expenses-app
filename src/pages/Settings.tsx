import { useState } from "react";
import type { Expense, RecurringExpense } from "../constants";

export type UserProfile = {
  name: string;
  email: string;
};

type SettingsProps = {
  budget: number;
  onBudgetChange: (value: number) => void;
  profile: UserProfile;
  onProfileChange: (p: UserProfile) => void;
  expenses: Expense[];
  recurring: RecurringExpense[];
  salary: number;
  onSalaryChange: (val: number) => void;
  savingsGoal: number;
  onSavingsGoalChange: (val: number) => void;
  onLogout: () => void;
};

function Settings({ budget, onBudgetChange, profile, onProfileChange, expenses, recurring, salary, onSalaryChange, savingsGoal, onSavingsGoalChange, onLogout }: SettingsProps) {
  const [notifications, setNotifications] = useState(true);

  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput]     = useState(String(budget));

  const [editingSalary, setEditingSalary]       = useState(false);
  const [salaryInput, setSalaryInput]           = useState(String(salary || ""));
  const [savingsGoalInput, setSavingsGoalInput] = useState(String(savingsGoal || ""));

  const [editingProfile, setEditingProfile] = useState(false);
  const [nameInput, setNameInput]   = useState(profile.name);
  const [emailInput, setEmailInput] = useState(profile.email);

  const saveBudget = () => {
    const val = parseFloat(budgetInput);
    if (!isNaN(val) && val > 0) onBudgetChange(val);
    setEditingBudget(false);
  };

  const saveSalary = () => {
    const s = parseFloat(salaryInput);
    const g = parseFloat(savingsGoalInput);
    if (!isNaN(s) && s > 0) onSalaryChange(s);
    if (!isNaN(g) && g > 0) onSavingsGoalChange(g);
    setEditingSalary(false);
  };

  const saveProfile = () => {
    onProfileChange({ name: nameInput, email: emailInput });
    setEditingProfile(false);
  };

  const exportData = () => {
    const data = JSON.stringify(expenses, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `despeses_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const initial = profile.name?.trim()[0]?.toUpperCase() || "?";
  const totalRecurring = recurring.reduce((s, r) => s + r.amount, 0);
  const recommendedBudget = salary > 0 && savingsGoal > 0
    ? salary - savingsGoal - totalRecurring
    : null;
  const isRecommendedApplied = recommendedBudget !== null && budget === recommendedBudget;

  return (
    <>
      <div className="header settings-header">
        <p className="settings-header-title">Configuració</p>
      </div>

      <div className="body settings-body">

        {/* Perfil */}
        <div className="settings-profile-card" onClick={() => setEditingProfile(true)}>
          <div className="settings-avatar">{initial}</div>
          <div className="settings-profile-info">
            <p className="settings-profile-name">{profile.name || "Sense nom"}</p>
            <p className="settings-profile-email">{profile.email || "Sense correu"}</p>
            <p className="settings-profile-status">
              <span className="settings-status-dot" />
              Compte personal actiu
            </p>
          </div>
        </div>

        {/* Sou i estalvi */}
        <p className="settings-section-label">SOU I ESTALVI</p>
        <div className="settings-card">
          <div className="settings-row clickable" onClick={() => { setSalaryInput(String(salary || "")); setSavingsGoalInput(String(savingsGoal || "")); setEditingSalary(true); }}>
            <div className="settings-row-icon" style={{ background: "#d1fae5" }}><span>💰</span></div>
            <div className="settings-row-info">
              <p className="settings-row-title">Sou net mensual</p>
              <p className="settings-row-sub">{salary > 0 ? `${salary}€` : "No configurat"}</p>
            </div>
            <button className="settings-edit-btn">Edita</button>
          </div>

          <div className="settings-divider" />

          <div className="settings-row clickable" onClick={() => { setSalaryInput(String(salary || "")); setSavingsGoalInput(String(savingsGoal || "")); setEditingSalary(true); }}>
            <div className="settings-row-icon" style={{ background: "#dbeafe" }}><span>🎯</span></div>
            <div className="settings-row-info">
              <p className="settings-row-title">Objectiu d'estalvi</p>
              <p className="settings-row-sub">{savingsGoal > 0 ? `${savingsGoal}€ / mes` : "No configurat"}</p>
            </div>
            <button className="settings-edit-btn">Edita</button>
          </div>

          {recommendedBudget !== null && (
            <div className="settings-recommendation">
              <div className="settings-recommendation-top">
                <span>💡</span>
                <p>Pressupost recomanat: <strong>{recommendedBudget}€/mes</strong></p>
                {!isRecommendedApplied && (
                  <button
                    className="settings-apply-btn"
                    onClick={() => onBudgetChange(recommendedBudget)}
                  >
                    Aplica
                  </button>
                )}
                {isRecommendedApplied && (
                  <span className="settings-applied-badge">✓ Aplicat</span>
                )}
              </div>
              <div className="settings-recommendation-breakdown">
                <span>Sou {salary}€</span>
                <span>− Estalvi {savingsGoal}€</span>
                {totalRecurring > 0 && <span>− Hàbits {totalRecurring}€</span>}
                <span className="settings-breakdown-result">= {recommendedBudget}€</span>
              </div>
            </div>
          )}
        </div>

        {/* Pressupost */}
        <p className="settings-section-label">PRESSUPOST</p>
        <div className="settings-card">
          <div className="settings-row">
            <div className="settings-row-icon" style={{ background: "#ede9fe" }}><span>$</span></div>
            <div className="settings-row-info">
              <p className="settings-row-title">Pressupost mensual</p>
              <p className="settings-row-sub">{budget}€ per mes</p>
            </div>
            <button className="settings-edit-btn" onClick={() => { setBudgetInput(String(budget)); setEditingBudget(true); }}>Edita</button>
          </div>
        </div>

        {/* Preferències */}
        <p className="settings-section-label">PREFERÈNCIES</p>
        <div className="settings-card">
          <div className="settings-row">
            <div className="settings-row-icon" style={{ background: "#fef3c7" }}><span>🔔</span></div>
            <div className="settings-row-info">
              <p className="settings-row-title">Notificacions</p>
              <p className="settings-row-sub">Alertes de pressupost</p>
            </div>
            <button className={`settings-toggle${notifications ? " on" : ""}`} onClick={() => setNotifications(!notifications)}>
              <span className="settings-toggle-knob" />
            </button>
          </div>
        </div>

        {/* Dades */}
        <p className="settings-section-label">DADES</p>
        <div className="settings-card">
          <div className="settings-row clickable" onClick={exportData}>
            <div className="settings-row-icon" style={{ background: "#dbeafe" }}><span>↓</span></div>
            <div className="settings-row-info">
              <p className="settings-row-title">Exportar dades</p>
              <p className="settings-row-sub">JSON</p>
            </div>
            <span className="settings-chevron">›</span>
          </div>

          <div className="settings-divider" />

          <div className="settings-row">
            <div className="settings-row-icon" style={{ background: "#d1fae5" }}><span>🛡</span></div>
            <div className="settings-row-info">
              <p className="settings-row-title">Privacitat</p>
              <p className="settings-row-sub">Dades sincronitzades amb Supabase</p>
            </div>
            <span className="settings-chevron">›</span>
          </div>
        </div>

        {/* Sessió */}
        <p className="settings-section-label">SESSIÓ</p>
        <div className="settings-card">
          <div className="settings-row clickable" onClick={onLogout}>
            <div className="settings-row-icon" style={{ background: "#fee2e2" }}><span>🚪</span></div>
            <div className="settings-row-info">
              <p className="settings-row-title" style={{ color: "#dc2626" }}>Tancar sessió</p>
              <p className="settings-row-sub">Sortir del compte actual</p>
            </div>
            <span className="settings-chevron">›</span>
          </div>
        </div>

      </div>

      {/* MODAL PRESSUPOST */}
      {editingBudget && (
        <div className="modal-overlay" onClick={() => setEditingBudget(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <h2>Pressupost mensual</h2>
            <input type="number" placeholder="Import (€)" value={budgetInput} onChange={(e) => setBudgetInput(e.target.value)} autoFocus />
            <button className="btn-primary" onClick={saveBudget}>Guardar</button>
            <button className="btn-secondary" onClick={() => setEditingBudget(false)}>Cancel·lar</button>
          </div>
        </div>
      )}

      {/* MODAL SOU I ESTALVI */}
      {editingSalary && (
        <div className="modal-overlay" onClick={() => setEditingSalary(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <h2>Sou i objectiu d'estalvi</h2>
            <input type="number" placeholder="Sou net mensual (€)" value={salaryInput} onChange={(e) => setSalaryInput(e.target.value)} autoFocus />
            <input type="number" placeholder="Objectiu d'estalvi mensual (€)" value={savingsGoalInput} onChange={(e) => setSavingsGoalInput(e.target.value)} />
            {salaryInput && savingsGoalInput && (
              <p className="modal-hint">
                💡 Pressupost recomanat: <strong>{Math.max(0, parseFloat(salaryInput) - parseFloat(savingsGoalInput) - totalRecurring)}€</strong>
                {totalRecurring > 0 && <span className="modal-hint-detail"> ({parseFloat(salaryInput)}€ − {parseFloat(savingsGoalInput)}€ estalvi − {totalRecurring}€ hàbits)</span>}
              </p>
            )}
            <button className="btn-primary" onClick={saveSalary}>Guardar</button>
            <button className="btn-secondary" onClick={() => setEditingSalary(false)}>Cancel·lar</button>
          </div>
        </div>
      )}

      {/* MODAL PERFIL */}
      {editingProfile && (
        <div className="modal-overlay" onClick={() => setEditingProfile(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <h2>Editar perfil</h2>
            <input type="text" placeholder="Nom" value={nameInput} onChange={(e) => setNameInput(e.target.value)} autoFocus />
            <input type="email" placeholder="Correu electrònic" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} />
            <button className="btn-primary" onClick={saveProfile}>Guardar</button>
            <button className="btn-secondary" onClick={() => setEditingProfile(false)}>Cancel·lar</button>
          </div>
        </div>
      )}
    </>
  );
}

export default Settings;