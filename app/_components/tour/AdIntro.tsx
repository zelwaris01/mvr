"use client";

import { useEffect } from "react";
import { AD, useAdDismissed } from "@/app/_lib/ad";
import { useLocale } from "@/app/_lib/i18n";
import { usePress } from "@/app/_lib/usePress";
import { RewardsCta } from "./RewardsCta";

/**
 * The ad shown once on arrival, on every screen size.
 *
 * Dismissal is deliberately lopsided: a tap anywhere puts it away, and only
 * the ad itself is exempt — that one goes to the campaign. So the scrim covers
 * the whole viewport rather than just the area around the card, and the card
 * sits above it.
 *
 * It is not dismissed when the ad is followed. The link opens in a new tab,
 * and taking the card away underneath the tap would race the browser's own
 * activation — on touch the click that navigates is dispatched after the
 * touch ends, so unmounting first can swallow the navigation entirely.
 *
 * Shown once per session (see `useAdDismissed`), which also keeps it from
 * reappearing on every floor switch — those remount the whole tour.
 */
export function AdIntro() {
  const { t } = useLocale();
  const [dismissed, dismiss] = useAdDismissed();
  const scrimPress = usePress(dismiss);
  const closePress = usePress(dismiss);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dismiss]);

  if (dismissed) return null;

  return (
    <div className="ad-slot">
      <button
        {...scrimPress}
        aria-label={t("closeAd")}
        tabIndex={-1}
        className="ad-scrim"
      />

      <div className="ad-card" role="dialog" aria-label={t("advertisement")}>
        <button
          {...closePress}
          aria-label={t("closeAd")}
          className="absolute right-3 top-3 z-10 w-10 h-10 rounded-full grid place-items-center bg-[rgba(11,10,9,.72)] text-ink-2 hover:text-brass transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>

        <a href={AD.href} target="_blank" rel="noreferrer" className="block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={AD.image}
            alt=""
            className="w-full h-[168px] object-cover"
          />
          <span className="block p-4">
            <span className="block text-[9.5px] uppercase tracking-[0.18em] text-brass">
              {AD.brand}
            </span>
            <span className="block text-[16px] font-semibold text-ink mt-2">
              {AD.headline}
            </span>
            <span className="block text-[12.5px] leading-[1.6] text-ink-2 mt-1.5">
              {AD.body}
            </span>
          </span>
        </a>

        <span className="flex items-center justify-between px-4 pb-3 text-[8.5px] uppercase tracking-[0.16em] text-ink-3">
          <span>{t("advertisement")}</span>
          <span className="normal-case tracking-normal text-[10px]">
            {t("tapElsewhere")}
          </span>
        </span>

        {/* Inside the card, so reaching it is not one of the taps that
            dismisses the ad. */}
        <div className="px-4 pb-4">
          <RewardsCta compact />
        </div>
      </div>
    </div>
  );
}
