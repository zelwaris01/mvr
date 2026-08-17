"use client";

import { useCallback, useMemo } from "react";
import Link from "next/link";
import { useGame } from "@/app/_components/GameStateProvider";
import { useLocale, intlTag } from "@/app/_lib/i18n";
import { LocaleSwitch } from "@/app/_components/LocaleSwitch";
import { badgesFor, rewardsFor } from "@/app/_lib/rewards-data";
import { STORES } from "@/app/_lib/stores-data";
import { STORE_EN } from "@/app/_lib/content-en";
import {
  ANALYTICS_KEY,
  clearAnalytics,
  emptyAnalytics,
  formatDuration,
  parseAnalytics,
  type AnalyticsState,
} from "@/app/_lib/analytics";
import { useStoredString } from "@/app/_lib/useStoredString";

/**
 * The KPI dashboard.
 *
 * Two sources, deliberately kept apart: counters that only exist because we
 * record them (time, clicks, quiz starts) come from `analytics`, and anything
 * the game already knows (badges, reward tiers) is derived from the progress
 * payload instead of being counted twice. A second copy of a badge count is a
 * second thing to fall out of step — a reset would leave it stranded.
 */
export function AdminDashboard() {
  const { t, locale } = useLocale();
  const { progress, isHydrated } = useGame();

  /**
   * The stored JSON is the subscription; the parsed object is memoised on it.
   * Subscribing to the raw string rather than the object is what keeps the
   * snapshot referentially stable — `JSON.parse` returns a fresh object each
   * call, and React would re-render forever chasing it.
   */
  const [raw, setRaw] = useStoredString(ANALYTICS_KEY);
  const stats: AnalyticsState = useMemo(() => parseAnalytics(raw), [raw]);

  const reset = useCallback(() => {
    if (!window.confirm(t("adminResetConfirm"))) return;
    clearAnalytics();
    // Write through the same channel the reader subscribes to, so the page
    // updates without a reload.
    setRaw(JSON.stringify(emptyAnalytics()));
  }, [t, setRaw]);

  const badges = badgesFor(locale);
  const rewards = rewardsFor(locale);

  const unlockedBadges = badges.filter((b) =>
    progress.unlockedBadges.includes(b.id)
  );
  const unlockedRewards = rewards.filter(
    (r) => progress.totalXp >= r.requiredXp
  );

  // slug -> display name, so a click count reads as a shop rather than an id.
  const nameFor = (slug: string) =>
    STORES.find((s) => s.slug === slug)?.name ?? slug;
  const categoryFor = (slug: string) => {
    const store = STORES.find((s) => s.slug === slug);
    if (!store) return "";
    return locale === "en"
      ? STORE_EN[slug]?.category ?? store.category
      : store.category;
  };

  const clicks = Object.entries(stats.storeClicks)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1]);
  const totalClicks = clicks.reduce((n, [, count]) => n + count, 0);

  const avgSession =
    stats.sessions > 0 ? Math.round(stats.msActive / stats.sessions) : 0;

  const nothingYet =
    stats.sessions === 0 && stats.msActive === 0 && clicks.length === 0;

  // The counters arrive synchronously (see useStoredString), but the game's
  // own progress still hydrates through an effect — and badges and rewards are
  // read from it. Showing zeroes first and the real figures a frame later
  // reads as "the numbers just dropped", which on a dashboard is worse than a
  // beat of nothing.
  const loading = !isHydrated;

  return (
    <main className="fixed inset-0 overflow-y-auto bg-bg text-ink">
      <div className="mx-auto flex max-w-[1080px] flex-col gap-5 px-5 py-8 pb-16">
        {/* ── Head ── */}
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-[9.5px] uppercase tracking-[0.2em] text-ink-3">
              {t("brandTitle")}
            </span>
            <h1 className="font-display text-[30px] leading-none">
              {t("adminTitle")}
            </h1>
            <p className="text-[12px] text-ink-2">{t("adminSubtitle")}</p>
          </div>

          <div className="flex items-center gap-2">
            <LocaleSwitch />
            <Link href="/" className="btn btn-ghost">
              {t("adminBackToTour")}
            </Link>
          </div>
        </header>

        {/* The most important sentence on the page, so it is not a footnote. */}
        <p className="flex items-start gap-2.5 rounded-xl border border-clay/30 bg-clay-soft px-4 py-3 text-[11.5px] leading-snug text-ink-2">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="mt-px flex-shrink-0 text-clay"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="13" /><line x1="12" y1="16.5" x2="12" y2="16.5" strokeWidth="2.5" strokeLinecap="round" /></svg>
          {t("adminDeviceOnly")}
        </p>

        {loading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                className="h-[132px] rounded-2xl border border-line bg-surface-1 opacity-40"
              />
            ))}
          </div>
        ) : nothingYet ? (
          <p className="rounded-2xl border border-line bg-surface-1 px-5 py-10 text-center text-[12.5px] text-ink-2">
            {t("adminEmpty")}
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {/* ── 1. Temps passé ── */}
              <Kpi
                label={t("kpiTimeSpent")}
                value={formatDuration(stats.msActive, locale)}
                hint={t("kpiTimeSpentHint")}
                foot={`${t(
                  stats.sessions === 1 ? "adminSessionsOne" : "adminSessions",
                  { n: stats.sessions }
                )} · ${t("adminAvgSession")} ${formatDuration(
                  avgSession,
                  locale
                )}`}
              />

              {/* ── 3. Participants quiz ── */}
              <Kpi
                label={t("kpiQuizParticipants")}
                value={String(stats.quizSessions)}
                hint={t("kpiQuizParticipantsHint")}
                foot={t("adminAnswers", {
                  answered: stats.answers,
                  correct: stats.correctAnswers,
                })}
              />

              {/* ── 4. Badges débloqués ── */}
              <Kpi
                label={t("kpiBadges")}
                value={`${unlockedBadges.length}`}
                suffix={`/ ${badges.length}`}
                hint={t("kpiBadgesHint", { total: badges.length })}
                foot={
                  unlockedBadges.length > 0
                    ? unlockedBadges.map((b) => b.name).join(" · ")
                    : "—"
                }
              />

              {/* ── 5. Promotions débloquées ── */}
              <Kpi
                label={t("kpiPromos")}
                value={`${unlockedRewards.length}`}
                suffix={`/ ${rewards.length}`}
                hint={t("kpiPromosHint")}
                foot={
                  unlockedRewards.length > 0
                    ? unlockedRewards
                        .map((r) => `${r.discount} ${r.title}`)
                        .join(" · ")
                    : "—"
                }
              />

              {/* Total XP is not one of the five asked for, but it is the
                  number every other one is a consequence of, and it costs a
                  tile. */}
              <Kpi
                label="XP"
                value={String(progress.totalXp)}
                hint={t("statVisited")}
                foot={`${progress.exploredStores.length}`}
              />
            </div>

            {/* ── 2. Clics par boutique ── */}
            <section className="flex flex-col gap-3">
              <div className="mt-2 flex items-center gap-2.5">
                <span className="h-4 w-[3px] rounded-full bg-brass" />
                <h2 className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-ink-2">
                  {t("kpiStoreClicks")}
                </h2>
                <span className="text-[10.5px] text-ink-3">
                  {t("kpiStoreClicksHint")}
                </span>
              </div>

              {clicks.length === 0 ? (
                <p className="rounded-xl border border-line bg-surface-1 px-4 py-6 text-center text-[12px] text-ink-3">
                  {t("adminNoClicks")}
                </p>
              ) : (
                <ol className="flex flex-col gap-1.5">
                  {clicks.map(([slug, count]) => (
                    <li
                      key={slug}
                      className="flex items-center gap-3 rounded-xl border border-line bg-surface-1 p-3"
                    >
                      <span className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className="truncate text-[13px] font-semibold leading-none text-ink">
                          {nameFor(slug)}
                        </span>
                        <span className="truncate text-[11px] leading-none text-ink-3">
                          {categoryFor(slug)}
                        </span>
                      </span>

                      {/* The bar is the comparison; the number is the fact.
                          A list of counts without one is a table you have to
                          read twice to rank. */}
                      <span className="hidden h-1.5 w-[38%] overflow-hidden rounded-full bg-surface-2 sm:block">
                        <span
                          className="block h-full rounded-full bg-brass"
                          style={{
                            width: `${Math.round(
                              (count / clicks[0][1]) * 100
                            )}%`,
                          }}
                        />
                      </span>

                      <span className="flex-shrink-0 text-[11px] font-semibold uppercase tracking-[0.12em] tabular-nums text-brass">
                        {t(count === 1 ? "adminClicksOne" : "adminClicks", {
                          n: count,
                        })}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </section>

            {/* ── Footer ── */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
              {/* Two facts, joined only when both exist — a bare "· 23" with
                  nothing after it is what an unlabelled total looks like. */}
              <span className="text-[10.5px] text-ink-3 tabular-nums">
                {[
                  stats.firstSeen > 0
                    ? t("adminSince", {
                        date: new Date(stats.firstSeen).toLocaleDateString(
                          intlTag(locale),
                          { day: "2-digit", month: "long", year: "numeric" }
                        ),
                      })
                    : null,
                  totalClicks > 0
                    ? t(totalClicks === 1 ? "adminClicksOne" : "adminClicks", {
                        n: totalClicks,
                      })
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
              <button onClick={reset} className="btn btn-ghost">
                {t("adminReset")}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function Kpi({
  label,
  value,
  suffix,
  hint,
  foot,
}: {
  label: string;
  value: string;
  suffix?: string;
  hint: string;
  foot?: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-line bg-surface-1 p-5">
      <span className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-ink-3">
        {label}
      </span>
      <p className="font-display text-[32px] leading-none tabular-nums text-brass">
        {value}
        {suffix && (
          <span className="ml-1 text-[19px] text-ink-3">{suffix}</span>
        )}
      </p>
      <span className="text-[10.5px] leading-snug text-ink-3">{hint}</span>
      {foot && (
        <span className="mt-auto truncate border-t border-line pt-2.5 text-[10.5px] leading-snug text-ink-2">
          {foot}
        </span>
      )}
    </div>
  );
}
