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
  const { toggle } = useTheme();
  const pathname = usePathname();

  return (
    <header className="site-header sticky top-0 z-50 bg-bg/80 backdrop-blur-xl border-b border-line">
      <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        {/* Wordmark — elegant serif */}
        <Link href="/" className="flex items-baseline gap-2.5">
          <span className="font-display text-2xl text-ink tracking-[0.04em] leading-none">
            Meridian
          </span>
          <span className="hidden sm:inline text-ink-3 text-[10px] uppercase tracking-[0.18em]">
            Anfa Place
          </span>
        </Link>

        {/* Desktop pill nav */}
        <nav className="hidden md:flex items-center gap-1.5">
          {NAV_LINKS.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-full text-[11.5px] font-medium tracking-wide transition-colors border ${
                  active
                    ? "text-brass bg-brass-soft border-brass-line"
                    : "text-ink-2 border-line hover:text-ink hover:bg-surface-2 hover:border-line-strong"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* GOLD points pill */}
          {isHydrated && (
            <Link
              href="/rewards"
              className="flex items-center gap-2 pl-3.5 pr-2 py-1.5 rounded-full bg-brass-soft border border-brass-line hover:bg-brass/20 transition-colors"
            >
              <span className="text-brass text-[10px] font-semibold uppercase tracking-[0.08em]">
                {level.label}
              </span>
              <span className="text-ink text-xs font-medium tabular-nums">{progress.totalXp} pts</span>
              <span className="w-6 h-6 rounded-full bg-[linear-gradient(135deg,var(--brass-soft),var(--surface-2))] border border-brass-line" />
            </Link>
          )}

          {/* Theme toggle */}
          <button
            onClick={toggle}
            aria-label="Changer le thème"
            className="w-9 h-9 rounded-full bg-surface-2 border border-line flex items-center justify-center text-ink-3 hover:text-brass hover:border-brass-line transition-colors"
          >
            {/* Both icons render; .theme-icon-* picks one off data-theme in CSS */}
            <svg className="theme-icon-sun" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
            <svg className="theme-icon-moon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
          </button>
        </div>
      </div>
    </header>
  );
}
