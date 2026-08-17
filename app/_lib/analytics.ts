"use client";

/**
 * What /admin counts, and where it comes from.
 *
 * There is no backend. Everything here is written to this browser's
 * localStorage and read back by the dashboard, so every figure describes ONE
 * device — /admin says so on the page rather than implying a visitor count it
 * cannot know. Point `flush` at an endpoint and the same shape becomes a real
 * aggregate; nothing above this file would change.
 *
 * Two things are deliberately NOT stored: anything identifying, and anything
 * derivable. Badges and rewards are recomputed from the progress payload the
 * game already keeps, because a second copy is a second thing to get out of
 * step — a badge revoked by a reset would otherwise stay counted forever.
 */

import { writeStored } from "./useStoredString";

export const ANALYTICS_KEY = "mallquest_events_v1";

export type AnalyticsState = {
  /** Epoch ms of the first session recorded on this device. */
  firstSeen: number;
  /** Epoch ms of the most recent activity. */
  lastSeen: number;
  /** Distinct visits — a page load that got as far as the tour. */
  sessions: number;
  /**
   * Foreground milliseconds, summed across sessions.
   *
   * Foreground only: a tab left open overnight is not time spent in the mall,
   * and counting it would make the headline KPI meaningless within a week.
   */
  msActive: number;
  /** slug -> how many times its panel was opened, however it was opened. */
  storeClicks: Record<string, number>;
  /** Sessions in which at least one quiz answer was submitted. */
  quizSessions: number;
  /** Every answer submitted, and how many were right. */
  answers: number;
  correctAnswers: number;
};

const EMPTY: AnalyticsState = {
  firstSeen: 0,
  lastSeen: 0,
  sessions: 0,
  msActive: 0,
  storeClicks: {},
  quizSessions: 0,
  answers: 0,
  correctAnswers: 0,
};

export function emptyAnalytics(): AnalyticsState {
  return { ...EMPTY, storeClicks: {} };
}

/**
 * Turns the stored JSON into state, tolerating anything.
 *
 * Exported because the dashboard subscribes to the raw string — a stable
 * snapshot React can compare — and parses it itself.
 */
export function parseAnalytics(raw: string | null): AnalyticsState {
  if (!raw) return emptyAnalytics();
  try {
    const parsed = JSON.parse(raw) as Partial<AnalyticsState>;
    // Spread over the defaults rather than trusting the payload: a state
    // written by an older build is missing whichever fields came later, and
    // `undefined + 1` is NaN, which would poison the counter permanently.
    return {
      ...emptyAnalytics(),
      ...parsed,
      storeClicks: { ...(parsed.storeClicks ?? {}) },
    };
  } catch {
    return emptyAnalytics();
  }
}

function read(): AnalyticsState {
  try {
    return parseAnalytics(window.localStorage.getItem(ANALYTICS_KEY));
  } catch {
    return emptyAnalytics();
  }
}

function write(state: AnalyticsState): void {
  // Through writeStored, not setItem: it notifies same-tab subscribers, so a
  // dashboard open beside the tour updates instead of going stale.
  writeStored(ANALYTICS_KEY, JSON.stringify(state));
}

/** Read-modify-write, so two tabs interleaving cannot lose each other's edits. */
function update(fn: (state: AnalyticsState) => AnalyticsState): void {
  if (typeof window === "undefined") return;
  const next = fn(read());
  next.lastSeen = Date.now();
  write(next);
}

export function loadAnalytics(): AnalyticsState {
  if (typeof window === "undefined") return emptyAnalytics();
  return read();
}

export function clearAnalytics(): void {
  writeStored(ANALYTICS_KEY, null);
}

/** A shop panel was opened, from a checkpoint or from the directory. */
export function trackStoreClick(slug: string): void {
  update((s) => ({
    ...s,
    storeClicks: { ...s.storeClicks, [slug]: (s.storeClicks[slug] ?? 0) + 1 },
  }));
}

/**
 * An answer was submitted.
 *
 * `firstOfSession` is what makes "participants" mean people rather than
 * answers: it is the caller's job to pass it true exactly once per visit, and
 * TourScreen holds that flag in a ref so a re-render cannot double-count.
 */
export function trackAnswer(isCorrect: boolean, firstOfSession: boolean): void {
  update((s) => ({
    ...s,
    answers: s.answers + 1,
    correctAnswers: s.correctAnswers + (isCorrect ? 1 : 0),
    quizSessions: s.quizSessions + (firstOfSession ? 1 : 0),
  }));
}

/**
 * Counts a visit and starts the foreground clock.
 *
 * Returns a teardown. Time is banked on every hide and on unload rather than
 * only at the end: a phone visitor closes the tab by swiping the app away,
 * which fires `visibilitychange` and often nothing else, so a session that
 * only wrote on unload would record zero.
 */
export function startSession(): () => void {
  if (typeof window === "undefined") return () => {};

  update((s) => ({
    ...s,
    sessions: s.sessions + 1,
    firstSeen: s.firstSeen || Date.now(),
  }));

  let since = document.visibilityState === "visible" ? Date.now() : 0;

  const bank = () => {
    if (since === 0) return;
    const elapsed = Date.now() - since;
    since = 0;
    // A negative or absurd delta means the clock moved under us (sleep,
    // timezone change). Drop it rather than write a week into the total.
    if (elapsed <= 0 || elapsed > 6 * 60 * 60 * 1000) return;
    update((s) => ({ ...s, msActive: s.msActive + elapsed }));
  };

  const onVisibility = () => {
    if (document.visibilityState === "visible") {
      since = Date.now();
    } else {
      bank();
    }
  };

  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("pagehide", bank);

  return () => {
    bank();
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("pagehide", bank);
  };
}

/** "1 h 12 min" / "8 min 30 s" — never a raw millisecond count. */
export function formatDuration(ms: number, locale: "fr" | "en"): string {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const min = locale === "fr" ? "min" : "min";
  if (h > 0) return `${h} h ${m} ${min}`;
  if (m > 0) return `${m} ${min} ${s} s`;
  return `${s} s`;
}
