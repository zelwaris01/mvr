import type { Store } from "./types";

/**
 * The brand catalogue.
 *
 * This is NOT the list of what the user sees. The visible roster is built at
 * runtime from the pins actually present in the Matterport model — see
 * `roster.ts`. An entry here only supplies the name, blurb and reward for a
 * pin once the model reveals one, matched on the pin's label.
 *
 * So adding a store here does nothing on its own; tagging it in Matterport
 * Workshop is what puts it on screen.
 *
 * ⚠ SPRINGFIELD and WOMEN'SECRET (the two brands actually tagged in the scan
 * today) carry placeholder copy written from public knowledge of the brands.
 * Every `reward` line is likewise invented. All of it must be replaced with
 * real copy from Anfa Place before this goes anywhere near production.
 */
export const STORES: Store[] = [
  {
    slug: "zara",
    name: "ZARA",
    description:
      "Mode internationale en prêt-à-porter pour homme, femme et enfant.",
    category: "Mode",
    reward: "-15% sur la nouvelle collection",
  },
  {
    slug: "flo",
    name: "FLO",
    description:
      "Chaussures et accessoires alliant style et confort à prix accessibles.",
    category: "Chaussures",
    reward: "-10% sur une paire au choix",
  },
  {
    slug: "guess",
    name: "GUESS",
    description:
      "Denim, prêt-à-porter et accessoires à l'esprit californien.",
    category: "Mode",
    reward: "-20% sur le denim",
  },
  {
    slug: "birkenstock",
    name: "BIRKENSTOCK",
    description:
      "Sandales et chaussures ergonomiques façonnées en Allemagne depuis 1774.",
    category: "Chaussures",
    reward: "Semelles offertes pour tout achat",
  },
  {
    slug: "mango",
    name: "MANGO",
    description:
      "Silhouettes méditerranéennes et vestiaire urbain pour femme et homme.",
    category: "Mode",
    reward: "-15% dès deux articles",
  },
  {
    slug: "sephora",
    name: "SEPHORA",
    description:
      "Parfums, soins et maquillage des grandes maisons de la beauté.",
    category: "Beauté",
    reward: "-20% sur les soins visage",
  },
  {
    slug: "nike",
    name: "NIKE",
    description:
      "Équipement, sportswear et sneakers pour tous les terrains.",
    category: "Sport",
    reward: "-10% sur les sneakers",
  },
  {
    slug: "paul",
    name: "PAUL",
    description:
      "Boulangerie française de tradition, viennoiseries et salon de thé.",
    category: "Alimentation",
    reward: "Un café offert avec toute viennoiserie",
  },

  /* ── Balisées dans le scan Matterport ── */
  {
    slug: "springfield",
    name: "SPRINGFIELD",
    description:
      "Mode urbaine et décontractée pour homme et femme, entre essentiels du quotidien et pièces de saison.",
    category: "Mode",
    reward: "-20% sur la seconde pièce",
  },
  {
    slug: "womensecret",
    name: "WOMEN'SECRET",
    description:
      "Lingerie, vêtements de nuit et balnéaire pour femme.",
    category: "Lingerie",
    reward: "3 articles de nuit pour le prix de 2",
  },
];
