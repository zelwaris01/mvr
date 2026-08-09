import type { MpSdk } from "@matterport/sdk";

export type Vec3 = { x: number; y: number; z: number };

/** Ideal: a sweep this close is unambiguously "in front of" the pin. */
const MAX_SWEEP_DISTANCE_M = 15;
/**
 * Last resort. Beyond the ideal range we still travel rather than refuse —
 * landing roughly right beats a checkpoint that silently does nothing when
 * clicked, which is how this failed for Chocorico and Summer Market.
 */
const FALLBACK_DISTANCE_M = 35;

export function distanceSq(a: Vec3, b: Vec3): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return dx * dx + dy * dy + dz * dz;
}

/**
 * How much a metre of height counts against a metre of ground distance.
 *
 * This used to be 4, to stop a first-floor pin resolving to the sweep
 * directly beneath it on the ground floor. That risk no longer exists: the
 * mall's levels are separate Matterport scans, so a single space only ever
 * contains one storey and there is nothing below to fall through to.
 *
 * Left at 4 it did real damage. Pins float above head height, so a couple of
 * metres of stem became eight metres of penalty against a nine-metre budget —
 * enough to reject every candidate and leave the pin unreachable. A mild
 * weight still prefers a sweep on the shop's own level if a scan ever does
 * contain two.
 */
const VERTICAL_PENALTY = 1.5;

/**
 * The walkable spot nearest a pin.
 *
 * The SDK has no such helper — `Sweep.data` is a flat dictionary and nothing
 * relates a tag to a standing position.
 *
 * Two passes, because refusing to travel is the worst outcome: prefer a sweep
 * within the ideal radius, but rather than give up, accept the nearest one
 * within the fallback radius. A checkpoint that lands you approximately right
 * is honest; one that appears clickable and then does nothing is not.
 */
export function nearestSweep(
  target: Vec3,
  sweeps: Iterable<MpSdk.Sweep.ObservableSweepData>
): MpSdk.Sweep.ObservableSweepData | null {
  const idealSq = MAX_SWEEP_DISTANCE_M * MAX_SWEEP_DISTANCE_M;
  const fallbackSq = FALLBACK_DISTANCE_M * FALLBACK_DISTANCE_M;

  let best: MpSdk.Sweep.ObservableSweepData | null = null;
  let bestScore = Infinity;

  for (const sweep of sweeps) {
    if (!sweep.enabled || !sweep.position) continue;

    const dx = target.x - sweep.position.x;
    const dy = (target.y - sweep.position.y) * VERTICAL_PENALTY;
    const dz = target.z - sweep.position.z;
    const score = dx * dx + dy * dy + dz * dz;

    if (score < bestScore) {
      bestScore = score;
      best = sweep;
    }
  }

  if (!best) return null;
  if (bestScore <= idealSq) return best;
  return bestScore <= fallbackSq ? best : null;
}

/** How far out in front of a shopfront we'd ideally stand, in metres. */
const VIEWING_DISTANCE_M = 3.5;

/**
 * The spot to stand in to look at a shopfront.
 *
 * Picking the sweep nearest the shop itself sounds right and isn't: the
 * nearest sweep to a point on the glass can easily be off to one side, or
 * even inside the shop, and you arrive facing along the window rather than
 * into it. The pin's stem points straight out from the surface, so stepping
 * that way first gives a target out in the walkway, square to the storefront.
 *
 * Falls back to the anchor when the stem is missing or degenerate, which is
 * no worse than the old behaviour.
 */
export function viewpointFor(anchor: Vec3, stem: Vec3): Vec3 {
  const length = Math.hypot(stem.x, stem.y, stem.z);
  if (!Number.isFinite(length) || length < 0.01) return anchor;

  const scale = VIEWING_DISTANCE_M / length;
  return {
    x: anchor.x + stem.x * scale,
    // Stay at standing height: the stem often points upward off a fascia,
    // and following it vertically would aim for a spot in mid-air.
    y: anchor.y,
    z: anchor.z + stem.z * scale,
  };
}

/**
 * Turns the camera until `target` is centred on screen.
 *
 * Every previous attempt here computed a heading from trigonometry and hoped
 * Matterport's yaw convention matched — which is how clicking Women'Secret
 * ended up framing Springfield. The convention is undocumented, and guessing
 * its sign is a coin flip that stays wrong until someone notices.
 *
 * This asks the question the other way round: project the target with the
 * SDK's own `worldToScreen`, see how far off centre it lands, and rotate to
 * close the gap. The sign is discovered rather than assumed — if the first
 * nudge makes things worse, the direction flips and the loop carries on. A
 * couple of iterations settle it, and it is correct for any model.
 */
export async function aimAt(
  sdk: MpSdk,
  target: Vec3,
  size: { w: number; h: number }
): Promise<void> {
  if (size.w === 0 || size.h === 0) return;

  const APPROX_HFOV_DEG = 65; // only sets the step size; the loop corrects it
  const TOLERANCE = size.w * 0.035;
  const scratch = { x: 0, y: 0, z: 0 };

  let direction = 1;
  let previousError = Infinity;

  for (let i = 0; i < 5; i++) {
    const pose = await sdk.Camera.pose.waitUntil(() => true);
    sdk.Conversion.worldToScreen(target, pose, size, scratch);

    // Behind the camera: no meaningful screen error to read, so swing round
    // and re-measure rather than chasing a mirrored coordinate.
    if (!(scratch.z > 0 && scratch.z < 1)) {
      await sdk.Camera.rotate(90 * direction, 0, { speed: 220 });
      continue;
    }

    const error = scratch.x - size.w / 2;
    if (Math.abs(error) <= TOLERANCE) return;

    // Got worse after a turn? The convention runs the other way.
    if (Math.abs(error) > Math.abs(previousError)) direction = -direction;
    previousError = error;

    const degrees = (error / size.w) * APPROX_HFOV_DEG * direction;
    await sdk.Camera.rotate(degrees, 0, { speed: 220 });
  }
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
