import { useState } from "react";
import type { Expense } from "../constants";

// ─── Types ────────────────────────────────────────────────────────────────────
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
};

// ─── Settings ─────────────────────────────────────────────────────────────────
function Settings({ budget, onBudgetChange, profile, onProfileChange, expenses }: SettingsProps) {
  const [notifications, setNotifications] = useState(() => {
    return localStorage.getItem("notifications") !== "false";
  });

  // ── Edició pressupost ──
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput]     = useState(String(budget));

  const saveBudget = () => {
    const val = parseFloat(budgetInput);
    if (!isNaN(val) && val > 0) onBudgetChange(val);
    setEditingBudget(false);
  };

  // ── Edició perfil ──
  const [editingProfile, setEditingProfile] = useState(false);
  const [nameInput, setNameInput]   = useState(profile.name);
  const [emailInput, setEmailInput] = useState(profile.email);

  const saveProfile = () => {
    onProfileChange({ name: nameInput, email: emailInput });
    setEditingProfile(false);
  };

  // ── Exportar dades ──
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

  const toggleNotifications = (val: boolean) => {
    setNotifications(val);
    localStorage.setItem("notifications", String(val));
  };

  const initial = profile.name?.trim()[0]?.toUpperCase() || "?";

  return (
    <>
      {/* ── HEADER ── */}
      <div className="header settings-header">
        <p className="settings-header-title">Configuració</p>
      </div>

      {/* ── BODY ── */}
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

        {/* Secció pressupost */}
        <p className="settings-section-label">PRESSUPOST</p>
        <div className="settings-card">
          <div className="settings-row">
            <div className="settings-row-icon" style={{ background: "#ede9fe" }}>
              <span>$</span>
            </div>
            <div className="settings-row-info">
              <p className="settings-row-title">Pressupost mensual</p>
              <p className="settings-row-sub">{budget}€ per mes</p>
            </div>
            <button className="settings-edit-btn" onClick={() => { setBudgetInput(String(budget)); setEditingBudget(true); }}>
              Edita
            </button>
          </div>
        </div>

        {/* Secció preferències */}
        <p className="settings-section-label">PREFERÈNCIES</p>
        <div className="settings-card">
          <div className="settings-row">
            <div className="settings-row-icon" style={{ background: "#fef3c7" }}>
              <span>🔔</span>
            </div>
            <div className="settings-row-info">
              <p className="settings-row-title">Notificacions</p>
              <p className="settings-row-sub">Alertes de pressupost</p>
            </div>
            <button
              className={`settings-toggle${notifications ? " on" : ""}`}
              onClick={() => toggleNotifications(!notifications)}
            >
              <span className="settings-toggle-knob" />
            </button>
          </div>
        </div>

        {/* Secció dades */}
        <p className="settings-section-label">DADES</p>
        <div className="settings-card">
          <div className="settings-row clickable" onClick={exportData}>
            <div className="settings-row-icon" style={{ background: "#dbeafe" }}>
              <span>↓</span>
            </div>
            <div className="settings-row-info">
              <p className="settings-row-title">Exportar dades</p>
              <p className="settings-row-sub">CSV o JSON</p>
            </div>
            <span className="settings-chevron">›</span>
          </div>

          <div className="settings-divider" />

          <div className="settings-row">
            <div className="settings-row-icon" style={{ background: "#d1fae5" }}>
              <span>🛡</span>
            </div>
            <div className="settings-row-info">
              <p className="settings-row-title">Privacitat</p>
              <p className="settings-row-sub">Dades locals al dispositiu</p>
            </div>
            <span className="settings-chevron">›</span>
          </div>
        </div>

      </div>

      {/* ── MODAL PRESSUPOST ── */}
      {editingBudget && (
        <div className="modal-overlay" onClick={() => setEditingBudget(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <h2>Pressupost mensual</h2>
            <input
              type="number"
              placeholder="Import (€)"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              autoFocus
            />
            <button className="btn-primary" onClick={saveBudget}>Guardar</button>
            <button className="btn-secondary" onClick={() => setEditingBudget(false)}>Cancel·lar</button>
          </div>
        </div>
      )}

      {/* ── MODAL PERFIL ── */}
      {editingProfile && (
        <div className="modal-overlay" onClick={() => setEditingProfile(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <h2>Editar perfil</h2>
            <input
              type="text"
              placeholder="Nom"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              autoFocus
            />
            <input
              type="email"
              placeholder="Correu electrònic"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
            />
            <button className="btn-primary" onClick={saveProfile}>Guardar</button>
            <button className="btn-secondary" onClick={() => setEditingProfile(false)}>Cancel·lar</button>
          </div>
        </div>
      )}
    </>
  );
}

export default Settings;