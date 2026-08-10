"use client";

import { useEffect } from "react";
import type { DiscoveredStore } from "@/app/_lib/roster";
import { useGame } from "@/app/_components/GameStateProvider";
import { BADGES, REWARDS } from "@/app/_lib/rewards-data";
import { RewardsCta } from "./RewardsCta";
import { usePress } from "@/app/_lib/usePress";

/**
 * The profile page: level, progress, badges and reward tiers.
 *
 * Full screen rather than the right-hand drawer — it's a summary you stop to
 * read, not something to consult while walking, and the shop panels already
 * own that column. Reached from the XP pill, which is what you tap when you
 * want to know what your points are worth.
 */
export function RewardsOverlay({
  roster,
  onClose,
}: {
  roster: DiscoveredStore[];
  onClose: () => void;
}) {
  const { progress, level, nextLevel, levelProgress } = useGame();
  const closePress = usePress(onClose);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Everything counts against what the model actually offers, not a fixed
  // catalogue: a shop with no pin can never be visited, so it must not sit in
  // the denominator making the visit look unfinished forever.
  const allQuestions = roster.flatMap((s) => s.questions);
  const answered = allQuestions.filter(
    (q) => progress.answeredQuestions[q.id]
  ).length;
  const correct = allQuestions.filter(
    (q) => progress.answeredQuestions[q.id]?.isCorrect
  ).length;
  const visited = roster.filter((s) =>
    progress.exploredStores.includes(s.slug)
  ).length;

  return (
    <div className="profile" role="region" aria-label="Mon profil">
      <div className="profile-sheet">
        <button
          {...closePress}
          aria-label="Fermer"
          // `fixed`, not absolute: positioned against the sheet it scrolled
          // away with the content, and on a phone — where the badge and
          // reward lists are long and there is no Escape key — that left no
          // way out of this page at all.
          className="hud-on fixed right-5 top-5 z-10 w-11 h-11 rounded-full pane grid place-items-center text-ink-2 hover:text-brass transition-colors safe-x"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>

        {/* ── Profil ── */}
        <SectionTitle>Mon profil</SectionTitle>

        <div className="rounded-2xl border border-line bg-surface-1 p-5 md:p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <span className="w-14 h-14 rounded-xl bg-brass grid place-items-center font-display text-[26px] leading-none text-on-brass">
                {level.level}
              </span>
              <span className="flex flex-col gap-1">
                <span className="text-[9.5px] uppercase tracking-[0.18em] text-ink-3">
                  Niveau
                </span>
                <span className="font-display text-[24px] leading-none text-ink">
                  {level.label}
                </span>
              </span>
            </div>
            <div className="text-right">
              <p className="font-display text-[28px] leading-none text-brass tabular-nums">
                {progress.totalXp}
              </p>
              <p className="text-[10.5px] text-ink-3 mt-1.5">
                {nextLevel
                  ? `prochain : ${nextLevel.minXp} XP`
                  : "niveau maximum"}
              </p>
            </div>
          </div>

          <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
            <div
              className="h-full rounded-full bg-brass transition-[width] duration-700"
              style={{ width: `${levelProgress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Stat value={visited} total={roster.length} label="Boutiques visitées" />
          <Stat
            value={answered}
            total={allQuestions.length}
            label="Questions répondues"
          />
          <Stat
            value={correct}
            total={allQuestions.length}
            label="Bonnes réponses"
            tone="jade"
          />
        </div>

        {/* High on the page, right under the score it relates to, so it is
            seen without scrolling past the badge and reward grids. */}
        <RewardsCta />

        {/* ── Badges ── */}
        <SectionTitle>Vos badges</SectionTitle>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {BADGES.map((badge) => {
            const has = progress.unlockedBadges.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`relative rounded-xl border p-4 flex flex-col items-center text-center gap-2 transition-colors ${
                  has ? "border-brass-line bg-brass-soft" : "border-line opacity-60"
                }`}
              >
                {!has && (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute right-2.5 top-2.5 text-ink-3"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                )}
                <span
                  className={`w-11 h-11 rounded-full grid place-items-center text-[20px] ${
                    has ? "bg-brass-soft" : "bg-surface-2 grayscale"
                  }`}
                >
                  {badge.icon}
                </span>
                <span className="text-[11px] font-semibold text-ink leading-tight">
                  {badge.name}
                </span>
                <span className="text-[9.5px] text-ink-3 leading-snug">
                  {badge.description}
                </span>
              </div>
            );
          })}
        </div>

        {/* ── Récompenses ── */}
        <SectionTitle>Vos récompenses</SectionTitle>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {REWARDS.map((reward) => {
            const unlocked = progress.totalXp >= reward.requiredXp;
            return (
              <div
                key={reward.id}
                className={`ticket flex flex-col items-center text-center ${
                  unlocked ? "ticket-on" : ""
                }`}
              >
                <span
                  className={`font-display text-[34px] leading-none ${
                    unlocked ? "text-brass" : "text-ink-3"
                  }`}
                >
                  {reward.discount}
                </span>
                <span className="text-[12px] font-semibold text-ink mt-2.5">
                  {reward.title}
                </span>
                <span className="text-[10.5px] text-ink-3 mt-1">
                  {reward.storeName}
                </span>

                <span className="ticket-rule" />

                <span
                  className={`text-[10.5px] tabular-nums ${
                    unlocked ? "text-jade" : "text-ink-3"
                  }`}
                >
                  {unlocked
                    ? "Débloquée"
                    : `${reward.requiredXp - progress.totalXp} XP restants`}
                </span>
              </div>
            );
          })}
        </div>

        {/* ── Par boutique ── */}
        {roster.length > 0 && (
          <>
            <SectionTitle>Offres des boutiques</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pb-2">
              {roster.map((store) => {
                const done =
                  store.questions.length > 0 &&
                  store.questions.every(
                    (q) => progress.answeredQuestions[q.id]?.isCorrect
                  );
                return (
                  <div
                    key={store.slug}
                    className={`flex items-center gap-3 p-3 rounded-xl border ${
                      done ? "border-brass-line bg-brass-soft" : "border-line opacity-70"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={store.image}
                      alt=""
                      className={`w-9 h-9 rounded-lg object-contain bg-surface-1 flex-shrink-0 ${
                        done ? "" : "grayscale"
                      }`}
                    />
                    <span className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-[11.5px] font-semibold text-ink truncate">
                        {store.name}
                      </span>
                      <span
                        className={`text-[10.5px] leading-snug ${
                          done ? "text-brass" : "text-ink-3"
                        }`}
                      >
                        {done ? store.reward : "Quiz à terminer sans faute"}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 mt-2">
      <span className="w-[3px] h-4 rounded-full bg-brass" />
      <h2 className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-ink-2">
        {children}
      </h2>
    </div>
  );
}

function Stat({
  value,
  total,
  label,
  tone = "brass",
}: {
  value: number;
  total: number;
  label: string;
  tone?: "brass" | "jade";
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="rounded-2xl border border-line bg-surface-1 p-5 flex flex-col items-center gap-2.5">
      <p className="font-display text-[30px] leading-none tabular-nums">
        <span className={tone === "jade" ? "text-jade" : "text-brass"}>
          {value}
        </span>
        <span className="text-ink-3 text-[19px]">/{total}</span>
      </p>
      <p className="text-[9.5px] uppercase tracking-[0.14em] text-ink-3">
        {label}
      </p>
      <div className="w-full h-1 rounded-full bg-surface-2 overflow-hidden">
        <div
          className={`h-full rounded-full ${
            tone === "jade" ? "bg-jade" : "bg-brass"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
