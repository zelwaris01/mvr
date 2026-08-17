"use client";

import { useState } from "react";
import { useLocale } from "@/app/_lib/i18n";
import { useStoredString } from "@/app/_lib/useStoredString";

/**
 * The sign-in in front of /admin.
 *
 * Be clear about what this is: the credentials are compiled into the client
 * bundle, so anyone who opens devtools can read them. It is a doorway, not a
 * lock — it keeps the dashboard from opening to whoever wanders onto the URL,
 * and that is the whole of its job.
 *
 * What makes that acceptable *here* is that there is nothing behind it worth
 * stealing: every figure on the dashboard is read out of the viewer's own
 * browser storage, so a stranger who guessed the password would be shown their
 * own visit. The moment these numbers come from a server holding other
 * people's data, this has to be replaced by a real server-side session —
 * checking a password in the browser cannot protect data the browser has
 * already been sent.
 */
const USERNAME = "admin";
const PASSWORD = "admin";

/** Survives a reload, not a new tab session. Cleared when the browser closes. */
const SESSION_KEY = "mallquest_admin_ok";

export function AdminGate({ children }: { children: React.ReactNode }) {
  const { t, locale } = useLocale();

  /**
   * The session flag IS the state. Reading it into `useState` from an effect
   * would render the sign-in form for one frame to someone already signed in,
   * which is exactly the flash `useSyncExternalStore` exists to avoid.
   */
  const [token, setToken] = useStoredString(SESSION_KEY, "session");
  const allowed = token === "1";

  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [failed, setFailed] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // trim() on the username only: a password's spaces are the password's
    // business, but a name typed with a trailing space is a typo, and phone
    // keyboards add one after autocapitalising.
    if (user.trim() === USERNAME && pass === PASSWORD) {
      setToken("1");
      return;
    }
    setFailed(true);
    setPass("");
  };

  const signOut = () => {
    setToken(null);
    setUser("");
    setPass("");
    setFailed(false);
  };

  if (allowed) {
    return (
      <>
        {children}
        <button
          onClick={signOut}
          className="fixed bottom-5 right-5 z-10 rounded-full border border-line bg-surface-1 px-4 py-2 text-[11px] font-semibold text-ink-2 transition-colors hover:border-brass-line hover:text-brass"
        >
          {locale === "fr" ? "Se déconnecter" : "Sign out"}
        </button>
      </>
    );
  }

  return (
    <main className="fixed inset-0 grid place-items-center overflow-y-auto bg-bg px-5 py-10 text-ink">
      <form
        onSubmit={submit}
        className="flex w-full max-w-[360px] flex-col gap-4 rounded-2xl border border-line bg-surface-1 p-6"
      >
        <div className="flex flex-col gap-1.5">
          <span className="text-[9.5px] uppercase tracking-[0.2em] text-ink-3">
            {t("brandTitle")}
          </span>
          <h1 className="font-display text-[26px] leading-none">
            {t("adminTitle")}
          </h1>
          <p className="text-[11.5px] leading-snug text-ink-3">
            {locale === "fr"
              ? "Identifiants requis pour consulter les indicateurs."
              : "Sign in to view the indicators."}
          </p>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
            {locale === "fr" ? "Identifiant" : "Username"}
          </span>
          <input
            value={user}
            onChange={(e) => setUser(e.target.value)}
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            className="rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-[13px] text-ink outline-none transition-colors focus:border-brass-line"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
            {locale === "fr" ? "Mot de passe" : "Password"}
          </span>
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            autoComplete="current-password"
            className="rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-[13px] text-ink outline-none transition-colors focus:border-brass-line"
          />
        </label>

        {/* aria-live so the failure is announced, not only shown — the field
            clears underneath a screen-reader user otherwise with no reason. */}
        <p
          aria-live="polite"
          className={`text-[11px] leading-snug text-clay ${
            failed ? "" : "sr-only"
          }`}
        >
          {failed
            ? locale === "fr"
              ? "Identifiant ou mot de passe incorrect."
              : "Wrong username or password."
            : ""}
        </p>

        <button type="submit" className="btn btn-fill">
          {locale === "fr" ? "Se connecter" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
