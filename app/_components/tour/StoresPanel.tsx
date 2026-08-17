"use client";

import { useEffect, useRef } from "react";
import type { DiscoveredStore } from "@/app/_lib/roster";
import { StoreLogo } from "@/app/_components/StoreLogo";
import { useLocale } from "@/app/_lib/i18n";
import { usePress } from "@/app/_lib/usePress";

/**
 * The directory: every shop the model reports, as a list you travel from.
 *
 * This replaces the strip of chips that used to run along the bottom of the
 * screen. The strip had to scroll sideways to hold a roster of any size, which
 * meant most of the mall was always off-screen, and it sat exactly where a
 * checkpoint's name plate wants to be. A panel holds the whole roster at once
 * and gets out of the way when it is not wanted.
 *
 * It borrows `.drawer` wholesale rather than inventing a second panel: side
 * panel from 640px, bottom sheet below it. That is not a style choice — a
 * floating panel over the Matterport iframe cannot be tapped on touch (the
 * compositor resolves the touch to the iframe's layer before our buttons are
 * hit-tested), and the sheet is the shape that was proven to work.
 */
export function StoresPanel({
  stores,
  doneSlugs,
  pendingXp,
  connecting,
  flyingSlug,
  onSelect,
  onClose,
}: {
  stores: DiscoveredStore[];
  doneSlugs: Set<string>;
  pendingXp: Map<string, number>;
  /** The model is still handing over its pins — show placeholders, not "none". */
  connecting: boolean;
  /** A flight is in progress; every row is inert until it lands. */
  flyingSlug: string | null;
  onSelect: (slug: string) => void;
  onClose: () => void;
}) {
  const { t } = useLocale();
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const closePress = usePress(onClose);

  return (
    <div className="stores-slot">
      <aside className="drawer on-dark" role="region" aria-label={t("shopsRegion")}>
        {/* ── Head ── */}
        <div className="flex items-start justify-between gap-3 p-5 pb-3">
          <div className="flex flex-col gap-1.5 min-w-0">
            <h2
              ref={headingRef}
              tabIndex={-1}
              className="font-display text-[22px] leading-none text-ink outline-none"
            >
              {t("shopsTitle")}
            </h2>
            <span className="text-[11px] text-ink-3 leading-none">
              {connecting && stores.length === 0
                ? t("shopsLoading")
                : t(
                    stores.length === 1 ? "shopsSubtitleOne" : "shopsSubtitle",
                    { count: stores.length }
                  )}
            </span>
          </div>

          <button
            {...closePress}
            aria-label={t("shopsClose")}
            className="w-10 h-10 rounded-full pane grid place-items-center text-ink-2 hover:text-brass transition-colors flex-shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        {/* ── The roster ── */}
        <div className="flex flex-col gap-2 px-4 pb-6">
          {connecting && stores.length === 0 ? (
            // Placeholders at the real row height, so the list does not jump
            // under a finger already reaching for it when the pins land.
            Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="h-[68px] rounded-xl pane opacity-40" />
            ))
          ) : stores.length === 0 ? (
            <p className="px-2 py-6 text-[12px] leading-relaxed text-ink-2">
              {t("statusNoStores")}
            </p>
          ) : (
            stores.map((store) => (
              <StoreRow
                key={store.slug}
                store={store}
                done={doneSlugs.has(store.slug)}
                xp={pendingXp.get(store.slug) ?? 0}
                flying={flyingSlug === store.slug}
                disabled={flyingSlug !== null}
                onSelect={onSelect}
              />
            ))
          )}
        </div>
      </aside>
    </div>
  );
}

function StoreRow({
  store,
  done,
  xp,
  flying,
  disabled,
  onSelect,
}: {
  store: DiscoveredStore;
  done: boolean;
  xp: number;
  flying: boolean;
  disabled: boolean;
  onSelect: (slug: string) => void;
}) {
  const { t } = useLocale();
  const press = usePress(() => onSelect(store.slug));

  // A shop whose pin resolved to no reachable sweep cannot be flown to. Saying
  // so on the row is better than a row that looks live and then does nothing —
  // the quiz still opens, so it stays pressable.
  const unreachable = !store.sweepId;

  return (
    <button
      {...press}
      disabled={disabled}
      aria-busy={flying}
      className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-colors disabled:cursor-not-allowed ${
        flying
          ? "border-brass-line bg-brass-soft"
          : "border-line bg-surface-1 hover:border-brass-line hover:bg-brass-soft"
      } ${disabled && !flying ? "opacity-45" : ""}`}
    >
      {store.imageFromModel ? (
        // Real brand logo from the model's pin. Plain <img> because the
        // Matterport CDN host isn't in next.config's remotePatterns, and
        // object-contain because a logo cropped to fill is a mangled logo.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={store.image}
          alt=""
          className="w-11 h-11 rounded-lg object-contain bg-surface-2 flex-shrink-0"
        />
      ) : (
        <StoreLogo slug={store.slug} name={store.name} size={44} />
      )}

      <span className="flex flex-col gap-1 min-w-0 flex-1">
        <span className="text-[13.5px] font-semibold text-ink leading-none truncate">
          {store.name}
        </span>
        <span className="text-[11px] text-ink-3 leading-none truncate">
          {unreachable ? t("shopApproximate") : store.category}
        </span>
      </span>

      <span
        className={`text-[10px] font-semibold uppercase tracking-[0.12em] tabular-nums flex-shrink-0 ${
          done ? "text-jade" : "text-brass"
        }`}
      >
        {flying ? t("shopsEnRoute") : done ? t("done") : t("quizXp", { xp })}
      </span>
    </button>
  );
}
