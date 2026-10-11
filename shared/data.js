/**
 * Opti'Noisy Pizza - Donnees Communes & Configuration
 * TP MMI3 Web Mobile - Octobre 2026
 */

const PIZZERIA_CONFIG = {
  name: "Opti'Noisy Pizza",
  subtitle: "Pizzeria Artisanale au Feu de Bois",
  slogan: "L'art de la pizza napolitaine a Noisy-le-Grand",
  phone: "01 43 05 92 10",
  phoneRaw: "0143059210",
  email: "contact@optinoisy-pizza.fr",
  address: "12 Avenue du Marechal Foch, 93160 Noisy-le-Grand",
  coords: {
    lat: 48.8488,
    lng: 2.5525
  },
  openingHours: "7j/7 - 11h30 a 14h30 / 18h00 a 23h00",
  deliveryZoneRadiusKm: 8.0,
  minOrderDelivery: 15.00,
  freeDeliveryThreshold: 25.00,
  deliveryBaseFee: 2.50,
  estimatedPrepTimeMin: 20,
  estimatedDeliveryTimeMin: 35
};

const PIZZA_SIZES = [
  {
    id: "junior",
    name: "Junior",
    diameter: 26,
    subtext: "26 cm - 1 pers.",
    picto: "picto-pizza-junior-26.svg",
    pictoWhite: "picto-pizza-junior-26-blanc.svg"
  },
  {
    id: "moyenne",
    name: "Moyenne",
    diameter: 31,
    subtext: "31 cm - 1 a 2 pers.",
    picto: "picto-pizza-moyenne-31.svg",
    pictoWhite: "picto-pizza-moyenne-31-blanc.svg",
    default: true
  },
  {
    id: "familiale",
    name: "Familiale",
    diameter: 40,
    subtext: "40 cm - 3 a 4 pers.",
    picto: "picto-pizza-familiale-40.svg",
    pictoWhite: "picto-pizza-familiale-40-blanc.svg"
  }
];

const MENU_CATEGORIES = [
  { id: "all", label: "Toute la carte", slug: "all" },
  { id: "classiques", label: "Les Classiques", slug: "classiques" },
  { id: "viandes", label: "Viandes & BBQ", slug: "viandes" },
  { id: "fromages", label: "Fromages Fondants", slug: "fromages" },
  { id: "speciales", label: "Specialites Chef", slug: "speciales" },
  { id: "mer", label: "Saveurs Marines", slug: "mer" },
  { id: "veggie", label: "Vegetariennes", slug: "veggie" },
  { id: "salades", label: "Salades & Desserts", slug: "salades" }
];

const EXTRA_INGREDIENTS = [
  { id: "extra-mozza", name: "Double Mozzarella di Bufala", price: 1.50 },
  { id: "extra-piment", name: "Piments Frais & Huile Piquante", price: 0.50 },
  { id: "extra-oeuf", name: "Oeuf Bio au Plat", price: 1.00 },
  { id: "extra-olives", name: "Olives Noires Taggiasche", price: 0.80 },
  { id: "extra-champignons", name: "Champignons de Paris Frais", price: 1.00 },
  { id: "extra-sauce-blanche", name: "Sauce Blanche Ail & Fines Herbes", price: 0.80 }
];

const MENU_ITEMS = [
  {
    id: "marguerita",
    name: "Margherita Tradizionale",
    category: "classiques",
    veggie: true,
    badge: "Classique",
    description: "Sauce tomate San Marzano DOP, mozzarella Fior di Latte fondante, basilic frais, huile d'olive vierge extra pressee a froid.",
    prices: { junior: 8.90, moyenne: 11.90, familiale: 15.90 },
    image: "OPTINOISY-Mob-pizza-marguerita.jpg"
  },
  {
    id: "reine",
    name: "La Reine",
    category: "classiques",
    badge: "Best-Seller",
    description: "Sauce tomate mijotee aux herbes, mozzarella fior di latte, jambon cuit superieur au torchon, champignons de Paris frais.",
    prices: { junior: 9.90, moyenne: 13.50, familiale: 17.90 },
    image: "OPTINOISY-Mob-pizza-reine.jpg"
  },
  {
    id: "regina",
    name: "Regina di Parma",
    category: "classiques",
    badge: "Premium",
    description: "Sauce tomate italienne, mozzarella di Bufala Campana, jambon de Parme affine 18 mois, champignons sautes, olives noires Taggiasche.",
    prices: { junior: 10.90, moyenne: 14.50, familiale: 19.50 },
    image: "OPTINOISY-Mob-pizza-regina.jpg"
  },
  {
    id: "4-fromages",
    name: "4 Fromages Fondants",
    category: "fromages",
    veggie: true,
    badge: "Top Fondant",
    description: "Sauce tomate veloutee, mozzarella filante, gorgonzola doux AOP, fromage de chevre fermier affine, parmesan rape.",
    prices: { junior: 10.50, moyenne: 14.20, familiale: 18.90 },
    image: "OPTINOISY-Mob-pizza-4-fromages.jpg"
  },
  {
    id: "chevre-miel",
    name: "Chevre Chaud & Miel Dore",
    category: "fromages",
    veggie: true,
    badge: "Coup de Coeur",
    description: "Creme fraiche epaisse d'Isigny, mozzarella fior di latte, generouses rondelles de chevre artisanal, filet de miel d'acacia doux, noix.",
    prices: { junior: 10.50, moyenne: 14.20, familiale: 18.90 },
    image: "OPTINOISY-Mob-pizza-chevre-miel.jpg"
  },
  {
    id: "savoyarde",
    name: "La Savoyarde",
    category: "fromages",
    badge: "Gourmande",
    description: "Creme fraiche gourmande, mozzarella, veritable Reblochon fermier AOP au lait cru, lardons fumes, oignons confits, pommes de terre.",
    prices: { junior: 11.20, moyenne: 14.90, familiale: 19.90 },
    image: "OPTINOISY-Mob-pizza-savoyarde.jpg"
  },
  {
    id: "barbecue",
    name: "Barbecue Texas Grill",
    category: "viandes",
    badge: "USA Style",
    description: "Sauce barbecue fumee maison, mozzarella, boeuf hache assaisonne a la texane, oignons rouges confits, poivrons rouges doux.",
    prices: { junior: 10.90, moyenne: 14.50, familiale: 19.20 },
    image: "OPTINOISY-Mob-pizza-barbecue.jpg"
  },
  {
    id: "cannibale",
    name: "La Cannibale 3 Viandes",
    category: "viandes",
    badge: "Maxi Viandes",
    description: "Sauce barbecue epicee, mozzarella, emince de poulet roti aux epices, boeuf pur steak hache emiette, merguez artisanale grillee.",
    prices: { junior: 11.90, moyenne: 15.50, familiale: 20.90 },
    image: "OPTINOISY-Mob-pizza-cannibale.jpg"
  },
  {
    id: "campione",
    name: "Campione d'Italie",
    category: "viandes",
    badge: "Recette Chef",
    description: "Sauce tomate maison, mozzarella fondante, boeuf hache frais assaisonne, champignons de Paris frais, oeuf bio au plat.",
    prices: { junior: 10.90, moyenne: 14.50, familiale: 19.20 },
    image: "OPTINOISY-Mob-pizza-campione.jpg"
  },
  {
    id: "poulet",
    name: "Poulet Roti & Romarin",
    category: "viandes",
    badge: "Volaille",
    description: "Sauce tomate mijotee, mozzarella, tendres aiguillettes de poulet roti dore au romarin, champignons frais, pointe de creme.",
    prices: { junior: 10.20, moyenne: 13.90, familiale: 18.50 },
    image: "OPTINOISY-Mob-pizza-poulet.jpg"
  },
  {
    id: "curry",
    name: "Poulet Curry Exotique",
    category: "speciales",
    badge: "Exotique",
    description: "Creme onctueuse au curry de Madras doux, mozzarella, emince de poulet marine au gingembre, poivrons marines, oignons rouges.",
    prices: { junior: 10.90, moyenne: 14.50, familiale: 19.20 },
    image: "OPTINOISY-Mob-pizza-curry.jpg"
  },
  {
    id: "kebab",
    name: "Orientale Kebab",
    category: "viandes",
    badge: "Gourmand",
    description: "Sauce tomate et pointe de sauce blanche maison, mozzarella, lamelles de veau et dinde facon kebab grillees, oignons rouges, poivrons doux.",
    prices: { junior: 10.90, moyenne: 14.50, familiale: 19.20 },
    image: "OPTINOISY-Mob-pizza-kebab.jpg"
  },
  {
    id: "calzone",
    name: "Calzone Souffle Napolitain",
    category: "speciales",
    badge: "Chausson d'Or",
    description: "Chausson dore cuit au four a bois : coeur fondant sauce tomate San Marzano, mozzarella fior di latte, jambon cuit superieur, oeuf bio.",
    prices: { junior: 10.50, moyenne: 13.90, familiale: 18.90 },
    image: "OPTINOISY-Mob-pizza-calzone.jpg"
  },
  {
    id: "mexicaine",
    name: "Mexicaine Piquante",
    category: "viandes",
    spicy: true,
    badge: "Epice",
    description: "Sauce tomate relevee au piment de Cayenne, mozzarella, boeuf hache epice, piments jalapenos croquants, poivrons rouges, mais doux.",
    prices: { junior: 10.90, moyenne: 14.50, familiale: 19.20 },
    image: "OPTINOISY-Mob-pizza-mexicaine.jpg"
  },
  {
    id: "paysanne",
    name: "La Paysanne Rustique",
    category: "classiques",
    badge: "Terroir",
    description: "Sauce tomate et creme fraiche, mozzarella, lardons fumes au bois de hetre, oignons dores a la poele, pommes de terre, herbes de Provence.",
    prices: { junior: 10.20, moyenne: 13.90, familiale: 18.50 },
    image: "OPTINOISY-Mob-pizza-paysanne.jpg"
  },
  {
    id: "4-saisons",
    name: "Quattro Stagioni (4 Saisons)",
    category: "speciales",
    badge: "Tradition",
    description: "Sauce tomate, mozzarella, coeurs d'artichauts marines alla romana, champignons de Paris, jambon blanc superieur, poivrons rouges rotis.",
    prices: { junior: 10.50, moyenne: 14.20, familiale: 18.90 },
    image: "OPTINOISY-Mob-pizza-4-saisons.jpg"
  },
  {
    id: "vegetarienne",
    name: "Ortolana Vegetarienne",
    category: "veggie",
    veggie: true,
    badge: "100% Veggie",
    description: "Sauce tomate San Marzano, mozzarella, aubergines grillees maison, courgettes fondantes, poivrons doux marines, tomates cerises confites.",
    prices: { junior: 9.90, moyenne: 13.50, familiale: 17.90 },
    image: "OPTINOISY-Mob-pizza-vegetarienne.jpg"
  },
  {
    id: "hawayenne",
    name: "Hawayenne Sucre-Sale",
    category: "speciales",
    badge: "Sucre-Sale",
    description: "Sauce tomate, mozzarella fior di latte, des de jambon blanc cuit au torchon, morceaux d'ananas Victoria juteux caramelises au four.",
    prices: { junior: 9.90, moyenne: 13.50, familiale: 17.90 },
    image: "OPTINOISY-Mob-pizza-hawayenne.jpg"
  },
  {
    id: "napolitaine",
    name: "Napolitaine Authentique",
    category: "mer",
    badge: "Tradition",
    description: "Sauce tomate San Marzano, mozzarella, filets d'anchois de Mediterranee marines a l'huile d'olive, capres au vinaigre de vin, origan sauvage.",
    prices: { junior: 10.20, moyenne: 13.90, familiale: 18.50 },
    image: "OPTINOISY-Mob-pizza-napolitaine.jpg"
  },
  {
    id: "sicilienne",
    name: "Sicilienne Parfumee",
    category: "mer",
    badge: "Mediterranee",
    description: "Sauce tomate intense, mozzarella, anchois de Sicile marines, capres sauvages, olives noires Taggiasche, ail confit et basilic frais.",
    prices: { junior: 10.20, moyenne: 13.90, familiale: 18.50 },
    image: "OPTINOISY-Mob-pizza-sicilienne.jpg"
  },
  {
    id: "norvegienne",
    name: "Norvegienne au Saumon",
    category: "mer",
    badge: "Nordique",
    description: "Creme fraiche epaisse citronnee, mozzarella, fines tranches de saumon fume de Norvege, aneth frais cisele, baies roses et quartier de citron.",
    prices: { junior: 11.90, moyenne: 15.50, familiale: 20.50 },
    image: "OPTINOISY-Mob-pizza-norvegienne.jpg"
  },
  {
    id: "fruits-mer",
    name: "Frutti di Mare (Fruits de Mer)",
    category: "mer",
    badge: "Fruits de Mer",
    description: "Sauce tomate cuisinee, mozzarella filante, cocktail de fruits de mer marines (petits calamars, moules, crevettes), persil plat et filet de citron.",
    prices: { junior: 11.90, moyenne: 15.50, familiale: 20.50 },
    image: "OPTINOISY-Mob-pizza-fruits-mer.jpg"
  },
  {
    id: "salade-cesar",
    name: "Salade Cesar Croustillante",
    category: "salades",
    isSalad: true,
    badge: "Fraicheur",
    description: "Coeur de salade romaine croquante, aiguillettes de filet de poulet dore, copeaux de Parmigiano Reggiano AOP, croutons dores a l'ail, sauce Cesar.",
    prices: { unique: 9.50 },
    image: "OPTINOISY-Mob-salade-cesar.jpg"
  },
  {
    id: "salade-oceane",
    name: "Salade Oceane Gourmande",
    category: "salades",
    isSalad: true,
    badge: "Frais & Leger",
    description: "Jeunes pousses fraiches, crevettes royales marinees, lamelles de saumon fume d'Atlantique, des d'avocat mur, tomates cerises confites.",
    prices: { unique: 10.50 },
    image: "OPTINOISY-Mob-salade-oceane.jpg"
  },
  {
    id: "salade-fruits",
    name: "Salade de Fruits Frais du Jour",
    category: "salades",
    isDessert: true,
    badge: "Fait Maison",
    description: "Selection rafraichissante de fruits frais de saison decoupes le matin : fraises parfumees, melon de Cavaillon, ananas Victoria et menthe fraiche.",
    prices: { unique: 5.50 },
    image: "OPTINOISY-Mob-salade-fruits.jpg"
  }
];

// Export universel compatible navigateur sans module et bundlers
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    PIZZERIA_CONFIG,
    PIZZA_SIZES,
    MENU_CATEGORIES,
    EXTRA_INGREDIENTS,
    MENU_ITEMS
  };
}
