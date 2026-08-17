/**
 * YouTube embedding, in one place.
 *
 * Two callers want it and they want opposite things: a wall screen is signage
 * — it plays itself, silently, with no controls — while a video in the shop
 * panel is something you chose to look at, so it should wait for you and give
 * you a scrub bar. Same embed, different parameters, hence the options rather
 * than two hand-built URL strings drifting apart.
 */

/**
 * The video id out of any YouTube URL people actually paste.
 *
 * All four forms turn up in practice: the full watch URL from the address bar,
 * the short share link, an embed URL copied from someone else's page, and a
 * Shorts link. Returning null rather than guessing means a mistyped URL shows
 * up as "nothing rendered plus a console warning" instead of an iframe quietly
 * loading YouTube's 404 player.
 */
export function youTubeId(url: string): string | null {
  try {
    const u = new URL(url.trim());
    const host = u.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      return clean(u.pathname.slice(1));
    }
    if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
      const v = u.searchParams.get("v");
      if (v) return clean(v);
      const m = u.pathname.match(/^\/(embed|shorts|v)\/([^/?#]+)/);
      if (m) return clean(m[2]);
    }
    return null;
  } catch {
    // Not a URL at all. Accept a bare id, since that is what the embed API
    // takes and somebody will eventually paste one.
    return clean(url);
  }
}

/** YouTube ids are 11 characters of [A-Za-z0-9_-]. Anything else is not one. */
function clean(candidate: string): string | null {
  const id = candidate.trim();
  return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
}

export type EmbedOptions = {
  /** Signage plays itself; a panel video waits to be asked. */
  autoplay?: boolean;
  /** Autoplay is only ever granted to a muted player — see below. */
  controls?: boolean;
  loop?: boolean;
};

/**
 * The embed URL.
 *
 * `mute=1` accompanies autoplay because it is not a preference: browsers
 * refuse to autoplay a player with sound, so an unmuted autoplay is simply an
 * embed that never starts. A player the visitor presses play on keeps its
 * sound, which is why muting is tied to autoplay rather than applied always.
 *
 * `loop=1` does nothing by itself for a single video and needs `playlist` set
 * to the same id — YouTube's documented quirk, not a mistake here.
 *
 * nocookie is the privacy-preserving host and behaves identically otherwise.
 */
export function youTubeEmbedUrl(id: string, opts: EmbedOptions = {}): string {
  const { autoplay = false, controls = true, loop = false } = opts;

  const params = new URLSearchParams({
    controls: controls ? "1" : "0",
    modestbranding: "1",
    playsinline: "1",
    rel: "0",
    iv_load_policy: "3",
  });

  if (autoplay) {
    params.set("autoplay", "1");
    params.set("mute", "1");
  }
  if (loop) {
    params.set("loop", "1");
    params.set("playlist", id);
  }
  if (!controls) {
    params.set("disablekb", "1");
    params.set("fs", "0");
  }

  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(
    id
  )}?${params.toString()}`;
}
