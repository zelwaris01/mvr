"use client";

import { useCallback, useEffect, useRef } from "react";
import type { MpSdk } from "@matterport/sdk";
import { ScreenEngine } from "./screen-engine";
import type { PlacedScreen } from "./screen-placement";

/**
 * Wires the screen engine to the SDK camera, the stage, and the view mode.
 *
 * Mirrors useCheckpointOverlay deliberately — same lifecycle, same stable
 * `bind` callback, same ResizeObserver reasoning. The one addition is the mode
 * subscription: a screen is only honest in walk mode, and Mode.current tells us
 * when we have left it.
 */
export function useWallScreens(
  sdk: MpSdk | null,
  stageRef: React.RefObject<HTMLElement | null>,
  screens: PlacedScreen[]
) {
  const engineRef = useRef<ScreenEngine | null>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!sdk || !stage) return;

    const engine = new ScreenEngine(sdk.Conversion);
    engineRef.current = engine;

    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      engine.setSize(r.width, r.height);
    });
    ro.observe(stage);
    engine.setSize(stage.clientWidth, stage.clientHeight);

    const poseSub = sdk.Camera.pose.subscribe(engine.onPose);

    /**
     * Hide only when we are definitely OUTSIDE the model, rather than showing
     * only when we are definitely inside it.
     *
     * The polarity matters and I had it the wrong way round. `Mode.current`
     * also emits TRANSITIONING, and null before the player settles; testing
     * for INSIDE meant any of those hid every screen, and if the last thing
     * emitted was a transition they stayed hidden for good. Failing towards
     * "visible" is right here: the worst case is a screen briefly on show
     * during a mode change, against a feature that silently never appears.
     */
    const modeSub = sdk.Mode.current.subscribe((mode) => {
      const outside =
        mode === sdk.Mode.Mode.DOLLHOUSE || mode === sdk.Mode.Mode.FLOORPLAN;
      engine.setInside(!outside);
    });

    return () => {
      poseSub.cancel();
      modeSub.cancel();
      ro.disconnect();
      engine.dispose();
      engineRef.current = null;
    };
  }, [sdk, stageRef]);

  useEffect(() => {
    engineRef.current?.setScreens(screens);
  }, [screens]);

  const bind = useCallback(
    (id: string) => (el: HTMLElement | null) => {
      engineRef.current?.bind(id, el);
    },
    []
  );

  return { bind };
}
