/**
 * Opti'Noisy Pizzeria - Gestion des commandes, paiement et passerelles de livraison
 */

class OrderManager {
  constructor() {
    this.activeOrder = this.loadActiveOrder();
  }

  loadActiveOrder() {
    try {
      const data = localStorage.getItem('optinoisy_active_order');
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  saveActiveOrder(order) {
    this.activeOrder = order;
    if (order) {
      localStorage.setItem('optinoisy_active_order', JSON.stringify(order));
    } else {
      localStorage.removeItem('optinoisy_active_order');
    }
    window.dispatchEvent(new CustomEvent('activeOrderChanged', { detail: order }));
  }

  createOrder(orderData) {
    // orderData: { customer, address, coords, paymentMethod, items, totals, deliveryType }
    const orderId = 'OPT-' + Math.floor(100000 + Math.random() * 900000);
    const newOrder = {
      id: orderId,
      createdAt: new Date().toISOString(),
      customer: orderData.customer,
      address: orderData.address,
      coords: orderData.coords || null,
      paymentMethod: orderData.paymentMethod || 'CB',
      deliveryType: orderData.deliveryType || 'livraison',
      items: orderData.items,
      totals: orderData.totals,
      status: 'PREPARATION', // 'CONFIRMED' -> 'PREPARATION' -> 'IN_TRANSIT' -> 'DELIVERED'
      statusStep: 1, // 0: reçue, 1: en cuisine, 2: en livraison, 3: livrée
      estimatedMinutes: 30,
      timeline: [
        { title: 'Commande confirmée', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), done: true },
        { title: 'Cuisson au feu de bois', time: 'En cours', done: true },
        { title: 'Livreur en route', time: 'À venir', done: false },
        { title: 'Livraison effectuée', time: 'À venir', done: false }
      ]
    };

    this.saveActiveOrder(newOrder);

    // Ajouter à l'historique de l'utilisateur si connecté
    if (window.authManager) {
      window.authManager.addOrderToHistory(newOrder);
    }

    // Vider le panier
    if (window.cartManager) {
      window.cartManager.clearCart();
    }

    return newOrder;
  }

  advanceOrderStatus() {
    if (!this.activeOrder) return;

    if (this.activeOrder.statusStep < 3) {
      this.activeOrder.statusStep++;
      if (this.activeOrder.statusStep === 1) {
        this.activeOrder.status = 'PREPARATION';
        this.activeOrder.timeline[1].time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        this.activeOrder.timeline[1].done = true;
      } else if (this.activeOrder.statusStep === 2) {
        this.activeOrder.status = 'IN_TRANSIT';
        this.activeOrder.timeline[2].time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        this.activeOrder.timeline[2].done = true;
      } else if (this.activeOrder.statusStep === 3) {
        this.activeOrder.status = 'DELIVERED';
        this.activeOrder.timeline[3].time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        this.activeOrder.timeline[3].done = true;
      }
      this.saveActiveOrder(this.activeOrder);
    }
  }
}

window.orderManager = new OrderManager();
