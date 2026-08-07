"use client";

import type { Reward } from "@/app/_lib/types";

export function RewardCard({
  reward,
  unlocked,
  currentXp,
}: {
  reward: Reward;
  unlocked: boolean;
  currentXp: number;
}) {
  const remaining = Math.max(0, reward.requiredXp - currentXp);

  return (
    <div
      className={`p-5 rounded-xl border flex flex-col gap-3 ${
        unlocked ? "border-brass-line bg-brass-soft" : "border-line bg-card"
      }`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <span
          className={`font-display text-[30px] leading-none tabular-nums ${
            unlocked ? "text-brass" : "text-ink-3"
          }`}
        >
          {reward.discount}
        </span>
        <span className="eyebrow eyebrow-muted">{reward.storeName}</span>
      </div>

      <div className="flex flex-col gap-1.5">
        <span
          className={`font-display text-[19px] leading-[1.25] ${
            unlocked ? "text-ink" : "text-ink-2"
          }`}
        >
          {reward.title}
        </span>
        <span className="text-[10.5px] leading-[1.5] text-ink-3 text-pretty">
          {reward.description}
        </span>
      </div>

      <div className="mt-auto pt-1">
        {unlocked ? (
          <button className="btn btn-brass w-full !py-2.5 !text-[11.5px]">
            Débloquée
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="h-1 rounded-full bg-line overflow-hidden">
              <div
                className="h-full bg-brass"
                style={{
                  width: `${Math.min(100, (currentXp / reward.requiredXp) * 100)}%`,
                }}
              />
            </div>
            <span className="text-[10.5px] leading-none text-ink-3 tabular-nums">
              Encore {remaining} XP · palier {reward.requiredXp} XP
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
