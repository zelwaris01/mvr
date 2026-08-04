import type { Question } from "./types";

export const QUESTIONS: Question[] = [
  {
    id: "q1",
    storeSlug: "zara",
    questionText: "En quelle année ZARA a-t-elle été fondée ?",
    options: ["1965", "1975", "1985", "1995"],
    correctIndex: 1,
    explanation:
      "ZARA a été fondée en 1975 par Amancio Ortega à La Corogne, en Espagne.",
    xpReward: 50,
  },
  {
    id: "q2",
    storeSlug: "zara",
    questionText: "Quel est le groupe propriétaire de ZARA ?",
    options: ["H&M Group", "Inditex", "LVMH", "Kering"],
    correctIndex: 1,
    explanation:
      "ZARA appartient au groupe Inditex, le plus grand détaillant de mode au monde.",
    xpReward: 50,
  },
  {
    id: "q3",
    storeSlug: "sephora",
    questionText: "Dans quel pays SEPHORA a-t-elle été créée ?",
    options: ["États-Unis", "Italie", "France", "Espagne"],
    correctIndex: 2,
    explanation:
      "SEPHORA a été fondée en France en 1970 par Dominique Mandonnaud.",
    xpReward: 50,
  },
  {
    id: "q4",
    storeSlug: "sephora",
    questionText:
      "Quel concept SEPHORA a-t-elle popularisé dans l'industrie de la beauté ?",
    options: [
      "La vente en ligne",
      "Le libre-service en parfumerie",
      "Les échantillons gratuits",
      "Les tutoriels vidéo",
    ],
    correctIndex: 1,
    explanation:
      "SEPHORA a révolutionné la beauté en permettant aux clients de tester librement les produits en magasin.",
    xpReward: 50,
  },
  {
    id: "q5",
    storeSlug: "nike",
    questionText: "Que signifie le nom « Nike » ?",
    options: [
      "Force",
      "Vitesse",
      "Déesse grecque de la victoire",
      "Champion",
    ],
    correctIndex: 2,
    explanation:
      "Nike tire son nom de Niké, la déesse grecque de la victoire.",
    xpReward: 50,
  },
  {
    id: "q6",
    storeSlug: "nike",
    questionText: "Quel est le slogan emblématique de Nike ?",
    options: ["Just Do It", "Impossible Is Nothing", "Run Fast", "Be Strong"],
    correctIndex: 0,
    explanation:
      "« Just Do It » est le slogan iconique de Nike depuis 1988.",
    xpReward: 50,
  },
  {
    id: "q7",
    storeSlug: "mango",
    questionText: "Dans quelle ville MANGO a-t-elle son siège social ?",
    options: ["Madrid", "Barcelone", "Paris", "Milan"],
    correctIndex: 1,
    explanation:
      "MANGO a été fondée et a son siège à Barcelone, en Espagne.",
    xpReward: 50,
  },
  {
    id: "q8",
    storeSlug: "guess",
    questionText: "Dans quel pays GUESS a-t-elle été fondée ?",
    options: ["France", "Italie", "États-Unis", "Royaume-Uni"],
    correctIndex: 2,
    explanation:
      "GUESS a été fondée en 1981 à Los Angeles par les frères Marciano.",
    xpReward: 50,
  },
  {
    id: "q9",
    storeSlug: "flo",
    questionText: "Quel type de produits FLO propose-t-elle principalement ?",
    options: [
      "Vêtements de sport",
      "Chaussures et accessoires",
      "Cosmétiques",
      "Électronique",
    ],
    correctIndex: 1,
    explanation:
      "FLO est spécialisée dans les chaussures et accessoires de mode.",
    xpReward: 50,
  },
  {
    id: "q10",
    storeSlug: "birkenstock",
    questionText: "Depuis quelle année BIRKENSTOCK fabrique-t-elle des chaussures ?",
    options: ["1774", "1850", "1920", "1960"],
    correctIndex: 0,
    explanation:
      "L'histoire de BIRKENSTOCK remonte à 1774, ce qui en fait l'une des plus anciennes marques de chaussures au monde.",
    xpReward: 50,
  },
  {
    id: "q11",
    storeSlug: "paul",
    questionText: "Quel est le produit signature de PAUL ?",
    options: [
      "Le macaron",
      "Le pain de tradition",
      "Le croissant",
      "La tarte aux fruits",
    ],
    correctIndex: 1,
    explanation:
      "PAUL est avant tout célèbre pour son pain de tradition française, fabriqué de manière artisanale.",
    xpReward: 50,
  },
  {
    id: "q12",
    storeSlug: "paul",
    questionText: "En quelle année la maison PAUL a-t-elle été fondée ?",
    options: ["1889", "1921", "1950", "1975"],
    correctIndex: 0,
    explanation:
      "La maison PAUL a été fondée en 1889 par Charlemagne Mayot dans le nord de la France.",
    xpReward: 50,
  },
];
