import type { Store } from "./types";

export const STORES: Store[] = [
  {
    slug: "zara",
    name: "ZARA",
    logo: "/stores/zara.svg",
    description:
      "ZARA est une enseigne de mode internationale proposant les dernières tendances en prêt-à-porter pour homme, femme et enfant.",
    category: "Mode",
    products: [
      { id: "z1", name: "Blazer Oversize", image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop", price: "599 MAD" },
      { id: "z2", name: "Jean Slim Fit", image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop", price: "349 MAD" },
      { id: "z3", name: "T-shirt Basique", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop", price: "149 MAD" },
    ],
    offers: [
      {
        id: "zo1",
        title: "Nouvelle Collection",
        description: "Découvrez la collection Automne-Hiver avec -15% sur votre premier achat",
        discount: "-15%",
      },
    ],
  },
  {
    slug: "flo",
    name: "FLO",
    logo: "/stores/flo.svg",
    description:
      "FLO est une marque de chaussures et accessoires offrant style et confort à prix accessibles.",
    category: "Chaussures",
    products: [
      { id: "f1", name: "Baskets Urbaines", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop", price: "399 MAD" },
      { id: "f2", name: "Mocassins Cuir", image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400&h=400&fit=crop", price: "499 MAD" },
      { id: "f3", name: "Sandales Été", image: "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400&h=400&fit=crop", price: "299 MAD" },
    ],
    offers: [
      {
        id: "fo1",
        title: "Offre Duo",
        description: "Achetez 2 paires et bénéficiez de -20% sur la deuxième",
        discount: "-20%",
      },
    ],
  },
  {
    slug: "guess",
    name: "GUESS",
    logo: "/stores/guess.svg",
    description:
      "GUESS est une marque lifestyle américaine connue pour son style glamour et ses accessoires iconiques.",
    category: "Mode",
    products: [
      { id: "g1", name: "Montre Classique", image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop", price: "1 299 MAD" },
      { id: "g2", name: "Sac à Main Logo", image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop", price: "899 MAD" },
      { id: "g3", name: "Lunettes de Soleil", image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&h=400&fit=crop", price: "699 MAD" },
    ],
    offers: [
      {
        id: "go1",
        title: "Accessoires Premium",
        description: "-15% sur toute la collection d'accessoires",
        discount: "-15%",
      },
    ],
  },
  {
    slug: "birkenstock",
    name: "BIRKENSTOCK",
    logo: "/stores/birkenstock.svg",
    description:
      "BIRKENSTOCK propose des sandales et chaussures ergonomiques fabriquées en Allemagne depuis 1774.",
    category: "Chaussures",
    products: [
      { id: "b1", name: "Arizona Classic", image: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=400&h=400&fit=crop", price: "899 MAD" },
      { id: "b2", name: "Boston Suede", image: "https://images.unsplash.com/photo-1605733160314-4fc7dac4bb16?w=400&h=400&fit=crop", price: "1 099 MAD" },
      { id: "b3", name: "Gizeh Birko-Flor", image: "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400&h=400&fit=crop", price: "799 MAD" },
    ],
    offers: [
      {
        id: "bo1",
        title: "Confort Garanti",
        description: "Livraison gratuite sur toutes les commandes",
        discount: "Gratuit",
      },
    ],
  },
  {
    slug: "mango",
    name: "MANGO",
    logo: "/stores/mango.svg",
    description:
      "MANGO est une marque de mode méditerranéenne offrant des vêtements élégants et contemporains.",
    category: "Mode",
    products: [
      { id: "m1", name: "Robe Midi Fluide", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop", price: "499 MAD" },
      { id: "m2", name: "Manteau Laine", image: "https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=400&h=400&fit=crop", price: "1 199 MAD" },
      { id: "m3", name: "Chemise Lin", image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop", price: "349 MAD" },
    ],
    offers: [
      {
        id: "mo1",
        title: "Mid-Season Sale",
        description: "Jusqu'à -30% sur une sélection d'articles",
        discount: "-30%",
      },
    ],
  },
  {
    slug: "sephora",
    name: "SEPHORA",
    logo: "/stores/sephora.svg",
    description:
      "SEPHORA est le leader mondial de la distribution de parfums et cosmétiques, offrant une expérience beauté unique.",
    category: "Beauté",
    products: [
      { id: "s1", name: "Palette Yeux Prestige", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop", price: "449 MAD" },
      { id: "s2", name: "Sérum Vitamine C", image: "https://images.unsplash.com/photo-1570194065650-d99fb4b38b17?w=400&h=400&fit=crop", price: "349 MAD" },
      { id: "s3", name: "Coffret Parfum", image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop", price: "799 MAD" },
    ],
    offers: [
      {
        id: "so1",
        title: "Beauty Week",
        description: "Un mini-produit offert dès 300 MAD d'achat",
        discount: "Cadeau",
      },
    ],
  },
  {
    slug: "nike",
    name: "Nike",
    logo: "/stores/nike.svg",
    description:
      "Nike est la marque de sport la plus emblématique au monde, alliant performance et style.",
    category: "Sport",
    products: [
      { id: "n1", name: "Air Max 90", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop", price: "1 299 MAD" },
      { id: "n2", name: "Dri-FIT T-Shirt", image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400&h=400&fit=crop", price: "299 MAD" },
      { id: "n3", name: "Tech Fleece Jogger", image: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400&h=400&fit=crop", price: "899 MAD" },
    ],
    offers: [
      {
        id: "no1",
        title: "Back to Sport",
        description: "-15% sur la collection Training avec le code SPORT15",
        discount: "-15%",
      },
    ],
  },
  {
    slug: "paul",
    name: "PAUL",
    logo: "/stores/paul.svg",
    description:
      "PAUL est une boulangerie-pâtisserie française artisanale proposant pains, viennoiseries et restauration.",
    category: "Alimentation",
    products: [
      { id: "p1", name: "Croissant Pur Beurre", image: "https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=400&h=400&fit=crop", price: "18 MAD" },
      { id: "p2", name: "Pain de Campagne", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop", price: "35 MAD" },
      { id: "p3", name: "Éclair au Chocolat", image: "https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=400&h=400&fit=crop", price: "28 MAD" },
    ],
    offers: [
      {
        id: "po1",
        title: "Formule Déjeuner",
        description: "Sandwich + Boisson + Dessert à 75 MAD",
        discount: "75 MAD",
      },
    ],
  },
];
