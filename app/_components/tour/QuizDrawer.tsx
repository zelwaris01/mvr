"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { DiscoveredStore } from "@/app/_lib/roster";
import type { Question } from "@/app/_lib/types";
import { useGame } from "@/app/_components/GameStateProvider";
import { StoreLogo } from "@/app/_components/StoreLogo";
import { intlTag, useLocale, type Locale } from "@/app/_lib/i18n";
import type { ShopVideo } from "@/app/_lib/shop-media";
import { youTubeEmbedUrl, youTubeId } from "@/app/_lib/youtube";
import { RETRY_LIMIT, RETRY_WINDOW_HOURS } from "@/app/_lib/constants";

const FEEDBACK_MS = 2200;

type Tab = "store" | "quiz";

/**
 * The storefront panel: what this shop is, and its quiz.
 *
 * Intentionally NOT a modal dialog: `role="dialog" aria-modal` would declare
 * the panorama inert to assistive technology, which is the opposite of the
 * promise this panel makes in its own footer. So: a labelled region, focus
 * moved to the heading, Escape to close, and no focus trap — Tab continues
 * past the drawer onto the checkpoint discs, so the visit stays navigable by
 * keyboard too.
 */
export function QuizDrawer({
  store,
  onClose,
  onOpenImage,
  onAnswer,
}: {
  store: DiscoveredStore;
  onClose: () => void;
  /** Raised to the screen, which owns the lightbox — see the note in globals.css. */
  onOpenImage: (images: string[], start: number) => void;
  /**
   * Raised too, rather than calling `answerQuestion` directly: the screen
   * wraps it so the XP and the /admin counter are written from one place.
   */
  onAnswer: (questionId: string, index: number) => void;
}) {
  const { progress } = useGame();
  const { t } = useLocale();
  const headingRef = useRef<HTMLHeadingElement>(null);

  const questions = store.questions;
  const current = questions.find((q) => !progress.answeredQuestions[q.id]);

  // Always the shop first, whether or not questions are outstanding. It used
  // to open on the quiz while any remained, which meant arriving at a shop put
  // a question in front of you before you had seen the shop — and the photos,
  // the video and the blurb are what the visit is for. The quiz is one tap
  // away and keeps its unanswered count on the tab.
  //
  // Initial value only: the caller keys this component on the slug, so
  // switching store remounts and re-evaluates it. Resetting it from an effect
  // instead would yank the panel back here on every answer.
  const [tab, setTab] = useState<Tab>("store");

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

  return (
    <div className="drawer-slot">
      <aside
        className="drawer on-dark"
        role="region"
        aria-label={t("drawerRegion", { store: store.name })}
      >
        {/* ── Head ── */}
        <div className="flex items-start justify-between gap-3 p-5 pb-3">
          <div className="flex items-center gap-3 min-w-0">
            {store.imageFromModel ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={store.image}
                alt=""
                className="w-11 h-11 rounded-lg object-contain bg-surface-1 flex-shrink-0"
              />
            ) : (
              <StoreLogo slug={store.slug} name={store.name} size={44} />
            )}
            <div className="flex flex-col gap-1 min-w-0">
              <h2
                ref={headingRef}
                tabIndex={-1}
                className="font-display text-[22px] leading-none text-ink truncate outline-none"
              >
                {store.name}
              </h2>
              <span className="text-[11px] text-ink-3 leading-none truncate">
                {store.category}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={t("close")}
            className="w-10 h-10 rounded-full grid place-items-center text-ink-3 hover:text-brass border border-line hover:border-brass-line transition-colors flex-shrink-0"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        {/* ── Tabs ── */}
        <div className="mx-5 mb-4 flex rounded-full border border-line p-1">
          <TabButton active={tab === "store"} onClick={() => setTab("store")}>
            {t("tabStore")}
          </TabButton>
          <TabButton active={tab === "quiz"} onClick={() => setTab("quiz")}>
            {t("tabQuiz")}
            {current && (
              <span className="ml-1.5 text-brass">
                {questions.length - questions.indexOf(current)}
              </span>
            )}
          </TabButton>
        </div>

        {tab === "store" ? (
          <StorePanel store={store} onOpenImage={onOpenImage} />
        ) : (
          <QuizPanel store={store} onAnswer={onAnswer} onClose={onClose} />
        )}

        {/* The reward line lived here; removed on request. `Store.reward` is
            still carried in the data if it ever comes back. */}
        <div className="mt-auto border-t border-line px-5 py-4">
          <span className="text-[10.5px] text-ink-3 leading-snug">
            {t("tourStaysLive")}
          </span>
        </div>
      </aside>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`flex-1 py-2.5 min-h-[40px] rounded-full text-[11.5px] font-semibold tracking-wide transition-colors ${
        active ? "bg-brass text-on-brass" : "text-ink-2 hover:text-brass"
      }`}
    >
      {children}
    </button>
  );
}

/* ══════════════════════════════════════════
   La boutique
   ══════════════════════════════════════════ */

function StorePanel({
  store,
  onOpenImage,
}: {
  store: DiscoveredStore;
  onOpenImage: (images: string[], start: number) => void;
}) {
  const { t } = useLocale();
  const parts = useMemo(() => parseTagText(store.tagText), [store.tagText]);

  return (
    // No `flex-1` here. The footer below uses `mt-auto`, and auto margins
    // absorb a flex container's free space *before* flex-grow is applied — so
    // `flex: 1 1 0%` left this panel sitting at its 0% basis and rendered
    // nothing at all. Natural height plus the footer's auto margin gives the
    // same layout without the collapse.
    <div className="flex flex-col gap-4 px-5 pb-5">
      {/* The shop's own photography, straight from the pin. The first image
          leads; the rest sit under it as a grid. Matterport paginates these
          one at a time in its billboard — showing them together is the point
          of having taken the panel over. */}
      {store.gallery.length > 0 && (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => onOpenImage(store.gallery, 0)}
            title={t("enlarge")}
            className="h-[132px] w-full rounded-xl bg-surface-1 border border-line grid place-items-center overflow-hidden hover:border-brass-line transition-colors"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={store.gallery[0]}
              alt={store.name}
              className="max-h-[104px] max-w-[84%] object-contain"
            />
          </button>

          {store.gallery.length > 1 && (
            <div className="grid grid-cols-3 gap-2">
              {store.gallery.slice(1, 7).map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => onOpenImage(store.gallery, i + 1)}
                  title={t("enlarge")}
                  className="aspect-square rounded-lg bg-surface-1 border border-line overflow-hidden hover:border-brass-line transition-colors"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={t("imageAlt", { store: store.name, n: i + 2 })}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Videos the pin carries, under the photography. Whoever attaches one in
          Workshop gets it here on the next load — no code change, which is the
          whole point of reading the model rather than a catalogue.
          `controls` here, unlike the wall screens: this is a panel you have
          stopped to read, so playing and pausing is exactly what you want. */}
      {store.videos.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-[9.5px] font-medium uppercase tracking-[0.18em] text-ink-3">
            {t("storeVideos")}
          </span>
          <div className="flex flex-col gap-2">
            {store.videos.map((video, i) => (
              <ShopVideoFrame
                key={video.kind === "youtube" ? video.url : video.src}
                video={video}
                index={i}
                storeName={store.name}
              />
            ))}
          </div>
        </div>
      )}

      <p className="text-[12.5px] leading-[1.65] text-ink-2 text-pretty">
        {store.description}
      </p>

      {/* Said plainly rather than left as a gap: this shop exists because the
          model has a pin for it, and nobody has written it a quiz yet. */}
      {!store.fromCatalogue && (
        <p className="rounded-xl border border-line bg-surface-1 px-3.5 py-2.5 text-[11px] leading-snug text-ink-3">
          {t("storeFromModel")}
        </p>
      )}

      {parts.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-[9.5px] font-medium uppercase tracking-[0.18em] text-ink-3">
            {t("storeInfo")}
          </span>
          <div className="flex flex-col gap-2 text-[12px] leading-[1.65] text-ink-2">
            {parts.map((part, i) =>
              part.href ? (
                <a
                  key={i}
                  href={part.href}
                  target={part.href.startsWith("tel:") ? undefined : "_blank"}
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-brass hover:underline break-all"
                >
                  {part.text}
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                </a>
              ) : (
                <span key={i} className="whitespace-pre-line break-words">
                  {part.text}
                </span>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * One video in the shop panel.
 *
 * Nothing autoplays here, unlike the wall screens. Several of these can be a
 * scroll apart over a live 3D scene, and a panel that starts making noise when
 * it opens is the wrong kind of surprise — so YouTube gets controls and no
 * autoplay, and a file gets `preload="metadata"`, which fetches the duration
 * and a first frame without pulling the whole thing down.
 *
 * The 16:9 box is fixed rather than left to the content. A YouTube iframe has
 * no intrinsic size, so without it the embed collapses to nothing.
 */
function ShopVideoFrame({
  video,
  index,
  storeName,
}: {
  video: ShopVideo;
  index: number;
  storeName: string;
}) {
  const { t } = useLocale();

  if (video.kind === "youtube") {
    const id = youTubeId(video.url);
    if (!id) {
      // Rendering nothing beats an iframe quietly loading YouTube's 404
      // player, which looks like a broken shop rather than a bad config line.
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          `[shop-media] ${storeName}: not a YouTube URL — ${video.url}`
        );
      }
      return null;
    }
    return (
      <div className="relative w-full aspect-video overflow-hidden rounded-xl border border-line bg-black">
        <iframe
          src={youTubeEmbedUrl(id, { autoplay: false, controls: true })}
          title={video.title ?? `${storeName} — ${t("storeVideos")}`}
          allow="encrypted-media; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    );
  }

  return (
    <video
      src={video.src}
      poster={video.poster}
      controls
      playsInline
      preload="metadata"
      aria-label={video.title ?? `${storeName} — ${index + 1}`}
      className="w-full rounded-xl border border-line bg-black"
    />
  );
}

type TextPart = { text: string; href?: string };

/**
 * Turns a pin's description into renderable parts.
 *
 * Matterport stores links as markdown — `[Achat en ligne](https://…)` — which
 * looked like literal brackets on screen until this existed. Bare URLs and
 * phone numbers are picked up too, so "Pour vos commandes: 05375-80993"
 * becomes something you can actually tap on a phone.
 */
export function parseTagText(raw: string): TextPart[] {
  if (!raw?.trim()) return [];

  const parts: TextPart[] = [];
  const pattern =
    /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)|(https?:\/\/[^\s)]+)|(\+?\d[\d\s().-]{7,}\d)/g;

  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(raw)) !== null) {
    if (m.index > last) {
      const text = raw.slice(last, m.index).trim();
      if (text) parts.push({ text });
    }
    if (m[1] && m[2]) {
      parts.push({ text: m[1], href: m[2] });
    } else if (m[3]) {
      parts.push({ text: m[3], href: m[3] });
    } else if (m[4]) {
      const digits = m[4].replace(/[^\d+]/g, "");
      parts.push({ text: m[4].trim(), href: `tel:${digits}` });
    }
    last = pattern.lastIndex;
  }
  const tail = raw.slice(last).trim();
  if (tail) parts.push({ text: tail });

  return parts;
}

/* ══════════════════════════════════════════
   Retry
   ══════════════════════════════════════════ */

/** "3 h" / "45 min" — enough to know whether waiting is worth it. */
function formatWait(
  ms: number,
  t: (key: "waitMinutes" | "waitHours", params: { n: number }) => string
): string {
  const minutes = Math.max(1, Math.ceil(ms / 60000));
  if (minutes < 60) return t("waitMinutes", { n: minutes });
  return t("waitHours", { n: Math.ceil(minutes / 60) });
}

/**
 * The wall-clock time a retry returns, so it isn't only ever relative.
 * The locale decides 14:30 against 2:30 pm, which is the whole reason it is
 * threaded down here rather than hardcoded to fr-FR.
 */
function formatClock(at: number, locale: Locale): string {
  return new Date(at).toLocaleTimeString(intlTag(locale), {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * The wall clock, as an external store.
 *
 * Reading Date.now() during render is impure, and pushing it into state from
 * an effect is the cascading-render pattern React now flags. `useSyncExternal
 * Store` is the sanctioned way to read a mutable outside value: the snapshot
 * is quantised to the tick interval so it stays byte-identical between ticks,
 * which is what keeps React from re-rendering on every read.
 */
function useNow(intervalMs = 30_000): number {
  return useSyncExternalStore(
    (onChange) => {
      const id = setInterval(onChange, intervalMs);
      return () => clearInterval(id);
    },
    () => Math.floor(Date.now() / intervalMs) * intervalMs,
    () => 0 // server render: unknown, and the caller renders nothing for 0
  );
}

function Retry({ store }: { store: DiscoveredStore }) {
  const { retryStore, retryState } = useGame();
  const { t, locale } = useLocale();
  const now = useNow();

  // First paint, before the clock effect has run: say nothing rather than
  // guess at a quota and flash the wrong answer.
  if (now === 0) return null;

  const { left, nextAt } = retryState(now);

  // Out of retries: say so plainly, and say when they come back. A greyed
  // button with no explanation reads as a broken feature.
  if (left === 0) {
    return (
      <div className="flex flex-col items-center gap-2 max-w-[280px] p-3.5 rounded-xl border border-clay/30 bg-clay-soft">
        <span className="text-[9.5px] font-medium uppercase tracking-[0.18em] text-clay">
          {t("retryExhausted")}
        </span>
        <p className="text-[11.5px] leading-[1.6] text-ink-2">
          {t("retryExhaustedBody", { limit: RETRY_LIMIT })}{" "}
          {nextAt
            ? t("retryBefore", {
                wait: formatWait(nextAt - now, t),
                clock: formatClock(nextAt, locale),
              })
            : t("retryForNow")}
        </p>
      </div>
    );
  }

  const last = left === 1;

  return (
    <div className="flex flex-col items-center gap-2">
      <button onClick={() => retryStore(store.slug)} className="btn btn-fill">
        {t("retryAgain")}
      </button>
      <span
        className={`text-[10.5px] leading-snug max-w-[260px] ${
          last ? "text-clay" : "text-ink-3"
        }`}
      >
        {last
          ? t("retryLast", { hours: RETRY_WINDOW_HOURS })
          : t("retryLeft", { left, limit: RETRY_LIMIT })}
      </span>
    </div>
  );
}

/* ══════════════════════════════════════════
   Quiz
   ══════════════════════════════════════════ */

function QuizPanel({
  store,
  onAnswer,
  onClose,
}: {
  store: DiscoveredStore;
  onAnswer: (questionId: string, index: number) => void;
  onClose: () => void;
}) {
  const { progress } = useGame();
  const { t } = useLocale();
  const [selected, setSelected] = useState<number | null>(null);
  /**
   * The question being reviewed during the feedback pause.
   *
   * Without this the panel jumped a question ahead the instant you answered:
   * `current` is derived from progress, so answering makes it resolve to the
   * *next* question while the feedback for the previous one is still on
   * screen — which rendered the new question with your last pick highlighted
   * on it, looking as though the quiz had chosen an answer for you.
   */
  const [reviewing, setReviewing] = useState<Question | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const questions = store.questions;
  const pending = questions.find((q) => !progress.answeredQuestions[q.id]);
  // Hold on the reviewed question until its feedback has run its course.
  const current = reviewing ?? pending;
  const showFeedback = reviewing !== null;
  const correctCount = questions.filter(
    (q) => progress.answeredQuestions[q.id]?.isCorrect
  ).length;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleAnswer = (index: number) => {
    if (reviewing || !pending) return;
    setSelected(index);
    setReviewing(pending);
    onAnswer(pending.id, index);
    timerRef.current = setTimeout(() => {
      setSelected(null);
      setReviewing(null);
    }, FEEDBACK_MS);
  };

  const questionIndex = current ? questions.indexOf(current) : questions.length;
  const isCorrect = current ? selected === current.correctIndex : false;

  // A shop tagged in the model that has no questions yet. Without this it
  // falls through to the completion screen and congratulates the visitor on
  // "0 / 0 bonnes réponses", with a retry button that has nothing to retry.
  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center text-center gap-3 px-5 pb-8 pt-4">
        <span className="w-11 h-11 rounded-full grid place-items-center bg-surface-2 text-ink-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="10" /><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.5-3 4" /><line x1="12" y1="17.5" x2="12" y2="17.5" strokeWidth="2.5" strokeLinecap="round" /></svg>
        </span>
        <p className="text-[13px] font-semibold text-ink leading-none">
          {t("quizSoon")}
        </p>
        <p className="text-[11.5px] leading-[1.6] text-ink-3 max-w-[260px]">
          {t("quizSoonBody")}
        </p>
        <button onClick={onClose} className="btn btn-ghost mt-1">
          {t("resumeTour")}
        </button>
      </div>
    );
  }

  return (
    // Natural height, not flex-1 — see the note in StorePanel.
    <div className="flex flex-col gap-4 px-5 pb-5">
      {/* Segmented progress */}
      <div className="flex gap-1">
        {questions.map((q, i) => {
          const answer = progress.answeredQuestions[q.id];
          return (
            <div
              key={q.id}
              className={`flex-1 h-[3px] rounded-full transition-colors duration-500 ${
                answer
                  ? answer.isCorrect
                    ? "bg-jade"
                    : "bg-clay"
                  : i === questionIndex
                  ? "bg-brass"
                  : "bg-surface-2"
              }`}
            />
          );
        })}
      </div>

      {current ? (
        <>
          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.16em] text-ink-3 tabular-nums">
            <span>
              {questionIndex + 1} / {questions.length}
            </span>
            <span className="text-brass">
              {t("quizXp", { xp: current.xpReward })}
            </span>
          </div>

          <h3 className="font-display text-[23px] leading-[1.2] text-ink text-pretty">
            {current.questionText}
          </h3>

          <div className="flex flex-col gap-2">
            {current.options.map((option, index) => {
              const isAnswer = index === current.correctIndex;
              const isWrongPick = index === selected && !isAnswer;

              let row = "border-line hover:border-brass-line hover:bg-brass-soft";
              let plate = "bg-surface-2 text-ink-3";

              if (showFeedback) {
                if (isAnswer) {
                  row = "border-jade/40 bg-jade-soft";
                  plate = "bg-jade/20 text-jade";
                } else if (isWrongPick) {
                  row = "border-clay/40 bg-clay-soft";
                  plate = "bg-clay/20 text-clay";
                } else {
                  row = "border-line opacity-45";
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={showFeedback}
                  className={`w-full text-left p-3 rounded-xl border flex items-center gap-3 transition-all duration-300 ${row}`}
                >
                  <span
                    className={`w-8 h-8 rounded-lg grid place-items-center flex-shrink-0 font-display text-[14px] leading-none transition-colors ${plate}`}
                  >
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="text-[13px] font-medium text-ink flex-1">
                    {option}
                  </span>
                </button>
              );
            })}
          </div>

          {showFeedback && (
            <div
              className={`p-3.5 rounded-xl border animate-scale-in flex flex-col gap-1.5 ${
                isCorrect
                  ? "border-jade/30 bg-jade-soft"
                  : "border-clay/30 bg-clay-soft"
              }`}
            >
              <span
                className={`text-[9.5px] font-medium uppercase tracking-[0.18em] ${
                  isCorrect ? "text-jade" : "text-clay"
                }`}
              >
                {isCorrect
                  ? t("quizRight", { xp: current.xpReward })
                  : t("quizWrong")}
              </span>
              <p className="text-[12px] leading-[1.6] text-ink-2 text-pretty">
                {current.explanation}
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center text-center gap-3.5 py-8">
          <span className="eyebrow">{t("quizFinished")}</span>
          <p className="font-display text-[26px] leading-[1.15] text-ink">
            {t("quizScore", {
              correct: correctCount,
              total: questions.length,
            })}
          </p>

          <Retry store={store} />

          <button onClick={onClose} className="btn btn-ghost mt-1">
            {t("resumeTour")}
          </button>
        </div>
      )}
    </div>
  );
}
