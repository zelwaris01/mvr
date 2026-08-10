"use client";

/**
 * A document-level tap router.
 *
 * Every previous attempt to make the HUD tappable on touch worked *through*
 * the button: `onClick`, then React's `onPointerUp`, then `pointer-events` and
 * `touch-action` on the element and its ancestors. All of them still depend on
 * the event reaching the button, and over the Matterport iframe something in
 * that chain does not happen — the one hard measurement we have is that a
 * capture-phase `pointerdown` on `document` fires with the right coordinates
 * and `elementFromPoint` returns our button, while the button's own handlers
 * never run.
 *
 * So this stops routing through the button at all. Listeners live on
 * `document` in the capture phase — the one place we know events arrive — and
 * the target is resolved by hit-testing the coordinates, not by bubbling.
 * Nothing between `document` and the button can intercept, retarget or cancel
 * its way out of that.
 *
 * Both pointer *and* touch events are watched. Pointer events are synthesized
 * from touch and can be suppressed or cancelled independently of it, so raw
 * `touchend` is the more reliable signal on phones; `lastFire` keeps the two
 * families from firing a handler twice for one tap.
 */

type Handler = () => void;

/** Registered controls, keyed by their DOM node. */
const registry = new Map<Element, Handler>();

/** How far a finger may travel and still count as a tap, in px. */
const SLOP = 12;
/** Longer than this is a press-and-hold. */
const MAX_MS = 800;
/**
 * A single tap produces a touch sequence, a pointer sequence and a synthesized
 * click. The first to resolve wins; the rest are swallowed inside this window.
 */
const DEDUPE_MS = 400;

let installed = false;
let downX = 0;
let downY = 0;
let downT = 0;
let armed = false;
let lastFire = -Infinity;

/** True if a tap fired recently — lets `onClick` ignore the echo. */
export function tapJustFired(now: number): boolean {
  return now - lastFire < DEDUPE_MS;
}

/**
 * Walks up from the hit-tested element to the nearest registered control.
 *
 * Hit-testing sidesteps the `disabled` attribute, which normally suppresses
 * activation by suppressing the event — so it has to be honoured explicitly
 * here, or a greyed-out button would still fire.
 */
function handlerAt(x: number, y: number): Handler | null {
  let node: Element | null = document.elementFromPoint(x, y);
  while (node) {
    const found = registry.get(node);
    if (found) {
      const el = node as Partial<HTMLButtonElement>;
      return el.disabled ? null : found;
    }
    node = node.parentElement;
  }
  return null;
}

function begin(x: number, y: number, t: number) {
  downX = x;
  downY = y;
  downT = t;
  armed = true;
}

function end(x: number, y: number, t: number) {
  if (!armed) return;
  armed = false;
  if (t - lastFire < DEDUPE_MS) return;
  if (Math.abs(x - downX) > SLOP || Math.abs(y - downY) > SLOP) return; // a drag
  if (t - downT > MAX_MS) return; // a long press
  // Hit-test where the finger went down. A tap that drifts a few px should
  // still activate what it started on, not whatever it ended over.
  const handler = handlerAt(downX, downY) ?? handlerAt(x, y);
  if (!handler) return;
  lastFire = t;
  handler();
}

function install() {
  if (installed || typeof document === "undefined") return;
  installed = true;

  document.addEventListener(
    "pointerdown",
    (e) => {
      // Mouse keeps the ordinary click path — it never had this problem, and
      // routing it here would break text selection and drag gestures.
      if (e.pointerType === "mouse") {
        armed = false;
        return;
      }
      begin(e.clientX, e.clientY, e.timeStamp);
    },
    true
  );

  document.addEventListener(
    "pointerup",
    (e) => {
      if (e.pointerType === "mouse") return;
      end(e.clientX, e.clientY, e.timeStamp);
    },
    true
  );

  document.addEventListener(
    "touchstart",
    (e) => {
      const t = e.changedTouches[0];
      if (t) begin(t.clientX, t.clientY, e.timeStamp);
    },
    // Passive: this only observes. Never call preventDefault here or the
    // panorama stops responding to drags.
    { capture: true, passive: true }
  );

  document.addEventListener(
    "touchend",
    (e) => {
      const t = e.changedTouches[0];
      if (t) end(t.clientX, t.clientY, e.timeStamp);
    },
    { capture: true, passive: true }
  );
}

/** Registers `el` as tappable. Returns the unregister function. */
export function registerTap(el: Element, handler: Handler): () => void {
  install();
  registry.set(el, handler);
  return () => {
    registry.delete(el);
  };
}
