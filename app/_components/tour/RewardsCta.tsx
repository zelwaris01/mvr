"use client";

import { STORES_URL } from "@/app/_lib/ad";
import { useLocale } from "@/app/_lib/i18n";

/**
 * "Débloquer mes récompenses" — our replacement for Matterport's own
 * call-to-action, which pointed at this same directory before we suppressed it.
 *
 * Appears on the profile page, in the offers page and on the arrival ad, so it
 * lives here rather than in whichever one happened to grow it first.
 *
 * An anchor, not a button with a handler: `target="_blank"` navigation is
 * handled by the browser natively, which is also the one activation path that
 * has never failed on touch over the Matterport iframe.
 *
 * `compact` trims it for the ad card, where it sits under a photo and a
 * headline and must not compete with them.
 */
export function RewardsCta({ compact = false }: { compact?: boolean }) {
  const { t } = useLocale();
  return (
    <a
      href={STORES_URL}
      target="_blank"
      rel="noreferrer"
      className={`group flex items-center rounded-2xl border border-brass-line bg-brass-soft hover:bg-brass/15 transition-colors ${
        compact ? "gap-3 p-3.5" : "gap-4 p-4 sm:p-5"
      }`}
    >
      <span
        className={`rounded-xl grid place-items-center bg-brass text-on-brass flex-shrink-0 ${
          compact ? "w-9 h-9" : "w-12 h-12"
        }`}
      >
        <svg
          width={compact ? 16 : 20}
          height={compact ? 16 : 20}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="20 12 20 22 4 22 4 12" />
          <rect x="2" y="7" width="20" height="5" />
          <line x1="12" y1="22" x2="12" y2="7" />
          <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
          <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
        </svg>
      </span>

      <span className="flex flex-col gap-1 min-w-0">
        <span
          className={`font-semibold text-ink leading-none ${
            compact ? "text-[12.5px]" : "text-[14px]"
          }`}
        >
          {t("ctaTitle")}
        </span>
        <span
          className={`text-ink-3 leading-snug ${
            compact ? "text-[10.5px]" : "text-[11.5px]"
          }`}
        >
          {t("ctaBody")}
        </span>
      </span>

      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-brass flex-shrink-0 ml-auto transition-transform group-hover:translate-x-0.5"
      >
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    </a>
  );
}
