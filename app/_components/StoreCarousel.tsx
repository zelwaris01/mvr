"use client";

import Link from "next/link";
import { STORES } from "@/app/_lib/stores-data";
import { useGame } from "./GameStateProvider";
import { SectionTitle } from "./SectionTitle";
import { StoreLogo } from "./StoreLogo";

export function StoreCarousel() {
  const { progress } = useGame();

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <SectionTitle>Boutiques</SectionTitle>
        <Link
          href="/stores"
          className="text-[11px] text-ink-3 hover:text-brass transition-colors uppercase tracking-wider font-medium"
        >
          Tout voir →
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 -mx-1 px-1 snap-x snap-mandatory">
        {STORES.map((store) => {
          const explored = progress.exploredStores.includes(store.slug);
          return (
            <Link
              key={store.slug}
              href={`/stores/${store.slug}`}
              className="flex-shrink-0 snap-start group"
            >
              <div
                className={`relative w-[88px] md:w-[100px] rounded-xl overflow-hidden transition-all duration-200 group-hover:scale-105 border ${
                  explored
                    ? "border-jade bg-jade-soft"
                    : "border-line bg-surface-1 hover:border-line-strong"
                }`}
              >
                {/* Logo */}
                <div className="aspect-square bg-surface-1 flex items-center justify-center relative">
                  <StoreLogo slug={store.slug} name={store.name} size={60} className="border-0 bg-transparent" />
                  {explored && (
                    <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-jade flex items-center justify-center">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="text-white">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Name */}
                <div className="bg-surface-2 py-2 px-1 text-center">
                  <span className="text-[10px] font-bold tracking-wide text-ink-2">
                    {store.name}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
