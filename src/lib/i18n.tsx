import { createContext, useCallback, useContext, type ReactNode } from "react";
import { fr, type Dict } from "./locales/fr";

// Application monolingue : français uniquement.
export const LOCALE = "fr" as const;
export type Locale = typeof LOCALE;

type Ctx = { locale: Locale; t: (key: string, vars?: Record<string, string | number>) => string };
const I18nContext = createContext<Ctx | null>(null);

function lookup(dict: Dict, key: string): string | undefined {
  let cur: unknown = dict;
  for (const part of key.split(".")) {
    if (cur && typeof cur === "object" && part in (cur as Record<string, unknown>)) cur = (cur as Record<string, unknown>)[part];
    else return undefined;
  }
  return typeof cur === "string" ? cur : undefined;
}

export function translate(key: string, vars?: Record<string, string | number>) {
  let s = lookup(fr, key) ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const t = useCallback((key: string, vars?: Record<string, string | number>) => translate(key, vars), []);
  return <I18nContext.Provider value={{ locale: LOCALE, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be inside I18nProvider");
  return ctx;
}
