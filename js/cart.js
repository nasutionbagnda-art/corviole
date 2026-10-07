/**
 * Opti'Noisy Pizzeria - Gestion du panier
 */

class CartManager {
  constructor() {
    this.storageKey = 'optinoisy_cart';
    this.cart = this.loadCart();
    this.discount = 0;
    this.promoCode = '';
  }

  loadCart() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  saveCart() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.cart));
  }

  addItem(item) {
    // item: { id, name, category, sizeId, sizeName, price, image, extras }
    const existingIndex = this.cart.findIndex(i => 
      i.id === item.id && i.sizeId === item.sizeId && JSON.stringify(i.extras || []) === JSON.stringify(item.extras || [])
    );

    if (existingIndex > -1) {
      this.cart[existingIndex].quantity += (item.quantity || 1);
    } else {
      this.cart.push({
        cartItemId: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        ...item,
        quantity: item.quantity || 1
      });
    }
    this.saveCart();
    this.dispatchUpdateEvent();
  }

  removeItem(cartItemId) {
    this.cart = this.cart.filter(i => i.cartItemId !== cartItemId);
    this.saveCart();
    this.dispatchUpdateEvent();
  }

  updateQuantity(cartItemId, delta) {
    const item = this.cart.find(i => i.cartItemId === cartItemId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      this.removeItem(cartItemId);
    } else {
      this.saveCart();
      this.dispatchUpdateEvent();
    }
  }

  clearCart() {
    this.cart = [];
    this.discount = 0;
    this.promoCode = '';
    this.saveCart();
    this.dispatchUpdateEvent();
  }

  applyPromo(code) {
    const cleanCode = (code || '').trim().toUpperCase();
    if (cleanCode === 'OPTI10') {
      this.discount = 0.10; // 10%
      this.promoCode = 'OPTI10';
      return { success: true, message: 'Code promo OPTI10 appliqué : -10% sur votre commande !' };
    } else if (cleanCode === 'NOISY5') {
      this.discount = 5.00; // 5€
      this.promoCode = 'NOISY5';
      return { success: true, message: 'Code promo NOISY5 appliqué : -5.00€ sur votre commande !' };
    } else {
      return { success: false, message: 'Code promo invalide. Essayez OPTI10 ou NOISY5.' };
    }
  }

  getTotals() {
    const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const count = this.cart.reduce((sum, item) => sum + item.quantity, 0);

    let discountAmount = 0;
    if (this.promoCode === 'OPTI10') {
      discountAmount = subtotal * 0.10;
    } else if (this.promoCode === 'NOISY5') {
      discountAmount = Math.min(subtotal, 5.00);
    }

    const deliveryFee = subtotal >= PIZZERIA_CONFIG.freeDeliveryThreshold || subtotal === 0 ? 0 : PIZZERIA_CONFIG.deliveryFee;
    const total = Math.max(0, subtotal - discountAmount + deliveryFee);

    return {
      subtotal,
      count,
      discountAmount,
      promoCode: this.promoCode,
      deliveryFee,
      isFreeDelivery: deliveryFee === 0 && subtotal > 0,
      total
    };
  }

  dispatchUpdateEvent() {
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: this.getTotals() }));
  }
}

window.cartManager = new CartManager();
