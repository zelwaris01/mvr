import type { Vec3 } from "./tour-nav";
import { youTubeEmbedUrl } from "./youtube";

/**
 * Video screens mounted on surfaces in the model.
 *
 * Each entry says WHERE the rectangle is and WHAT plays on it, and those are
 * two independent choices — hence two unions rather than one flat type.
 *
 * `spaceId` ties a screen to one scan. The mall's two levels are separate
 * Matterport models with unrelated coordinate systems, so a screen authored
 * downstairs would land somewhere arbitrary upstairs — see MATTERPORT_LEVELS.
 */

/* ── Where ───────────────────────────────────────────────────────────────── */

/**
 * Four explicit world points. Exact, and blind to whether the model changes
 * under it — a rescan moves the walls and leaves the rectangle behind.
 *
 * WINDING MATTERS. Top-left → top-right → bottom-right → bottom-left, as seen
 * from where a visitor stands. Wound the other way the screen is treated as
 * facing away and stays hidden, which looks like a bug and is not.
 *
 * Pick them with the tool: open the tour with `?screen=1`, click the four
 * corners, paste what it prints.
 */
export type CornerPlacement = {
  at: "corners";
  corners: [Vec3, Vec3, Vec3, Vec3];
};

/**
 * Derived from a shop's own pin, every time the model loads.
 *
 * The pin carries an anchor on the storefront and a stem pointing straight out
 * of it, which is a plane and a normal — everything a rectangle needs except
 * its size. That makes this placement survive a rescan: move the pin in
 * Workshop and the screen follows it.
 *
 * The cost is that it is inferred, not measured. The four numbers below are
 * how you correct it, and they are in metres because the model is.
 */
export type TagPlacement = {
  at: "tag";
  /** Whose pin to hang this on. */
  storeSlug: string;
  /** Across the storefront. */
  width: number;
  /** Floor to ceiling of the screen itself. */
  height: number;
  /** Raise the centre above the pin's anchor. Pins usually sit low. */
  lift: number;
  /**
   * Push out from the surface, along the stem. A few centimetres, so the
   * screen reads as mounted on the glass rather than embedded in it.
   */
  push: number;
};

/* ── What ────────────────────────────────────────────────────────────────── */

/** A file the browser can play directly. Best quality, best performance. */
export type VideoMedia = {
  kind: "video";
  src: string;
  poster?: string;
};

/**
 * A YouTube video, played through YouTube's own embed player.
 *
 * `<video src>` cannot take a YouTube link — youtu.be/… is a web page, not a
 * media file — so this renders an iframe instead. That works with the same
 * transform (an iframe is an element like any other), with three consequences
 * worth knowing before choosing it over a hosted file:
 *
 *  - Autoplay is only granted to a MUTED player. Sound is not an option here.
 *  - YouTube draws its own chrome. `controls=0` removes most of it; the title
 *    card and the end-screen suggestions are not fully suppressible.
 *  - A live cross-origin iframe under a projective transform is heavier to
 *    composite than a video element, on top of an app that already has one
 *    cross-origin iframe rendering 3D.
 *
 * For a storefront that should look like real signage, a self-hosted MP4 is
 * the better answer. This exists because it is the fastest way to get content
 * on the wall today.
 */
export type YouTubeMedia = {
  kind: "youtube";
  /** The bare id — the part after `youtu.be/` or `?v=`. */
  id: string;
};

export type ScreenMedia = VideoMedia | YouTubeMedia;

export type WallScreen = {
  id: string;
  spaceId: string;
  place: CornerPlacement | TagPlacement;
  media: ScreenMedia;
  /** For screen readers, which cannot see the storefront it is mounted on. */
  label: string;
};

/* ── The screens ─────────────────────────────────────────────────────────── */

export const WALL_SCREENS: WallScreen[] = [
  {
    id: "faces-window",
    // Ground floor — where the FACES pin lives. See MATTERPORT_LEVELS.
    spaceId: "iGiPWMPBMdw",
    /**
     * Hung on the FACES pin rather than on picked corners, because the
     * coordinates of that window were never measured. The size below is an
     * estimate of a shopfront panel, not a measurement:
     *
     *   width  2.4 m — a little under the glass, so it sits inside the frame
     *   height 1.6 m — 3:2, close enough to 16:9 that the video barely crops
     *   lift   1.25 m — the pin sits near the floor; this raises it to eye level
     *   push   0.04 m — clear of the glass so it reads as mounted on it
     *
     * If it lands wrong, these four numbers are the fix — or pick the corners
     * exactly with `?screen=1` and swap `at: "tag"` for `at: "corners"`.
     */
    place: {
      at: "tag",
      storeSlug: "faces",
      width: 2.4,
      height: 1.6,
      lift: 1.25,
      push: 0.04,
    },
    media: { kind: "youtube", id: "-X6RsLWL-98" },
    label: "Écran vidéo FACES",
  },
];

export function screensFor(spaceId: string): WallScreen[] {
  return WALL_SCREENS.filter((s) => s.spaceId === spaceId);
}

/**
 * The embed URL for a wall screen: signage, so it plays itself, silently,
 * with no controls and on a loop.
 *
 * The URL building itself lives in `youtube.ts` — the shop panel needs the
 * opposite settings from the same embed, and two hand-built URL strings would
 * drift the first time YouTube changed a parameter.
 */
export function wallScreenEmbedUrl(id: string): string {
  return youTubeEmbedUrl(id, { autoplay: true, controls: false, loop: true });
}
