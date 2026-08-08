/**
 * Matches Matterport pins to stores.
 *
 * The SDK has no idea what a "Zara" is — it reports opaque tag IDs and raw 3D
 * coordinates. Turning those into a store is a lookup we own, and it is done
 * on the pin's Workshop label so that naming a pin "ZARA" is the entire
 * integration step. No IDs to copy, no code to change.
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

const BY_NAME: Array<{ slug: string; key: string }> = STORES.map((s) => ({
  slug: s.slug,
  key: normalize(s.name),
}));

/**
 * Tag ID → slug, for pins whose label doesn't name the store. The tour prints
 * a copy-pasteable block of unmatched pins in development.
 */
export const TAG_OVERRIDES: Record<string, string> = {};

/**
 * Resolves a pin to a store slug, longest match first so a hypothetical
 * "Zara Home" can't be swallowed by "Zara".
 */
export function resolveStoreByTag(tagId: string, label: string): string | null {
  const override = TAG_OVERRIDES[tagId];
  if (override) return override;

  const key = normalize(label);
  if (!key) return null;

  const matches = BY_NAME.filter(
    (s) => key === s.key || key.includes(s.key)
  ).sort((a, b) => b.key.length - a.key.length);

  return matches[0]?.slug ?? null;
}
