"use client";

import { useGame } from "./GameStateProvider";
import { REWARDS } from "@/app/_lib/rewards-data";
import { RewardCard } from "./RewardCard";

export function RewardList() {
  const { progress } = useGame();
  const unlockedCount = REWARDS.filter(
    (r) => progress.totalXp >= r.requiredXp
  ).length;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-display text-[26px] leading-none text-ink">
          Vos récompenses
        </h2>
        <span className="text-[11px] text-ink-3 leading-none tabular-nums">
          {unlockedCount} / {REWARDS.length} obtenues
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
        {REWARDS.map((reward) => (
          <RewardCard
            key={reward.id}
            reward={reward}
            unlocked={progress.totalXp >= reward.requiredXp}
            currentXp={progress.totalXp}
          />
        ))}
      </div>
    </section>
  );
}
