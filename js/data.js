/**
 * Opti'Noisy Pizzeria - Base de données des produits et configurations
 * MMI3 - TP Web Mobile Capacitor 2026
 */

const PIZZERIA_CONFIG = {
  name: "Opti'Noisy Pizzeria",
  slogan: "Pizzas artisanales cuites au feu de bois",
  address: "12 Avenue Aristide Briand, 93160 Noisy-le-Grand",
  phone: "01 43 05 12 34",
  email: "contact@optinoisy-pizza.fr",
  lat: 48.8485,
  lng: 2.5532,
  deliveryFee: 2.50,
  freeDeliveryThreshold: 25.00,
  estimatedTime: "25 - 35 min",
  openingHours: "7j/7 : 11h30 - 14h30 / 18h00 - 23h00",
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
    label: "1 personne"
  },
  {
    id: "moyenne",
    name: "Moyenne",
    size: "31 cm",
    factor: 1.35,
    priceBonus: 4.00,
    icon: "assets/picto-pizza-moyenne-31.svg",
    iconWhite: "assets/picto-pizza-moyenne-31-blanc.svg",
    label: "1-2 personnes",
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
    label: "3-4 personnes"
  }
];

const MENU_DATA = {
  heroSlides: [
    {
      image: "assets/OPTINOISY-Mob-visuel-intro.jpg",
      title: "Des pizzas cuites au feu de bois",
      subtitle: "Pâte pétrie chaque matin et ingrédients 100% frais d'Italie"
    },
    {
      image: "assets/OPTINOISY-Mob-visuel-intro2.jpg",
      title: "Recettes traditionnelles & modernes",
      subtitle: "Plus de 22 créations gourmandes pour tous les goûts"
    },
    {
      image: "assets/OPTINOISY-Mob-visuel-intro3.jpg",
      title: "Livraison rapide chez vous",
      subtitle: "Suivez votre livreur en temps réel avec notre géolocalisation"
    },
    {
      image: "assets/OPTINOISY-Mob-visuel-intro4.jpg",
      title: "Disponible sur Uber Eats & Deliveroo",
      subtitle: "Commandez directement sur notre app ou vos plateformes préférées"
    }
  ],

  pizzas: [
    {
      id: "marguerita",
      name: "Margherita",
      category: "Classique",
      description: "Sauce tomate maison au basilic frais, mozzarella fior di latte, huile d'olive vierge extra, origan.",
      basePrice: 9.50,
      image: "assets/OPTINOISY-Mob-pizza-marguerita.jpg",
      badge: "Végétarien",
      isSpicy: false,
      isVegetarian: true
    },
    {
      id: "reine",
      name: "Reine",
      category: "Classique",
      description: "Sauce tomate, mozzarella fior di latte, jambon blanc supérieur, champignons de Paris frais, origan.",
      basePrice: 10.90,
      image: "assets/OPTINOISY-Mob-pizza-reine.jpg",
      badge: "Incontournable",
      isSpicy: false,
      isVegetarian: false
    },
    {
      id: "regina",
      name: "Regina",
      category: "Classique",
      description: "Sauce tomate, mozzarella, jambon cuit au torchon, champignons frais sautés, olives noires de Calabre.",
      basePrice: 11.20,
      image: "assets/OPTINOISY-Mob-pizza-regina.jpg",
      badge: "Best-seller",
      isSpicy: false,
      isVegetarian: false
    },
    {
      id: "4-fromages",
      name: "4 Fromages",
      category: "Fromagère",
      description: "Sauce tomate, mozzarella fior di latte, fromage de chèvre affiné, emmental doux, gorgonzola crémeux AOP.",
      basePrice: 11.90,
      image: "assets/OPTINOISY-Mob-pizza-4-fromages.jpg",
      badge: "Gourmande",
      isSpicy: false,
      isVegetarian: true
    },
    {
      id: "4-saisons",
      name: "4 Saisons",
      category: "Classique",
      description: "Sauce tomate, mozzarella, jambon supérieur, cœurs d'artichauts marinés, champignons frais, olives noires.",
      basePrice: 11.90,
      image: "assets/OPTINOISY-Mob-pizza-4-saisons.jpg",
      badge: "Tradition",
      isSpicy: false,
      isVegetarian: false
    },
    {
      id: "calzone",
      name: "Calzone Soufflée",
      category: "Spécialité",
      description: "En chausson : Sauce tomate, mozzarella fondante, jambon blanc supérieur, œuf bio au cœur fondant, origan.",
      basePrice: 11.90,
      image: "assets/OPTINOISY-Mob-pizza-calzone.jpg",
      badge: "Chausson",
      isSpicy: false,
      isVegetarian: false
    },
    {
      id: "chevre-miel",
      name: "Chèvre Miel & Noix",
      category: "Gourmande",
      description: "Base crème fraîche d'Isigny, mozzarella fior di latte, bûche de chèvre gratinée, filet de miel d'acacia, cerneaux de noix.",
      basePrice: 12.20,
      image: "assets/OPTINOISY-Mob-pizza-chevre-miel.jpg",
      badge: "Coup de cœur",
      isSpicy: false,
      isVegetarian: true
    },
    {
      id: "savoyarde",
      name: "Savoyarde",
      category: "Montagnarde",
      description: "Crème fraîche, mozzarella, pommes de terre rissolées, lardons paysans fumés, véritable Reblochon AOP.",
      basePrice: 12.50,
      image: "assets/OPTINOISY-Mob-pizza-savoyarde.jpg",
      badge: "Hivernal",
      isSpicy: false,
      isVegetarian: false
    },
    {
      id: "paysanne",
      name: "Paysanne",
      category: "Campagnarde",
      description: "Crème fraîche épaisse, mozzarella, lardons fumés, oignons doux caramélisés, champignons de Paris, persillade.",
      basePrice: 11.50,
      image: "assets/OPTINOISY-Mob-pizza-paysanne.jpg",
      badge: "Généreuse",
      isSpicy: false,
      isVegetarian: false
    },
    {
      id: "barbecue",
      name: "Barbecue Steak",
      category: "Carnivore",
      description: "Sauce barbecue fumée, mozzarella, pur bœuf haché assaisonné, oignons rouges croustillants, poivrons marinés.",
      basePrice: 11.90,
      image: "assets/OPTINOISY-Mob-pizza-barbecue.jpg",
      badge: "Smoky",
      isSpicy: false,
      isVegetarian: false
    },
    {
      id: "cannibale",
      name: "La Cannibale",
      category: "Carnivore",
      description: "Sauce tomate mijotée, mozzarella, émincé de poulet, viande hachée marinée, merguez artisanale, sauce burger maison.",
      basePrice: 12.90,
      image: "assets/OPTINOISY-Mob-pizza-cannibale.jpg",
      badge: "Maxi Viande",
      isSpicy: false,
      isVegetarian: false
    },
    {
      id: "campione",
      name: "Campione",
      category: "Carnivore",
      description: "Sauce tomate, mozzarella fior di latte, viande hachée assaisonnée, champignons frais émincés, œuf miroir.",
      basePrice: 11.90,
      image: "assets/OPTINOISY-Mob-pizza-campione.jpg",
      badge: "Énergique",
      isSpicy: false,
      isVegetarian: false
    },
    {
      id: "poulet",
      name: "Poulet Rôti",
      category: "Volailles",
      description: "Sauce tomate ou crème, mozzarella, aiguillettes de poulet rôti aux herbes de Provence, poivrons doux, origan.",
      basePrice: 11.50,
      image: "assets/OPTINOISY-Mob-pizza-poulet.jpg",
      badge: "Tendre",
      isSpicy: false,
      isVegetarian: false
    },
    {
      id: "curry",
      name: "Poulet Curry Exotique",
      category: "Épicée",
      description: "Crème onctueuse au curry doux de Madras, mozzarella, émincé de poulet mariné, oignons rouges, poivrons.",
      basePrice: 12.00,
      image: "assets/OPTINOISY-Mob-pizza-curry.jpg",
      badge: "Épicée",
      isSpicy: true,
      isVegetarian: false
    },
    {
      id: "mexicaine",
      name: "Mexicaine Caliente",
      category: "Épicée",
      description: "Sauce tomate aux piments, mozzarella, bœuf haché épicé, piments jalapeños rouges, poivrons croquants, maïs.",
      basePrice: 12.20,
      image: "assets/OPTINOISY-Mob-pizza-mexicaine.jpg",
      badge: "Pimentée",
      isSpicy: true,
      isVegetarian: false
    },
    {
      id: "kebab",
      name: "Kebab D'Or",
      category: "Spécialité",
      description: "Sauce blanche ciboulette, mozzarella, lamelles de kebab grillé à la broche, oignons doux, rondelles de tomate.",
      basePrice: 12.00,
      image: "assets/OPTINOISY-Mob-pizza-kebab.jpg",
      badge: "Street-Food",
      isSpicy: false,
      isVegetarian: false
    },
    {
      id: "napolitaine",
      name: "Napolitaine Authentique",
      category: "Marinière",
      description: "Sauce tomate San Marzano, mozzarella, filets d'anchois marinés, câpres au vinaigre, olives noires de Gaeta.",
      basePrice: 11.20,
      image: "assets/OPTINOISY-Mob-pizza-napolitaine.jpg",
      badge: "Caractère",
      isSpicy: false,
      isVegetarian: false
    },
    {
      id: "sicilienne",
      name: "Sicilienne",
      category: "Marinière",
      description: "Sauce tomate, mozzarella, anchois salés, câpres, olives noires, poivrons marinés, origan de Sicile.",
      basePrice: 11.50,
      image: "assets/OPTINOISY-Mob-pizza-sicilienne.jpg",
      badge: "Méditerranée",
      isSpicy: false,
      isVegetarian: false
    },
    {
      id: "norvegienne",
      name: "Norvégienne",
      category: "Marinière",
      description: "Crème fraîche légère, mozzarella, savoureux saumon fumé de Norvège, zeste de citron jaune, aneth fraîche.",
      basePrice: 12.90,
      image: "assets/OPTINOISY-Mob-pizza-norvegienne.jpg",
      badge: "Prestige",
      isSpicy: false,
      isVegetarian: false
    },
    {
      id: "fruits-mer",
      name: "Fruits de Mer",
      category: "Marinière",
      description: "Sauce tomate cuisinée, mozzarella, cocktail de crevettes roses, moules, calamars, persillade fraîche au beurre aillé.",
      basePrice: 12.90,
      image: "assets/OPTINOISY-Mob-pizza-fruits-mer.jpg",
      badge: "Iodée",
      isSpicy: false,
      isVegetarian: false
    },
    {
      id: "vegetarienne",
      name: "Jardin Végétarien",
      category: "Végétarienne",
      description: "Sauce tomate, mozzarella, courgettes grillées, poivrons rouges et jaunes, champignons frais, tomates cerises, origan.",
      basePrice: 10.90,
      image: "assets/OPTINOISY-Mob-pizza-vegetarienne.jpg",
      badge: "100% Veggie",
      isSpicy: false,
      isVegetarian: true
    },
    {
      id: "hawayenne",
      name: "Hawaïenne Sucré-Salé",
      category: "Spécialité",
      description: "Sauce tomate douce, mozzarella fior di latte, jambon cuit, morceaux d'ananas frais caramélisés au four.",
      basePrice: 11.00,
      image: "assets/OPTINOISY-Mob-pizza-hawayenne.jpg",
      badge: "Exotique",
      isSpicy: false,
      isVegetarian: false
    }
  ],

  salades: [
    {
      id: "salade-cesar",
      name: "Salade César",
      category: "Salade",
      description: "Cœur de salade romaine croquante, émincé de poulet rôti pané, copeaux de Grana Padano, croûtons à l'ail, sauce César crémeuse.",
      price: 7.90,
      image: "assets/OPTINOISY-Mob-salade-cesar.jpg",
      badge: "Fraîcheur"
    },
    {
      id: "salade-oceane",
      name: "Salade Océane",
      category: "Salade",
      description: "Mélange de jeunes pousses, saumon fumé d'Atlantique, crevettes roses décortiquées, avocat, tomates cerises, vinaigrette au citron vert.",
      price: 8.50,
      image: "assets/OPTINOISY-Mob-salade-oceane.jpg",
      badge: "Gourmande"
    },
    {
      id: "salade-fruits",
      name: "Salade de Fruits de Saison",
      category: "Dessert",
      description: "Composition fraîche de fraises, ananas, melon, raisins et myrtilles avec un sirop léger à la menthe douce.",
      price: 4.50,
      image: "assets/OPTINOISY-Mob-salade-fruits.jpg",
      badge: "Dessert Frais"
    }
  ]
};
