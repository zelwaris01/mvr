/**
 * The mall's levels.
 *
 * Smart Mall is not one multi-storey Matterport model — it is two separate
 * scans, one per level, each with its own space id, its own sweeps and its
 * own pins. That is why `Floor.data` reports a single floor however hard you
 * ask it: from inside a space, the other level does not exist.
 *
 * So switching level means loading a different model and reconnecting the
 * SDK, not calling `Floor.moveTo`. Add a scan here and it becomes a level.
 */
/**
 * `short` is a code, not prose — N0/N1 is the same in both languages, and it
 * is what the rail button shows, so it stays a plain string. Only the spoken
 * name of the level has to be translated.
 */
export type MallLevel = {
  id: string;
  short: string;
  label: { fr: string; en: string };
};

export const MATTERPORT_LEVELS: MallLevel[] = [
  {
    id: "iGiPWMPBMdw",
    short: "N0",
    label: { fr: "Rez-de-chaussée", en: "Ground floor" },
  },
  {
    id: "UjnosRzGqQH",
    short: "N1",
    label: { fr: "Premier étage", en: "First floor" },
  },
];

/** The space loaded on arrival. */
export const MATTERPORT_SPACE_ID = MATTERPORT_LEVELS[0].id;

/**
 * Showcase SDK key. Public by necessity: the SDK connects from the browser, so
 * the key ships in the bundle. The domain allowlist configured against the key
 * in Account Settings -> Developer Tools is the real access control.
 *
 * Absent (no .env.local) the tour degrades to a plain, non-interactive embed.
 */
export const MATTERPORT_SDK_KEY =
  process.env.NEXT_PUBLIC_MATTERPORT_SDK_KEY ?? "";

/**
 * The hosted SDK bootstrap, which exports `connect` directly.
 *
 * It lives here rather than beside its only caller so the document head can
 * `modulepreload` it: the connection is otherwise not even requested until
 * React has hydrated and the tour component has mounted, which puts a
 * cross-origin fetch on the critical path at the worst possible moment — while
 * the player is already saturating the connection downloading the model.
 *
 * The URL must match the caller's import byte for byte or the preload is
 * wasted and the module is fetched twice, so both read this constant.
 */
export const SDK_BOOTSTRAP_URL =
  "https://static.matterport.com/showcase-sdk/bootstrap/3.0.0-0-g0517b8d76c/sdk.es6.js" +
  `?applicationKey=${MATTERPORT_SDK_KEY}`;

/**
 * Showcase URL parameters that strip Matterport's own chrome.
 *
 * These MUST live on the iframe's `src`. `setupSdk`'s `iframeQueryParams`
 * looks like the tidier home for them, but that path never runs here — the
 * npm loader fails under Turbopack and we connect via the hosted bootstrap
 * instead, which attaches to whatever URL the iframe already has. Params set
 * through `setupSdk` were silently doing nothing.
 *
 * The player is a cross-origin iframe: its UI cannot be restyled, moved or
 * hidden with CSS from out here. Asking it not to draw is the only lever, and
 * anything it draws anyway has to be replaced by our own HUD.
 *
 * `dh=0` / `f=0` hide the dollhouse and floorplan buttons — the view-mode
 * cluster at the bottom. They may also disable the modes themselves, which
 * the MAP button uses. That is handled rather than avoided: `toggleMap` tries
 * dollhouse, falls back to floorplan, and permanently hides its own button if
 * both reject. So the worst case is losing MAP, not a broken control.
 */
const SHOWCASE_PARAMS: Record<string, string | number> = {
  play: 1, // start walking immediately
  qs: 1, // quickstart, no splash
  brand: 0, // no branding badge
  help: 0, // no help button
  hl: 0, // no highlight reel (the play / next arrows)
  gt: 0, // no guided-tour controls
  tourcta: 0, // no call-to-action bubble
  title: 0, // no model title
  // `mt: 0` is deliberately NOT set. It hides native pins, but it also stops
  // Matterport reporting them through Tag.data — which silently cost us every
  // pin in the model except the two that happened to arrive first. Pins are
  // suppressed individually instead (enabled = false + allowAction + close),
  // which hides them just as well and keeps their positions available.
  vr: 0, // no VR button
  hr: 0, // no highlight reel (older alias; harmless if ignored)
  lang: "fr",
  /**
   * Listing-compliance mode: 2 is documented as "MLS friendly without the
   * top-left panel" — the contact / call-to-action card. That card is what
   * renders the "Débloquer mes Récompenses" button, and it is invisible to
   * the SDK (Tag.openTags reports nothing), so this param is the only thing
   * that actually removes it rather than covering it.
   *
   * It was here once and I took it out while hunting the missing upper floor,
   * on the theory that it might be restricting the model. It wasn't — the
   * missing floor was a second scan entirely.
   */
  mls: 2,
  // Removed on purpose — each of these restricts what the model exposes, not
  // just what it draws, and `mt: 0` already cost us most of the pins once:
  //   dh: 0  / f: 0   may disable dollhouse and floorplan outright. `f` is as
  //                   likely to mean "floors" as "floorplan", which would
  //                   explain the SDK reporting a single storey.
  //   mls: 2          real-estate compliance mode; scope is undocumented.
  // Chrome they were hiding is covered by .chrome-mask instead, which is
  // cosmetic and cannot break the model.
};

const showcaseQuery = Object.entries(SHOWCASE_PARAMS)
  .map(([k, v]) => `${k}=${v}`)
  .join("&");

/**
 * The embed URL for a level.
 *
 * The key has to be on the iframe's `src` from the very first load. Setting a
 * keyless src and letting the SDK rewrite it afterwards loses the race —
 * Showcase boots without a key and rejects the later connection with
 * NO_APPLICATION_KEY_SUPPLIED.
 */
export function tourUrlFor(spaceId: string): string {
  const base = `https://my.matterport.com/show/?m=${spaceId}&${showcaseQuery}`;
  return MATTERPORT_SDK_KEY
    ? `${base}&applicationKey=${MATTERPORT_SDK_KEY}`
    : base;
}

/** The ground floor's embed URL — the level loaded on arrival. */
export const MATTERPORT_TOUR_URL = tourUrlFor(MATTERPORT_SPACE_ID);

/**
 * Bumped from `mallquest_progress` when question ids moved to `${slug}-${n}`
 * and the XP scale changed. A payload from the old scheme would restore
 * answers keyed by ids that no longer exist alongside an XP total that
 * reconciles with nothing on screen — discarding it is the honest outcome.
 */
export const STORAGE_KEY = "mallquest_progress_v2";

export const XP_PER_STORE_VISIT = 10;
export const XP_PER_QUESTION = 30;

/**
 * Quiz retries allowed inside any rolling window. Rolling, not a counter that
 * resets on the hour — otherwise the quota can be gamed by waiting for the
 * boundary and spending six attempts across it.
 */
export const RETRY_LIMIT = 3;
export const RETRY_WINDOW_HOURS = 12;
export const RETRY_WINDOW_MS = RETRY_WINDOW_HOURS * 60 * 60 * 1000;

/**
 * Levels as fractions of the maximum XP actually achievable in this model,
 * not as absolute numbers.
 *
 * The roster is discovered at runtime, so the ceiling moves: with two tagged
 * stores the most anyone can earn is 200 XP, and a hardcoded "Champion at 600"
 * would be unreachable forever. Expressing the bands as ratios keeps every
 * level attainable whether the mall has two pins or twenty.
 */
export const LEVEL_BANDS = [
  { level: 1, at: 0, label: { fr: "Visiteur", en: "Visitor" } },
  { level: 2, at: 0.15, label: { fr: "Explorateur", en: "Explorer" } },
  { level: 3, at: 0.35, label: { fr: "Connaisseur", en: "Connoisseur" } },
  { level: 4, at: 0.6, label: { fr: "Expert", en: "Expert" } },
  { level: 5, at: 0.85, label: { fr: "Champion", en: "Champion" } },
] as const;
