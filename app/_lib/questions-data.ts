import type { Question } from "./types";

/**
 * The quiz, written only where the trade is not in doubt.
 *
 * Every question below is answerable from something the model itself carries —
 * the pin's label, its links, or its own printed question — or from what the
 * brand's own domain plainly says it sells. Nothing here is invented brand
 * history, which is why nine of the fifteen shops have no questions at all:
 * RAZANA, LNKO, DUO ZOU LU, ROSABELLA and ALTI do not state their trade
 * anywhere in the scan, and a wrong fact about a real business is worse than
 * no quiz. The shop pages and the quiz hub already hide the quiz for those.
 *
 * SPRINGFIELD's question is the mall's own: the ground floor carries a
 * billboard pin reading "SPRINGFIELD est originaire de quel pays ? A. USA
 * B. Espagne C. Italie", reproduced here verbatim, options and order included.
 *
 * The carousel pin carries a second one — how many experience categories the
 * Carrousel website lists — and it is deliberately NOT here: the answer cannot
 * be checked from the model, and guessing between 6, 7 and 8 would ship a
 * quiz that lies to the visitor.
 */
export const QUESTIONS: Question[] = [
  {
    id: "electroplanet-1",
    storeSlug: "electroplanet",
    questionText: "Que vend ELECTROPLANET ?",
    options: [
      "De l'électroménager et de l'électronique",
      "Des vêtements de sport",
      "Des cosmétiques",
      "Des chaussures",
    ],
    correctIndex: 0,
    explanation:
      "ELECTROPLANET est une enseigne d'électroménager et d'électronique grand public — climatiseurs, réfrigérateurs, télévisions.",
    xpReward: 50,
  },
  {
    id: "electroplanet-2",
    storeSlug: "electroplanet",
    questionText:
      "Que propose la fiche ELECTROPLANET du mall, en plus de l'achat en ligne ?",
    options: [
      "Un chèque cadeau",
      "Un atelier de réparation",
      "Une carte de fidélité",
      "Un service de livraison en 1 heure",
    ],
    correctIndex: 0,
    explanation:
      "Sa fiche porte deux liens : « Acheter en ligne » et « Offrez un Chèque Cadeau ».",
    xpReward: 50,
  },
  {
    id: "planet-sport-1",
    storeSlug: "planet-sport",
    questionText: "Quel type d'articles trouve-t-on chez PLANET SPORT ?",
    options: [
      "Des articles de sport",
      "Du mobilier",
      "Des parfums",
      "De l'électroménager",
    ],
    correctIndex: 0,
    explanation:
      "PLANET SPORT est une enseigne d'articles et d'équipements de sport.",
    xpReward: 50,
  },
  {
    id: "faces-1",
    storeSlug: "faces",
    questionText: "Quelle est la spécialité de FACES ?",
    options: [
      "La beauté et les cosmétiques",
      "La maroquinerie",
      "L'électronique",
      "La restauration",
    ],
    correctIndex: 0,
    explanation:
      "FACES est une enseigne de beauté et de cosmétiques ; sa boutique en ligne est facesbeauty.ma.",
    xpReward: 50,
  },
  {
    id: "springfield-1",
    storeSlug: "springfield",
    questionText: "SPRINGFIELD est originaire de quel pays ?",
    options: ["USA", "Espagne", "Italie"],
    correctIndex: 1,
    explanation:
      "SPRINGFIELD est une marque espagnole. C'est la question posée par le panneau « CONNAISSEZ-VOUS LES MARQUES DU MALL ? » au rez-de-chaussée.",
    xpReward: 50,
  },
  {
    id: "womensecret-1",
    storeSlug: "womensecret",
    questionText: "Quelle catégorie de produits WOMEN'SECRET propose-t-elle ?",
    options: [
      "La lingerie et les vêtements de nuit",
      "Les articles de sport",
      "Le mobilier",
      "L'électroménager",
    ],
    correctIndex: 0,
    explanation:
      "WOMEN'SECRET est une marque de lingerie et de vêtements de nuit, distribuée au Maroc par Vogue Retail Shop.",
    xpReward: 50,
  },
  {
    id: "sogno-1",
    storeSlug: "sogno",
    questionText: "Quelle est la spécialité de SOGNO, au premier étage ?",
    options: ["Le tiramisu et le café", "Les sushis", "La pizza", "Les burgers"],
    correctIndex: 0,
    explanation:
      "Son enseigne dans le modèle se lit « SOGNO - Tiramisu & Coffee ».",
    xpReward: 50,
  },
];
