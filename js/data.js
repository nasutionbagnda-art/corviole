/**
 * Opti'Noisy Pizzeria - Base de données & Configurations
 * Style & Structure inspirés de Five Pizza Original
 */

const PIZZERIA_CONFIG = {
  name: "Opti'Noisy Original",
  brand: "Five Pizza Style",
  slogan: "Par vous, pour tous. Pizzas artisanales cuites au feu de bois.",
  address: "12 Avenue Aristide Briand, 93160 Noisy-le-Grand",
  phone: "01 43 05 12 34",
  email: "contact@optinoisy-pizza.fr",
  lat: 48.8485,
  lng: 2.5532,
  deliveryFee: 2.50,
  freeDeliveryThreshold: 25.00,
  estimatedTime: "20 - 30 min",
  openingHours: "7j/7 : 11h30 - 14h30 / 18h00 - 23h30",
  uberEatsUrl: "https://www.ubereats.com/fr",
  deliverooUrl: "https://deliveroo.fr/fr"
};

const PIZZA_SIZES = [
  {
    id: "junior",
    name: "Junior",
    size: "26 cm",
    factor: 1.0,
    priceBonus: 0,
    icon: "assets/picto-pizza-junior-26.svg",
    iconWhite: "assets/picto-pizza-junior-26-blanc.svg",
    label: "Format solo"
  },
  {
    id: "moyenne",
    name: "Moyenne",
    size: "31 cm",
    factor: 1.35,
    priceBonus: 4.00,
    icon: "assets/picto-pizza-moyenne-31.svg",
    iconWhite: "assets/picto-pizza-moyenne-31-blanc.svg",
    label: "1 - 2 personnes",
    popular: true
  },
  {
    id: "familiale",
    name: "Familiale",
    size: "40 cm",
    factor: 1.85,
    priceBonus: 8.50,
    icon: "assets/picto-pizza-familiale-40.svg",
    iconWhite: "assets/picto-pizza-familiale-40-blanc.svg",
    label: "3 - 4 personnes"
  }
];

const MENU_DATA = {
  heroSlides: [
    {
      image: "assets/OPTINOISY-Mob-visuel-intro.jpg",
      title: "PAR VOUS, POUR TOUS",
      subtitle: "Pizzas artisanales au feu de bois dès 9€50. Sur place, à emporter ou en livraison chrono."
    },
    {
      image: "assets/OPTINOISY-Mob-visuel-intro2.jpg",
      title: "PÂTE FRAÎCHE PÉTRIE DU JOUR",
      subtitle: "Ingrédients italiens de première fraîcheur et mozzarella fior di latte fondante."
    },
    {
      image: "assets/OPTINOISY-Mob-visuel-intro3.jpg",
      title: "LIVRAISON CHRONO GÉOLOCALISÉE",
      subtitle: "Suivez votre livreur en temps réel de notre fournil jusqu'à votre porte."
    },
    {
      image: "assets/OPTINOISY-Mob-visuel-intro4.jpg",
      title: "REJOIGNEZ LE FIVE CLUB",
      subtitle: "Cumulez des avantages exclusifs et débloquez vos pizzas gratuites."
    }
  ],

  deals: [
    {
      badge: "MENU FIVE MIDI",
      title: "Formule Solo Express",
      desc: "1 Pizza Junior ou Moyenne + 1 Boisson 33cl ou Salade de fruits.",
      price: "11.90 €",
      highlight: true
    },
    {
      badge: "DUO GOURMAND",
      title: "Offre 2 Pizzas Moyennes",
      desc: "2 Pizzas Moyennes achetées = -10% immédiat avec le code promo OPTI10.",
      price: "Dès 22.90 €",
      highlight: false
    },
    {
      badge: "FIVE CLUB FIDÉLITÉ",
      title: "Programme Fidélité",
      desc: "Créez votre compte, cumulez 10 points et gagnez 1 Pizza Junior offerte !",
      price: "Gratuit",
      highlight: false
    }
  ],

  concepts: [
    {
      icon: "🍕",
      title: "Pâte Fraîche Artisanale",
      desc: "Farine de blé sélectionnée, levain naturel et repos de 48h pour une pâte aérée et digeste."
    },
    {
      icon: "🧀",
      title: "Ingrédients 100% Frais",
      desc: "Légumes découpés chaque matin, vraie mozzarella fior di latte et charcuteries de qualité."
    },
    {
      icon: "🔥",
      title: "Cuisson Minute 450°C",
      desc: "Cuite à la flamme au feu de bois pour une croûte dorée, croustillante et moelleuse."
    },
    {
      icon: "🛵",
      title: "Livraison Chrono & GPS",
      desc: "Livraison à domicile en 20 à 30 min avec géolocalisation et suivi du livreur en temps réel."
    }
  ],

  pizzas: [
    {
      id: "marguerita",
      name: "Margherita",
      base: "tomate",
      category: "Base Tomate",
      description: "Sauce tomate maison au basilic frais, mozzarella fior di latte, huile d'olive vierge extra, origan.",
      basePrice: 9.50,
      image: "assets/OPTINOISY-Mob-pizza-marguerita.jpg",
      badge: "Végétarien",
      isVegetarian: true
    },
    {
      id: "reine",
      name: "Reine",
      base: "tomate",
      category: "Base Tomate",
      description: "Sauce tomate, mozzarella fior di latte, jambon blanc supérieur, champignons de Paris frais, origan.",
      basePrice: 10.90,
      image: "assets/OPTINOISY-Mob-pizza-reine.jpg",
      badge: "Incontournable",
      isVegetarian: false
    },
    {
      id: "regina",
      name: "Regina",
      base: "tomate",
      category: "Base Tomate",
      description: "Sauce tomate, mozzarella, jambon cuit au torchon, champignons frais sautés, olives noires de Calabre.",
      basePrice: 11.20,
      image: "assets/OPTINOISY-Mob-pizza-regina.jpg",
      badge: "Best-seller",
      isVegetarian: false
    },
    {
      id: "4-fromages",
      name: "4 Fromages",
      base: "tomate",
      category: "Base Tomate",
      description: "Sauce tomate, mozzarella fior di latte, fromage de chèvre affiné, emmental doux, gorgonzola crémeux AOP.",
      basePrice: 11.90,
      image: "assets/OPTINOISY-Mob-pizza-4-fromages.jpg",
      badge: "Gourmande",
      isVegetarian: true
    },
    {
      id: "4-saisons",
      name: "4 Saisons",
      base: "tomate",
      category: "Base Tomate",
      description: "Sauce tomate, mozzarella, jambon supérieur, cœurs d'artichauts marinés, champignons frais, olives noires.",
      basePrice: 11.90,
      image: "assets/OPTINOISY-Mob-pizza-4-saisons.jpg",
      badge: "Tradition",
      isVegetarian: false
    },
    {
      id: "calzone",
      name: "Calzone Soufflée",
      base: "speciale",
      category: "Spécialités",
      description: "En chausson : Sauce tomate, mozzarella fondante, jambon blanc supérieur, œuf bio au cœur fondant, origan.",
      basePrice: 11.90,
      image: "assets/OPTINOISY-Mob-pizza-calzone.jpg",
      badge: "Chausson",
      isVegetarian: false
    },
    {
      id: "chevre-miel",
      name: "Chèvre Miel & Noix",
      base: "creme",
      category: "Base Crème",
      description: "Base crème fraîche d'Isigny, mozzarella fior di latte, bûche de chèvre gratinée, filet de miel d'acacia, cerneaux de noix.",
      basePrice: 12.20,
      image: "assets/OPTINOISY-Mob-pizza-chevre-miel.jpg",
      badge: "Coup de cœur",
      isVegetarian: true
    },
    {
      id: "savoyarde",
      name: "Savoyarde",
      base: "creme",
      category: "Base Crème",
      description: "Crème fraîche, mozzarella, pommes de terre rissolées, lardons paysans fumés, véritable Reblochon AOP.",
      basePrice: 12.50,
      image: "assets/OPTINOISY-Mob-pizza-savoyarde.jpg",
      badge: "Montagnarde",
      isVegetarian: false
    },
    {
      id: "paysanne",
      name: "Paysanne",
      base: "creme",
      category: "Base Crème",
      description: "Crème fraîche épaisse, mozzarella, lardons fumés, oignons doux caramélisés, champignons de Paris, persillade.",
      basePrice: 11.50,
      image: "assets/OPTINOISY-Mob-pizza-paysanne.jpg",
      badge: "Campagnarde",
      isVegetarian: false
    },
    {
      id: "barbecue",
      name: "Barbecue Steak",
      base: "speciale",
      category: "Spécialités",
      description: "Sauce barbecue fumée, mozzarella, pur bœuf haché assaisonné, oignons rouges croustillants, poivrons marinés.",
      basePrice: 11.90,
      image: "assets/OPTINOISY-Mob-pizza-barbecue.jpg",
      badge: "Smoky",
      isVegetarian: false
    },
    {
      id: "cannibale",
      name: "La Cannibale",
      base: "tomate",
      category: "Base Tomate",
      description: "Sauce tomate mijotée, mozzarella, émincé de poulet, viande hachée marinée, merguez artisanale, sauce burger maison.",
      basePrice: 12.90,
      image: "assets/OPTINOISY-Mob-pizza-cannibale.jpg",
      badge: "Maxi Viande",
      isVegetarian: false
    },
    {
      id: "campione",
      name: "Campione",
      base: "tomate",
      category: "Base Tomate",
      description: "Sauce tomate, mozzarella fior di latte, viande hachée assaisonnée, champignons frais émincés, œuf miroir.",
      basePrice: 11.90,
      image: "assets/OPTINOISY-Mob-pizza-campione.jpg",
      badge: "Énergique",
      isVegetarian: false
    },
    {
      id: "poulet",
      name: "Poulet Rôti",
      base: "tomate",
      category: "Base Tomate",
      description: "Sauce tomate, mozzarella, aiguillettes de poulet rôti aux herbes de Provence, poivrons doux, origan.",
      basePrice: 11.50,
      image: "assets/OPTINOISY-Mob-pizza-poulet.jpg",
      badge: "Tendre",
      isVegetarian: false
    },
    {
      id: "curry",
      name: "Poulet Curry Exotique",
      base: "creme",
      category: "Base Crème",
      description: "Crème onctueuse au curry doux de Madras, mozzarella, émincé de poulet mariné, oignons rouges, poivrons.",
      basePrice: 12.00,
      image: "assets/OPTINOISY-Mob-pizza-curry.jpg",
      badge: "Épicée",
      isVegetarian: false
    },
    {
      id: "mexicaine",
      name: "Mexicaine Caliente",
      base: "tomate",
      category: "Base Tomate",
      description: "Sauce tomate aux piments, mozzarella, bœuf haché épicé, piments jalapeños rouges, poivrons croquants, maïs.",
      basePrice: 12.20,
      image: "assets/OPTINOISY-Mob-pizza-mexicaine.jpg",
      badge: "Pimentée",
      isVegetarian: false
    },
    {
      id: "kebab",
      name: "Kebab D'Or",
      base: "speciale",
      category: "Spécialités",
      description: "Sauce blanche ciboulette, mozzarella, lamelles de kebab grillé à la broche, oignons doux, rondelles de tomate.",
      basePrice: 12.00,
      image: "assets/OPTINOISY-Mob-pizza-kebab.jpg",
      badge: "Street-Food",
      isVegetarian: false
    },
    {
      id: "napolitaine",
      name: "Napolitaine Authentique",
      base: "tomate",
      category: "Base Tomate",
      description: "Sauce tomate San Marzano, mozzarella, filets d'anchois marinés, câpres au vinaigre, olives noires de Gaeta.",
      basePrice: 11.20,
      image: "assets/OPTINOISY-Mob-pizza-napolitaine.jpg",
      badge: "Caractère",
      isVegetarian: false
    },
    {
      id: "sicilienne",
      name: "Sicilienne",
      base: "tomate",
      category: "Base Tomate",
      description: "Sauce tomate, mozzarella, anchois salés, câpres, olives noires, poivrons marinés, origan de Sicile.",
      basePrice: 11.50,
      image: "assets/OPTINOISY-Mob-pizza-sicilienne.jpg",
      badge: "Méditerranée",
      isVegetarian: false
    },
    {
      id: "norvegienne",
      name: "Norvégienne",
      base: "creme",
      category: "Base Crème",
      description: "Crème fraîche légère, mozzarella, savoureux saumon fumé de Norvège, zeste de citron jaune, aneth fraîche.",
      basePrice: 12.90,
      image: "assets/OPTINOISY-Mob-pizza-norvegienne.jpg",
      badge: "Prestige",
      isVegetarian: false
    },
    {
      id: "fruits-mer",
      name: "Fruits de Mer",
      base: "tomate",
      category: "Base Tomate",
      description: "Sauce tomate cuisinée, mozzarella, cocktail de crevettes roses, moules, calamars, persillade fraîche au beurre aillé.",
      basePrice: 12.90,
      image: "assets/OPTINOISY-Mob-pizza-fruits-mer.jpg",
      badge: "Iodée",
      isVegetarian: false
    },
    {
      id: "vegetarienne",
      name: "Jardin Végétarien",
      base: "tomate",
      category: "Base Tomate",
      description: "Sauce tomate, mozzarella, courgettes grillées, poivrons rouges et jaunes, champignons frais, tomates cerises, origan.",
      basePrice: 10.90,
      image: "assets/OPTINOISY-Mob-pizza-vegetarienne.jpg",
      badge: "100% Veggie",
      isVegetarian: true
    },
    {
      id: "hawayenne",
      name: "Hawaïenne Sucré-Salé",
      base: "speciale",
      category: "Spécialités",
      description: "Sauce tomate douce, mozzarella fior di latte, jambon cuit, morceaux d'ananas frais caramélisés au four.",
      basePrice: 11.00,
      image: "assets/OPTINOISY-Mob-pizza-hawayenne.jpg",
      badge: "Exotique",
      isVegetarian: false
    }
  ],

  salades: [
    {
      id: "salade-cesar",
      name: "Salade César",
      category: "Salade",
      description: "Cœur de salade romaine croquante, émincé de poulet rôti pané, copeaux de Grana Padano, croûtons à l'ail, sauce César.",
      price: 7.90,
      image: "assets/OPTINOISY-Mob-salade-cesar.jpg",
      badge: "Fraîcheur"
    },
    {
      id: "salade-oceane",
      name: "Salade Océane",
      category: "Salade",
      description: "Mélange de jeunes pousses, saumon fumé d'Atlantique, crevettes roses décortiquées, avocat, tomates cerises, citron vert.",
      price: 8.50,
      image: "assets/OPTINOISY-Mob-salade-oceane.jpg",
      badge: "Gourmande"
    },
    {
      id: "salade-fruits",
      name: "Salade de Fruits Frais",
      category: "Dessert",
      description: "Composition fraîche de fraises, ananas, melon, raisins et myrtilles avec un sirop léger à la menthe douce.",
      price: 4.50,
      image: "assets/OPTINOISY-Mob-salade-fruits.jpg",
      badge: "Dessert Frais"
    }
  ]
};
