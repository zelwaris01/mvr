import type { Vec3 } from "./tour-nav";
import type { TagRecord } from "./roster";
import type { TagPlacement, WallScreen } from "./screens-data";

/**
 * Turns a screen's placement into four world-space corners.
 *
 * Corner placements pass straight through. Tag placements are built here, from
 * the two things a Matterport pin already knows about the surface it is stuck
 * to: where it touches (`anchorPosition`) and which way that surface faces
 * (`stemVector`). A plane and a normal is a rectangle short of its size, and
 * the size is what the config supplies.
 */

type Vec = { x: number; y: number; z: number };

/** World up. Matterport's SDK is Y-up; the whole app assumes it. */
const UP: Vec = { x: 0, y: 1, z: 0 };

function length(v: Vec): number {
  return Math.hypot(v.x, v.y, v.z);
}

function scale(v: Vec, k: number): Vec {
  return { x: v.x * k, y: v.y * k, z: v.z * k };
}

function cross(a: Vec, b: Vec): Vec {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

/**
 * The stem, flattened to the horizontal and normalised.
 *
 * Pins are often stuck to a fascia or an angled sign, so the stem tilts up or
 * down. A screen that inherited that tilt would lean out of the wall like a
 * departures board. Dropping the vertical component keeps the screen plumb
 * while preserving which way it faces, which is the only part that matters.
 *
 * Returns null when the stem is missing, degenerate, or points straight up or
 * down — a pin on a ceiling or a floor has no "front" to hang a screen on, and
 * guessing one would put a video somewhere arbitrary.
 */
function facingOf(stem: Vec | undefined): Vec | null {
  if (!stem) return null;
  const flat = { x: stem.x, y: 0, z: stem.z };
  const len = length(flat);
  if (!isFinite(len) || len < 1e-3) return null;
  return scale(flat, 1 / len);
}

/**
 * Corners for a tag-anchored screen, wound clockwise from the front.
 *
 * The winding is the subtle part. With Y up and a right-handed basis,
 * `cross(UP, facing)` is the viewer's right when `facing` points back at them,
 * so top-left → top-right → bottom-right → bottom-left comes out clockwise on
 * screen — which is exactly what ScreenEngine requires to consider the surface
 * front-facing. Swap the cross operands and every screen silently vanishes.
 */
export function cornersForTag(
  place: TagPlacement,
  anchor: Vec,
  stem: Vec | undefined
): [Vec3, Vec3, Vec3, Vec3] | null {
  const facing = facingOf(stem);
  if (!facing) return null;

  const right = cross(UP, facing);
  const rLen = length(right);
  if (rLen < 1e-6) return null;
  const r = scale(right, 1 / rLen);

  const halfW = place.width / 2;
  const halfH = place.height / 2;

  // Centre: up from the anchor by `lift`, out from the surface by `push`.
  const c: Vec = {
    x: anchor.x + facing.x * place.push,
    y: anchor.y + place.lift,
    z: anchor.z + facing.z * place.push,
  };

  const dx = scale(r, halfW);
  const dy = scale(UP, halfH);

  const corner = (sx: number, sy: number): Vec3 => ({
    x: c.x + dx.x * sx + dy.x * sy,
    y: c.y + dx.y * sx + dy.y * sy,
    z: c.z + dx.z * sx + dy.z * sy,
  });

  return [
    corner(-1, 1), // top-left
    corner(1, 1), // top-right
    corner(1, -1), // bottom-right
    corner(-1, -1), // bottom-left
  ];
}

export type PlacedScreen = WallScreen & {
  corners: [Vec3, Vec3, Vec3, Vec3];
};

/**
 * Resolves every screen for the current scan against the pins the model
 * actually reported.
 *
 * A tag-anchored screen whose shop is not in this model is dropped rather than
 * placed at the origin — the same rule the roster follows, and for the same
 * reason: a video hanging in the void is worse than no video.
 */
export function placeScreens(
  screens: WallScreen[],
  tags: TagRecord[]
): PlacedScreen[] {
  const out: PlacedScreen[] = [];

  for (const screen of screens) {
    // Bound to a local before switching on it: narrowing a discriminated union
    // through `screen.place.at` does not survive the `continue`, and the
    // compiler is right to complain — it cannot know the property is stable.
    const place = screen.place;

    if (place.at === "corners") {
      out.push({ ...screen, corners: place.corners });
      continue;
    }

    const tag = tags.find((t) => t.slug === place.storeSlug);
    if (!tag) {
      // Silent while the model has reported nothing at all. This runs on the
      // first render too, when `tags` is empty because the SDK has not
      // finished connecting — announcing "no pin" then is a false alarm on
      // every single load, and a diagnostic that cries wolf gets ignored.
      // console.warn, not log: Next forwards warn and error from the browser
      // to the dev terminal, which is the only way to see why a screen never
      // appeared without asking someone to open devtools on a phone.
      if (tags.length > 0) {
        report(screen.id, `no pin for "${place.storeSlug}" in this model`);
      }
      continue;
    }

    const corners = cornersForTag(place, tag.anchorPosition, tag.stemVector);
    if (!corners) {
      const s = tag.stemVector;
      report(
        screen.id,
        `pin "${tag.label}" has no usable stem — ` +
          `stem=(${s?.x?.toFixed(3)}, ${s?.y?.toFixed(3)}, ${s?.z?.toFixed(3)}). ` +
          `A vertical or zero-length stem gives no wall to face; ` +
          `place this one with explicit corners instead (?screen=1).`
      );
      continue;
    }

    report(
      screen.id,
      `placed on "${tag.label}" at ` +
        `(${corners[0].x.toFixed(2)}, ${corners[0].y.toFixed(2)}, ${corners[0].z.toFixed(2)})…`
    );
    out.push({ ...screen, corners });
  }

  return out;
}

/**
 * Says once, per screen, what became of it.
 *
 * `placeScreens` runs on every tag flush during load, so an unguarded log
 * would repeat a dozen times per visit and bury itself. This keeps the first
 * verdict for each screen and only speaks again when it changes.
 */
const lastReport = new Map<string, string>();

function report(id: string, message: string): void {
  if (process.env.NODE_ENV === "production") return;
  if (lastReport.get(id) === message) return;
  lastReport.set(id, message);
  console.warn(`[screen] ${id}: ${message}`);
}
