"use client";

import Link from "next/link";
import Image from "next/image";
import { STORES } from "@/app/_lib/stores-data";
import { MATTERPORT_URL } from "@/app/_lib/constants";
import { useGame } from "@/app/_components/GameStateProvider";
import { StoreLogo } from "@/app/_components/StoreLogo";

export default function HomePage() {
  const { isHydrated, progress } = useGame();

  return (
    <div className="animate-fade-up">
      {/* ════ HERO ════ */}
      <section className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden">
        <iframe
          src={MATTERPORT_URL}
          width="100%"
          height="100%"
          frameBorder={0}
          allow="fullscreen; xr-spatial-tracking"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
          title="Visite virtuelle du mall"
        />
        {/* Dark overlay — always dark regardless of theme since it's over video */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 pointer-events-none" />

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 pointer-events-none">
          <div className="max-w-6xl mx-auto">
            <p className="text-white/50 text-xs uppercase tracking-[0.2em] mb-2">
              Anfa Place · Casablanca
            </p>
            <h1 className="text-white text-3xl md:text-5xl font-display font-extrabold leading-tight max-w-xl">
              Explorez le Mall
              <br />comme si vous y étiez
            </h1>
            <p className="text-white/60 text-sm md:text-base mt-3 max-w-md">
              Visite virtuelle 360°, boutiques exclusives et récompenses à débloquer.
            </p>
            <div className="flex gap-3 mt-6 pointer-events-auto">
              <Link
                href="/tour"
                className="bg-brass hover:bg-brass/90 text-white font-semibold rounded-lg px-6 py-3 text-sm transition-colors"
              >
                Visite virtuelle 360°
              </Link>
              <Link
                href="/stores"
                className="bg-white/10 backdrop-blur hover:bg-white/20 text-white font-medium rounded-lg px-6 py-3 text-sm transition-colors border border-white/20"
              >
                Voir les boutiques
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ════ STORES GRID ════ */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-ink-3 text-xs uppercase tracking-[0.15em] mb-1">Nos boutiques</p>
            <h2 className="text-2xl md:text-3xl font-display font-extrabold text-ink">
              Les marques du Mall
            </h2>
          </div>
          <Link href="/stores" className="text-brass text-sm font-medium hover:underline hidden md:block">
            Tout voir →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          {STORES.map((store) => {
            const explored = isHydrated && progress.exploredStores.includes(store.slug);
            const heroImg = store.products[0]?.image;
            return (
              <Link
                key={store.slug}
                href={`/stores/${store.slug}`}
                className="group bg-surface-1 rounded-2xl overflow-hidden border border-line hover:border-line-strong transition-all"
              >
                <div className="aspect-[4/3] relative overflow-hidden bg-surface-2">
                  {heroImg && (
                    <Image
                      src={heroImg}
                      alt={store.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  )}
                  {explored && (
                    <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-jade text-white flex items-center justify-center">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                  )}
                </div>
                <div className="p-4 flex items-center gap-3">
                  <StoreLogo slug={store.slug} name={store.name} size={36} className="flex-shrink-0" />
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-ink truncate">{store.name}</h3>
                    <p className="text-[10px] text-ink-3 uppercase tracking-wider">{store.category}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-6 text-center md:hidden">
          <Link href="/stores" className="text-brass text-sm font-medium hover:underline">
            Voir toutes les boutiques →
          </Link>
        </div>
      </section>

      {/* ════ QUIZ CTA ════ */}
      <section className="bg-surface-1 border-y border-line">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-16 flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="flex-1">
            <p className="text-brass text-xs uppercase tracking-[0.15em] font-medium mb-2">
              Défis & Récompenses
            </p>
            <h2 className="text-2xl md:text-3xl font-display font-extrabold text-ink">
              Testez vos connaissances,
              <br />gagnez des récompenses
            </h2>
            <p className="text-ink-2 text-sm mt-3 max-w-md leading-relaxed">
              Répondez aux quiz sur les marques du mall, accumulez des points XP
              et débloquez des bons de réduction exclusifs.
            </p>
            <div className="flex gap-3 mt-6">
              <Link
                href="/quiz"
                className="bg-brass hover:bg-brass/90 text-white font-semibold rounded-lg px-6 py-3 text-sm transition-colors"
              >
                Commencer le quiz
              </Link>
              <Link
                href="/rewards"
                className="bg-ink/5 border border-ink/15 hover:bg-ink/10 text-ink font-medium rounded-lg px-6 py-3 text-sm transition-colors"
              >
                Mes récompenses
              </Link>
            </div>
          </div>
          {/* Stats preview — simple, not a dashboard */}
          {isHydrated && (
            <div className="flex gap-6 md:gap-8">
              <div className="text-center">
                <p className="text-3xl font-display font-extrabold text-brass tabular-nums">{progress.totalXp}</p>
                <p className="text-[10px] text-ink-3 uppercase tracking-wider mt-1">Points XP</p>
              </div>
              <div className="w-px bg-line" />
              <div className="text-center">
                <p className="text-3xl font-display font-extrabold text-ink tabular-nums">
                  {Object.values(progress.answeredQuestions).filter(a => a.isCorrect).length}/12
                </p>
                <p className="text-[10px] text-ink-3 uppercase tracking-wider mt-1">Bonnes réponses</p>
              </div>
              <div className="w-px bg-line" />
              <div className="text-center">
                <p className="text-3xl font-display font-extrabold text-ink tabular-nums">
                  {progress.exploredStores.length}/8
                </p>
                <p className="text-[10px] text-ink-3 uppercase tracking-wider mt-1">Boutiques</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ════ FOOTER BANNER ════ */}
      <section className="bg-brass py-6 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <p className="text-white font-display font-bold text-sm md:text-base tracking-[0.1em] uppercase">
            Explorez · Découvrez · Répondez · Gagnez
          </p>
          <span className="hidden md:block text-white/60 text-xs">
            Smart Mall Experience
          </span>
        </div>
      </section>
    </div>
  );
}
