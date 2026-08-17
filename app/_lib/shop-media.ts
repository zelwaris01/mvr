/**
 * Videos shown in a shop's panel, added from here rather than from Matterport.
 *
 * The panel already shows any video attached to the shop's pin — that is the
 * path that needs no code and updates itself. This file is the other case: a
 * clip that lives on YouTube, or one nobody wants to upload into the model.
 *
 * Both end up in the same list on the same "Vidéos" heading, config first, so
 * a curated clip leads and the model's own follow.
 */

export type ShopVideo =
  /** Any YouTube URL — watch, youtu.be, embed or shorts. Parsed at render. */
  | { kind: "youtube"; url: string; title?: string }
  /** A file the browser can play: mp4, webm. Best quality, no third party. */
  | { kind: "file"; src: string; poster?: string; title?: string };

/**
 * Keyed by slug — the same slug the roster uses, so a shop discovered from the
 * model rather than the catalogue can have one too.
 */
export const SHOP_VIDEOS: Record<string, ShopVideo[]> = {
  faces: [
    {
      kind: "youtube",
      url: "https://www.youtube.com/watch?v=eUXJcN1bf_Y",
      title: "FACES",
    },
  ],
};

export function shopVideosFor(slug: string): ShopVideo[] {
  return SHOP_VIDEOS[slug] ?? [];
}
