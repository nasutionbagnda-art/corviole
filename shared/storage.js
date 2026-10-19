/**
 * Opti'Noisy Pizza - Gestionnaire de Stockage Local & Etat (State Management)
 * Persistance complete en localStorage pour web mobile & Capacitor
 */

const STORAGE_KEYS = {
  CART: "optinoisy_cart_v1",
  USER: "optinoisy_current_user_v1",
  USERS_DB: "optinoisy_users_db_v1",
  ORDERS: "optinoisy_orders_v1",
  FAVORITES: "optinoisy_favorites_v1",
  DELIVERY_LOCATION: "optinoisy_delivery_location_v1"
};

const PizzaStorage = {
  // --- PANIER ---
  getCart() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CART);
      return data ? JSON.parse(data) : { items: [], deliveryMode: "direct", specialNotes: "", promoCode: "", discountAmount: 0, tipAmount: 0 };
    } catch (e) {
      console.error("Erreur lecture panier:", e);
      return { items: [], deliveryMode: "direct", specialNotes: "", promoCode: "", discountAmount: 0, tipAmount: 0 };
    }
  },

  saveCart(cart) {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
      window.dispatchEvent(new CustomEvent("optinoisy:cart-updated", { detail: cart }));
    } catch (e) {
      console.error("Erreur sauvegarde panier:", e);
    }
  },

  addToCart({ itemId, sizeId = "moyenne", quantity = 1, extras = [], instructions = "" }) {
    const item = MENU_ITEMS.find(p => p.id === itemId);
    if (!item) return null;

    const cart = this.getCart();
    const isSalad = !!item.isSalad || !!item.isDessert;
    const effectiveSize = isSalad ? "unique" : sizeId;

    const basePrice = isSalad ? item.prices.unique : (item.prices[effectiveSize] || item.prices.moyenne);
    const extrasTotal = extras.reduce((sum, extId) => {
      const ext = EXTRA_INGREDIENTS.find(e => e.id === extId);
      return sum + (ext ? ext.price : 0);
    }, 0);
    const unitPrice = Number((basePrice + extrasTotal).toFixed(2));

    const extrasKey = [...extras].sort().join("-");
    const cartItemId = `${itemId}_${effectiveSize}_${extrasKey}`;

    const existingIndex = cart.items.findIndex(it => it.id === cartItemId);
    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += quantity;
      cart.items[existingIndex].lineTotal = Number((cart.items[existingIndex].quantity * unitPrice).toFixed(2));
    } else {
      cart.items.push({
        id: cartItemId,
        itemId: item.id,
        name: item.name,
        sizeId: effectiveSize,
        sizeName: isSalad ? "Portion Gourmande" : (PIZZA_SIZES.find(s => s.id === effectiveSize)?.name || "Moyenne"),
        image: item.image,
        unitPrice: unitPrice,
        basePrice: basePrice,
        quantity: quantity,
        extras: extras,
        extrasDetails: extras.map(extId => EXTRA_INGREDIENTS.find(e => e.id === extId)).filter(Boolean),
        instructions: instructions,
        lineTotal: Number((unitPrice * quantity).toFixed(2))
      });
    }

    this.saveCart(cart);
    return cart;
  },

  updateCartQuantity(cartItemId, delta) {
    const cart = this.getCart();
    const index = cart.items.findIndex(it => it.id === cartItemId);
    if (index > -1) {
      cart.items[index].quantity += delta;
      if (cart.items[index].quantity <= 0) {
        cart.items.splice(index, 1);
      } else {
        cart.items[index].lineTotal = Number((cart.items[index].quantity * cart.items[index].unitPrice).toFixed(2));
      }
      this.saveCart(cart);
    }
    return cart;
  },

  removeCartItem(cartItemId) {
    const cart = this.getCart();
    cart.items = cart.items.filter(it => it.id !== cartItemId);
    this.saveCart(cart);
    return cart;
  },

  clearCart() {
    const cart = { items: [], deliveryMode: "direct", specialNotes: "", promoCode: "", discountAmount: 0, tipAmount: 0 };
    this.saveCart(cart);
    return cart;
  },

  setDeliveryMode(mode) {
    const cart = this.getCart();
    cart.deliveryMode = mode;
    this.saveCart(cart);
  },

  applyPromoCode(code) {
    const cart = this.getCart();
    const clean = (code || "").trim().toUpperCase();
    if (clean === "MMI2026" || clean === "MMI20" || clean === "PIZZA10") {
      cart.promoCode = clean;
      const subtotal = cart.items.reduce((sum, it) => sum + (it.unitPrice * it.quantity), 0);
      cart.discountAmount = Number((subtotal * 0.15).toFixed(2)); // 15% de reduction
      this.saveCart(cart);
      return { success: true, discount: cart.discountAmount };
    }
    return { success: false, message: "Code promo invalide (essayez MMI2026)" };
  },

  setTip(amount) {
    const cart = this.getCart();
    cart.tipAmount = Math.max(0, Number(amount) || 0);
    this.saveCart(cart);
  },

  getCartTotals() {
    const cart = this.getCart();
    const subtotal = cart.items.reduce((sum, it) => sum + (it.unitPrice * it.quantity), 0);
    const count = cart.items.reduce((sum, it) => sum + it.quantity, 0);

    const isPickup = cart.deliveryMode === 'pickup';
    let deliveryFee = PIZZERIA_CONFIG.deliveryBaseFee;
    if (isPickup || subtotal >= PIZZERIA_CONFIG.freeDeliveryThreshold || subtotal === 0) {
      deliveryFee = 0;
    }

    const discount = cart.discountAmount || 0;
    const tip = cart.tipAmount || 0;
    const total = Math.max(0, Number((subtotal - discount + (subtotal > 0 ? deliveryFee : 0) + tip).toFixed(2)));

    return {
      subtotal: Number(subtotal.toFixed(2)),
      deliveryFee: Number(deliveryFee.toFixed(2)),
      isPickup: isPickup,
      discount: discount,
      tip: tip,
      promoCode: cart.promoCode,
      total: total,
      count: count,
      isFreeDelivery: deliveryFee === 0 && subtotal > 0,
      minOrderMet: isPickup ? true : (subtotal >= PIZZERIA_CONFIG.minOrderDelivery),
      minRemaining: Math.max(0, PIZZERIA_CONFIG.minOrderDelivery - subtotal).toFixed(2)
    };
  },

  // --- UTILISATEUR & AUTHENTIFICATION ---
  getUsersDb() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS_DB);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  getCurrentUser() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  saveCurrentUser(user) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
    window.dispatchEvent(new CustomEvent("optinoisy:user-changed", { detail: user }));
  },

  registerUser({ firstName, lastName, email, phone, password, address, city = "Noisy-le-Grand", postalCode = "93160" }) {
    const users = this.getUsersDb();
    const cleanEmail = email.trim().toLowerCase();

    if (users.some(u => u.email === cleanEmail)) {
      return { success: false, message: "Un compte existe deja avec cette adresse email." };
    }

    const newUser = {
      id: "usr_" + Date.now(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      fullName: `${firstName.trim()} ${lastName.trim()}`,
      email: cleanEmail,
      phone: phone.trim(),
      password: password,
      addresses: [
        {
          id: "addr_1",
          label: "Mon Domicile",
          street: address.trim(),
          city: city.trim(),
          postalCode: postalCode.trim(),
          isDefault: true
        }
      ],
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users));
    this.saveCurrentUser(newUser);
    return { success: true, user: newUser };
  },

  loginUser(email, password) {
    const cleanEmail = email.trim().toLowerCase();
    const users = this.getUsersDb();
    const found = users.find(u => u.email === cleanEmail && u.password === password);

    if (found) {
      this.saveCurrentUser(found);
      return { success: true, user: found };
    }

    if (cleanEmail === "demo@mmi.fr" && password === "demo123") {
      const demoUser = {
        id: "usr_demo",
        firstName: "Lucas",
        lastName: "Moreau",
        fullName: "Lucas Moreau (Etudiant MMI)",
        email: "demo@mmi.fr",
        phone: "06 12 34 56 78",
        addresses: [
          {
            id: "addr_demo",
            label: "Campus / Appartement",
            street: "2 Allee de l'IUT",
            city: "Noisy-le-Grand",
            postalCode: "93160",
            isDefault: true
          }
        ],
        createdAt: new Date().toISOString()
      };
      this.saveCurrentUser(demoUser);
      return { success: true, user: demoUser };
    }

    return { success: false, message: "Identifiants invalides (demo@mmi.fr / demo123)" };
  },

  logoutUser() {
    this.saveCurrentUser(null);
  },

  // --- COMMANDES ---
  getOrders() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
      const orders = data ? JSON.parse(data) : [];
      const now = Date.now();
      orders.forEach(ord => {
        if (ord.manualStep) {
          ord.step = ord.manualStep;
          const labels = {
            1: { status: "confirmee", label: "Commande validee" },
            2: { status: "cuisson", label: "Enfournee au feu de bois" },
            3: { status: "livraison", label: "Coursier en route" },
            4: { status: "livree", label: "Livraison effectuee" }
          };
          ord.status = labels[ord.manualStep]?.status || "confirmee";
          ord.statusLabel = labels[ord.manualStep]?.label || "Commande validee";
          return;
        }
        const elapsedSec = Math.floor((now - new Date(ord.createdAt).getTime()) / 1000);
        if (elapsedSec < 30) {
          ord.step = 1;
          ord.status = "confirmee";
          ord.statusLabel = "Commande validee";
        } else if (elapsedSec < 90) {
          ord.step = 2;
          ord.status = "cuisson";
          ord.statusLabel = "Enfournee au feu de bois";
        } else if (elapsedSec < 240) {
          ord.step = 3;
          ord.status = "livraison";
          ord.statusLabel = "Coursier en route";
        } else {
          ord.step = 4;
          ord.status = "livree";
          ord.statusLabel = "Livraison effectuee";
        }
      });
      return orders;
    } catch (e) {
      return [];
    }
  },

  setOrderStep(orderId, step) {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
      const orders = data ? JSON.parse(data) : [];
      const ord = orders.find(o => o.id === orderId);
      if (ord) {
        ord.manualStep = step;
        const labels = {
          1: { status: "confirmee", label: "Commande validee" },
          2: { status: "cuisson", label: "Enfournee au feu de bois" },
          3: { status: "livraison", label: "Coursier en route" },
          4: { status: "livree", label: "Livraison effectuee" }
        };
        ord.step = step;
        ord.status = labels[step]?.status || "confirmee";
        ord.statusLabel = labels[step]?.label || "Commande validee";
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
        window.dispatchEvent(new CustomEvent("optinoisy:orders-updated", { detail: { orderId, step } }));
        window.dispatchEvent(new Event("storage"));
      }
      return orders;
    } catch (e) {
      return [];
    }
  },

  createOrder({ cartItems, totals, customerInfo, deliveryAddress, paymentMethod, deliveryChannel = "direct" }) {
    const orders = this.getOrders();
    const orderNumber = "OPT-" + Math.floor(100000 + Math.random() * 900000);
    const isPickup = totals.isPickup || deliveryChannel === 'pickup';

    const newOrder = {
      id: "ord_" + Date.now(),
      orderNumber: orderNumber,
      createdAt: new Date().toISOString(),
      step: 1,
      status: "confirmee",
      statusLabel: "Commande validee",
      deliveryChannel: isPickup ? "pickup" : deliveryChannel,
      channelName: isPickup ? "Retrait en Magasin (Atelier Noisy)" : (deliveryChannel === "ubereats" ? "Uber Eats" : (deliveryChannel === "deliveroo" ? "Deliveroo" : "Opti'Noisy Express")),
      items: cartItems,
      totals: totals,
      customer: customerInfo,
      address: isPickup ? "Retrait à l'Atelier - 12 Avenue du Maréchal Foch, 93160 Noisy-le-Grand" : deliveryAddress,
      payment: {
        method: paymentMethod,
        label: paymentMethod === "cb" ? "Carte Bancaire" : (paymentMethod === "applepay" ? "Apple Pay" : (isPickup ? "Espèces au comptoir" : "Espèces à la livraison")),
        paid: paymentMethod !== "especes"
      },
      estimatedMinutes: isPickup ? 15 : PIZZERIA_CONFIG.estimatedDeliveryTimeMin,
      eta: new Date(Date.now() + (isPickup ? 15 : PIZZERIA_CONFIG.estimatedDeliveryTimeMin) * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    orders.unshift(newOrder);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    this.clearCart();
    window.dispatchEvent(new CustomEvent("optinoisy:orders-updated", { detail: newOrder }));
    window.dispatchEvent(new Event("storage"));
    return newOrder;
  },

  // --- ADRESSES & LOCALISATION ---
  getSavedLocation() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DELIVERY_LOCATION);
      return data ? JSON.parse(data) : {
        lat: 48.8488,
        lng: 2.5525,
        address: "12 Avenue du Marechal Foch, 93160 Noisy-le-Grand",
        distanceKm: 0,
        isEligible: true
      };
    } catch (e) {
      return null;
    }
  },

  saveLocation(loc) {
    try {
      localStorage.setItem(STORAGE_KEYS.DELIVERY_LOCATION, JSON.stringify(loc));
      window.dispatchEvent(new CustomEvent("optinoisy:location-updated", { detail: loc }));
    } catch (e) {
      console.error(e);
    }
  },

  calculateDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(2));
  },

  getFavorites() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return data ? JSON.parse(data) : ["reine", "4-fromages", "chevre-miel"];
    } catch (e) {
      return [];
    }
  },

  toggleFavorite(itemId) {
    const favs = this.getFavorites();
    const index = favs.indexOf(itemId);
    if (index > -1) {
      favs.splice(index, 1);
    } else {
      favs.push(itemId);
    }
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favs));
    window.dispatchEvent(new CustomEvent("optinoisy:favorites-updated", { detail: favs }));
    return favs.includes(itemId);
  }
};
