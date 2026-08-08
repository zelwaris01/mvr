"use client";

import { memo, useRef } from "react";
import type { DiscoveredStore } from "@/app/_lib/roster";

type Props = {
  stores: DiscoveredStore[];
  /** Slugs whose quiz is fully answered — these stop advertising themselves. */
  doneSlugs: Set<string>;
  bind: (id: string) => (el: HTMLElement | null) => void;
  onSelect: (slug: string) => void;
  disabled: boolean;
};

/**
 * The gold discs floating over the storefronts.
 *
 * This component renders once per roster change and then never again while
 * the visitor moves — positions are written straight to these elements by
 * CheckpointEngine. Re-rendering on camera movement is the thing the entire
 * design exists to avoid.
 */
function CheckpointLayerImpl({
  stores,
  doneSlugs,
  bind,
  onSelect,
  disabled,
}: Props) {
  return (
    <div className="cp-layer" style={disabled ? { pointerEvents: "none" } : undefined}>
      {stores.map((store) => (
        <Checkpoint
          key={store.tagId}
          store={store}
          done={doneSlugs.has(store.slug)}
          bind={bind}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

export const CheckpointLayer = memo(CheckpointLayerImpl);

function Checkpoint({
  store,
  done,
  bind,
  onSelect,
}: {
  store: DiscoveredStore;
  done: boolean;
  bind: Props["bind"];
  onSelect: Props["onSelect"];
}) {
  const down = useRef({ x: 0, y: 0, t: 0 });

  return (
    <button
      ref={bind(store.tagId)}
      type="button"
      className={`cp ${done ? "cp-done" : ""}`}
      aria-label={
        done ? `${store.name} — quiz terminé` : `${store.name} — ouvrir le quiz`
      }
      onPointerDown={(e) => {
        down.current = { x: e.clientX, y: e.clientY, t: e.timeStamp };
      }}
      onPointerUp={(e) => {
        // A press that moved is someone trying to look around who happened to
        // start on a disc — don't hijack it into opening a quiz.
        const d = down.current;
        if (Math.abs(e.clientX - d.x) > 8 || Math.abs(e.clientY - d.y) > 8) return;
        if (e.timeStamp - d.t > 500) return;
        onSelect(store.slug);
      }}
    >
      <span className="cp-ring" aria-hidden />
    </button>
  );
}
