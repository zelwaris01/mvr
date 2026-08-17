import type { MpSdk } from "@matterport/sdk";
import {
  createMat3d,
  signedArea,
  solveQuad,
  toCss,
  type Mat3d,
  type Pt,
} from "./homography";

type Vector3 = MpSdk.Vector3;

/**
 * Keeps wall screens glued to their surfaces.
 *
 * Same contract as CheckpointEngine, for the same reasons: `Camera.pose` fires
 * 60–120 times a second, so this owns the elements directly and writes one
 * transform per frame inside a single rAF. It never reads the DOM and never
 * allocates in `tick` — read the header of tour-engine.ts for what happens
 * when either rule is broken.
 *
 * The extra rule here is the one that keeps the illusion:
 *
 *   A screen is drawn ONLY when all four of its corners are in front of the
 *   camera and wound the right way round.
 *
 * An HTML overlay always composites above the iframe, so it cannot be occluded
 * by anything in the scene. That is survivable for a marker, which is meant to
 * float. It is not survivable for something pretending to be mounted on a
 * wall: seen from behind that wall, an unchecked overlay hangs in mid-air,
 * facing away, in the middle of a corridor. So a screen would rather be absent
 * than wrong.
 */

/**
 * Below this, the surface is a shimmering sliver — not worth a video decode.
 *
 * This, not the distance below, is the real test. It asks the question that
 * actually matters — "is there enough of it on screen to be worth drawing?" —
 * and it answers correctly for a big screen far away and a small one close up,
 * which a distance threshold cannot.
 */
const MIN_AREA_PX2 = 900;

/**
 * A cheap early-out, deliberately generous.
 *
 * It was 26 m, borrowed from the checkpoint markers, and that was wrong: a
 * marker is wayfinding you only need nearby, whereas signage in an atrium is
 * meant to be seen from across the concourse. It hid the FACES screen at 65 m
 * and made a working feature look broken.
 *
 * 60 m is roughly where the area test takes over anyway — a 2.4 m panel at
 * 60 m subtends about 36 x 24 px, just under the 900 px² floor — so the two
 * gates now agree instead of one pre-empting the other.
 */
const MAX_DIST_M = 60;

/**
 * The element's own box, before the transform maps it onto the wall.
 *
 * It is NOT the stage size and it is NOT arbitrary. The homography carries
 * this box onto the quad, so the box is the resolution the browser rasterises
 * at: too small and a screen filling half the viewport is visibly soft, too
 * large and every frame composites a layer nobody sees at that size. 960×540
 * covers a shopfront on a laptop without upscaling, and the 16:9 ratio means a
 * 16:9 video needs no letterboxing before the matrix stretches it to whatever
 * shape the authored rectangle actually is.
 *
 * Exported because the element must be laid out at exactly these dimensions —
 * the matrix assumes it, and a mismatch shows up as a screen that is subtly
 * the wrong size on the wall.
 */
export const SCREEN_BOX = { w: 960, h: 540 } as const;

type Slot = {
  id: string;
  /** Top-left, top-right, bottom-right, bottom-left. */
  world: [Vector3, Vector3, Vector3, Vector3];
  el: HTMLElement | null;
  /** Last written transform, so an unchanged frame costs no style write. */
  css: string;
  vis: boolean;
  /**
   * Why the screen is in its current state. Dev-only, and only ever logged
   * when it CHANGES — this is decided every frame, so an unguarded log would
   * emit sixty lines a second.
   */
  why: string;
};

const DEV = process.env.NODE_ENV !== "production";

export class ScreenEngine {
  private readonly conv: MpSdk["Conversion"];
  private readonly slots: Slot[] = [];
  private readonly byId = new Map<string, Slot>();

  private pose: MpSdk.Camera.Pose | null = null;
  private readonly size: MpSdk.Size = { w: 0, h: 0 };
  /** Walk mode only — see setInside. */
  private inside = true;

  private dirty = false;
  private raf = 0;
  private dead = false;

  /**
   * THE scratch. Four projected corners plus one reusable Vector3 for the
   * SDK's out-parameter, allocated once for the engine's whole life.
   */
  private readonly s: Vector3 = { x: 0, y: 0, z: 0 };
  private readonly q: [Pt, Pt, Pt, Pt] = [
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
  ];
  private readonly m: Mat3d = createMat3d();

  constructor(conv: MpSdk["Conversion"]) {
    this.conv = conv;
    this.tick = this.tick.bind(this);
    this.onPose = this.onPose.bind(this);
  }

  // ── inputs ──────────────────────────────────────────────────────────────

  onPose(p: MpSdk.Camera.Pose) {
    this.pose = p;
    this.schedule();
  }

  setSize(w: number, h: number) {
    if (w === this.size.w && h === this.size.h) return;
    this.size.w = w;
    this.size.h = h;
    this.schedule();
  }

  /**
   * Dollhouse and floorplan look at the model from outside it, where a screen
   * pasted flat onto a wall reads as a texture bug rather than a display.
   */
  setInside(on: boolean) {
    if (on === this.inside) return;
    this.inside = on;
    this.schedule();
  }

  setScreens(
    screens: Array<{ id: string; corners: [Vector3, Vector3, Vector3, Vector3] }>
  ) {
    const keep = new Set(screens.map((s) => s.id));
    for (const [id, slot] of this.byId) {
      if (!keep.has(id)) {
        this.byId.delete(id);
        const i = this.slots.indexOf(slot);
        if (i >= 0) this.slots.splice(i, 1);
      }
    }
    for (const s of screens) {
      if (this.byId.has(s.id)) continue;
      const slot: Slot = {
        id: s.id,
        world: [
          { ...s.corners[0] },
          { ...s.corners[1] },
          { ...s.corners[2] },
          { ...s.corners[3] },
        ],
        el: null,
        css: "",
        vis: false,
        why: "",
      };
      this.byId.set(s.id, slot);
      this.slots.push(slot);
    }
    this.schedule();
  }

  bind(id: string, el: HTMLElement | null) {
    const slot = this.byId.get(id);
    if (!slot) return;
    slot.el = el;
    if (el) {
      // Reset the cache: a fresh element carries none of the previous one's
      // inline styles, so the next tick must write unconditionally.
      slot.css = "";
      slot.vis = false;
      el.style.visibility = "hidden";
    }
    this.schedule();
  }

  private schedule() {
    this.dirty = true;
    if (this.raf === 0 && !this.dead) {
      this.raf = requestAnimationFrame(this.tick);
    }
  }

  // ── the frame ───────────────────────────────────────────────────────────

  private tick() {
    this.raf = 0;
    if (this.dead || !this.dirty) return;
    this.dirty = false;

    const pose = this.pose;
    if (!pose || this.size.w === 0 || this.size.h === 0) return;

    const maxDistSq = MAX_DIST_M * MAX_DIST_M;

    for (const slot of this.slots) {
      const el = slot.el;
      if (!el) continue;

      if (!this.inside) {
        this.hide(slot, el, "hidden: dollhouse or floorplan view");
        continue;
      }

      // Distance is measured to the first corner rather than to a computed
      // centre: the difference across one shopfront is under a metre, and a
      // centre would cost three adds and a divide per screen per frame.
      const dx = slot.world[0].x - pose.position.x;
      const dy = slot.world[0].y - pose.position.y;
      const dz = slot.world[0].z - pose.position.z;
      const distSq = dx * dx + dy * dy + dz * dz;
      if (distSq > maxDistSq) {
        this.hide(slot, el, `hidden: further than ${MAX_DIST_M} m`);
        continue;
      }

      let behind = -1;
      for (let i = 0; i < 4; i++) {
        this.conv.worldToScreen(slot.world[i], pose, this.size, this.s);
        // z outside (0,1) is behind the eye or past the far plane. Behind the
        // eye a perspective projection mirrors x and y, so the corner lands on
        // the wrong side of the screen and the quad turns inside out.
        if (!(this.s.z > 0 && this.s.z < 1)) {
          behind = i;
          break;
        }
        this.q[i].x = this.s.x;
        this.q[i].y = this.s.y;
      }
      if (behind >= 0) {
        this.hide(slot, el, "hidden: a corner is outside the view frustum");
        continue;
      }

      // Positive area means the corners still read clockwise on screen, which
      // is what "we are in front of the surface" looks like after projection.
      const area = signedArea(this.q[0], this.q[1], this.q[2], this.q[3]);
      if (area <= 0) {
        this.hide(
          slot,
          el,
          "hidden: back-facing — you are behind this surface, or its corners " +
            "are wound anticlockwise"
        );
        continue;
      }
      if (area < MIN_AREA_PX2 * 2) {
        this.hide(slot, el, `hidden: smaller than ${MIN_AREA_PX2} px² on screen`);
        continue;
      }

      // The element's box, not the stage's: the matrix maps the element's own
      // local coordinates, and passing the stage size here would size every
      // screen to the viewport.
      if (
        !solveQuad(
          this.q[0],
          this.q[1],
          this.q[2],
          this.q[3],
          SCREEN_BOX.w,
          SCREEN_BOX.h,
          this.m
        )
      ) {
        this.hide(slot, el, "hidden: degenerate quad, no solution");
        continue;
      }

      const css = toCss(this.m);
      if (css !== slot.css) {
        slot.css = css;
        el.style.transform = css;
      }
      if (!slot.vis) {
        slot.vis = true;
        el.style.visibility = "visible";
      }
      this.note(slot, "visible");
    }
  }

  private hide(slot: Slot, el: HTMLElement, why: string) {
    this.note(slot, why);
    if (!slot.vis) return;
    slot.vis = false;
    el.style.visibility = "hidden";
  }

  /**
   * Records why a screen is in its current state, and says so once when that
   * changes. This runs every frame, so the equality check is the entire point
   * — without it this is a firehose.
   */
  private note(slot: Slot, why: string) {
    if (!DEV || slot.why === why) return;
    slot.why = why;
    // console.warn, not log: Next forwards warn and error from the browser to
    // the dev terminal, which is where this is actually readable.
    console.warn(`[screen] ${slot.id}: ${why}`);
  }

  dispose() {
    this.dead = true;
    if (this.raf !== 0) cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.slots.length = 0;
    this.byId.clear();
  }
}
