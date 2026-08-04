"use client";

import Link from "next/link";
import Image from "next/image";
import type { Store } from "@/app/_lib/types";
import { useGame } from "./GameStateProvider";
import { StoreLogo } from "./StoreLogo";
import { QUESTIONS } from "@/app/_lib/questions-data";
import { XP_PER_STORE_VISIT } from "@/app/_lib/constants";

export function StoreCard({ store }: { store: Store }) {
  const { progress } = useGame();
  const explored = progress.exploredStores.includes(store.slug);
  const heroImage = store.products[0]?.image;
  const storeQs = QUESTIONS.filter((q) => q.storeSlug === store.slug);
  const unanswered = storeQs.filter((q) => !progress.answeredQuestions[q.id]).length;
  const availableXp = explored ? unanswered * 50 : XP_PER_STORE_VISIT + storeQs.length * 50;

  return (
    <Link
      href={`/stores/${store.slug}`}
      className={`group relative bg-surface-1 rounded-2xl overflow-hidden transition-all duration-200 hover:scale-[1.02] border ${
        explored ? "border-jade/30" : "border-line hover:border-line-strong"
      }`}
    >
      {/* Product image */}
      <div className="aspect-[4/3] relative overflow-hidden bg-surface-2">
        {heroImage && (
          <Image
            src={heroImage}
            alt={store.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-1 via-transparent to-transparent" />

        {/* Logo plate */}
        <div className="absolute top-3 left-3">
          <StoreLogo slug={store.slug} name={store.name} size={40} />
        </div>

        {/* State indicator — top right */}
        {explored ? (
          <div className="absolute top-3 right-3 bg-jade text-white rounded-full w-7 h-7 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        ) : (
          <div className="absolute top-3 right-3 bg-brass-soft border border-brass/20 text-brass rounded-full px-2 py-0.5">
            <span className="text-[9px] font-bold tabular-nums">+{availableXp} XP</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3.5">
        <p className="text-[9px] text-ink-3 uppercase tracking-wider">{store.category}</p>
        <h3 className="font-bold text-sm text-ink mt-0.5">{store.name}</h3>
        {store.offers[0] && (
          <div className="mt-2 flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brass">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
            <span className="text-[10px] font-semibold text-brass">{store.offers[0].discount}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
