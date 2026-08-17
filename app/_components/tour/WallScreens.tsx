"use client";

import { memo, useEffect, useRef } from "react";
import { SCREEN_BOX } from "@/app/_lib/screen-engine";
import { wallScreenEmbedUrl } from "@/app/_lib/screens-data";
import type { PlacedScreen } from "@/app/_lib/screen-placement";

/**
 * Video screens mounted on surfaces in the scan.
 *
 * Renders once per screen set and then never again while the visitor moves —
 * ScreenEngine writes the transforms straight onto these elements. Same
 * contract as CheckpointLayer, and for the same reason: re-rendering on camera
 * movement is what the whole design exists to avoid.
 *
 * Each element is laid out at exactly SCREEN_BOX and left at the stage origin;
 * the matrix does all the positioning. Nothing here reacts to the camera.
 */
function WallScreensImpl({
  screens,
  bind,
}: {
  screens: PlacedScreen[];
  bind: (id: string) => (el: HTMLElement | null) => void;
}) {
  if (screens.length === 0) return null;

  return (
    <div className="screen-layer">
      {screens.map((screen) => (
        <div
          key={screen.id}
          ref={bind(screen.id)}
          className="wall-screen"
          style={{ width: SCREEN_BOX.w, height: SCREEN_BOX.h }}
          role="img"
          aria-label={screen.label}
        >
          {screen.media.kind === "youtube" ? (
            <YouTubeSurface id={screen.media.id} title={screen.label} />
          ) : (
            <VideoSurface
              src={screen.media.src}
              poster={screen.media.poster}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export const WallScreens = memo(WallScreensImpl);

function VideoSurface({ src, poster }: { src: string; poster?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  /**
   * Autoplay is only granted to a muted video, and even then some browsers
   * reject the promise — a rejected play() that nobody catches is an unhandled
   * rejection in the console on every load. The poster stays up if it fails,
   * which is the right fallback: a still image on the wall beats a black hole.
   */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const attempt = () => {
      void el.play().catch(() => {
        // Blocked by policy, or the tab is in the background. Poster shows.
      });
    };
    attempt();
    // A video paused by the browser on hide does not resume on its own.
    const onVisible = () => {
      if (document.visibilityState === "visible") attempt();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="auto"
      tabIndex={-1}
    />
  );
}

/**
 * YouTube's own player, transformed onto the wall like any other element.
 *
 * `loading="eager"`: this is not below the fold in any sense a browser can
 * work out — it is an element with a projective transform that may currently
 * be off-screen, and lazy loading would leave the wall blank until the visitor
 * happened to look at it, then pop.
 *
 * No `allowFullScreen`, and `pointer-events` is off in CSS: it is signage, not
 * a player. Fullscreen from a surface nobody can click is unreachable anyway.
 */
function YouTubeSurface({ id, title }: { id: string; title: string }) {
  return (
    <iframe
      src={wallScreenEmbedUrl(id)}
      title={title}
      loading="eager"
      // autoplay is what makes it play at all; encrypted-media is what keeps
      // it playing if the video is DRM-protected rather than failing silently.
      allow="autoplay; encrypted-media; picture-in-picture"
      referrerPolicy="strict-origin-when-cross-origin"
      tabIndex={-1}
    />
  );
}
