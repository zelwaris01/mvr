"use client";

import { memo, useRef } from "react";
import type { DiscoveredStore } from "@/app/_lib/roster";
import { useLocale } from "@/app/_lib/i18n";

type Props = {
  stores: DiscoveredStore[];
  /** Slugs whose quiz is fully answered — these stop advertising themselves. */
  doneSlugs: Set<string>;
  /** XP still on the table per store, for the name plate. */
  pendingXp: Map<string, number>;
  bind: (id: string) => (el: HTMLElement | null) => void;
  onSelect: (slug: string) => void;
  disabled: boolean;
};

/**
 * The checkpoints floating over the storefronts.
 *
 * Renders once per roster change and then never again while the visitor
 * moves — positions are written straight to these elements by
 * CheckpointEngine. Re-rendering on camera movement is the thing the whole
 * design exists to avoid.
 */
function CheckpointLayerImpl({
  stores,
  doneSlugs,
  pendingXp,
  bind,
  onSelect,
  disabled,
}: Props) {
  return (
    <div
      className="cp-layer"
      style={disabled ? { pointerEvents: "none" } : undefined}
    >
      {stores.map((store) => (
        <Checkpoint
          key={store.tagId}
          store={store}
          done={doneSlugs.has(store.slug)}
          xp={pendingXp.get(store.slug) ?? 0}
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
  xp,
  bind,
  onSelect,
}: {
  store: DiscoveredStore;
  done: boolean;
  xp: number;
  bind: Props["bind"];
  onSelect: Props["onSelect"];
}) {
  const { t: translate } = useLocale();
  const down = useRef({ x: 0, y: 0, t: 0 });

  /**
   * A press that travelled is someone trying to look around who happened to
   * start on the marker — let it through as a drag instead of hijacking it
   * into opening a quiz.
   */
  const press = {
    onPointerDown: (e: React.PointerEvent) => {
      down.current = { x: e.clientX, y: e.clientY, t: e.timeStamp };
    },
    onPointerUp: (e: React.PointerEvent) => {
      const d = down.current;
      if (Math.abs(e.clientX - d.x) > 8 || Math.abs(e.clientY - d.y) > 8) return;
      if (e.timeStamp - d.t > 500) return;
      onSelect(store.slug);
    },
  };

  const label = done ? translate("cpDone") : translate("cpToEarn", { xp });

  return (
    <div ref={bind(store.tagId)} className={`cp ${done ? "cp-done" : ""}`}>
      <div className="cp-anchor">
        {/* Only the badge and plate bob. The stem stays put, so the tether to
            the storefront never floats free of the point it marks. */}
        <div className="cp-body">
          <button
            type="button"
            className="cp-badge"
            aria-label={`${store.name} — ${label}`}
            {...press}
          >
            <span className="cp-halo" aria-hidden />
            {/* Unanswered: a lit core inside the ring, no glyph. Answered:
                the ring keeps the same silhouette and holds a tick instead,
                so a finished checkpoint still reads as a landmark rather than
                disappearing into the scene.
                The name and the XP were never the badge's job — the plate
                below says both — which is what makes dropping the "?" safe. */}
            {done ? (
              <span className="cp-glyph" aria-hidden>
                ✓
              </span>
            ) : (
              <span className="cp-core" aria-hidden />
            )}
          </button>

          {/* Clicking the plate does the same as the badge — a bigger target
              for a thumb, and it names the thing so the badge isn't a riddle. */}
          <span className="cp-plate" role="presentation" {...press}>
            {store.name}
            {!done && xp > 0 && <span className="cp-xp">+{xp}</span>}
          </span>
        </div>

        <span className="cp-stem" aria-hidden />
      </div>
    </div>
  );
}
