/** The Matterport space id — the `m=` parameter of the showcase URL. */
export const MATTERPORT_SPACE_ID = "iGiPWMPBMdw";

/**
 * Showcase SDK key. Public by necessity: the SDK connects from the browser, so
 * the key ships in the bundle. The domain allowlist configured against the key
 * in Account Settings -> Developer Tools is the real access control.
 *
 * Absent (no .env.local) the tour degrades to a plain, non-interactive embed.
 */
export const MATTERPORT_SDK_KEY =
  process.env.NEXT_PUBLIC_MATTERPORT_SDK_KEY ?? "";

/** Keyless embed — no SDK, no events. The fallback when no key is configured. */
export const MATTERPORT_URL = `https://my.matterport.com/show/?m=${MATTERPORT_SPACE_ID}&play=1`;

/**
 * The interactive tour's embed URL.
 *
 * The key has to be on the iframe's `src` from the very first load. Setting a
 * keyless src and letting the SDK rewrite it afterwards loses the race —
 * Showcase boots without a key and rejects the later connection with
 * NO_APPLICATION_KEY_SUPPLIED.
 */
export const MATTERPORT_TOUR_URL = MATTERPORT_SDK_KEY
  ? `${MATTERPORT_URL}&applicationKey=${MATTERPORT_SDK_KEY}`
  : MATTERPORT_URL;

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
 * Levels as fractions of the maximum XP actually achievable in this model,
 * not as absolute numbers.
 *
 * The roster is discovered at runtime, so the ceiling moves: with two tagged
 * stores the most anyone can earn is 200 XP, and a hardcoded "Champion at 600"
 * would be unreachable forever. Expressing the bands as ratios keeps every
 * level attainable whether the mall has two pins or twenty.
 */
export const LEVEL_BANDS = [
  { level: 1, at: 0, label: "Visiteur" },
  { level: 2, at: 0.15, label: "Explorateur" },
  { level: 3, at: 0.35, label: "Connaisseur" },
  { level: 4, at: 0.6, label: "Expert" },
  { level: 5, at: 0.85, label: "Champion" },
] as const;
