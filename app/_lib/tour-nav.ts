import type { MpSdk } from "@matterport/sdk";

export type Vec3 = { x: number; y: number; z: number };

/** How far from a pin we'll still accept a sweep as "the spot in front of it". */
const MAX_SWEEP_DISTANCE_M = 9;

export function distanceSq(a: Vec3, b: Vec3): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return dx * dx + dy * dy + dz * dz;
}

/**
 * How much a metre of height counts against a metre of ground distance.
 *
 * `TagData` carries no floor number — only `roomId`, which lives in a
 * different id namespace from `Sweep.floorInfo` — so a floor filter isn't
 * available. Weighting the vertical axis achieves the same thing
 * geometrically: the sweep directly below a first-floor storefront is ~4 m
 * down, which at this weight scores as ~16 m and loses to any same-level
 * sweep within reach. Without it, clicking a brand can teleport you a floor
 * away, which reads as a total malfunction.
 */
const VERTICAL_PENALTY = 4;

/**
 * The walkable spot nearest a pin.
 *
 * The SDK has no such helper — `Sweep.data` is a flat dictionary and nothing
 * relates a tag to a standing position. Two constraints keep the answer sane:
 * the vertical weighting above, and a distance cap — straight-line distance is
 * not walkable distance, so past a few metres "nearest" stops meaning
 * anything. Returning null is better than flying somewhere wrong: the caller
 * simply skips the flight and opens the quiz where the visitor already stands.
 */
export function nearestSweep(
  target: Vec3,
  sweeps: Iterable<MpSdk.Sweep.ObservableSweepData>
): MpSdk.Sweep.ObservableSweepData | null {
  const maxSq = MAX_SWEEP_DISTANCE_M * MAX_SWEEP_DISTANCE_M;
  let best: MpSdk.Sweep.ObservableSweepData | null = null;
  let bestScore = Infinity;

  for (const sweep of sweeps) {
    if (!sweep.enabled || !sweep.position) continue;

    const dx = target.x - sweep.position.x;
    const dy = (target.y - sweep.position.y) * VERTICAL_PENALTY;
    const dz = target.z - sweep.position.z;
    const score = dx * dx + dy * dy + dz * dz;

    if (score < bestScore && score <= maxSq) {
      bestScore = score;
      best = sweep;
    }
  }
  return best;
}

/**
 * The camera rotation that puts `target` in view from `from`.
 *
 * Matterport's rotation is degrees: `y` is the heading, `x` the pitch. The
 * yaw convention here (atan2 over x/z, offset by 180°) is the part most
 * likely to be wrong on a given model — a flipped sign lands the camera
 * facing away from the storefront, which looks worse than not rotating at
 * all. `rotation` is optional on `Sweep.moveTo`, so callers should treat
 * this as best-effort and be willing to omit it.
 */
export function lookAtRotation(from: Vec3, target: Vec3): MpSdk.Rotation {
  const dx = target.x - from.x;
  const dy = target.y - from.y;
  const dz = target.z - from.z;

  const yaw = Math.atan2(dx, -dz) * (180 / Math.PI);
  const horizontal = Math.hypot(dx, dz);
  const pitch = Math.atan2(dy, horizontal) * (180 / Math.PI);

  return {
    x: Math.max(-90, Math.min(90, pitch)),
    y: yaw,
  };
}
