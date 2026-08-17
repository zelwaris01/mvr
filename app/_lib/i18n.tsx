"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { UI, type UiKey } from "./strings";
import { useStoredString } from "./useStoredString";

export type Locale = "fr" | "en";

export const LOCALES: Locale[] = ["fr", "en"];

/** Any piece of copy that exists in both languages. */
export type Dict<T = string> = { fr: T; en: T };

export function pick<T>(dict: Dict<T>, locale: Locale): T {
  return dict[locale];
}

const STORAGE_KEY = "mallquest_locale";

/**
 * French is the default because the mall is in Morocco and every pin in the
 * model is labelled in French. English is the alternative, not the base.
 */
const DEFAULT_LOCALE: Locale = "fr";

function isLocale(value: unknown): value is Locale {
  return value === "fr" || value === "en";
}

type LocaleContextValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
  /**
   * A UI string, with `{name}` placeholders filled from `params`.
   *
   * Content — shop blurbs, quiz questions, badge names — does NOT come through
   * here. That lives in the data files and is resolved in `roster.ts` and
   * `rewards-data.ts`, so components receive strings that are already in the
   * right language and never have to think about it.
   */
  t: (key: UiKey, params?: Record<string, string | number>) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  /**
   * Storage IS the state — there is no React copy to keep in step with it.
   * The server snapshot is null, which resolves to French, so the markup React
   * hydrates against always matches; a stored English choice lands on the
   * first client frame rather than after a second render.
   */
  const [stored, setStored] = useStoredString(STORAGE_KEY);
  const locale: Locale = isLocale(stored) ? stored : DEFAULT_LOCALE;

  // `lang` is set on the live document rather than in layout.tsx because the
  // layout is a server component and this choice is made in the browser. It
  // matters for screen-reader pronunciation and for the browser's own
  // translate prompt, neither of which read React state.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback(
    (next: Locale) => setStored(next),
    [setStored]
  );

  const t = useCallback(
    (key: UiKey, params?: Record<string, string | number>) => {
      const template = UI[key][locale];
      if (!params) return template;
      return template.replace(/\{(\w+)\}/g, (whole, name: string) =>
        name in params ? String(params[name]) : whole
      );
    },
    [locale]
  );

  const value = useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t]
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used inside <LocaleProvider>");
  }
  return ctx;
}

/**
 * The locale-aware `Intl` tag, for dates and clock times.
 *
 * "fr" alone would format a time as 14:30 and "en" as 2:30 PM, which is the
 * behaviour wanted — but the region matters for date order, so both are
 * pinned rather than left to the browser.
 */
export function intlTag(locale: Locale): string {
  return locale === "fr" ? "fr-FR" : "en-GB";
}
