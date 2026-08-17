"use client";

import { useEffect, useState } from "react";
import type { MallLevel } from "@/app/_lib/constants";
import { useLocale } from "@/app/_lib/i18n";
import { LocaleSwitch } from "@/app/_components/LocaleSwitch";
import { shareTour } from "@/app/_lib/share";
import { usePress } from "@/app/_lib/usePress";

/**
 * The phone tools page — everything the desktop side rail and overflow menu
 * hold, on one full-screen page behind a burger button.
 *
 * Why a page and not the rail: floating over the Matterport iframe, our
 * controls could not be tapped on touch. The compositor resolves the touch
 * region to the iframe's layer before the main thread hit-tests our buttons,
 * so links still worked (the browser follows those natively) and buttons did
 * not. `pointer-events: auto` and `touch-action: manipulation` on the overlay
 * were not enough. What does work, reliably, is any surface that *covers* the
 * iframe rather than hovering above it — the profile page, the quiz sheet —
 * so on phones the rail becomes one of those.
 *
 * The rail is unchanged on desktop, where the mouse never had this problem.
 */
export function ToolsMenu({
  onClose,
  onStores,
  storesActive,
  storesDisabled,
  storeCount,
  onBadges,
  onOffers,
  levels,
  currentLevel,
  onLevel,
  floorsDisabled,
}: {
  onClose: () => void;
  onStores: () => void;
  storesActive: boolean;
  storesDisabled: boolean;
  storeCount: number;
  onBadges: () => void;
  onOffers: () => void;
  levels: MallLevel[];
  currentLevel: number;
  onLevel: (index: number) => void;
  floorsDisabled: boolean;
}) {
  const { t, locale } = useLocale();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Same wrap-around rule as the rail: one control that always has somewhere
  // to go, rather than a row of buttons where all but one are inert.
  const nextIndex = (currentLevel + 1) % levels.length;
  const next = levels.length > 1 ? levels[nextIndex] : null;
  const goingDown = next !== null && nextIndex < currentLevel;

  const share = () => {
    void shareTour().then((result) => {
      if (result === "copied") {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    });
  };

  const closePress = usePress(onClose);
  const resumePress = usePress(onClose);

  return (
    <div className="profile" role="region" aria-label={t("menu")}>
      <button
        {...closePress}
        aria-label={t("closeMenu")}
        className="fixed right-5 top-5 z-10 w-11 h-11 rounded-full pane grid place-items-center text-ink-2 hover:text-brass transition-colors safe-x"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
      </button>

      <div className="profile-sheet">
        <div className="flex items-center gap-2.5 mt-2">
          <span className="w-[3px] h-4 rounded-full bg-brass" />
          <h2 className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-ink-2">
            {t("menu")}
          </h2>
        </div>

        {/* Language lives here on phones, where the top bar has no room for a
            third control. Not a ToolRow: it is a two-state choice, not a
            destination, so it shows both options rather than opening a page. */}
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-surface-1 p-4">
          <span className="flex min-w-0 flex-col gap-1">
            <span className="text-[14px] font-semibold leading-none text-ink">
              {t("language")}
            </span>
            <span className="text-[11.5px] leading-snug text-ink-3">
              {t("toolsLanguageHint")}
            </span>
          </span>
          <LocaleSwitch />
        </div>

        {/* Replaces "Plan du mall". The dollhouse view showed the mall from
            outside; this list walks you into a shop, which is what people were
            reaching for the map to do. */}
        <ToolRow
          label={t("toolsShops")}
          hint={
            storeCount > 0
              ? t(storeCount === 1 ? "toolsShopsCountOne" : "toolsShopsCount", {
                  count: storeCount,
                })
              : t("toolsShopsEmpty")
          }
          active={storesActive}
          disabled={storesDisabled}
          // Each of these closes the page: the result of pressing them is
          // something to look at in the scene, and the page is over it.
          onClick={() => {
            onStores();
            onClose();
          }}
          icon={
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M3 9h18l-1.4-4.2A2 2 0 0 0 17.7 3.4H6.3a2 2 0 0 0-1.9 1.4L3 9z" /><path d="M4 9v10a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 20 19V9" /><path d="M9 20.5V14h6v6.5" /></svg>
          }
        />

        <ToolRow
          label={t("toolsBadges")}
          hint={t("toolsBadgesHint")}
          onClick={() => {
            onBadges();
            onClose();
          }}
          icon={
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><polygon points="12 2 15 9 22 9.5 17 14.5 18.5 21.5 12 18 5.5 21.5 7 14.5 2 9.5 9 9" /></svg>
          }
        />

        <ToolRow
          label={t("toolsOffers")}
          hint={t("toolsOffersHint")}
          onClick={() => {
            onOffers();
            onClose();
          }}
          icon={
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" /></svg>
          }
        />

        {next && (
          <ToolRow
            label={t("goToLevel", { level: next.label[locale].toLowerCase() })}
            hint={t("toolsLevelHint", { short: next.short })}
            disabled={floorsDisabled}
            onClick={() => {
              onLevel(nextIndex);
              onClose();
            }}
            icon={
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                style={goingDown ? { transform: "scaleX(-1)" } : undefined}
              >
                <polyline points="3 20 8 20 8 15 13 15 13 10 18 10 18 5 21 5" />
              </svg>
            }
          />
        )}

        <ToolRow
          label={copied ? t("shareCopied") : t("shareTour")}
          hint={t("shareHint")}
          onClick={share}
          icon={
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.6" y1="10.5" x2="15.4" y2="6.5" /><line x1="8.6" y1="13.5" x2="15.4" y2="17.5" /></svg>
          }
        />

        <button {...resumePress} className="btn btn-ghost self-start mt-2">
          {t("resumeTour")}
        </button>
      </div>
    </div>
  );
}

function ToolRow({
  label,
  hint,
  icon,
  onClick,
  disabled,
  active,
}: {
  label: string;
  hint: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  const press = usePress(onClick);
  return (
    <button
      {...press}
      disabled={disabled}
      className={`flex items-center gap-4 p-4 rounded-2xl border text-left transition-colors ${
        disabled
          ? "border-line opacity-40 cursor-not-allowed"
          : active
          ? "border-brass-line bg-brass-soft"
          : "border-line bg-surface-1 hover:border-brass-line hover:bg-brass-soft"
      }`}
    >
      <span
        className={`w-11 h-11 rounded-xl grid place-items-center flex-shrink-0 ${
          active ? "bg-brass text-on-brass" : "bg-brass-soft text-brass"
        }`}
      >
        {icon}
      </span>
      <span className="flex flex-col gap-1 min-w-0">
        <span className="text-[14px] font-semibold text-ink leading-none">
          {label}
        </span>
        <span className="text-[11.5px] text-ink-3 leading-snug">{hint}</span>
      </span>
      {!disabled && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink-3 flex-shrink-0 ml-auto"><polyline points="9 18 15 12 9 6" /></svg>
      )}
    </button>
  );
}
