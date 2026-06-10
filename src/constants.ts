// ─── Types ───────────────────────────────────────────────────────────────────
export type Expense = {
  id: number;
  amount: number;
  category: string;
  date: string;
  note?: string;
  recurringId?: number; // referència a la recurrent que la va generar
};

export type RecurringExpense = {
  id: number;
  amount: number;
  category: string;
  note?: string;
  dayOfMonth: number;   // dia del mes que toca (1-28)
  lastTriggered?: string; // "YYYY-MM" — últim mes en què s'ha afegit
};

// ─── Category config ─────────────────────────────────────────────────────────
export const CATEGORIES: Record<string, { emoji: string; color: string; bg: string }> = {
  Cafè:          { emoji: "☕", color: "#f59e0b", bg: "#fef3c7" },
  Menjar:        { emoji: "🍔", color: "#10b981", bg: "#d1fae5" },
  Alimentació:   { emoji: "🛒", color: "#10b981", bg: "#d1fae5" },
  Roba:          { emoji: "👕", color: "#ec4899", bg: "#fce7f3" },
  Transport:     { emoji: "🚌", color: "#3b82f6", bg: "#dbeafe" },
  Salut:         { emoji: "💊", color: "#ef4444", bg: "#fee2e2" },
  Oci:           { emoji: "🎬", color: "#8b5cf6", bg: "#ede9fe" },
  Lleure:        { emoji: "🎬", color: "#8b5cf6", bg: "#ede9fe" },
  Subscripcions: { emoji: "📱", color: "#f97316", bg: "#ffedd5" },
  Serveis:       { emoji: "⚡", color: "#f97316", bg: "#ffedd5" },
  Altres:        { emoji: "📦", color: "#6b7280", bg: "#f3f4f6" },
};

export const CAT_KEYS = Object.keys(CATEGORIES).filter(
  (k) => !["Alimentació", "Lleure"].includes(k)
);

export function getCfg(cat: string) {
  for (const k of Object.keys(CATEGORIES)) {
    if (cat.toLowerCase().includes(k.toLowerCase())) return CATEGORIES[k];
  }
  return CATEGORIES["Altres"];
}

export const BUDGET = 400;
export const MONTHS = ["Gen","Feb","Mar","Abr","Mai","Jun","Jul","Ago","Set","Oct","Nov","Des"];