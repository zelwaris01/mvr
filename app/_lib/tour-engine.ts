import type { MpSdk } from "@matterport/sdk";

type Size = MpSdk.Size;
type Vector3 = MpSdk.Vector3;

/**
 * Positions the gold checkpoint markers over the live 3D scene.
 *
 * This is deliberately not a React component. `Camera.pose` fires 60–120 times
 * a second while the visitor looks around; running reconciliation on that
 * signal would cost the frame budget many times over. Instead the engine owns
 * the marker elements directly and writes `style.transform` on them inside a
 * single rAF, coalesced so many pose events produce at most one frame of work.
 *
 * Three rules hold the whole design up, each matching a failure that is
 * expensive to diagnose after the fact:
 *
 *  1. `tick()` NEVER reads the DOM. No getBoundingClientRect, no
 *     getComputedStyle. One read forces a synchronous layout every frame.
 *  2. `tick()` NEVER allocates. The single scratch vector below is exactly why
 *     `worldToScreen` accepts a `result` parameter — without it you get a GC
 *     sawtooth: smooth for a few seconds, then a hitch, forever.
 *  3. The rAF is scheduled by pose arrival and unschedules itself. A visitor
 *     standing still costs nothing.
 */

type Slot = {
  id: string;
  world: Vector3;
  el: HTMLElement | null;
  /** Last written position, quarter-pixel quantised. NaN = never written. */
  x: number;
  y: number;
  vis: boolean;
  /** Last written opacity bucket. -1 = never written. */
  op: number;
};

/** Slack beyond the viewport so a marker fades at the edge instead of popping. */
const CULL_MARGIN = 64;
/** Past this, a marker is more clutter than wayfinding. Metres, squared below. */
const MAX_DIST_M = 30;
const OPACITY_STEPS = [1, 0.86, 0.7, 0.54, 0.38];

export class CheckpointEngine {
  private readonly conv: MpSdk["Conversion"];
  private readonly slots: Slot[] = [];
  private readonly byId = new Map<string, Slot>();

  private pose: MpSdk.Camera.Pose | null = null;
  private readonly size: Size = { w: 0, h: 0 };
  /** Width of the quiz drawer, so markers behind it stop doing work. */
  private rightInset = 0;
  private reduced = false;

  private dirty = false;
  private raf = 0;
  private dead = false;

  /** THE preallocated result vector. One per engine, for its whole life. */
  private readonly s: Vector3 = { x: 0, y: 0, z: 0 };

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

  setRightInset(px: number) {
    if (px === this.rightInset) return;
    this.rightInset = px;
    this.schedule();
  }

  setReducedMotion(on: boolean) {
    if (on === this.reduced) return;
    this.reduced = on;
    // Force every opacity to be rewritten on the next pass.
    for (const slot of this.slots) slot.op = -1;
    this.schedule();
  }

  private schedule() {
    this.dirty = true;
    if (this.raf === 0 && !this.dead) {
      this.raf = requestAnimationFrame(this.tick);
    }
  }

  // ── registration (mount time only) ──────────────────────────────────────

  setMarkers(markers: Array<{ id: string; world: Vector3 }>) {
    const keep = new Set(markers.map((m) => m.id));
    for (const [id, slot] of this.byId) {
      if (!keep.has(id)) {
        this.byId.delete(id);
        const i = this.slots.indexOf(slot);
        if (i >= 0) this.slots.splice(i, 1);
      }
    }
    for (const m of markers) {
      const existing = this.byId.get(m.id);
      if (existing) {
        // Copy in place — the SDK may recycle the TagData object it handed us.
        existing.world.x = m.world.x;
        existing.world.y = m.world.y;
        existing.world.z = m.world.z;
        continue;
      }
      const slot: Slot = {
        id: m.id,
        world: { x: m.world.x, y: m.world.y, z: m.world.z },
        el: null,
        x: NaN,
        y: NaN,
        vis: false,
        op: -1,
      };
      this.byId.set(m.id, slot);
      this.slots.push(slot);
    }
    this.schedule();
  }

  /** Ref-callback target. React calls this once per element, never per frame. */
  bind(id: string, el: HTMLElement | null) {
    const slot = this.byId.get(id);
    if (!slot) return;
    slot.el = el;
    if (el) {
      slot.x = NaN;
      slot.y = NaN;
      slot.vis = false;
      slot.op = -1;
      this.schedule();
    }
  }

  /** Last known screen position, for lookAtScreenCoords. Off the hot path. */
  screenPos(id: string): { x: number; y: number } | null {
    const slot = this.byId.get(id);
    return slot && slot.vis ? { x: slot.x, y: slot.y } : null;
  }

  // ── the loop ────────────────────────────────────────────────────────────

  private tick() {
    this.raf = 0;
    if (this.dead || !this.dirty) return;
    this.dirty = false;

    const pose = this.pose;
    if (!pose) return;

    const w = this.size.w;
    const h = this.size.h;
    if (w === 0 || h === 0) return;

    const s = this.s;
    const right = w - this.rightInset;
    const cx = pose.position.x;
    const cy = pose.position.y;
    const cz = pose.position.z;
    const maxSq = MAX_DIST_M * MAX_DIST_M;
    const slots = this.slots;

    for (let i = 0; i < slots.length; i++) {
      const m = slots[i];
      const el = m.el;
      if (el === null) continue;

      const wp = m.world;

      // Cheapest gate first: pure arithmetic, no projection.
      const dx = wp.x - cx;
      const dy = wp.y - cy;
      const dz = wp.z - cz;
      const distSq = dx * dx + dy * dy + dz * dz;
      let vis = distSq <= maxSq;

      if (vis) {
        this.conv.worldToScreen(wp, pose, this.size, s);
        const x = s.x;
        const y = s.y;
        const z = s.z;

        // z outside (0,1) means behind the camera. Without this test, markers
        // behind you appear on screen and slide the WRONG WAY as you turn —
        // the single most disorienting bug available here.
        vis =
          z > 0 &&
          z < 1 &&
          x === x && // NaN guard, cheaper than isNaN
          y === y &&
          x > -CULL_MARGIN &&
          x < right + CULL_MARGIN &&
          y > -CULL_MARGIN &&
          y < h + CULL_MARGIN;

        if (vis) {
          // Quarter-pixel quantisation is a change detector, not a rendering
          // constraint: the disc is a composited layer so subpixel placement
          // is free, but rounding lets us skip the write when the camera is
          // effectively still. Integer rounding would visibly stutter.
          const qx = Math.round(x * 4) / 4;
          const qy = Math.round(y * 4) / 4;
          if (qx !== m.x || qy !== m.y) {
            m.x = qx;
            m.y = qy;
            el.style.transform = `translate3d(${qx}px,${qy}px,0)`;
          }

          if (this.reduced) {
            if (m.op !== 0) {
              m.op = 0;
              el.style.opacity = "1";
            }
          } else {
            let b = ((distSq * 5) / maxSq) | 0;
            if (b > 4) b = 4;
            if (b !== m.op) {
              m.op = b;
              el.style.opacity = String(OPACITY_STEPS[b]);
            }
          }
        }
      }

      if (vis !== m.vis) {
        m.vis = vis;
        // visibility, not display:none — display would relayout and destroy
        // the composited layer, so the marker flickers on the way back in.
        el.style.visibility = vis ? "visible" : "hidden";
      }
    }
  }

  dispose() {
    this.dead = true;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.slots.length = 0;
    this.byId.clear();
  }
}
