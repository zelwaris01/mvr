/**
 * English for the content that lives in the data files.
 *
 * Overrides rather than a parallel catalogue: `stores-data`, `questions-data`
 * and `rewards-data` stay the single source of truth for what exists, what the
 * correct answer is and what a reward costs. This file only says the same
 * things in English, keyed by the same slug or id.
 *
 * A missing key is not an error — `roster.ts` and `rewards-data.ts` fall back
 * to the French, so a shop tagged tomorrow shows up in both languages
 * immediately and only its copy is untranslated.
 *
 * ⚠ The same caveat as the French carries over: descriptions, rewards and the
 * questions marked placeholder there are unapproved copy. Translating them did
 * not make them official.
 */

export type StoreCopy = {
  description: string;
  category: string;
  reward: string;
};

export const STORE_EN: Record<string, StoreCopy> = {
  zara: {
    description: "International ready-to-wear fashion for men, women and children.",
    category: "Fashion",
    reward: "-15% on the new collection",
  },
  flo: {
    description: "Shoes and accessories combining style and comfort at accessible prices.",
    category: "Footwear",
    reward: "-10% on a pair of your choice",
  },
  guess: {
    description: "Denim, ready-to-wear and accessories with a Californian spirit.",
    category: "Fashion",
    reward: "-20% on denim",
  },
  birkenstock: {
    description: "Ergonomic sandals and shoes made in Germany since 1774.",
    category: "Footwear",
    reward: "Free insoles with any purchase",
  },
  mango: {
    description: "Mediterranean silhouettes and urban wardrobe for women and men.",
    category: "Fashion",
    reward: "-15% when you buy two items",
  },
  sephora: {
    description: "Fragrance, skincare and make-up from the great beauty houses.",
    category: "Beauty",
    reward: "-20% on facial skincare",
  },
  nike: {
    description: "Equipment, sportswear and sneakers for every surface.",
    category: "Sport",
    reward: "-10% on sneakers",
  },
  paul: {
    description: "Traditional French bakery, pastries and tea room.",
    category: "Food",
    reward: "A free coffee with any pastry",
  },
  sogno: {
    description: "Tiramisu, coffee and Italian sweets.",
    category: "Food",
    reward: "A free coffee with any dessert",
  },
  "maki-mac": {
    description: "Japanese food, sushi and maki.",
    category: "Food",
    reward: "-15% on takeaway platters",
  },
  chocorico: {
    description: "Chocolates, pastries and a tea room.",
    category: "Food",
    reward: "A free hot drink",
  },
  alti: {
    description: "A first-floor shop at Smart Mall.",
    category: "Fashion",
    reward: "-10% on your first purchase",
  },
  "summer-market": {
    description: "A pop-up space on the first floor.",
    category: "Event",
    reward: "Access to the current activity",
  },
  lnko: {
    description: "Opticians — prescription glasses and sunglasses.",
    category: "Optician",
    reward: "-15% on a second pair",
  },
  springfield: {
    description:
      "Urban, casual fashion for men and women, between everyday essentials and seasonal pieces.",
    category: "Fashion",
    reward: "-20% on your second item",
  },
  womensecret: {
    description: "Lingerie, nightwear and swimwear for women.",
    category: "Lingerie",
    reward: "3 nightwear items for the price of 2",
  },
  electroplanet: {
    description: "Home appliances, consumer electronics and multimedia.",
    category: "Electronics",
    reward: "-10% on small appliances",
  },
  "planet-sport": {
    description: "Sports equipment, clothing and footwear.",
    category: "Sport",
    reward: "-15% on running shoes",
  },
  faces: {
    description: "Make-up, fragrance and skincare.",
    category: "Beauty",
    reward: "A free beauty consultation",
  },
  razana: {
    description: "A ground-floor shop at Smart Mall.",
    category: "Shop",
    reward: "-10% on your first purchase",
  },
  "duo-zou-lu": {
    description: "A ground-floor shop at Smart Mall.",
    category: "Shop",
    reward: "-10% on your first purchase",
  },
  carrousel: {
    description: "An activity and games area at the heart of the mall.",
    category: "Activities",
    reward: "One free ride for every two bought",
  },
};

export type QuestionCopy = {
  questionText: string;
  options: string[];
  explanation: string;
};

/**
 * Option order is load-bearing: `correctIndex` lives in the French file and
 * indexes into this array too. Translate in place, never reorder.
 */
export const QUESTION_EN: Record<string, QuestionCopy> = {
  // ── ZARA ──
  "zara-1": {
    questionText: "In which country was ZARA founded?",
    options: ["Italy", "Spain", "Portugal", "France"],
    explanation:
      "ZARA was founded in 1975 by Amancio Ortega in A Coruña, Spain.",
  },
  "zara-2": {
    questionText: "Which group owns ZARA?",
    options: ["H&M Group", "Inditex", "LVMH", "Kering"],
    explanation:
      "ZARA belongs to Inditex, the largest fashion retailer in the world.",
  },
  "zara-3": {
    questionText: "What sets ZARA's model apart in fashion?",
    options: [
      "Selling online only",
      "Turning collections over very quickly",
      "Handmade production",
      "A single annual collection",
    ],
    explanation:
      "ZARA built its reputation on fast fashion: new pieces reach the shop floor every two weeks.",
  },

  // ── FLO ──
  "flo-1": {
    questionText: "What does FLO mainly sell?",
    options: ["Sportswear", "Shoes and accessories", "Cosmetics", "Electronics"],
    explanation: "FLO specialises in shoes and fashion accessories.",
  },
  "flo-2": {
    questionText: "Which country is the FLO chain from?",
    options: ["Turkey", "Greece", "Italy", "Morocco"],
    explanation:
      "FLO is a Turkish footwear chain, present in many countries.",
  },
  "flo-3": {
    questionText: "Who does FLO cater to?",
    options: [
      "Women only",
      "Children only",
      "The whole family",
      "Athletes only",
    ],
    explanation: "FLO offers collections for women, men and children.",
  },

  // ── GUESS ──
  "guess-1": {
    questionText: "In which country was GUESS founded?",
    options: ["France", "Italy", "United States", "United Kingdom"],
    explanation:
      "GUESS was founded in 1981 in Los Angeles by the Marciano brothers.",
  },
  "guess-2": {
    questionText: "Which product made GUESS famous?",
    options: ["Denim", "Fragrance", "Watches", "Eyewear"],
    explanation:
      "GUESS made its name with jeans, notably the three-zip Marilyn.",
  },
  "guess-3": {
    questionText: "Which symbol appears on the GUESS logo?",
    options: ["A star", "A question mark", "A crown", "An eagle"],
    explanation: "The red question mark is the brand's historic emblem.",
  },

  // ── BIRKENSTOCK ──
  "birkenstock-1": {
    questionText: "Since which year has BIRKENSTOCK been making shoes?",
    options: ["1774", "1850", "1920", "1960"],
    explanation:
      "BIRKENSTOCK's history goes back to 1774, making it one of the oldest shoe brands in the world.",
  },
  "birkenstock-2": {
    questionText: "Which country is BIRKENSTOCK from?",
    options: ["Austria", "Switzerland", "Germany", "Netherlands"],
    explanation: "BIRKENSTOCK is a German house.",
  },
  "birkenstock-3": {
    questionText: "Which innovation built BIRKENSTOCK's reputation?",
    options: [
      "The contoured footbed",
      "The elastic lace",
      "The transparent sole",
      "The wedge heel",
    ],
    explanation:
      "The brand owes its reputation to a footbed shaped to the foot, designed back in 1896.",
  },

  // ── MANGO ──
  "mango-1": {
    questionText: "In which city does MANGO have its head office?",
    options: ["Madrid", "Barcelona", "Paris", "Milan"],
    explanation: "MANGO was founded in and is headquartered in Barcelona, Spain.",
  },
  "mango-2": {
    questionText: "In which decade did MANGO open its first shop?",
    options: ["The 1960s", "The 1980s", "The 1990s", "The 2000s"],
    explanation:
      "The first MANGO shop opened on Passeig de Gràcia in Barcelona in 1984.",
  },
  "mango-3": {
    questionText: "Which style characterises MANGO's collections?",
    options: [
      "Technical sportswear",
      "A Mediterranean, urban wardrobe",
      "Workwear",
      "Haute couture",
    ],
    explanation:
      "MANGO claims a Mediterranean aesthetic — urban and wearable every day.",
  },

  // ── SEPHORA ──
  "sephora-1": {
    questionText: "In which country was SEPHORA created?",
    options: ["United States", "Italy", "France", "Spain"],
    explanation:
      "SEPHORA was founded in France in 1970 by Dominique Mandonnaud.",
  },
  "sephora-2": {
    questionText: "Which idea did SEPHORA popularise in the beauty industry?",
    options: [
      "Online selling",
      "Self-service in perfumery",
      "Free samples",
      "Video tutorials",
    ],
    explanation:
      "SEPHORA changed beauty retail by letting customers test products freely in store.",
  },
  "sephora-3": {
    questionText: "Which luxury group does SEPHORA belong to?",
    options: ["Kering", "LVMH", "Richemont", "L'Oréal"],
    explanation: "SEPHORA joined the LVMH group in 1997.",
  },

  // ── NIKE ──
  "nike-1": {
    questionText: "What does the name “Nike” mean?",
    options: ["Strength", "Speed", "The Greek goddess of victory", "Champion"],
    explanation: "Nike takes its name from Nike, the Greek goddess of victory.",
  },
  "nike-2": {
    questionText: "What is Nike's best-known slogan?",
    options: ["Just Do It", "Impossible Is Nothing", "Run Fast", "Be Strong"],
    explanation: "“Just Do It” has been Nike's iconic slogan since 1988.",
  },
  "nike-3": {
    questionText: "What is the Nike logo called?",
    options: ["The Swoosh", "The Jumpman", "The Flash", "The Arc"],
    explanation:
      "Nike's tick is called the Swoosh, drawn in 1971 by Carolyn Davidson.",
  },

  // ── PAUL ──
  "paul-1": {
    questionText: "What is PAUL's signature product?",
    options: [
      "The macaron",
      "Traditional bread",
      "The croissant",
      "The fruit tart",
    ],
    explanation:
      "PAUL is above all known for its traditional French bread, made by hand.",
  },
  "paul-2": {
    questionText: "In which year was the house of PAUL founded?",
    options: ["1889", "1921", "1950", "1975"],
    explanation:
      "PAUL was founded in 1889 by Charlemagne Mayot in northern France.",
  },
  "paul-3": {
    questionText: "Which French region is the house of PAUL from?",
    options: ["Provence", "The North", "Brittany", "Alsace"],
    explanation: "PAUL was born in Croix, in the north of France.",
  },

  // ── LNKO ──
  "lnko-1": {
    questionText: "What does LNKO specialise in?",
    options: ["Optics and eyewear", "Bakery", "Ready-to-wear", "Mobile phones"],
    explanation: "LNKO describes itself as an optician on its shopfront.",
  },
  "lnko-2": {
    questionText: "On which level of the mall is LNKO?",
    options: ["Ground floor", "First floor", "Basement", "Terrace"],
    explanation: "LNKO is on the ground floor, in the gallery.",
  },
  "lnko-3": {
    questionText: "What can you do at an optician like LNKO?",
    options: [
      "Have your eyes tested",
      "Have your phone repaired",
      "Withdraw cash",
      "Buy bread",
    ],
    explanation: "To be completed with the services the shop offers.",
  },

  // ── SPRINGFIELD ──
  "springfield-1": {
    questionText: "Which country is the SPRINGFIELD chain from?",
    options: ["Italy", "Spain", "Portugal", "France"],
    explanation:
      "SPRINGFIELD is a Spanish brand, born in 1988 and developed by the Tendam group.",
  },
  "springfield-2": {
    questionText: "Who did SPRINGFIELD cater to in its early days?",
    options: ["Children", "Men", "Women", "Athletes"],
    explanation:
      "SPRINGFIELD started as a menswear brand before opening its collections to women.",
  },
  "springfield-3": {
    questionText: "Which style best defines SPRINGFIELD?",
    options: [
      "Casual everyday fashion",
      "Formal suiting",
      "Technical mountain clothing",
      "Haute couture",
    ],
    explanation:
      "SPRINGFIELD was built around an urban, casual wardrobe.",
  },

  // ── WOMEN'SECRET ──
  "womensecret-1": {
    questionText: "What does WOMEN'SECRET specialise in?",
    options: [
      "Leather goods",
      "Lingerie and nightwear",
      "Sports shoes",
      "Perfumery",
    ],
    explanation:
      "WOMEN'SECRET is dedicated to lingerie, nightwear and swimwear for women.",
  },
  "womensecret-2": {
    questionText: "Which country is WOMEN'SECRET from?",
    options: ["Spain", "United Kingdom", "Belgium", "Turkey"],
    explanation:
      "WOMEN'SECRET is a Spanish chain, created in 1993 and part of the Tendam group.",
  },
  "womensecret-3": {
    questionText: "Which category does WOMEN'SECRET offer alongside lingerie?",
    options: ["Swimwear", "Formal shoes", "Travel bags", "Watches"],
    explanation:
      "Swimwear is one of the brand's flagship collections, alongside nightwear and lingerie.",
  },

  // ── La Table de Chocorico ──
  "chocorico-1": {
    questionText: "On which level of the mall is La Table de Chocorico?",
    options: ["Ground floor", "First floor", "Basement", "Terrace"],
    explanation: "La Table de Chocorico is on the first floor.",
  },
  "chocorico-2": {
    questionText: "What does La Table de Chocorico specialise in?",
    options: ["Chocolate", "Ice cream", "Burgers", "Pizza"],
    explanation: "The house is first and foremost a chocolatier and pâtissier.",
  },
  "chocorico-3": {
    questionText: "What can you do on site at La Table de Chocorico?",
    options: [
      "Sit down in the tea room",
      "Have your shoes repaired",
      "Try on glasses",
      "Collect a parcel",
    ],
    explanation: "The shop has a tea room as well as a counter.",
  },

  // ── SOGNO ──
  "sogno-1": {
    questionText: "Which Italian dessert gives SOGNO its name?",
    options: ["Tiramisu", "Panna cotta", "Cannolo", "Gelato"],
    explanation:
      "The shop is called “SOGNO — Tiramisu & Coffee”: tiramisu is its signature.",
  },
  "sogno-2": {
    questionText: "What does SOGNO serve alongside its desserts?",
    options: ["Coffee", "Mint tea", "Fresh juice", "Hot chocolate"],
    explanation: "Coffee is in the shop's name itself.",
  },
  "sogno-3": {
    questionText: "On which level of the mall is SOGNO?",
    options: ["Ground floor", "First floor", "Basement", "Terrace"],
    explanation: "SOGNO is on the first floor.",
  },

  // ── MAKI MAC ──
  "maki-mac-1": {
    questionText: "Which cuisine does the name MAKI MAC suggest?",
    options: ["Japanese", "Italian", "Mexican", "Lebanese"],
    explanation:
      "Maki is a roll of rice and seaweed, emblematic of Japanese cooking.",
  },
  "maki-mac-2": {
    questionText: "What is a maki?",
    options: [
      "A rice roll wrapped in seaweed",
      "A noodle soup",
      "A grilled skewer",
      "A sweet doughnut",
    ],
    explanation: "A maki is a roll of vinegared rice wrapped in nori.",
  },
  "maki-mac-3": {
    questionText: "On which level of the mall is MAKI MAC?",
    options: ["Ground floor", "First floor", "Basement", "Car park"],
    explanation: "MAKI MAC is on the first floor.",
  },

  // ── ALTI ──
  "alti-1": {
    questionText: "On which level of the mall is ALTI?",
    options: ["Ground floor", "First floor", "Basement", "Terrace"],
    explanation: "ALTI is on the first floor of Smart Mall.",
  },
  "alti-2": {
    questionText: "Which world does ALTI's collection belong to?",
    options: ["Fashion", "Home appliances", "Gardening", "Motoring"],
    explanation: "To be completed with the shop's official description.",
  },
  "alti-3": {
    questionText: "Which way in leads to ALTI?",
    options: [
      "Through the first-floor gallery",
      "Through the car park",
      "Through the terrace",
      "Through the basement",
    ],
    explanation: "To be completed with information from Smart Mall.",
  },

  // ── SUMMER MARKET ──
  "summer-market-1": {
    questionText: "On which level is the SUMMER MARKET held?",
    options: ["Ground floor", "First floor", "Basement", "Car park"],
    explanation: "The SUMMER MARKET occupies a space on the first floor.",
  },
  "summer-market-2": {
    questionText: "What kind of space is the SUMMER MARKET?",
    options: ["A pop-up space", "A bank", "A cinema", "A car park"],
    explanation: "To be completed with the official description of the event.",
  },
  "summer-market-3": {
    questionText: "Which season is the SUMMER MARKET tied to?",
    options: ["Summer", "Winter", "Autumn", "Spring"],
    explanation: "To be completed with the centre's events calendar.",
  },

  // ── ELECTROPLANET ──
  "electroplanet-1": {
    questionText: "What do you mainly find at ELECTROPLANET?",
    options: [
      "Clothing",
      "Home appliances and consumer electronics",
      "Books",
      "Garden furniture",
    ],
    explanation:
      "ELECTROPLANET sells home appliances, multimedia and consumer electronics.",
  },
  "electroplanet-2": {
    questionText: "Which of these departments would you expect at ELECTROPLANET?",
    options: ["Bakery", "Perfumery", "Phones and computing", "Jewellery"],
    explanation:
      "Phones, computing, TV and audio are the heart of the offer.",
  },
  "electroplanet-3": {
    questionText: "Which service most often comes with a large appliance?",
    options: [
      "Delivery and installation",
      "Alterations",
      "Gift wrapping only",
      "Dry cleaning",
    ],
    explanation:
      "Large appliances come with delivery and, depending on the product, installation.",
  },

  // ── PLANET SPORT ──
  "planet-sport-1": {
    questionText: "Which family of products does PLANET SPORT sell?",
    options: [
      "Sports goods",
      "Groceries",
      "Baby products",
      "Home decoration",
    ],
    explanation:
      "The shop brings together sports equipment, clothing and footwear.",
  },
  "planet-sport-2": {
    questionText:
      "For running regularly, which criterion matters most when choosing a shoe?",
    options: [
      "The colour",
      "Cushioning and support",
      "The brand alone",
      "The weight of the box",
    ],
    explanation:
      "Cushioning and support protect the joints over distance.",
  },
  "planet-sport-3": {
    questionText: "Which of these belongs in the fitness department?",
    options: ["A yoga mat", "A teapot", "A school bag", "A lampshade"],
    explanation: "A yoga mat is part of fitness equipment.",
  },

  // ── FACES ──
  "faces-1": {
    questionText: "Which world does FACES belong to?",
    options: ["Sport", "Beauty", "Furniture", "Optics"],
    explanation: "FACES is a beauty retailer: make-up, fragrance and skincare.",
  },
  "faces-2": {
    questionText: "Which of these products is make-up?",
    options: ["A mascara", "A shampoo", "A deodorant", "A toothpaste"],
    explanation:
      "Mascara is a make-up product; the others are toiletries.",
  },
  "faces-3": {
    questionText: "What does “facial skincare” mean in a beauty shop?",
    options: [
      "A haircut",
      "A product or routine for the skin of the face",
      "A foot massage",
      "A clothing alteration",
    ],
    explanation:
      "Facial skincare covers cleansers, serums and creams made for the skin of the face.",
  },
};

export type BadgeCopy = { name: string; description: string };

export const BADGE_EN: Record<string, BadgeCopy> = {
  explorer: { name: "Explorer", description: "Visit 3 shops in the mall" },
  "grand-explorer": {
    name: "Grand Explorer",
    description: "Visit every shop in the mall",
  },
  apprentice: { name: "Apprentice", description: "Answer 3 questions correctly" },
  quizmaster: { name: "Quiz Master", description: "Answer every question" },
  scholar: { name: "Scholar", description: "Answer 8 questions correctly" },
  champion: { name: "Mall Champion", description: "Reach 500 XP" },
};

export type RewardCopy = {
  title: string;
  description: string;
  storeName: string;
};

export const REWARD_EN: Record<string, RewardCopy> = {
  r1: {
    title: "Discount voucher",
    description: "A voucher to use in participating shops.",
    storeName: "The whole mall",
  },
  r2: {
    title: "Fashion discount",
    description: "On ready-to-wear at participating shops.",
    storeName: "Fashion shops",
  },
  r3: {
    title: "Beauty offer",
    description: "On skincare and fragrance.",
    storeName: "Beauty",
  },
  r4: {
    title: "Super discount",
    description: "The reward for completing the whole trail.",
    storeName: "The whole mall",
  },
};
