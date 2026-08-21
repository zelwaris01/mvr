"use client";

import { use, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { STORES } from "@/app/_lib/stores-data";
import { LEVEL_LABELS } from "@/app/_lib/constants";
import { QUESTIONS } from "@/app/_lib/questions-data";
import { useGame } from "@/app/_components/GameStateProvider";

export default function StoreDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { progress, exploreStore, isHydrated } = useGame();

  const store = STORES.find((s) => s.slug === slug);
  const storeQuestions = QUESTIONS.filter((q) => q.storeSlug === slug);
  const answeredCount = storeQuestions.filter(
    (q) => progress.answeredQuestions[q.id]
  ).length;
  const correctCount = storeQuestions.filter(
    (q) => progress.answeredQuestions[q.id]?.isCorrect
  ).length;
  const explored = progress.exploredStores.includes(slug);

  useEffect(() => {
    if (isHydrated && store) {
      exploreStore(store.slug);
    }
  }, [isHydrated, store, exploreStore]);

  if (!store) {
    return (
      <div className="max-w-[1360px] mx-auto px-5 py-32 text-center">
        <p className="font-display text-[28px] text-ink-2">Boutique introuvable</p>
        <Link href="/stores" className="btn btn-ghost mt-7">
          Retour au répertoire
        </Link>
      </div>
    );
  }

  const stats = [
    { value: String(store.gallery.length), label: "photos du modèle" },
    { value: String(storeQuestions.length), label: "questions du quiz" },
    { value: `${correctCount}/${storeQuestions.length || 1}`, label: "bonnes réponses" },
    { value: store.level, label: LEVEL_LABELS[store.level], accent: true },
  ];

  return (
    <div className="max-w-[1360px] mx-auto px-5 md:px-[34px] pt-8 md:pt-10 pb-16 md:pb-24 animate-fade-up">
      <Link href="/stores" className="backlink mb-6 md:mb-[26px]">
        ← Retour au répertoire
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 lg:gap-[34px] items-start">
        {/* ════ Main column ════ */}
        <div className="flex flex-col gap-7 md:gap-[30px]">
          {/* ── Hero plate ── */}
          <div className="plate relative h-[240px] md:h-[290px] rounded-[14px] border border-line">
            {store.gallery[0] && (
              <Image
                src={store.gallery[0]}
                alt={store.name}
                fill
                className="object-cover opacity-45"
                sizes="100vw"
                priority
              />
            )}
            <div className="absolute inset-0 bg-[linear-gradient(105deg,var(--bg)_10%,transparent_70%)]" />
            <div className="brass-glow" />

            <div className="absolute left-6 md:left-[34px] bottom-6 md:bottom-[30px] flex items-end gap-5">
              <div className="hidden sm:grid w-[82px] h-[82px] rounded-xl bg-fill place-items-center flex-shrink-0">
                <span className="font-display text-[30px] leading-none text-on-fill">
                  {store.name.charAt(0)}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="eyebrow">
                  {store.category} · Anfa Place{explored ? " · Visitée" : ""}
                </span>
                <h1 className="font-display text-ink text-[34px] md:text-[46px] leading-none">
                  {store.name}
                </h1>
              </div>
            </div>

            {storeQuestions.length > 0 && (
              <Link
                href={`/quiz/${store.slug}`}
                className="btn btn-brass absolute right-5 md:right-[30px] bottom-6 md:bottom-[30px]"
              >
                {answeredCount === 0
                  ? `Quiz · +${storeQuestions.length * 50} XP`
                  : answeredCount < storeQuestions.length
                  ? `Continuer (${answeredCount}/${storeQuestions.length})`
                  : "Quiz terminé"}
              </Link>
            )}
          </div>

          {/* ── Stat strip ── */}
          <div className="strip grid-cols-2 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1.5">
                <span
                  className={`font-display text-[24px] leading-none ${
                    stat.accent ? "text-brass" : "text-ink"
                  }`}
                >
                  {stat.value}
                </span>
                <span className="text-[10.5px] text-ink-3 leading-none">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* ── Collection ── */}
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-[26px] leading-none text-ink">
              La galerie
            </h2>
            <span className="text-[11px] uppercase tracking-[0.1em] text-ink-3">
              {store.gallery.length} photo{store.gallery.length === 1 ? "" : "s"} du
              modèle
            </span>
          </div>

          {store.gallery.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {store.gallery.map((src, i) => (
                <div key={src} className="group flex flex-col gap-3">
                  <div className="plate relative aspect-[4/5] rounded-[10px] border border-line group-hover:border-brass-line transition-colors">
                    <Image
                      src={src}
                      alt={`${store.name} — photo ${i + 1}`}
                      fill
                      className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                    <div className="brass-glow" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Two pins carry no attachment at all — the carousel and Summer
               Market. Saying so beats an empty grid that reads as a bug. */
            <div className="card p-6 text-center">
              <p className="text-[12.5px] leading-[1.6] text-ink-3">
                Aucune photo sur ce point d&apos;intérêt dans le modèle.
              </p>
            </div>
          )}
        </div>

        {/* ════ Sidebar ════ */}
        <aside className="flex flex-col gap-4 lg:sticky lg:top-24">
          {/* About */}
          <div className="card p-5 flex flex-col gap-3.5">
            <span className="eyebrow">La maison</span>
            <p className="text-[11.5px] leading-[1.6] text-ink-2 text-pretty">
              {store.description}
            </p>
            <div className="h-px bg-line" />
            {[
              { k: "Catégorie", v: store.category },
              { k: "Niveau", v: LEVEL_LABELS[store.level] },
              { k: "Statut", v: explored ? "Visitée" : "Non visitée" },
            ].map((row) => (
              <div key={row.k} className="flex justify-between text-[12.5px]">
                <span className="text-ink-3">{row.k}</span>
                <span className="text-ink">{row.v}</span>
              </div>
            ))}
          </div>

          {/* The pin's own links — the mall wrote these, not us. */}
          {store.links.length > 0 && (
            <div className="p-5 rounded-xl border border-brass-line bg-brass-soft flex flex-col gap-2.5">
              <span className="eyebrow">Depuis la fiche du mall</span>
              {store.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[12.5px] leading-[1.5] text-ink hover:text-brass transition-colors underline decoration-brass-line underline-offset-4"
                >
                  {link.label} →
                </a>
              ))}
            </div>
          )}

          {/* Quiz */}
          {storeQuestions.length > 0 && (
            <div className="card p-5 flex flex-col gap-3.5">
              <span className="eyebrow eyebrow-muted">Le défi de la boutique</span>
              <div className="flex gap-1">
                {storeQuestions.map((q) => {
                  const answer = progress.answeredQuestions[q.id];
                  return (
                    <div
                      key={q.id}
                      className={`h-1 flex-1 rounded-full ${
                        answer
                          ? answer.isCorrect
                            ? "bg-jade"
                            : "bg-clay"
                          : "bg-surface-2"
                      }`}
                    />
                  );
                })}
              </div>
              <p className="text-[11.5px] leading-[1.6] text-ink-2">
                {answeredCount === storeQuestions.length
                  ? `Terminé — ${correctCount}/${storeQuestions.length} bonnes réponses.`
                  : `${storeQuestions.length - answeredCount} question${
                      storeQuestions.length - answeredCount > 1 ? "s" : ""
                    } restante${
                      storeQuestions.length - answeredCount > 1 ? "s" : ""
                    }, 50 XP chacune.`}
              </p>
              <Link href={`/quiz/${store.slug}`} className="btn btn-fill w-full">
                {answeredCount === storeQuestions.length
                  ? "Revoir le quiz"
                  : "Répondre maintenant"}
              </Link>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
