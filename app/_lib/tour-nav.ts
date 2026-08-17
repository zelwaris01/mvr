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
 * Total degrees of turning allowed to frame one shopfront.
 *
 * Nothing is ever more than 180° away — turn further and you are going the
 * long way round to somewhere you could have reached by turning the other
 * way. The old loop had no budget at all: it corrected a target behind the
 * camera in blind 90° steps, five iterations deep, so an arrival facing away
 * from the shop span most of a full circle before it settled. Landing a few
 * degrees off centre is a far better outcome than a pirouette.
 */
const MAX_TURN_DEG = 180;

/**
 * Turns the camera until `target` is centred on screen.
 *
 * Every previous attempt here computed a heading from trigonometry and hoped
 * Matterport's yaw convention matched — which is how clicking Women'Secret
 * ended up framing Springfield. `Camera.rotate` documents its own sign
 * (positive is clockwise) but says nothing about how `pose.rotation.y` relates
 * to world coordinates, and guessing that is a coin flip that stays wrong until
 * someone notices.
 *
 * This asks the question the other way round: project the target with the
 * SDK's own `worldToScreen`, see how far off centre it lands, and rotate to
 * close the gap. The sign is discovered rather than assumed — if the first
 * nudge makes things worse, the direction flips and the loop carries on.
 *
 * Every turn is now drawn from a shared budget, so the discovery can cost at
 * most a wasted fraction of one turn rather than an extra lap.
 */
export async function aimAt(
  sdk: MpSdk,
  target: Vec3,
  size: { w: number; h: number }
): Promise<void> {
  if (size.w === 0 || size.h === 0) return;
  // A pin can carry a degenerate anchor — `worldToScreen` then reports NaN,
  // the correction computes to NaN, and `Camera.rotate` throws "xAngle must
  // be a finite number", aborting the arrival mid-flight. Not aiming is a far
  // better outcome than not arriving.
  if (!isFinite(target.x) || !isFinite(target.y) || !isFinite(target.z)) return;

  const APPROX_HFOV_DEG = 65; // only sets the step size; the loop corrects it
  const TOLERANCE = size.w * 0.035;
  const scratch = { x: 0, y: 0, z: 0 };

  let spent = 0; // degrees of travel used, whichever way it went
  let direction = 1;
  let previousError = Infinity;

  /**
   * Turns by at most what is left of the budget. Returns false when there is
   * nothing left to spend, which ends the loop where it stands rather than
   * carrying on with turns that would breach the cap.
   */
  const turn = async (degrees: number): Promise<boolean> => {
    const remaining = MAX_TURN_DEG - spent;
    if (remaining <= 0.5) return false;
    const capped = Math.max(-remaining, Math.min(remaining, degrees));
    if (Math.abs(capped) < 0.5) return false;
    await sdk.Camera.rotate(capped, 0, { speed: 220 });
    spent += Math.abs(capped);
    return true;
  };

  for (let i = 0; i < 5; i++) {
    const pose = await sdk.Camera.pose.waitUntil(() => true);
    sdk.Conversion.worldToScreen(target, pose, size, scratch);

    const offset = scratch.x - size.w / 2;

    // Behind the camera. A perspective projection mirrors what is behind the
    // eye, so the side it reports is the wrong one and negating it is the way
    // to turn; if that is not true of this build, the flip-on-worse below
    // still recovers, only now out of a budget rather than out of five free
    // 90° swings.
    // 140°, not 90°: one turn should bring a target that is behind you into
    // view, leaving the rest of the budget for the fine correction. Repeated
    // 90° steps were what turned a wrong first guess into a full circle.
    if (!(scratch.z > 0 && scratch.z < 1)) {
      const side = isFinite(offset) ? (offset >= 0 ? -1 : 1) : direction;
      if (!(await turn(140 * side))) return;
      continue;
    }

    if (!isFinite(offset)) return; // projection failed — leave the camera be
    if (Math.abs(offset) <= TOLERANCE) return;

    // Got worse after a turn? The convention runs the other way.
    if (Math.abs(offset) > Math.abs(previousError)) direction = -direction;
    previousError = offset;

    if (!(await turn((offset / size.w) * APPROX_HFOV_DEG * direction))) return;
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
