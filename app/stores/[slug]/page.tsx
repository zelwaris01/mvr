"use client";

import { use, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { STORES } from "@/app/_lib/stores-data";
import { QUESTIONS } from "@/app/_lib/questions-data";
import { useGame } from "@/app/_components/GameStateProvider";
import { SectionTitle } from "@/app/_components/SectionTitle";
import { StoreLogo } from "@/app/_components/StoreLogo";

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

  useEffect(() => {
    if (isHydrated && store) {
      exploreStore(store.slug);
    }
  }, [isHydrated, store, exploreStore]);

  if (!store) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <p className="text-ink-2">Boutique introuvable</p>
        <Link href="/stores" className="text-brass text-sm mt-4 inline-block">
          ← Retour aux boutiques
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1100px] mx-auto px-4 md:px-6 py-6 space-y-8 animate-fade-up">
      {/* Back link */}
      <Link
        href="/stores"
        className="text-ink-3 hover:text-brass text-xs transition-colors inline-flex items-center gap-1 uppercase tracking-wider"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Boutiques
      </Link>

      {/* Store hero banner */}
      <div className="relative rounded-2xl overflow-hidden">
        {/* Background image from first product */}
        <div className="relative h-52 md:h-72">
          <Image
            src={store.products[0]?.image || store.logo}
            alt={store.name}
            fill
            className="object-cover opacity-40"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/80 to-bg/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-bg/50" />
        </div>

        {/* Content overlay */}
        <div className="absolute inset-0 flex items-center p-6 md:p-10">
          <div className="flex flex-col md:flex-row gap-5 items-start md:items-center w-full">
            {/* Logo */}
            <StoreLogo slug={store.slug} name={store.name} size={80} className="md:!w-[112px] md:!h-[112px] flex-shrink-0 backdrop-blur" />

            {/* Info */}
            <div className="flex-1">
              <span className="text-[9px] text-brass uppercase tracking-[0.25em] font-medium">
                {store.category}
              </span>
              <h1 className="text-2xl md:text-4xl font-black mt-1 mb-2">
                {store.name}
              </h1>
              <p className="text-xs md:text-sm text-ink-2 leading-relaxed max-w-lg">
                {store.description}
              </p>

              {storeQuestions.length > 0 && (
                <Link
                  href={`/quiz/${store.slug}`}
                  className="inline-flex items-center gap-2 mt-4 bg-brass hover:bg-brass/90 text-white font-bold rounded-full px-6 py-2.5 text-sm transition-all"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  {answeredCount > 0
                    ? `Quiz (${answeredCount}/${storeQuestions.length})`
                    : "Commencer le Quiz"}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Products grid */}
      <section>
        <SectionTitle className="mb-5">Photos & Produits</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {store.products.map((product) => (
            <div
              key={product.id}
              className="bg-surface-1 border border-line rounded-2xl overflow-hidden group hover:border-brass/30 transition-all"
            >
              <div className="aspect-square relative overflow-hidden bg-surface-2">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-1 via-transparent to-transparent opacity-60" />
                {/* Price tag */}
                <div className="absolute bottom-3 right-3 bg-surface-1/80 backdrop-blur rounded-full px-3 py-1 border border-line">
                  <span className="text-brass font-bold text-xs">{product.price}</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-sm font-bold">{product.name}</h3>
                <p className="text-[10px] text-ink-3 mt-0.5">{store.name}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Offers */}
      {store.offers.length > 0 && (
        <section>
          <SectionTitle className="mb-5">Offres & Promos</SectionTitle>
          <div className="space-y-3">
            {store.offers.map((offer) => (
              <div
                key={offer.id}
                className="bg-surface-1 border border-line rounded-2xl p-5 flex items-center gap-5"
              >
                <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl bg-brass-soft flex items-center justify-center border border-brass/20">
                  <span className="text-brass font-black text-xl md:text-2xl">
                    {offer.discount}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm md:text-base">{offer.title}</h3>
                  <p className="text-xs text-ink-2 mt-1 leading-relaxed">
                    {offer.description}
                  </p>
                </div>
                <div className="hidden md:block flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-brass-soft flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brass">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
