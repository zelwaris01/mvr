/**
 * Matches Matterport pins to stores.
 *
 * The SDK has no idea what a "Zara" is — it reports opaque tag IDs and raw 3D
 * coordinates. Turning those into a store is a lookup we own, and it is done
 * on the pin's Workshop label so that naming a pin "ZARA" is the entire
 * integration step. No IDs to copy, no code to change.
 *
 * The catalogue is now ENRICHMENT, NOT A GATE. It used to be both: a pin whose
 * label matched no entry in `stores-data` was deleted from the scene, so
 * tagging a new shop in Workshop did nothing until somebody edited the code
 * and redeployed. Any pin the model reports is now a shop; the catalogue only
 * adds a blurb, a category, a reward and a quiz on top of what the pin already
 * carries. Adding a shop is a Workshop job again.
 */

import { STORES } from "./stores-data";

/** Strips case, accents and punctuation so "Zara · Niveau 1" matches "zara". */
function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/**
 * A stable, readable slug for a pin the catalogue has never heard of.
 *
 * Stable is the important word: this is the key that progress, XP and answers
 * are stored under, so it has to survive a reload. Deriving it from the label
 * rather than from the tag id means renaming a pin in Workshop resets that
 * shop's progress — the alternative, keying on the tag id, produces
 * unreadable storage and breaks if the pin is ever recreated. Renaming is the
 * rarer event, so the label wins.
 */
export function slugifyLabel(label: string): string {
  return label
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Pins that are not shops.
 *
 * Now that every pin gets in, the ones that were never a shop have to be named
 * — and they cannot be detected reliably. "LES UNIVERS DU CARROUSEL" is a real
 * attraction with four words in its name; "CONNAISSEZ-VOUS LES MARQUES DU
 * MALL ?" is a quiz prompt with five. No heuristic separates those without
 * also getting one of them wrong, so this is an explicit list rather than a
 * guess. Matched on the normalised label, and on a prefix, so a pin renamed
 * with a suffix stays excluded.
 *
 * Add a line here when a non-shop pin turns up in the directory. The dev
 * console prints every auto-added pin precisely so they are easy to spot.
 */
const IGNORED_LABEL_KEYS: string[] = [
  // The quiz teaser pin. Carries Matterport's own promotional billboard.
  normalize("CONNAISSEZ-VOUS LES MARQUES DU MALL"),
  normalize("Formulaire de participation"),
  normalize("Débloquer mes Récompenses"),
];

/**
 * Tag ID → slug, for pins whose label doesn't name the store. Rarely needed
 * now that unknown labels get a slug of their own; keep it for the case where
 * two pins should resolve to the SAME shop.
 */
export const TAG_OVERRIDES: Record<string, string> = {};

const BY_NAME: Array<{ slug: string; key: string }> = STORES.map((s) => ({
  slug: s.slug,
  key: normalize(s.name),
}));

export type TagMatch = {
  slug: string;
  /** True when the catalogue has an entry — so a blurb and a quiz exist. */
  known: boolean;
};

/**
 * Resolves a pin to a shop.
 *
 * Returns null only for a pin on the ignore list, or one with no usable label
 * at all. Everything else is a shop, known to the catalogue or not.
 *
 * Catalogue matching is longest-match-first so a hypothetical "Zara Home"
 * can't be swallowed by "Zara".
 */
export function resolveStoreByTag(
  tagId: string,
  label: string
): TagMatch | null {
  const override = TAG_OVERRIDES[tagId];
  if (override) return { slug: override, known: true };

  const key = normalize(label);
  if (!key) return null;

  if (IGNORED_LABEL_KEYS.some((ignored) => key.startsWith(ignored))) {
    return null;
  }

  const matches = BY_NAME.filter(
    (s) => key === s.key || key.includes(s.key)
  ).sort((a, b) => b.key.length - a.key.length);

  if (matches[0]) return { slug: matches[0].slug, known: true };

  const generated = slugifyLabel(label);
  if (!generated) return null;
  return { slug: generated, known: false };
}
