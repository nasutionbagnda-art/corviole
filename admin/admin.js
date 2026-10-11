/**
 * Opti'Noisy Pizza - Script Back-Office Atelier & Livraisons
 * Synchronisation temps reel via localStorage & events
 */

const AdminApp = {
  currentFilter: 'all',
  lastKnownOrderCount: 0,
  searchQuery: '',

  init() {
    this.updateClock();
    setInterval(() => this.updateClock(), 1000);

    this.render();

    // Ecoute des evenements cross-tab / cross-window en direct
    window.addEventListener('storage', (e) => {
      if (!e.key || e.key.includes('orders')) {
        this.render();
      }
    });

    window.addEventListener('optinoisy:orders-updated', () => {
      this.render();
    });

    // Rafraichissement automatique toutes les 2.5 secondes
    setInterval(() => {
      this.render(false);
    }, 2500);
  },

  updateClock() {
    const el = document.getElementById('adminClock');
    if (el) {
      const now = new Date();
      el.textContent = now.toLocaleTimeString('fr-FR', {
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
    }
  },

  setFilter(filter) {
    this.currentFilter = filter;
    document.querySelectorAll('.tab-btn').forEach(btn => {
      if (btn.getAttribute('data-filter') === filter) btn.classList.add('active');
      else btn.classList.remove('active');
    });
    this.render();
  },

  handleSearch(query) {
    this.searchQuery = (query || '').toLowerCase().trim();
    this.render(false);
  },

  render(checkNew = true) {
    const orders = PizzaStorage.getOrders();

    if (checkNew && orders.length > this.lastKnownOrderCount && this.lastKnownOrderCount > 0) {
      const newest = orders[0];
      const banner = document.getElementById('newOrderBanner');
      const text = document.getElementById('newOrderText');
      if (banner && text) {
        text.textContent = `N° ${newest.orderNumber} (${newest.customer?.fullName || 'Client'}) • ${newest.totals.total.toFixed(2)} €`;
        banner.style.display = 'flex';
      }
    }
    this.lastKnownOrderCount = orders.length;

    this.updateKPIs(orders);
    this.renderOrdersGrid(orders);
  },

  updateKPIs(orders) {
    const totalOrders = orders.length;
    const inOven = orders.filter(o => o.step === 2).length;
    const inDelivery = orders.filter(o => o.step === 3).length;
    const delivered = orders.filter(o => o.step === 4).length;
    const revenue = orders.reduce((sum, o) => sum + (o.totals?.total || 0), 0);

    const activeCount = orders.filter(o => o.step < 4).length;

    document.getElementById('kpiTotalOrders').textContent = totalOrders;
    document.getElementById('kpiInOven').textContent = inOven;
    document.getElementById('kpiInDelivery').textContent = inDelivery;
    document.getElementById('kpiDelivered').textContent = delivered;
    document.getElementById('kpiRevenue').textContent = `${revenue.toFixed(2)} €`;

    document.getElementById('filterCountAll').textContent = totalOrders;
    document.getElementById('filterCountActive').textContent = activeCount;
    document.getElementById('filterCountOven').textContent = inOven;
    document.getElementById('filterCountDelivery').textContent = inDelivery;
    document.getElementById('filterCountDelivered').textContent = delivered;
  },

  renderOrdersGrid(orders) {
    const container = document.getElementById('adminOrdersGrid');
    if (!container) return;

    let filtered = orders;
    if (this.currentFilter === 'active') {
      filtered = orders.filter(o => o.step < 4);
    } else if (this.currentFilter === 'oven') {
      filtered = orders.filter(o => o.step === 2);
    } else if (this.currentFilter === 'delivery') {
      filtered = orders.filter(o => o.step === 3);
    } else if (this.currentFilter === 'delivered') {
      filtered = orders.filter(o => o.step === 4);
    }

    if (this.searchQuery) {
      filtered = filtered.filter(o => {
        const num = (o.orderNumber || '').toLowerCase();
        const client = (o.customer?.fullName || '').toLowerCase();
        const phone = (o.customer?.phone || '').toLowerCase();
        const address = (o.address || '').toLowerCase();
        const items = o.items.map(i => i.name).join(' ').toLowerCase();
        return num.includes(this.searchQuery) || client.includes(this.searchQuery) || phone.includes(this.searchQuery) || address.includes(this.searchQuery) || items.includes(this.searchQuery);
      });
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: var(--dark-surface); border-radius: 14px; border: 1px dashed var(--border);">
          <div style="margin-bottom: 12px; color: var(--primary);">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
          </div>
          <h3 style="font-size: 1.1rem; color: #FFF; margin-bottom: 4px;">Aucune commande dans cette categorie</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 16px;">Passez une commande sur le smartphone ou cliquez sur le bouton de simulation ci-dessous.</p>
          <button type="button" class="btn-action btn-simulate" onclick="AdminApp.createDemoOrder()">
            + Creer une commande test
          </button>
        </div>
      `;
      return;
    }

    let html = '';
    filtered.forEach(ord => {
      const step = ord.step || 1;
      const channelClass = ord.deliveryChannel === 'ubereats' ? 'channel-ubereats' : (ord.deliveryChannel === 'deliveroo' ? 'channel-deliveroo' : 'channel-direct');
      const channelName = ord.channelName || 'Opti\'Noisy Direct';

      const createdAt = new Date(ord.createdAt);
      const timeFormatted = createdAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      const elapsedMins = Math.max(0, Math.floor((Date.now() - createdAt.getTime()) / 60000));
      const elapsedText = elapsedMins === 0 ? "A l'instant" : `Il y a ${elapsedMins} min`;

      const subtotalHT = (ord.totals.subtotal / 1.10).toFixed(2);
      const tva = (ord.totals.subtotal - subtotalHT).toFixed(2);

      // Collecter les instructions particulieres des items ou de la commande
      const specialNotes = ord.instructions || ord.items.map(it => it.instructions).filter(Boolean).join(' | ') || "Pâte fine bien dorée, sans origan";
      const kitchenNote = ord.kitchenNote || "";

      html += `
        <article class="order-admin-card step-${step}">
          
          <div class="order-card-header">
            <div class="order-num-group">
              <span class="order-num-text">${ord.orderNumber}</span>
              <span class="channel-badge ${channelClass}">${channelName}</span>
            </div>
            <div class="order-time-text">${timeFormatted} • <strong style="color: #FFF;">${elapsedText}</strong></div>
          </div>

          <div class="order-card-body">

            <!-- Coordonnees Client -->
            <div class="client-info-box">
              <div class="client-name">${ord.customer?.fullName || 'Client Invite'}</div>
              <div class="client-contact">
                <div>Tel : ${ord.customer?.phone || '06 12 34 56 78'} • Email : ${ord.customer?.email || 'client@optinoisy.fr'}</div>
                <div>Adresse : <strong>${ord.address || '12 Avenue du Marechal Foch, 93160 Noisy-le-Grand'}</strong></div>
              </div>
            </div>

            <!-- Instructions Particulieres Cuisine -->
            <div class="instructions-alert-box">
              <div class="instructions-header">
                <span style="display: flex; align-items: center; gap: 6px;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                  Instructions Cuisine / Client :
                </span>
                <button type="button" class="btn-edit-note" onclick="AdminApp.openEditModal('${ord.id}')">Modifier</button>
              </div>
              <div class="instructions-content">"${specialNotes}"</div>
              ${kitchenNote ? `
                <div class="kitchen-note-tag">
                  <strong>Note Atelier :</strong> ${kitchenNote}
                </div>
              ` : ''}
            </div>

            <!-- Articles commandees -->
            <div class="order-items-box">
              <div class="items-header">Pizzas & Produits (${ord.items.length}) :</div>
              ${ord.items.map(it => `
                <div class="order-item-row">
                  <div>
                    <span class="item-qty-badge">${it.quantity}x</span>
                    <strong style="color: #FFF;">${it.name}</strong>
                    <div class="item-extras-list">
                      Format: <strong>${it.sizeName}</strong>
                      ${it.extrasDetails?.length ? ' • ' + it.extrasDetails.map(e => e.name).join(', ') : ''}
                    </div>
                  </div>
                  <div class="item-row-price">${it.lineTotal.toFixed(2)} €</div>
                </div>
              `).join('')}
            </div>

            <!-- Synthese financiere -->
            <div class="order-finance-box">
              <div class="finance-line">
                <span>Sous-total HT :</span>
                <span>${subtotalHT} €</span>
              </div>
              <div class="finance-line">
                <span>TVA Restauration (10%) :</span>
                <span>${tva} €</span>
              </div>
              ${ord.totals.deliveryFee > 0 ? `
                <div class="finance-line">
                  <span>Frais de livraison :</span>
                  <span>${ord.totals.deliveryFee.toFixed(2)} €</span>
                </div>
              ` : `
                <div class="finance-line" style="color: #4ADE80;">
                  <span>Livraison :</span>
                  <span>OFFERTE (0.00 €)</span>
                </div>
              `}
              ${ord.totals.discount > 0 ? `
                <div class="finance-line" style="color: #F87171;">
                  <span>Remise Promo (${ord.totals.promoCode || 'MMI2026'}) :</span>
                  <span>-${ord.totals.discount.toFixed(2)} €</span>
                </div>
              ` : ''}
              ${ord.totals.tip > 0 ? `
                <div class="finance-line">
                  <span>Pourboire :</span>
                  <span>+${ord.totals.tip.toFixed(2)} €</span>
                </div>
              ` : ''}
              <div class="finance-total">
                <span>TOTAL TTC REGLE :</span>
                <span class="finance-total-val">${ord.totals.total.toFixed(2)} €</span>
              </div>
              <div style="font-size: 0.72rem; color: #94A3B8; margin-top: 4px; display: flex; justify-content: space-between;">
                <span>Reglement : <strong>${ord.payment?.label || 'Carte Bancaire'}</strong></span>
                <span style="color: #4ADE80;">Paye en ligne</span>
              </div>
            </div>

            <!-- Controleur de Suivi en Direct (Actions Pizzaiolo) -->
            <div class="status-controller-box">
              <div class="status-label-now">
                <span>Statut de preparation actuel :</span>
                <span class="status-badge badge-step-${step}">${ord.statusLabel}</span>
              </div>

              <div class="status-action-btns">
                <button type="button" class="btn-step step-1 ${step === 1 ? 'active' : ''}" onclick="AdminApp.changeStep('${ord.id}', 1)">
                  1. Validee
                </button>
                <button type="button" class="btn-step step-2 ${step === 2 ? 'active' : ''}" onclick="AdminApp.changeStep('${ord.id}', 2)">
                  2. Au Four
                </button>
                <button type="button" class="btn-step step-3 ${step === 3 ? 'active' : ''}" onclick="AdminApp.changeStep('${ord.id}', 3)">
                  3. En Route
                </button>
                <button type="button" class="btn-step step-4 ${step === 4 ? 'active' : ''}" onclick="AdminApp.changeStep('${ord.id}', 4)">
                  4. Livree
                </button>
              </div>
            </div>

          </div>
        </article>
      `;
    });

    container.innerHTML = html;
  },

  changeStep(orderId, step) {
    PizzaStorage.setOrderStep(orderId, step);
    // Notifier tous les onglets (smartphone client, W3C, etc.)
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('optinoisy:orders-updated'));
    this.render();
  },

  openEditModal(orderId) {
    const orders = PizzaStorage.getOrders();
    const ord = orders.find(o => o.id === orderId);
    if (!ord) return;

    document.getElementById('editOrderId').value = ord.id;
    document.getElementById('editModalTitle').textContent = `Modifier la commande ${ord.orderNumber}`;
    document.getElementById('editOrderPrice').value = ord.totals?.total !== undefined ? ord.totals.total.toFixed(2) : '0.00';
    document.getElementById('editOrderDiscount').value = ord.totals?.discount !== undefined ? ord.totals.discount.toFixed(2) : '0.00';
    document.getElementById('editOrderStepSelect').value = String(ord.step || 1);
    document.getElementById('editOrderInstructions').value = ord.instructions || ord.items.map(it => it.instructions).filter(Boolean).join(' | ') || "";
    document.getElementById('editOrderKitchenNote').value = ord.kitchenNote || "";

    document.getElementById('editOrderModal').style.display = 'flex';
  },

  closeEditModal() {
    document.getElementById('editOrderModal').style.display = 'none';
  },

  saveOrderModifications() {
    const orderId = document.getElementById('editOrderId').value;
    const instructions = document.getElementById('editOrderInstructions').value;
    const kitchenNote = document.getElementById('editOrderKitchenNote').value;
    const newPrice = parseFloat(document.getElementById('editOrderPrice').value);
    const newDiscount = parseFloat(document.getElementById('editOrderDiscount').value);
    const newStep = parseInt(document.getElementById('editOrderStepSelect').value, 10);

    try {
      const data = localStorage.getItem('optinoisy_orders_v1');
      const orders = data ? JSON.parse(data) : [];
      const ord = orders.find(o => o.id === orderId);
      if (ord) {
        ord.instructions = instructions;
        ord.kitchenNote = kitchenNote;
        if (!isNaN(newPrice) && newPrice >= 0) {
          ord.totals.total = Number(newPrice.toFixed(2));
        }
        if (!isNaN(newDiscount) && newDiscount >= 0) {
          ord.totals.discount = Number(newDiscount.toFixed(2));
        }
        if (!isNaN(newStep) && newStep >= 1 && newStep <= 4) {
          ord.step = newStep;
          const labels = ["Commande Validee", "Au four a bois", "En route coursier", "Livree avec succes"];
          ord.statusLabel = labels[newStep - 1];
        }
        localStorage.setItem('optinoisy_orders_v1', JSON.stringify(orders));
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('optinoisy:orders-updated'));
      }
    } catch (e) {
      console.error(e);
    }

    this.closeEditModal();
    this.render();
  },

  createDemoOrder() {
    const sampleItems = [
      {
        id: "reine_moyenne_",
        itemId: "reine",
        name: "La Reine",
        sizeId: "moyenne",
        sizeName: "Moyenne",
        unitPrice: 13.50,
        quantity: 1,
        extras: ["extra-mozza"],
        extrasDetails: [{ id: "extra-mozza", name: "Double Mozzarella di Bufala", price: 1.50 }],
        instructions: "Pâte bien croustillante, sans champignons",
        lineTotal: 15.00
      },
      {
        id: "4-fromages_junior_",
        itemId: "4-fromages",
        name: "Quattro Formaggi (4 Fromages)",
        sizeId: "junior",
        sizeName: "Junior",
        unitPrice: 10.50,
        quantity: 1,
        extras: [],
        extrasDetails: [],
        instructions: "Très chaud svp",
        lineTotal: 10.50
      }
    ];

    const totals = {
      subtotal: 25.50,
      deliveryFee: 0,
      discount: 3.82,
      promoCode: "MMI2026",
      tip: 2.00,
      total: 23.68
    };

    const newOrder = PizzaStorage.createOrder({
      cartItems: sampleItems,
      totals: totals,
      customerInfo: {
        fullName: "Lucas Moreau (Étudiant MMI)",
        email: "demo@mmi.fr",
        phone: "06 12 34 56 78"
      },
      deliveryAddress: "Campus IUT Noisy-Champs, 2 Allée de l'IUT, 93160 Noisy-le-Grand",
      paymentMethod: "cb",
      deliveryChannel: "direct"
    });

    newOrder.instructions = "Pâte bien croustillante, code interphone 4920B";
    newOrder.kitchenNote = "Commande prioritaire service du soir";

    // Mettre a jour dans storage
    const all = PizzaStorage.getOrders();
    all[0] = newOrder;
    localStorage.setItem('optinoisy_orders_v1', JSON.stringify(all));

    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('optinoisy:orders-updated'));

    this.render();
  },

  clearAllOrders() {
    if (confirm("Voulez-vous réinitialiser l'historique des commandes de l'Atelier ?")) {
      localStorage.removeItem('optinoisy_orders_v1');
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('optinoisy:orders-updated'));
      this.render();
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  AdminApp.init();
});
