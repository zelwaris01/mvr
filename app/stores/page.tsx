"use client";

import { useState } from "react";
import { STORES } from "@/app/_lib/stores-data";
import { StoreCard } from "@/app/_components/StoreCard";
import { SectionTitle } from "@/app/_components/SectionTitle";
import { useGame } from "@/app/_components/GameStateProvider";

const CATEGORIES = ["Tout", "Mode", "Chaussures", "Beauté", "Sport", "Alimentation"];

export default function StoresPage() {
  const { isHydrated, progress } = useGame();
  const [filter, setFilter] = useState("Tout");

  const filteredStores =
    filter === "Tout" ? STORES : STORES.filter((s) => s.category === filter);

  if (!isHydrated) {
    return (
      <div className="max-w-[1440px] mx-auto px-5 md:px-[34px] pt-10 md:pt-14">
        <div className="h-10 w-64 bg-surface-1 rounded animate-pulse mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[18px]">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-[300px] rounded-[14px] bg-surface-1 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-5 md:px-[34px] pt-10 md:pt-14 pb-16 md:pb-24 flex flex-col gap-6 md:gap-[26px] animate-fade-up">
      <SectionTitle
        eyebrow={`Anfa Place · ${progress.exploredStores.length} sur ${STORES.length} visitées`}
        action={
          <div className="flex gap-1.5 overflow-x-auto hide-scrollbar -mx-1 px-1 py-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`pill flex-shrink-0 ${filter === cat ? "pill-on" : "pill-off"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        }
      >
        Le répertoire des maisons
      </SectionTitle>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[18px]">
        {filteredStores.map((store) => (
          <StoreCard key={store.slug} store={store} />
        ))}
      </div>

      {filteredStores.length === 0 && (
        <div className="text-center py-24">
          <p className="font-display text-[22px] text-ink-2">
            Aucune boutique dans cette catégorie
          </p>
          <button onClick={() => setFilter("Tout")} className="btn btn-ghost mt-6">
            Voir toutes les boutiques
          </button>
        </div>
      )}
    </div>
  );
}
