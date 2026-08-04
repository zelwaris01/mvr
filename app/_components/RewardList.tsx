"use client";

import { useGame } from "./GameStateProvider";
import { REWARDS } from "@/app/_lib/rewards-data";
import { RewardCard } from "./RewardCard";
import { SectionTitle } from "./SectionTitle";

export function RewardList() {
  const { progress } = useGame();

  return (
    <div className="min-w-0">
      <SectionTitle className="mb-3">Vos Récompenses</SectionTitle>

      <div className="overflow-x-auto hide-scrollbar -mx-1 px-1">
        <div className="flex gap-2.5 pb-1 w-max">
          {REWARDS.map((reward) => (
            <RewardCard
              key={reward.id}
              reward={reward}
              unlocked={progress.totalXp >= reward.requiredXp}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
