"use client";

import type { Reward } from "@/app/_lib/types";

export function RewardCard({
  reward,
  unlocked,
}: {
  reward: Reward;
  unlocked: boolean;
}) {
  return (
    <div
      className={`flex-shrink-0 w-[175px] md:w-[195px] rounded-xl overflow-hidden border-2 transition-all ${
        unlocked
          ? "border-jade bg-surface-1"
          : "border-line bg-surface-1"
      }`}
    >
      {/* Top — discount at display size */}
      <div className="p-4 pb-3 text-center">
        <span
          className={`text-4xl font-display font-extrabold tabular-nums leading-none ${
            unlocked ? "text-brass" : "text-ink-3"
          }`}
        >
          {reward.discount}
        </span>
        <p className={`text-[11px] font-semibold mt-2 ${unlocked ? "text-ink" : "text-ink-3"}`}>
          {reward.title}
        </p>
        <p className="text-[9px] text-ink-3 mt-0.5">{reward.storeName}</p>
      </div>

      {/* Perforated tear line */}
      <div className="relative h-0 mx-0">
        <div className="absolute inset-x-3 top-0 border-t-2 border-dashed border-line" />
        <div className="absolute -left-[5px] -top-[7px] w-[14px] h-[14px] rounded-full bg-bg" />
        <div className="absolute -right-[5px] -top-[7px] w-[14px] h-[14px] rounded-full bg-bg" />
      </div>

      {/* Bottom — status */}
      <div className="px-4 py-3 flex items-center justify-between">
        {unlocked ? (
          <>
            <div className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-jade">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="text-[10px] font-semibold text-jade">Débloquée</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1.5">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-ink-3">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span className="text-[10px] font-semibold text-ink-3 tabular-nums">{reward.requiredXp} XP</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
