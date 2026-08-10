"use client";

import { useEffect } from "react";
import { AD, useAdDismissed } from "@/app/_lib/ad";
import { RewardsCta } from "./RewardsCta";
import { usePress } from "@/app/_lib/usePress";

/**
 * The offers page.
 *
 * Deliberately a full-screen opaque page rather than a floating panel. A panel
 * hovering over the Matterport iframe could not be tapped on touch: the
 * compositor hands the touch to the iframe's layer before our buttons are hit-
 * tested, so links worked (the browser navigates them natively) and buttons
 * did not. Everything that reliably takes a tap in this app — the profile
 * page, the quiz sheet — covers the iframe rather than floating above it, and
 * this now does the same.
 */
export function PromoFlyout({ onClose }: { onClose: () => void }) {
  const [adDismissed, dismissAd] = useAdDismissed();
  const closePress = usePress(onClose);
  const resumePress = usePress(onClose);
  const dismissPress = usePress(dismissAd);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="profile" role="region" aria-label="Offres du mall">
      <button
        {...closePress}
        aria-label="Fermer"
        className="fixed right-5 top-5 z-10 w-11 h-11 rounded-full pane grid place-items-center text-ink-2 hover:text-brass transition-colors safe-x"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
      </button>

      <div className="profile-sheet">
        <div className="flex items-center gap-2.5 mt-2">
          <span className="w-[3px] h-4 rounded-full bg-brass" />
          <h2 className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-ink-2">
            Offres du moment
          </h2>
        </div>

        {!adDismissed && (
          <div className="relative rounded-2xl border border-line overflow-hidden bg-surface-1">
            <button
              {...dismissPress}
              aria-label="Masquer cette publicité"
              className="absolute right-3 top-3 z-10 w-10 h-10 rounded-full grid place-items-center bg-[rgba(11,10,9,.72)] text-ink-2 hover:text-brass transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>

            <a href={AD.href} target="_blank" rel="noreferrer" className="block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={AD.image}
                alt=""
                className="w-full h-[180px] sm:h-[240px] object-cover"
              />
              <span className="block p-4 sm:p-5">
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
            <span className="block px-4 sm:px-5 pb-3 text-[8.5px] uppercase tracking-[0.16em] text-ink-3">
              Publicité
            </span>
          </div>
        )}

        <RewardsCta />

        <button {...resumePress} className="btn btn-ghost self-start mt-2">
          Reprendre la visite
        </button>
      </div>
    </div>
  );
}
