"use client";

import { createContext, useContext } from "react";
import { useGameState } from "@/app/_lib/useGameState";

type GameStateContextType = ReturnType<typeof useGameState>;

const GameStateContext = createContext<GameStateContextType | null>(null);

export function GameStateProvider({ children }: { children: React.ReactNode }) {
  const gameState = useGameState();
  return (
    <GameStateContext.Provider value={gameState}>
      {children}
    </GameStateContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameStateContext);
  if (!ctx) {
    throw new Error("useGame must be used within a GameStateProvider");
  }
  return ctx;
}
