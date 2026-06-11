import { useState } from "react";
import { supabase } from "../supabase";

function Auth() {
  const [mode, setMode]             = useState<"login" | "register">("login");
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [loading, setLoading]       = useState(false);
  const [sent, setSent]             = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    if (mode === "register") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setSent(true);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError("Correu o contrasenya incorrectes");
    }
    setLoading(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  if (sent) {
    return (
      <div className="auth-root">
        <div className="auth-hero">
          <div className="auth-hero-circles" />
          <div className="auth-logo-wrap">
            <div className="auth-logo">💸</div>
          </div>
          <h1 className="auth-hero-title">SpendTrack</h1>
          <p className="auth-hero-sub">Controla les teves despeses</p>
        </div>
        <div className="auth-sheet">
          <div className="auth-sent-icon">📬</div>
          <h2 className="auth-sheet-title">Comprova el correu</h2>
          <p className="auth-sheet-sub">
            T'hem enviat un enllaç de confirmació a <strong>{email}</strong>.
            Confirma'l i torna aquí per entrar.
          </p>
          <button className="auth-btn-primary" onClick={() => { setSent(false); setMode("login"); }}>
            Torna a l'inici de sessió
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-root">
      <div className="auth-hero">
        <div className="auth-hero-circles" />
        <div className="auth-logo-wrap">
          <div className="auth-logo">💸</div>
        </div>
        <h1 className="auth-hero-title">SpendTrack</h1>
        <p className="auth-hero-sub">Controla les teves despeses</p>
      </div>

      <div className="auth-sheet">
        {mode === "register" && (
          <button className="auth-back-btn" onClick={() => { setMode("login"); setError(null); }}>
            ‹ Enrere
          </button>
        )}

        <h2 className="auth-sheet-title">
          {mode === "login" ? "Benvingut de nou" : "Crear compte"}
        </h2>
        <p className="auth-sheet-sub">
          {mode === "login" ? "Inicia sessió al teu compte" : "Comença a controlar les despeses"}
        </p>

        <div className="auth-input-wrap">
          <span className="auth-input-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="m2 7 10 7 10-7"/>
            </svg>
          </span>
          <input
            className="auth-input"
            type="email"
            placeholder="Correu electrònic"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKey}
            autoComplete="email"
          />
        </div>

        <div className="auth-input-wrap">
          <span className="auth-input-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </span>
          <input
            className="auth-input"
            type={showPassword ? "text" : "password"}
            placeholder="Contrasenya"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKey}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
          <button className="auth-input-eye" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
            {showPassword ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        </div>

        {mode === "login" && (
          <div className="auth-forgot-wrap">
            <button className="auth-forgot-btn">Has oblidat la contrasenya?</button>
          </div>
        )}

        {error && <p className="auth-error">{error}</p>}

        <button className="auth-btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? "..." : mode === "login" ? "Iniciar sessió →" : "Crear compte →"}
        </button>

        <div className="auth-footer-link">
          {mode === "login" ? (
            <span>No tens compte? <button className="auth-link" onClick={() => { setMode("register"); setError(null); }}>Crea'n un</button></span>
          ) : (
            <span>Ja tens compte? <button className="auth-link" onClick={() => { setMode("login"); setError(null); }}>Inicia sessió</button></span>
          )}
        </div>
      </div>
    </div>
  );
}

export default Auth;