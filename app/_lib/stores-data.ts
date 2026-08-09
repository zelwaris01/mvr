import type { Store } from "./types";

/**
 * The brand catalogue.
 *
 * This is NOT the list of what the user sees. The visible roster is built at
 * runtime from the pins actually present in the Matterport model — see
 * `roster.ts`. An entry here only supplies the name, blurb, reward and
 * thumbnail for a pin once the model reveals one, matched on the pin's label.
 *
 * So adding a store here does nothing on its own; tagging it in Matterport
 * Workshop is what puts it on screen.
 *
 * ⚠ Placeholder content throughout, pending real copy from Anfa Place:
 * descriptions and rewards are invented, and the `image` thumbnails are
 * generic stock photography that does not depict these shops. They are
 * decorative only — nothing reads them except the brand rail.
 */
export const STORES: Store[] = [
  {
    slug: "zara",
    name: "ZARA",
    description:
      "Mode internationale en prêt-à-porter pour homme, femme et enfant.",
    category: "Mode",
    reward: "-15% sur la nouvelle collection",
    image:
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=160&h=160&fit=crop",
  },
  {
    slug: "flo",
    name: "FLO",
    description:
      "Chaussures et accessoires alliant style et confort à prix accessibles.",
    category: "Chaussures",
    reward: "-10% sur une paire au choix",
    image:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=160&h=160&fit=crop",
  },
  {
    slug: "guess",
    name: "GUESS",
    description: "Denim, prêt-à-porter et accessoires à l'esprit californien.",
    category: "Mode",
    reward: "-20% sur le denim",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=160&h=160&fit=crop",
  },
  {
    slug: "birkenstock",
    name: "BIRKENSTOCK",
    description:
      "Sandales et chaussures ergonomiques façonnées en Allemagne depuis 1774.",
    category: "Chaussures",
    reward: "Semelles offertes pour tout achat",
    image:
      "https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=160&h=160&fit=crop",
  },
  {
    slug: "mango",
    name: "MANGO",
    description:
      "Silhouettes méditerranéennes et vestiaire urbain pour femme et homme.",
    category: "Mode",
    reward: "-15% dès deux articles",
    image:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=160&h=160&fit=crop",
  },
  {
    slug: "sephora",
    name: "SEPHORA",
    description:
      "Parfums, soins et maquillage des grandes maisons de la beauté.",
    category: "Beauté",
    reward: "-20% sur les soins visage",
    image:
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=160&h=160&fit=crop",
  },
  {
    slug: "nike",
    name: "NIKE",
    description: "Équipement, sportswear et sneakers pour tous les terrains.",
    category: "Sport",
    reward: "-10% sur les sneakers",
    image:
      "https://images.unsplash.com/photo-1541643600914-78b084683601?w=160&h=160&fit=crop",
  },
  {
    slug: "paul",
    name: "PAUL",
    description:
      "Boulangerie française de tradition, viennoiseries et salon de thé.",
    category: "Alimentation",
    reward: "Un café offert avec toute viennoiserie",
    image:
      "https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=160&h=160&fit=crop",
  },

  /* ── Balisées au premier étage (scan UjnosRzGqQH) ── */
  {
    slug: "sogno",
    name: "SOGNO",
    description: "Tiramisu, cafés et douceurs italiennes.",
    category: "Alimentation",
    reward: "Un café offert pour un dessert acheté",
    image:
      "https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=160&h=160&fit=crop",
  },
  {
    slug: "maki-mac",
    name: "MAKI MAC",
    description: "Restauration japonaise, sushis et makis.",
    category: "Alimentation",
    reward: "-15% sur les plateaux à emporter",
    image:
      "https://images.unsplash.com/photo-1541643600914-78b084683601?w=160&h=160&fit=crop",
  },
  {
    slug: "chocorico",
    name: "La Table de Chocorico",
    description: "Chocolats, pâtisseries et salon de thé.",
    category: "Alimentation",
    reward: "Une boisson chaude offerte",
    image:
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=160&h=160&fit=crop",
  },
  {
    slug: "alti",
    name: "ALTI",
    description: "Enseigne du premier étage d'Anfa Place.",
    category: "Mode",
    reward: "-10% sur votre premier achat",
    image:
      "https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=160&h=160&fit=crop",
  },
  {
    slug: "summer-market",
    name: "SUMMER MARKET",
    description: "Espace éphémère du premier étage.",
    category: "Événement",
    reward: "Accès à l'animation du moment",
    image:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=160&h=160&fit=crop",
  },

  /* ── Balisées au rez-de-chaussée (scan iGiPWMPBMdw) ── */
  {
    slug: "springfield",
    name: "SPRINGFIELD",
    description:
      "Mode urbaine et décontractée pour homme et femme, entre essentiels du quotidien et pièces de saison.",
    category: "Mode",
    reward: "-20% sur la seconde pièce",
    image:
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=160&h=160&fit=crop",
  },
  {
    slug: "womensecret",
    name: "WOMEN'SECRET",
    description: "Lingerie, vêtements de nuit et balnéaire pour femme.",
    category: "Lingerie",
    reward: "3 articles de nuit pour le prix de 2",
    image:
      "https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=160&h=160&fit=crop",
  },
];
