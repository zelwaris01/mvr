"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGame } from "./GameStateProvider";
import { useTheme } from "@/app/_lib/useTheme";

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/tour", label: "Visite 360°" },
  { href: "/stores", label: "Boutiques" },
  { href: "/quiz", label: "Quiz" },
  { href: "/rewards", label: "Récompenses" },
];

export function Header() {
  const { progress, level, isHydrated } = useGame();
  const { theme, toggle, mounted } = useTheme();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-bg/90 backdrop-blur-xl border-b border-line">
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-brass flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor" />
              <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </div>
          <span className="text-sm font-display font-bold tracking-[0.08em] text-ink">
            SMART MALL
          </span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  active ? "text-brass bg-brass-soft" : "text-ink-2 hover:text-ink hover:bg-surface-2"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* XP pill */}
          {isHydrated && (
            <Link href="/rewards" className="flex items-center gap-1.5 bg-surface-2 border border-line rounded-full px-2.5 py-1 hover:border-line-strong transition-colors">
              <span className="text-brass text-xs font-bold tabular-nums">{progress.totalXp} XP</span>
            </Link>
          )}

          {/* Theme toggle */}
          <button
            onClick={toggle}
            aria-label="Changer le thème"
            className="w-8 h-8 rounded-full bg-surface-2 border border-line flex items-center justify-center text-ink-3 hover:text-ink hover:border-line-strong transition-colors"
          >
            {mounted && theme === "dark" ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
