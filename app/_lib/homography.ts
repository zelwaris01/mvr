/**
 * The projective transform that glues a flat HTML element to a surface in the
 * 3D scene.
 *
 * Four world points bound a rectangle on a wall. Project each with the SDK's
 * `worldToScreen` and you have four screen points — but they are a *trapezium*,
 * not a rectangle, because perspective foreshortens the far edge. `translate`
 * and `scale` cannot produce that shape; only a projective map can, and CSS
 * exposes exactly one: `matrix3d`.
 *
 * So: solve the homography that carries the element's own box onto the quad,
 * and hand it to the compositor. No per-frame layout, no canvas, no WebGL.
 *
 * Pure and allocation-free by design — `solveQuad` writes into a caller-owned
 * array because it runs inside a rAF, and the engine that calls it is built on
 * the rule that the frame loop never allocates.
 */

export type Pt = { x: number; y: number };

/** A 16-slot buffer, column-major, ready for `matrix3d(...)`. */
export type Mat3d = Float64Array;

export function createMat3d(): Mat3d {
  return new Float64Array(16);
}

/**
 * Solves the map from the element's local box (0,0)–(w,h) onto the screen
 * quad p0→p1→p2→p3, given in that winding: top-left, top-right, bottom-right,
 * bottom-left.
 *
 * The closed form is the standard unit-square-to-quad homography; the element's
 * own width and height are folded into the first two columns afterwards, which
 * is the same thing as pre-multiplying by `scale(1/w, 1/h)` and saves a second
 * transform in the CSS.
 *
 * Returns false when the quad is degenerate — the two diagonals parallel, or a
 * corner behind the camera dragging a coordinate to infinity. The caller hides
 * the element rather than writing a matrix full of NaN, which browsers render
 * as an invisible-but-still-composited mess.
 */
export function solveQuad(
  p0: Pt,
  p1: Pt,
  p2: Pt,
  p3: Pt,
  w: number,
  h: number,
  out: Mat3d
): boolean {
  if (w <= 0 || h <= 0) return false;
  if (
    !isFinite(p0.x) || !isFinite(p0.y) ||
    !isFinite(p1.x) || !isFinite(p1.y) ||
    !isFinite(p2.x) || !isFinite(p2.y) ||
    !isFinite(p3.x) || !isFinite(p3.y)
  ) {
    return false;
  }

  const dx1 = p1.x - p2.x;
  const dy1 = p1.y - p2.y;
  const dx2 = p3.x - p2.x;
  const dy2 = p3.y - p2.y;
  // How far the quad is from being a parallelogram. Zero means it is one, and
  // the projective terms drop out to an affine map.
  const sx = p0.x - p1.x + p2.x - p3.x;
  const sy = p0.y - p1.y + p2.y - p3.y;

  let a: number, b: number, c: number;
  let d: number, e: number, f: number;
  let g: number, hh: number;

  if (Math.abs(sx) < 1e-9 && Math.abs(sy) < 1e-9) {
    a = p1.x - p0.x;
    b = p2.x - p1.x;
    c = p0.x;
    d = p1.y - p0.y;
    e = p2.y - p1.y;
    f = p0.y;
    g = 0;
    hh = 0;
  } else {
    const den = dx1 * dy2 - dx2 * dy1;
    if (Math.abs(den) < 1e-9) return false; // diagonals parallel — no solution
    g = (sx * dy2 - dx2 * sy) / den;
    hh = (dx1 * sy - sx * dy1) / den;
    a = p1.x - p0.x + g * p1.x;
    b = p3.x - p0.x + hh * p3.x;
    c = p0.x;
    d = p1.y - p0.y + g * p1.y;
    e = p3.y - p0.y + hh * p3.y;
    f = p0.y;
  }

  // Column-major, as matrix3d() wants it. Rows 3 and columns 3 carry the
  // identity in z: this is a 2D projective map wearing a 4x4 coat.
  out[0] = a / w;  out[1] = d / w;  out[2] = 0; out[3] = g / w;
  out[4] = b / h;  out[5] = e / h;  out[6] = 0; out[7] = hh / h;
  out[8] = 0;      out[9] = 0;      out[10] = 1; out[11] = 0;
  out[12] = c;     out[13] = f;     out[14] = 0; out[15] = 1;

  for (let i = 0; i < 16; i++) {
    if (!isFinite(out[i])) return false;
  }
  return true;
}

/**
 * Twice the signed area of the quad, by the shoelace formula.
 *
 * Two jobs. The magnitude says how much of the screen the surface covers, so a
 * screen seen from far away or almost edge-on can be dropped before it becomes
 * a shimmering sliver. The *sign* says which way the quad is wound: negative
 * means we are looking at the back of the surface, and a video playing through
 * the back of a wall is the giveaway that breaks the whole illusion.
 *
 * Note the leading minus. Screen y grows *downward*, so the textbook shoelace
 * — which assumes y up — reports a clockwise-on-screen quad as negative. The
 * sign is flipped here so the contract reads the way a caller expects:
 * POSITIVE means the corners still run clockwise as drawn, which is what being
 * in front of the surface looks like after projection. Verified against a
 * known rectangle rather than reasoned about; the convention is easy to get
 * backwards and the failure is silent — every screen simply never appears.
 */
export function signedArea(p0: Pt, p1: Pt, p2: Pt, p3: Pt): number {
  return -(
    (p1.x - p0.x) * (p1.y + p0.y) +
    (p2.x - p1.x) * (p2.y + p1.y) +
    (p3.x - p2.x) * (p3.y + p2.y) +
    (p0.x - p3.x) * (p0.y + p3.y)
  );
}

/** `matrix3d(...)`, ready to assign to `style.transform`. */
export function toCss(m: Mat3d): string {
  // Six significant figures: enough that a 4K screen cannot see the rounding,
  // short enough that the string stays cheap to build every frame.
  return `matrix3d(${m[0].toFixed(6)},${m[1].toFixed(6)},0,${m[3].toFixed(8)},${m[4].toFixed(6)},${m[5].toFixed(6)},0,${m[7].toFixed(8)},0,0,1,0,${m[12].toFixed(3)},${m[13].toFixed(3)},0,1)`;
}
