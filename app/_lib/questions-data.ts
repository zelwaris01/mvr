import type { Question } from "./types";
import { XP_PER_QUESTION } from "./constants";

/**
 * Three questions per store, in the order they are asked.
 *
 * IDs are `${slug}-${n}` rather than a running integer so adding a store never
 * means hunting for the next free number, and so a stale localStorage payload
 * from a deleted store simply stops matching instead of colliding.
 *
 * ⚠ The questions carrying a `// placeholder` marker were written from public
 * knowledge of the brands to reach three per store. They are plausible and
 * fact-checked as far as public sources go, but they have NOT been approved by
 * Smart Mall. Review before launch.
 */
export const QUESTIONS: Question[] = [
  // ── ZARA ──
  {
    id: "zara-1",
    storeSlug: "zara",
    questionText: "Dans quel pays la marque ZARA a-t-elle été fondée ?",
    options: ["Italie", "Espagne", "Portugal", "France"],
    correctIndex: 1,
    explanation:
      "ZARA a été fondée en 1975 par Amancio Ortega à La Corogne, en Espagne.",
    xpReward: XP_PER_QUESTION,
  },
  {
    id: "zara-2",
    storeSlug: "zara",
    questionText: "Quel est le groupe propriétaire de ZARA ?",
    options: ["H&M Group", "Inditex", "LVMH", "Kering"],
    correctIndex: 1,
    explanation:
      "ZARA appartient au groupe Inditex, le plus grand détaillant de mode au monde.",
    xpReward: XP_PER_QUESTION,
  },
  {
    id: "zara-3", // placeholder
    storeSlug: "zara",
    questionText: "Qu'est-ce qui distingue le modèle de ZARA dans la mode ?",
    options: [
      "La vente exclusivement en ligne",
      "Le renouvellement très rapide des collections",
      "La production artisanale",
      "Les collections annuelles uniques",
    ],
    correctIndex: 1,
    explanation:
      "ZARA a bâti sa réputation sur la « fast fashion » : de nouvelles pièces arrivent en boutique toutes les deux semaines.",
    xpReward: XP_PER_QUESTION,
  },

  // ── FLO ──
  {
    id: "flo-1",
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
    xpReward: XP_PER_QUESTION,
  },
  {
    id: "flo-2", // placeholder
    storeSlug: "flo",
    questionText: "De quel pays l'enseigne FLO est-elle originaire ?",
    options: ["Turquie", "Grèce", "Italie", "Maroc"],
    correctIndex: 0,
    explanation:
      "FLO est une enseigne turque de chaussures, présente dans de nombreux pays.",
    xpReward: XP_PER_QUESTION,
  },
  {
    id: "flo-3", // placeholder
    storeSlug: "flo",
    questionText: "À quelle clientèle FLO s'adresse-t-elle ?",
    options: [
      "Uniquement aux femmes",
      "Uniquement aux enfants",
      "Toute la famille",
      "Uniquement aux sportifs",
    ],
    correctIndex: 2,
    explanation:
      "FLO propose des collections pour femme, homme et enfant.",
    xpReward: XP_PER_QUESTION,
  },

  // ── GUESS ──
  {
    id: "guess-1",
    storeSlug: "guess",
    questionText: "Dans quel pays GUESS a-t-elle été fondée ?",
    options: ["France", "Italie", "États-Unis", "Royaume-Uni"],
    correctIndex: 2,
    explanation:
      "GUESS a été fondée en 1981 à Los Angeles par les frères Marciano.",
    xpReward: XP_PER_QUESTION,
  },
  {
    id: "guess-2", // placeholder
    storeSlug: "guess",
    questionText: "Quel produit a lancé la notoriété de GUESS ?",
    options: ["Le denim", "Le parfum", "Les montres", "Les lunettes"],
    correctIndex: 0,
    explanation:
      "GUESS s'est fait connaître avec ses jeans, notamment le modèle Marilyn à trois zips.",
    xpReward: XP_PER_QUESTION,
  },
  {
    id: "guess-3", // placeholder
    storeSlug: "guess",
    questionText: "Quel symbole figure sur le logo de GUESS ?",
    options: [
      "Une étoile",
      "Un point d'interrogation",
      "Une couronne",
      "Un aigle",
    ],
    correctIndex: 1,
    explanation:
      "Le point d'interrogation rouge est l'emblème historique de la marque.",
    xpReward: XP_PER_QUESTION,
  },

  // ── BIRKENSTOCK ──
  {
    id: "birkenstock-1",
    storeSlug: "birkenstock",
    questionText:
      "Depuis quelle année BIRKENSTOCK fabrique-t-elle des chaussures ?",
    options: ["1774", "1850", "1920", "1960"],
    correctIndex: 0,
    explanation:
      "L'histoire de BIRKENSTOCK remonte à 1774, ce qui en fait l'une des plus anciennes marques de chaussures au monde.",
    xpReward: XP_PER_QUESTION,
  },
  {
    id: "birkenstock-2", // placeholder
    storeSlug: "birkenstock",
    questionText: "De quel pays BIRKENSTOCK est-elle originaire ?",
    options: ["Autriche", "Suisse", "Allemagne", "Pays-Bas"],
    correctIndex: 2,
    explanation: "BIRKENSTOCK est une maison allemande.",
    xpReward: XP_PER_QUESTION,
  },
  {
    id: "birkenstock-3", // placeholder
    storeSlug: "birkenstock",
    questionText: "Quelle innovation a fait la réputation de BIRKENSTOCK ?",
    options: [
      "La semelle anatomique",
      "Le lacet élastique",
      "La semelle transparente",
      "Le talon compensé",
    ],
    correctIndex: 0,
    explanation:
      "La marque doit sa notoriété à sa semelle épousant la forme du pied, conçue dès 1896.",
    xpReward: XP_PER_QUESTION,
  },

  // ── MANGO ──
  {
    id: "mango-1",
    storeSlug: "mango",
    questionText: "Dans quelle ville MANGO a-t-elle son siège social ?",
    options: ["Madrid", "Barcelone", "Paris", "Milan"],
    correctIndex: 1,
    explanation:
      "MANGO a été fondée et a son siège à Barcelone, en Espagne.",
    xpReward: XP_PER_QUESTION,
  },
  {
    id: "mango-2", // placeholder
    storeSlug: "mango",
    questionText: "En quelle décennie MANGO a-t-elle ouvert sa première boutique ?",
    options: ["Années 1960", "Années 1980", "Années 1990", "Années 2000"],
    correctIndex: 1,
    explanation:
      "La première boutique MANGO a ouvert sur le Paseo de Gracia à Barcelone en 1984.",
    xpReward: XP_PER_QUESTION,
  },
  {
    id: "mango-3", // placeholder
    storeSlug: "mango",
    questionText: "Quel style caractérise les collections MANGO ?",
    options: [
      "Le sportswear technique",
      "Le vestiaire méditerranéen et urbain",
      "Le vêtement de travail",
      "La haute couture",
    ],
    correctIndex: 1,
    explanation:
      "MANGO revendique une esthétique méditerranéenne, urbaine et portable au quotidien.",
    xpReward: XP_PER_QUESTION,
  },

  // ── SEPHORA ──
  {
    id: "sephora-1",
    storeSlug: "sephora",
    questionText: "Dans quel pays SEPHORA a-t-elle été créée ?",
    options: ["États-Unis", "Italie", "France", "Espagne"],
    correctIndex: 2,
    explanation:
      "SEPHORA a été fondée en France en 1970 par Dominique Mandonnaud.",
    xpReward: XP_PER_QUESTION,
  },
  {
    id: "sephora-2",
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
    xpReward: XP_PER_QUESTION,
  },
  {
    id: "sephora-3", // placeholder
    storeSlug: "sephora",
    questionText: "À quel groupe de luxe SEPHORA appartient-elle ?",
    options: ["Kering", "LVMH", "Richemont", "L'Oréal"],
    correctIndex: 1,
    explanation: "SEPHORA a rejoint le groupe LVMH en 1997.",
    xpReward: XP_PER_QUESTION,
  },

  // ── NIKE ──
  {
    id: "nike-1",
    storeSlug: "nike",
    questionText: "Que signifie le nom « Nike » ?",
    options: ["Force", "Vitesse", "Déesse grecque de la victoire", "Champion"],
    correctIndex: 2,
    explanation:
      "Nike tire son nom de Niké, la déesse grecque de la victoire.",
    xpReward: XP_PER_QUESTION,
  },
  {
    id: "nike-2",
    storeSlug: "nike",
    questionText: "Quel est le slogan emblématique de Nike ?",
    options: ["Just Do It", "Impossible Is Nothing", "Run Fast", "Be Strong"],
    correctIndex: 0,
    explanation: "« Just Do It » est le slogan iconique de Nike depuis 1988.",
    xpReward: XP_PER_QUESTION,
  },
  {
    id: "nike-3", // placeholder
    storeSlug: "nike",
    questionText: "Comment s'appelle le logo de Nike ?",
    options: ["Le Swoosh", "Le Jumpman", "Le Flash", "L'Arc"],
    correctIndex: 0,
    explanation:
      "La virgule de Nike s'appelle le Swoosh, dessinée en 1971 par Carolyn Davidson.",
    xpReward: XP_PER_QUESTION,
  },

  // ── PAUL ──
  {
    id: "paul-1",
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
    xpReward: XP_PER_QUESTION,
  },
  {
    id: "paul-2",
    storeSlug: "paul",
    questionText: "En quelle année la maison PAUL a-t-elle été fondée ?",
    options: ["1889", "1921", "1950", "1975"],
    correctIndex: 0,
    explanation:
      "La maison PAUL a été fondée en 1889 par Charlemagne Mayot dans le nord de la France.",
    xpReward: XP_PER_QUESTION,
  },
  {
    id: "paul-3", // placeholder
    storeSlug: "paul",
    questionText: "De quelle région française la maison PAUL est-elle originaire ?",
    options: ["La Provence", "Le Nord", "La Bretagne", "L'Alsace"],
    correctIndex: 1,
    explanation:
      "PAUL est née à Croix, dans le Nord de la France.",
    xpReward: XP_PER_QUESTION,
  },

  /* ── LNKO ──
     ⚠ L'enseigne se présente comme « magasin d'optique » sur sa devanture,
     visible dans le scan. Les questions s'appuient sur cela et sur la visite
     elle-même ; à faire valider par Smart Mall. */
  {
    id: "lnko-1",
    storeSlug: "lnko",
    questionText: "Quelle est la spécialité de LNKO ?",
    options: [
      "L'optique et les lunettes",
      "La boulangerie",
      "Le prêt-à-porter",
      "La téléphonie",
    ],
    correctIndex: 0,
    explanation:
      "LNKO se présente comme magasin d'optique sur sa devanture.",
    xpReward: XP_PER_QUESTION,
  },
  {
    id: "lnko-2",
    storeSlug: "lnko",
    questionText: "À quel niveau du mall se trouve LNKO ?",
    options: ["Rez-de-chaussée", "Premier étage", "Sous-sol", "Terrasse"],
    correctIndex: 0,
    explanation: "LNKO se trouve au rez-de-chaussée, dans la galerie.",
    xpReward: XP_PER_QUESTION,
  },
  {
    id: "lnko-3", // ⚠ espace-réservé — contenu à fournir
    storeSlug: "lnko",
    questionText: "Que peut-on faire chez un opticien comme LNKO ?",
    options: [
      "Faire contrôler sa vue",
      "Faire réparer son téléphone",
      "Retirer de l'argent",
      "Acheter du pain",
    ],
    correctIndex: 0,
    explanation: "À compléter avec les services proposés par l'enseigne.",
    xpReward: XP_PER_QUESTION,
  },

  // ── SPRINGFIELD ──
  {
    id: "springfield-1",
    storeSlug: "springfield",
    questionText: "De quel pays l'enseigne SPRINGFIELD est-elle originaire ?",
    options: ["Italie", "Espagne", "Portugal", "France"],
    correctIndex: 1,
    explanation:
      "SPRINGFIELD est une marque espagnole, née en 1988 et développée par le groupe Tendam.",
    xpReward: XP_PER_QUESTION,
  },
  {
    id: "springfield-2",
    storeSlug: "springfield",
    questionText: "À quelle clientèle SPRINGFIELD s'adressait-elle à ses débuts ?",
    options: ["Aux enfants", "Aux hommes", "Aux femmes", "Aux sportifs"],
    correctIndex: 1,
    explanation:
      "SPRINGFIELD a démarré comme une marque de mode masculine avant d'ouvrir ses collections aux femmes.",
    xpReward: XP_PER_QUESTION,
  },
  {
    id: "springfield-3", // placeholder
    storeSlug: "springfield",
    questionText: "Quel style définit le mieux SPRINGFIELD ?",
    options: [
      "La mode décontractée du quotidien",
      "Le costume de cérémonie",
      "Le vêtement technique de montagne",
      "La haute couture",
    ],
    correctIndex: 0,
    explanation:
      "SPRINGFIELD s'est construite autour d'un vestiaire urbain et décontracté.",
    xpReward: XP_PER_QUESTION,
  },

  // ── WOMEN'SECRET ──
  {
    id: "womensecret-1",
    storeSlug: "womensecret",
    questionText: "Quelle est la spécialité de WOMEN'SECRET ?",
    options: [
      "La maroquinerie",
      "La lingerie et les vêtements de nuit",
      "Les chaussures de sport",
      "La parfumerie",
    ],
    correctIndex: 1,
    explanation:
      "WOMEN'SECRET est dédiée à la lingerie, aux vêtements de nuit et au balnéaire pour femme.",
    xpReward: XP_PER_QUESTION,
  },
  {
    id: "womensecret-2",
    storeSlug: "womensecret",
    questionText: "De quel pays WOMEN'SECRET est-elle originaire ?",
    options: ["Espagne", "Royaume-Uni", "Belgique", "Turquie"],
    correctIndex: 0,
    explanation:
      "WOMEN'SECRET est une enseigne espagnole, créée en 1993 et rattachée au groupe Tendam.",
    xpReward: XP_PER_QUESTION,
  },
  {
    id: "womensecret-3", // placeholder
    storeSlug: "womensecret",
    questionText:
      "Quelle catégorie WOMEN'SECRET propose-t-elle en plus de la lingerie ?",
    options: [
      "Les maillots de bain",
      "Les chaussures de ville",
      "Les sacs de voyage",
      "Les montres",
    ],
    correctIndex: 0,
    explanation:
      "Le balnéaire est l'une des collections phares de la marque, aux côtés de la nuit et de la lingerie.",
    xpReward: XP_PER_QUESTION,
  },
  /* ────────────────────────────────────────────────────────────────────
     PREMIER ÉTAGE — La Table de Chocorico, ALTI, SUMMER MARKET.

     ⚠ Ces trois enseignes sont balisées dans le scan mais je ne dispose
     d'aucune information fiable à leur sujet. Plutôt que d'inventer des
     faits, la première question de chaque série porte sur la visite
     elle-même (le niveau), ce qui est vérifiable en se déplaçant. Les
     deux suivantes sont des ESPACE-RÉSERVÉS à remplacer par Smart Mall
     avant toute mise en ligne — ne pas publier en l'état.
     ──────────────────────────────────────────────────────────────────── */
  {
    id: "chocorico-1",
    storeSlug: "chocorico",
    questionText: "À quel niveau du mall se trouve La Table de Chocorico ?",
    options: ["Rez-de-chaussée", "Premier étage", "Sous-sol", "Terrasse"],
    correctIndex: 1,
    explanation: "La Table de Chocorico se trouve au premier étage.",
    xpReward: XP_PER_QUESTION,
  },
  {
    id: "chocorico-2", // ⚠ à valider
    storeSlug: "chocorico",
    questionText: "Quelle est la spécialité de La Table de Chocorico ?",
    options: ["Le chocolat", "Les glaces", "Les burgers", "Les pizzas"],
    correctIndex: 0,
    explanation: "La maison est avant tout chocolatier et pâtissier.",
    xpReward: XP_PER_QUESTION,
  },
  {
    id: "chocorico-3", // ⚠ à valider
    storeSlug: "chocorico",
    questionText: "Que peut-on faire sur place à La Table de Chocorico ?",
    options: [
      "S'asseoir au salon de thé",
      "Faire réparer ses chaussures",
      "Essayer des lunettes",
      "Retirer un colis",
    ],
    correctIndex: 0,
    explanation: "L'enseigne propose un salon de thé en plus de la vente.",
    xpReward: XP_PER_QUESTION,
  },

  {
    id: "sogno-1",
    storeSlug: "sogno",
    questionText: "Quel dessert italien donne son nom à l'enseigne SOGNO ?",
    options: ["Le tiramisu", "La panna cotta", "Le cannolo", "La glace"],
    correctIndex: 0,
    explanation:
      "L'enseigne s'appelle « SOGNO — Tiramisu & Coffee » : le tiramisu est sa signature.",
    xpReward: XP_PER_QUESTION,
  },
  {
    id: "sogno-2",
    storeSlug: "sogno",
    questionText: "Que sert SOGNO en accompagnement de ses desserts ?",
    options: ["Du café", "Du thé à la menthe", "Des jus pressés", "Du chocolat chaud"],
    correctIndex: 0,
    explanation: "Le café figure dans le nom même de l'enseigne.",
    xpReward: XP_PER_QUESTION,
  },
  {
    id: "sogno-3",
    storeSlug: "sogno",
    questionText: "À quel niveau du mall se trouve SOGNO ?",
    options: ["Rez-de-chaussée", "Premier étage", "Sous-sol", "Terrasse"],
    correctIndex: 1,
    explanation: "SOGNO se trouve au premier étage.",
    xpReward: XP_PER_QUESTION,
  },

  {
    id: "maki-mac-1",
    storeSlug: "maki-mac",
    questionText: "Quelle cuisine évoque le nom MAKI MAC ?",
    options: ["Japonaise", "Italienne", "Mexicaine", "Libanaise"],
    correctIndex: 0,
    explanation:
      "Le maki est un rouleau de riz et d'algue emblématique de la cuisine japonaise.",
    xpReward: XP_PER_QUESTION,
  },
  {
    id: "maki-mac-2", // ⚠ espace-réservé — contenu à fournir
    storeSlug: "maki-mac",
    questionText: "Qu'est-ce qu'un maki ?",
    options: [
      "Un rouleau de riz entouré d'algue",
      "Une soupe de nouilles",
      "Une brochette grillée",
      "Un beignet sucré",
    ],
    correctIndex: 0,
    explanation: "Le maki est un rouleau de riz vinaigré enveloppé de nori.",
    xpReward: XP_PER_QUESTION,
  },
  {
    id: "maki-mac-3",
    storeSlug: "maki-mac",
    questionText: "À quel niveau du mall se trouve MAKI MAC ?",
    options: ["Rez-de-chaussée", "Premier étage", "Sous-sol", "Parking"],
    correctIndex: 1,
    explanation: "MAKI MAC se trouve au premier étage.",
    xpReward: XP_PER_QUESTION,
  },

  {
    id: "alti-1",
    storeSlug: "alti",
    questionText: "À quel niveau du mall se trouve ALTI ?",
    options: ["Rez-de-chaussée", "Premier étage", "Sous-sol", "Terrasse"],
    correctIndex: 1,
    explanation: "ALTI se trouve au premier étage de Smart Mall.",
    xpReward: XP_PER_QUESTION,
  },
  {
    id: "alti-2", // ⚠ espace-réservé — contenu à fournir
    storeSlug: "alti",
    questionText: "Dans quel univers ALTI propose-t-elle ses collections ?",
    options: ["La mode", "L'électroménager", "Le jardinage", "L'automobile"],
    correctIndex: 0,
    explanation: "À compléter avec la description officielle de l'enseigne.",
    xpReward: XP_PER_QUESTION,
  },
  {
    id: "alti-3", // ⚠ espace-réservé — contenu à fournir
    storeSlug: "alti",
    questionText: "Depuis quel étage accède-t-on à ALTI ?",
    options: ["Par la galerie du premier", "Par le parking", "Par la terrasse", "Par le sous-sol"],
    correctIndex: 0,
    explanation: "À compléter avec les informations de Smart Mall.",
    xpReward: XP_PER_QUESTION,
  },

  {
    id: "summer-market-1",
    storeSlug: "summer-market",
    questionText: "À quel niveau se tient le SUMMER MARKET ?",
    options: ["Rez-de-chaussée", "Premier étage", "Sous-sol", "Parking"],
    correctIndex: 1,
    explanation: "Le SUMMER MARKET occupe un espace du premier étage.",
    xpReward: XP_PER_QUESTION,
  },
  {
    id: "summer-market-2", // ⚠ espace-réservé — contenu à fournir
    storeSlug: "summer-market",
    questionText: "Quel type d'espace est le SUMMER MARKET ?",
    options: ["Un espace éphémère", "Une banque", "Un cinéma", "Un parking"],
    correctIndex: 0,
    explanation: "À compléter avec la description officielle de l'animation.",
    xpReward: XP_PER_QUESTION,
  },
  {
    id: "summer-market-3", // ⚠ espace-réservé — contenu à fournir
    storeSlug: "summer-market",
    questionText: "À quelle saison le SUMMER MARKET est-il associé ?",
    options: ["L'été", "L'hiver", "L'automne", "Le printemps"],
    correctIndex: 0,
    explanation: "À compléter avec le calendrier d'animation du centre.",
    xpReward: XP_PER_QUESTION,
  },
];

/**
 * Questions grouped by store, built once at module load.
 * The quiz drawer and the roster both need this lookup on every render —
 * filtering the flat list each time would be needless work on the hot screen.
 */
export const QUESTIONS_BY_STORE: Record<string, Question[]> = QUESTIONS.reduce(
  (acc, q) => {
    (acc[q.storeSlug] ??= []).push(q);
    return acc;
  },
  {} as Record<string, Question[]>
);
