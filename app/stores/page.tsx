"use client";

import { STORES } from "@/app/_lib/stores-data";
import { StoreCard } from "@/app/_components/StoreCard";
import { SectionTitle } from "@/app/_components/SectionTitle";
import { useGame } from "@/app/_components/GameStateProvider";
import { useState } from "react";

const CATEGORIES = ["Tout", "Mode", "Chaussures", "Beauté", "Sport", "Alimentation"];

export default function StoresPage() {
  const { isHydrated, progress } = useGame();
  const [filter, setFilter] = useState("Tout");

  const filteredStores =
    filter === "Tout"
      ? STORES
      : STORES.filter((s) => s.category === filter);

  if (!isHydrated) {
    return (
      <div className="max-w-[1100px] mx-auto px-4 md:px-6 py-6">
        <div className="h-6 w-40 bg-surface-1 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-[4/5] rounded-2xl bg-surface-1 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1100px] mx-auto px-4 md:px-6 py-6 animate-fade-up">
      <div className="flex items-center justify-between mb-6">
        <SectionTitle>Boutiques du Mall</SectionTitle>
        <span className="text-[10px] text-ink-3 tabular-nums">
          {progress.exploredStores.length}/{STORES.length} visitées
        </span>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-6 pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all ${
              filter === cat
                ? "bg-brass text-white"
                : "bg-surface-1 border border-line text-ink-2 hover:text-brass hover:border-brass/30"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Store grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredStores.map((store) => (
          <StoreCard key={store.slug} store={store} />
        ))}
      </div>

      {filteredStores.length === 0 && (
        <div className="text-center py-16">
          <p className="text-ink-3 text-sm">Aucune boutique dans cette catégorie</p>
        </div>
      )}
    </div>
  );
}
