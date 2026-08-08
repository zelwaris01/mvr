"use client";

import { useCallback, useEffect, useRef } from "react";
import type { MpSdk } from "@matterport/sdk";
import { CheckpointEngine } from "./tour-engine";

type Marker = { id: string; world: MpSdk.Vector3 };

/**
 * Wires the checkpoint engine to the SDK camera and the stage element.
 *
 * Everything here runs at mount, on resize, or when the marker set changes —
 * never per frame. The returned `bind` is a stable ref callback; if its
 * identity changed between renders React would detach and reattach every
 * marker, resetting the engine's cached positions each time.
 */
export function useCheckpointOverlay(
  sdk: MpSdk | null,
  stageRef: React.RefObject<HTMLElement | null>,
  markers: Marker[]
) {
  const engineRef = useRef<CheckpointEngine | null>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!sdk || !stage) return;

    const engine = new CheckpointEngine(sdk.Conversion);
    engineRef.current = engine;

    // ResizeObserver rather than window.resize: the stage can change size
    // without the window doing so, and on mobile the collapsing URL bar would
    // otherwise leave every marker progressively misplaced.
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      engine.setSize(r.width, r.height);
    });
    ro.observe(stage);
    engine.setSize(stage.clientWidth, stage.clientHeight);

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    engine.setReducedMotion(mq.matches);
    const onMq = () => engine.setReducedMotion(mq.matches);
    mq.addEventListener("change", onMq);

    const sub = sdk.Camera.pose.subscribe(engine.onPose);

    return () => {
      sub.cancel();
      ro.disconnect();
      mq.removeEventListener("change", onMq);
      engine.dispose();
      engineRef.current = null;
    };
  }, [sdk, stageRef]);

  useEffect(() => {
    engineRef.current?.setMarkers(markers);
  }, [markers]);

  const bind = useCallback(
    (id: string) => (el: HTMLElement | null) => {
      engineRef.current?.bind(id, el);
    },
    []
  );

  const setDrawerInset = useCallback((px: number) => {
    engineRef.current?.setRightInset(px);
  }, []);

  const screenPos = useCallback(
    (id: string) => engineRef.current?.screenPos(id) ?? null,
    []
  );

  return { bind, setDrawerInset, screenPos };
}
