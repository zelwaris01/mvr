"use client";

import Link from "next/link";
import Image from "next/image";
import type { Store } from "@/app/_lib/types";
import { useGame } from "./GameStateProvider";
import { QUESTIONS } from "@/app/_lib/questions-data";
import { XP_PER_STORE_VISIT } from "@/app/_lib/constants";

export function StoreCard({ store }: { store: Store }) {
  const { progress } = useGame();
  const explored = progress.exploredStores.includes(store.slug);
  const heroImage = store.products[0]?.image;
  const thumbs = store.products.slice(1, 3);
  const storeQs = QUESTIONS.filter((q) => q.storeSlug === store.slug);
  const unanswered = storeQs.filter((q) => !progress.answeredQuestions[q.id]).length;
  const availableXp = explored
    ? unanswered * 50
    : XP_PER_STORE_VISIT + storeQs.length * 50;

  return (
    <Link
      href={`/stores/${store.slug}`}
      className="card card-link group flex flex-col gap-3.5 p-[18px]"
    >
      {/* ── Plate ── */}
      <div className="plate relative h-[132px] rounded-[10px]">
        {heroImage && (
          <Image
            src={heroImage}
            alt={store.name}
            fill
            className="object-cover opacity-70 group-hover:opacity-90 group-hover:scale-[1.04] transition-all duration-500"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        )}
        <div className="brass-glow" />

        {/* Serif initial plate */}
        <div className="absolute left-3.5 top-3.5 w-[38px] h-[38px] rounded-lg bg-fill grid place-items-center">
          <span className="font-display text-[17px] leading-none text-on-fill">
            {store.name.charAt(0)}
          </span>
        </div>

        {/* State chip */}
        <div className="absolute right-3 top-3">
          <span className={`tag ${explored ? "!text-jade" : ""}`}>
            {explored ? "Visitée" : `+${availableXp} XP`}
          </span>
        </div>
      </div>

      {/* ── Identity ── */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-2.5">
          <span className="font-display text-[20px] leading-none text-ink">
            {store.name}
          </span>
          {store.offers[0] && (
            <span className="text-brass text-[11.5px] font-semibold leading-none">
              {store.offers[0].discount}
            </span>
          )}
        </div>
        <span className="text-[11.5px] text-ink-3 leading-none">
          {store.category} · {store.products.length} pièces
          {storeQs.length > 0 && ` · ${storeQs.length} questions`}
        </span>
      </div>

      {/* ── Mini collection strip ── */}
      <div className="flex gap-[7px]">
        {thumbs.map((p) => (
          <div
            key={p.id}
            className="relative flex-1 h-[52px] rounded-md overflow-hidden bg-surface-2 border border-line"
          >
            <Image
              src={p.image}
              alt={p.name}
              fill
              className="object-cover opacity-80"
              sizes="80px"
            />
          </div>
        ))}
        <div className="flex-1 h-[52px] rounded-md bg-surface-2 border border-line grid place-items-center">
          <span className="text-[10.5px] font-medium text-ink-3 leading-none">
            {unanswered > 0 && !explored
              ? `+${storeQs.length}`
              : `${store.products.length} réf.`}
          </span>
        </div>
      </div>
    </Link>
  );
}
