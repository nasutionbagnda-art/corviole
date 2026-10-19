/**
 * Opti'Noisy Pizza - Logique Applicative Prototype W3C Pur (Vanilla JavaScript)
 * TP MMI3 Web Mobile - Octobre 2026
 * Sans dependance de framework externe, sans alert() ni confirm(), 100% conforme standards W3C
 */

const W3CApp = {
  activeTab: 'home',
  activeCategory: 'all',
  searchQuery: '',
  selectedProduct: null,
  homeSelectedSize: 'moyenne',
  modalSelectedSize: 'moyenne',
  modalSelectedExtras: [],
  modalQty: 1,
  selectedPaymentMethod: 'cb',

  leafletMap: null,
  shopMarker: null,
  userMarker: null,
  deliveryCircle: null,
  routePolyline: null,

  hapticFeedback(pattern = 15) {
    if ('vibrate' in navigator) {
      try { navigator.vibrate(pattern); } catch (e) {}
    }
  },

  init() {
    this.renderCategoryPills();
    this.renderHomeGrid();
    this.renderProducts();
    this.updateCartUI();
    this.updateAccountUI();
    this.initEventListeners();
    this.initMap();

    // Enregistrement PWA Service Worker
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
      });
    }

    // Actualisation du tracking toutes les 15 secondes
    setInterval(() => {
      if (this.activeTab === 'account') {
        this.renderUserOrders();
      }
    }, 15000);
  },

  initEventListeners() {
    window.addEventListener('optinoisy:cart-updated', () => {
      this.updateCartUI();
    });

    window.addEventListener('optinoisy:user-changed', () => {
      this.updateAccountUI();
    });

    window.addEventListener('optinoisy:orders-updated', () => {
      this.updateAccountUI();
    });

    window.addEventListener('storage', (e) => {
      if (!e.key || e.key === 'optinoisy_orders' || e.key === 'optinoisy_active_user') {
        this.updateAccountUI();
      }
    });

    const toggleBtn = document.getElementById('w3cTogglePcBtn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('desktop-expanded');
        const isExp = document.body.classList.contains('desktop-expanded');
        const txt = document.getElementById('w3cTogglePcText');
        if (txt) txt.textContent = isExp ? 'Vue Smartphone' : 'Vue PC Elargie';
        if (this.leafletMap) {
          setTimeout(() => this.leafletMap.invalidateSize(), 300);
        }
      });
    }

    const cardInput = document.getElementById('w3cCardNumber');
    if (cardInput) {
      cardInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '').substring(0, 16);
        let formatted = val.match(/.{1,4}/g)?.join(' ') || val;
        e.target.value = formatted;
      });
    }

    const expInput = document.getElementById('w3cCardExp');
    if (expInput) {
      expInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '').substring(0, 4);
        if (val.length >= 2) val = val.substring(0, 2) + '/' + val.substring(2);
        e.target.value = val;
      });
    }
  },

  switchTab(tabId) {
    this.activeTab = tabId;

    const tabs = ['home', 'menu', 'geo', 'cart', 'account'];
    tabs.forEach(t => {
      const section = document.getElementById(`w3c-tab-${t}`);
      if (section) section.style.display = (t === tabId) ? 'block' : 'none';
    });

    const navItems = {
      'home': 'w3cNavHome',
      'menu': 'w3cNavMenu',
      'cart': 'w3cNavCart',
      'geo': 'w3cNavGeo',
      'account': 'w3cNavAccount'
    };
    Object.keys(navItems).forEach(key => {
      const btn = document.getElementById(navItems[key]);
      if (btn) {
        if (key === tabId) btn.classList.add('active');
        else btn.classList.remove('active');
      }
    });

    if (tabId === 'geo' && this.leafletMap) {
      setTimeout(() => this.leafletMap.invalidateSize(), 200);
    }

    if (tabId === 'account') {
      this.updateAccountUI();
    }

    this.updateCartUI();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // --- RENDU ACCUEIL ---
  selectHomeSize(size) {
    this.homeSelectedSize = size;

    ['junior', 'moyenne', 'familiale'].forEach(s => {
      const card = document.getElementById(`w3cHomeSizeCard-${s}`);
      const label = document.getElementById(`w3cHomeSizeLabel-${s}`);
      if (card) {
        if (s === size) card.classList.add('selected');
        else card.classList.remove('selected');
      }
      if (label) {
        if (s === size) {
          label.style.color = 'var(--primary)';
        } else {
          label.style.color = '#1A1C20';
        }
      }
    });

    this.renderHomeGrid();
  },

  renderHomeGrid() {
    const container = document.getElementById('w3cHomeGrid');
    if (!container) return;

    const favorites = MENU_ITEMS.filter(it => 
      ['reine', '4-fromages', 'chevre-miel', 'cannibale'].includes(it.id)
    );

    const sizeNameMap = {
      junior: 'Junior 26cm',
      moyenne: 'Moyenne 31cm',
      familiale: 'Familiale 40cm'
    };
    const currentSize = this.homeSelectedSize || 'moyenne';
    const currentSizeLabel = sizeNameMap[currentSize] || 'Moyenne';

    let html = '';
    favorites.forEach(item => {
      const currentPrice = item.prices[currentSize] || item.prices.moyenne || 12.00;
      const isFav = PizzaStorage.getFavorites().includes(item.id);

      html += `
        <article class="pizza-card" onclick="W3CApp.openProductModal('${item.id}', '${currentSize}')">
          <div class="pizza-card-image-wrap">
            <img src="../assets/${item.image}" alt="${item.name}" loading="lazy">
            ${item.badge ? `<span class="pizza-badge-overlay">${item.badge}</span>` : ''}
            <button type="button" class="fav-btn-overlay ${isFav ? 'active' : ''}" 
                    onclick="event.stopPropagation(); W3CApp.toggleFav('${item.id}')" title="Favori">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="${isFav ? '#BE1C1F' : 'none'}" stroke="${isFav ? '#BE1C1F' : '#999'}" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            </button>
          </div>
          <div class="pizza-card-body p-2">
            <h4 class="pizza-card-title text-truncate mb-1">${item.name}</h4>
            <p class="pizza-card-desc mb-2">${item.description}</p>
            <div style="margin-bottom: 4px;">
              <span style="font-size: 0.65rem; background: #F8F9FA; border: 1px solid #E2E8F0; padding: 2px 6px; border-radius: 4px; color: #64748B; font-weight: 700;">
                ${currentSizeLabel}
              </span>
            </div>
            <div class="pizza-card-footer pt-1">
              <div class="pizza-card-price" style="font-size: 0.95rem;">
                ${currentPrice.toFixed(2)} €
              </div>
              <button type="button" class="btn-add-quick py-1 px-2" style="font-size: 0.72rem;">
                + Choisir
              </button>
            </div>
          </div>
        </article>
      `;
    });
    container.innerHTML = html;
  },

  // --- RENDU MENU ---
  renderCategoryPills() {
    const container = document.getElementById('w3cCatScroll');
    if (!container) return;

    let html = '';
    MENU_CATEGORIES.forEach(cat => {
      const isActive = cat.id === this.activeCategory;
      html += `
        <button type="button" class="category-pill ${isActive ? 'active' : ''}" onclick="W3CApp.filterCategory('${cat.id}')">
          ${cat.label}
        </button>
      `;
    });
    container.innerHTML = html;
  },

  filterCategory(catId) {
    this.activeCategory = catId;
    this.renderCategoryPills();
    this.renderProducts();
  },

  onSearch(query) {
    this.searchQuery = query.trim().toLowerCase();
    this.renderProducts();
  },

  renderProducts() {
    const container = document.getElementById('w3cProductsGrid');
    if (!container) return;

    const filtered = MENU_ITEMS.filter(item => {
      if (this.activeCategory !== 'all') {
        if (this.activeCategory === 'veggie' && !item.veggie) return false;
        if (this.activeCategory !== 'veggie' && item.category !== this.activeCategory) return false;
      }
      if (this.searchQuery) {
        const fullText = (item.name + ' ' + item.description + ' ' + (item.badge || '')).toLowerCase();
        if (!fullText.includes(this.searchQuery)) return false;
      }
      return true;
    });

    const countLabel = document.getElementById('w3cMenuCount');
    if (countLabel) {
      countLabel.textContent = `${filtered.length} produit${filtered.length > 1 ? 's' : ''}`;
    }

    const catBadge = document.getElementById('w3cCatLabel');
    if (catBadge) {
      const activeCat = MENU_CATEGORIES.find(c => c.id === this.activeCategory);
      catBadge.textContent = activeCat ? activeCat.label : 'Toute la carte';
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px 16px;">
          <p style="font-size: 0.85rem; color: #64748B;">Aucun produit ne correspond a votre recherche.</p>
          <button type="button" class="btn-ui btn-ui-outline" style="color: var(--primary); border-color: #FECACA;" onclick="document.getElementById('w3cSearchInput').value=''; W3CApp.onSearch(''); W3CApp.filterCategory('all');">
            Voir toute la carte
          </button>
        </div>
      `;
      return;
    }

    let html = '';
    filtered.forEach(item => {
      const isSalad = !!item.isSalad || !!item.isDessert;
      const startPrice = isSalad ? item.prices.unique : (item.prices.junior || item.prices.moyenne);
      const isFav = PizzaStorage.getFavorites().includes(item.id);

      html += `
        <article class="pizza-card" onclick="W3CApp.openProductModal('${item.id}')">
          <div class="pizza-card-image-wrap">
            <img src="../assets/${item.image}" alt="${item.name}" loading="lazy">
            ${item.badge ? `<span class="pizza-badge-overlay">${item.badge}</span>` : ''}
            <button type="button" class="fav-btn-overlay ${isFav ? 'active' : ''}" 
                    onclick="event.stopPropagation(); W3CApp.toggleFav('${item.id}')" title="Favori">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="${isFav ? '#BE1C1F' : 'none'}" stroke="${isFav ? '#BE1C1F' : '#999'}" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            </button>
          </div>
          <div class="pizza-card-body p-2">
            <h4 class="pizza-card-title text-truncate mb-1">${item.name}</h4>
            <p class="pizza-card-desc mb-2">${item.description}</p>
            
            ${!isSalad ? `
              <div style="display: flex; align-items: center; gap: 4px; font-size: 0.68rem; color: #64748B; margin-bottom: 8px;">
                <span>26cm</span> •
                <span style="color: var(--primary); font-weight: 700;">31cm</span> •
                <span>40cm</span>
              </div>
            ` : ''}

            <div class="pizza-card-footer pt-1">
              <div class="pizza-card-price" style="font-size: 0.95rem;">
                ${startPrice.toFixed(2)} €
              </div>
              <button type="button" class="btn-add-quick py-1 px-2" style="font-size: 0.72rem;">
                + Choisir
              </button>
            </div>
          </div>
        </article>
      `;
    });

    container.innerHTML = html;
  },

  // --- MODAL PRODUIT W3C ---
  openProductModal(itemId, initialSize = null) {
    const item = MENU_ITEMS.find(p => p.id === itemId);
    if (!item) return;

    this.selectedProduct = item;
    this.modalSelectedSize = initialSize || this.homeSelectedSize || 'moyenne';
    this.modalSelectedExtras = [];
    this.modalQty = 1;

    document.getElementById('w3cModalTitle').textContent = item.name;
    document.getElementById('w3cModalDesc').textContent = item.description;
    document.getElementById('w3cModalImg').src = `../assets/${item.image}`;
    document.getElementById('w3cModalImg').alt = item.name;

    const badge = document.getElementById('w3cModalBadge');
    if (item.badge) {
      badge.textContent = item.badge;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }

    const isSalad = !!item.isSalad || !!item.isDessert;
    const sizeWrap = document.getElementById('w3cModalSizeWrap');
    if (isSalad) {
      sizeWrap.style.display = 'none';
    } else {
      sizeWrap.style.display = 'block';
      document.getElementById('w3cSizePrice-junior').textContent = `${(item.prices.junior || 8.90).toFixed(2)} €`;
      document.getElementById('w3cSizePrice-moyenne').textContent = `${(item.prices.moyenne || 12.90).toFixed(2)} €`;
      document.getElementById('w3cSizePrice-familiale').textContent = `${(item.prices.familiale || 17.90).toFixed(2)} €`;
      this.updateModalSizeSelectionUI();
    }

    this.renderModalExtras();
    document.getElementById('w3cModalNotes').value = '';
    document.getElementById('w3cModalQtyText').textContent = '1';

    this.updateModalPrice();
    this.openModal('product');
  },

  selectModalSize(sizeId) {
    this.modalSelectedSize = sizeId;
    this.updateModalSizeSelectionUI();
    this.updateModalPrice();
  },

  updateModalSizeSelectionUI() {
    ['junior', 'moyenne', 'familiale'].forEach(s => {
      const el = document.getElementById(`w3cSize-${s}`);
      if (el) {
        if (s === this.modalSelectedSize) el.classList.add('selected');
        else el.classList.remove('selected');
      }
    });
  },

  renderModalExtras() {
    const container = document.getElementById('w3cModalExtras');
    if (!container) return;

    let html = '';
    EXTRA_INGREDIENTS.forEach(ext => {
      const isChecked = this.modalSelectedExtras.includes(ext.id);
      html += `
        <label style="display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; background: #F8F9FA; border-radius: 6px; margin-bottom: 6px; cursor: pointer; border: 1px solid #E2E8F0;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <input type="checkbox" value="${ext.id}" ${isChecked ? 'checked' : ''} onchange="W3CApp.toggleExtra('${ext.id}')">
            <span style="font-size: 0.8rem; font-weight: 600;">${ext.name}</span>
          </div>
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--primary);">+${ext.price.toFixed(2)} €</span>
        </label>
      `;
    });
    container.innerHTML = html;
  },

  toggleExtra(extraId) {
    const idx = this.modalSelectedExtras.indexOf(extraId);
    if (idx > -1) this.modalSelectedExtras.splice(idx, 1);
    else this.modalSelectedExtras.push(extraId);
    this.updateModalPrice();
  },

  changeModalQty(delta) {
    this.modalQty = Math.max(1, this.modalQty + delta);
    document.getElementById('w3cModalQtyText').textContent = this.modalQty;
    this.updateModalPrice();
  },

  updateModalPrice() {
    if (!this.selectedProduct) return;
    const item = this.selectedProduct;
    const isSalad = !!item.isSalad || !!item.isDessert;
    const basePrice = isSalad ? item.prices.unique : (item.prices[this.modalSelectedSize] || item.prices.moyenne);

    const extrasTotal = this.modalSelectedExtras.reduce((sum, extId) => {
      const ext = EXTRA_INGREDIENTS.find(e => e.id === extId);
      return sum + (ext ? ext.price : 0);
    }, 0);

    const total = (basePrice + extrasTotal) * this.modalQty;
    const btnPrice = document.getElementById('w3cModalPriceBtn');
    if (btnPrice) btnPrice.textContent = `${total.toFixed(2)} €`;
  },

  confirmAddToCart() {
    if (!this.selectedProduct) return;
    const notes = document.getElementById('w3cModalNotes')?.value || '';

    PizzaStorage.addToCart({
      itemId: this.selectedProduct.id,
      sizeId: this.modalSelectedSize,
      quantity: this.modalQty,
      extras: [...this.modalSelectedExtras],
      instructions: notes
    });

    this.closeModal('product');
    this.showToast(`${this.selectedProduct.name} ajoute au panier`);
  },

  toggleFav(itemId) {
    const isFav = PizzaStorage.toggleFavorite(itemId);
    this.renderHomeGrid();
    this.renderProducts();
    this.showToast(isFav ? "Ajoute a vos favoris" : "Retire des favoris");
  },

  openModal(name) {
    const modalMap = {
      'product': 'w3cProductModalOverlay',
      'partner': 'w3cPartnerModalOverlay',
      'checkout': 'w3cCheckoutModalOverlay',
      'receipt': 'w3cReceiptModal'
    };
    const el = document.getElementById(modalMap[name]);
    if (el) el.classList.add('open');
  },

  closeModal(name) {
    const modalMap = {
      'product': 'w3cProductModalOverlay',
      'partner': 'w3cPartnerModalOverlay',
      'checkout': 'w3cCheckoutModalOverlay',
      'receipt': 'w3cReceiptModal'
    };
    const el = document.getElementById(modalMap[name]);
    if (el) el.classList.remove('open');
  },

  // --- PANIER W3C ---
  updateCartUI() {
    const cart = PizzaStorage.getCart();
    const totals = PizzaStorage.getCartTotals();

    const hBadge = document.getElementById('w3cHeaderBadge');
    const bBadge = document.getElementById('w3cBottomBadge');
    if (hBadge) {
      hBadge.textContent = totals.count;
      hBadge.style.display = totals.count > 0 ? 'flex' : 'none';
    }
    if (bBadge) {
      bBadge.textContent = totals.count;
      bBadge.style.display = totals.count > 0 ? 'flex' : 'none';
    }

    // Barre flottante style Deliveroo
    const floatBar = document.getElementById('w3cFloatingCartBar');
    const floatCount = document.getElementById('w3cFloatingCartCount');
    const floatTotal = document.getElementById('w3cFloatingCartTotal');
    if (floatBar) {
      if (totals.count > 0 && this.activeTab !== 'cart') {
        floatBar.style.display = 'flex';
        if (floatCount) floatCount.textContent = totals.count;
        if (floatTotal) floatTotal.textContent = `${totals.total.toFixed(2)} €`;
      } else {
        floatBar.style.display = 'none';
      }
    }

    // Gestion Retrait Magasin vs Livraison
    const modeBadge = document.getElementById('w3cCartModeIndicatorBadge');
    const bDel = document.getElementById('w3cCartModeDeliveryBtn');
    const bPick = document.getElementById('w3cCartModePickupBtn');
    const pickNotice = document.getElementById('w3cCartPickupNotice');
    const chanBox = document.getElementById('w3cCartDeliveryChannelsBox');

    if (totals.isPickup) {
      if (modeBadge) { modeBadge.textContent = 'Retrait Magasin (0 €)'; modeBadge.style.background = 'var(--primary)'; modeBadge.style.color = '#FFF'; }
      if (bDel) bDel.classList.remove('active');
      if (bPick) bPick.classList.add('active');
      if (pickNotice) pickNotice.style.display = 'block';
      if (chanBox) chanBox.style.display = 'none';
    } else {
      if (modeBadge) { modeBadge.textContent = 'Livraison à domicile'; modeBadge.style.background = '#FEE2E2'; modeBadge.style.color = 'var(--primary)'; }
      if (bDel) bDel.classList.add('active');
      if (bPick) bPick.classList.remove('active');
      if (pickNotice) pickNotice.style.display = 'none';
      if (chanBox) chanBox.style.display = 'block';
    }

    const subTotal = document.getElementById('w3cSubtotalText');
    const fee = document.getElementById('w3cDeliveryFeeText');
    const tot = document.getElementById('w3cTotalText');
    if (subTotal) subTotal.textContent = `${totals.subtotal.toFixed(2)} €`;
    if (fee) fee.textContent = totals.deliveryFee > 0 ? `${totals.deliveryFee.toFixed(2)} €` : 'OFFERTE';
    if (tot) tot.textContent = `${totals.total.toFixed(2)} €`;

    const discLine = document.getElementById('w3cDiscountLine');
    const discText = document.getElementById('w3cDiscountText');
    if (discLine && discText) {
      if (totals.discount > 0) {
        discLine.style.display = 'flex';
        discText.textContent = `-${totals.discount.toFixed(2)} €`;
      } else {
        discLine.style.display = 'none';
      }
    }

    const tipLine = document.getElementById('w3cTipLine');
    const tipText = document.getElementById('w3cTipText');
    if (tipLine && tipText) {
      if (totals.tip > 0) {
        tipLine.style.display = 'flex';
        tipText.textContent = `+${totals.tip.toFixed(2)} €`;
      } else {
        tipLine.style.display = 'none';
      }
    }

    const freeNotice = document.getElementById('w3cFreeDeliveryNotice');
    if (freeNotice) {
      if (totals.isPickup) {
        freeNotice.style.display = 'block';
        freeNotice.style.background = '#FEE2E2';
        freeNotice.style.color = 'var(--primary)';
        freeNotice.innerHTML = `🏪 <strong>Retrait à l'Atelier sélectionné</strong> • 12 Avenue Foch (Frais : 0 €)`;
      } else if (totals.subtotal === 0) {
        freeNotice.style.display = 'none';
      } else if (totals.isFreeDelivery) {
        freeNotice.style.display = 'block';
        freeNotice.style.background = '#E8F5E9';
        freeNotice.style.color = '#13672F';
        freeNotice.innerHTML = `<strong>Livraison offerte</strong> sur votre commande`;
      } else {
        const remaining = (PIZZERIA_CONFIG.freeDeliveryThreshold - totals.subtotal).toFixed(2);
        freeNotice.style.display = 'block';
        freeNotice.style.background = '#FFF3CD';
        freeNotice.style.color = '#856404';
        freeNotice.innerHTML = `Plus que <strong>${remaining} €</strong> pour la livraison offerte`;
      }
    }

    const list = document.getElementById('w3cCartItemsList');
    const empty = document.getElementById('w3cCartEmpty');
    const sum = document.getElementById('w3cCartSummary');
    const clear = document.getElementById('w3cClearCartBtn');

    if (cart.items.length === 0) {
      if (list) list.innerHTML = '';
      if (empty) empty.style.display = 'block';
      if (sum) sum.style.display = 'none';
      if (clear) clear.style.display = 'none';
      return;
    }

    if (empty) empty.style.display = 'none';
    if (sum) sum.style.display = 'block';
    if (clear) clear.style.display = 'inline-block';

    let html = '';
    cart.items.forEach(it => {
      const extras = it.extrasDetails?.map(e => `+ ${e.name}`).join(', ');
      html += `
        <div style="background: #FFFFFF; border: 1px solid #ECEFF1; border-radius: var(--radius-md); padding: 10px; margin-bottom: 8px; display: flex; align-items: center; gap: 10px;">
          <img src="../assets/${it.image}" alt="${it.name}" style="width: 52px; height: 52px; object-fit: cover; border-radius: 8px;">
          <div style="flex: 1; min-width: 0;">
            <strong style="font-size: 0.85rem; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${it.name}</strong>
            <span style="font-size: 0.72rem; color: var(--primary); font-weight: 700;">${it.sizeName} • ${it.unitPrice.toFixed(2)} €</span>
            ${extras ? `<div style="font-size: 0.65rem; color: #64748B;">${extras}</div>` : ''}
            ${it.instructions ? `<div style="font-size: 0.65rem; color: #64748B; font-style: italic;">Note: ${it.instructions}</div>` : ''}
          </div>
          <div style="display: flex; align-items: center; gap: 4px;">
            <button type="button" class="btn-ui btn-ui-outline" style="width: 24px; height: 24px; padding: 0; color: #333; border-color: #CBD5E1;" onclick="PizzaStorage.updateCartQuantity('${it.id}', -1)">-</button>
            <span style="font-weight: 800; font-size: 0.85rem; min-width: 16px; text-align: center;">${it.quantity}</span>
            <button type="button" class="btn-ui btn-ui-outline" style="width: 24px; height: 24px; padding: 0; color: #333; border-color: #CBD5E1;" onclick="PizzaStorage.updateCartQuantity('${it.id}', 1)">+</button>
          </div>
          <div style="text-align: right; min-width: 48px;">
            <strong style="font-size: 0.85rem; display: block;">${it.lineTotal.toFixed(2)} €</strong>
            <button type="button" style="background: none; border: none; color: var(--primary); font-size: 0.72rem; cursor: pointer; padding: 2px;" onclick="PizzaStorage.removeCartItem('${it.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
      `;
    });

    if (list) list.innerHTML = html;
  },

  clearCartAction() {
    PizzaStorage.clearCart();
    this.showToast("Panier vide");
  },

  quickAddDessert(itemId) {
    const item = MENU_ITEMS.find(i => i.id === itemId);
    if (item) {
      this.hapticFeedback(20);
      PizzaStorage.addToCart({ itemId: item.id, sizeId: 'moyenne', quantity: 1 });
      this.renderCart();
      this.updateCartBadge();
      this.showToast(`${item.name} ajoute au panier`);
    }
  },

  applyPromoAction() {
    const input = document.getElementById('w3cCartPromoInput');
    const feedback = document.getElementById('w3cPromoFeedback');
    if (!input) return;

    const code = input.value.trim();
    if (!code) {
      this.showToast("Veuillez saisir un code promo");
      return;
    }

    const res = PizzaStorage.applyPromoCode(code);
    if (res.success) {
      if (feedback) {
        feedback.textContent = res.message;
        feedback.style.color = "#13672F";
      }
      this.showToast("Code promo active (-15%)");
    } else {
      if (feedback) {
        feedback.textContent = res.message;
        feedback.style.color = "#BE1C1F";
      }
      this.showToast(res.message);
    }
  },

  selectTip(amount, btn) {
    PizzaStorage.setTip(amount);
    const buttons = document.querySelectorAll('.tip-btn');
    buttons.forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
  },

  setOrderMode(mode) {
    const isPickup = mode === 'pickup';
    PizzaStorage.setDeliveryMode(isPickup ? 'pickup' : 'direct');

    const btnDel = document.getElementById('w3cBtnGeoModeDelivery');
    const btnPick = document.getElementById('w3cBtnGeoModePickup');
    const cardPick = document.getElementById('w3cPickupInfoCard');
    const flowDel = document.getElementById('w3cDeliveryFlowSection');

    if (btnDel) btnDel.classList.toggle('active', !isPickup);
    if (btnPick) btnPick.classList.toggle('active', isPickup);
    if (cardPick) cardPick.style.display = isPickup ? 'block' : 'none';
    if (flowDel) flowDel.style.display = isPickup ? 'none' : 'block';

    this.updateCartUI();
    this.showToast(isPickup ? "Mode Retrait à l'Atelier sélectionné (Frais : 0 €)" : "Mode Livraison à Domicile sélectionné");
  },

  confirmPickupMode() {
    this.setOrderMode('pickup');
    this.showToast("Retrait en magasin confirmé (12 Avenue Foch) !");
    this.switchTab('cart');
  },

  setDeliveryChannel(channel) {
    PizzaStorage.setDeliveryMode(channel);

    const bDirect = document.getElementById('w3cChanDirect');
    const bUber = document.getElementById('w3cChanUber');
    const bDeliv = document.getElementById('w3cChanDeliveroo');

    if (bDirect) bDirect.style.border = '1px solid #E2E8F0';
    if (bUber) bUber.style.border = '1px solid #E2E8F0';
    if (bDeliv) bDeliv.style.border = '1px solid #E2E8F0';

    if (channel === 'direct' && bDirect) bDirect.style.border = '2px solid var(--primary)';
    if (channel === 'ubereats' && bUber) bUber.style.border = '2px solid #06C167';
    if (channel === 'deliveroo' && bDeliv) bDeliv.style.border = '2px solid #00CDBC';

    if (channel === 'ubereats' || channel === 'deliveroo') {
      this.openPartnerGatewayModal(channel);
    }
  },

  openPartnerGatewayModal(partner) {
    const isUber = partner === 'ubereats';
    const logoEl = document.getElementById('w3cPartnerLogo');
    const titleEl = document.getElementById('w3cPartnerTitle');
    const countEl = document.getElementById('w3cPartnerModalCartCount');
    const btnEl = document.getElementById('w3cPartnerModalActionBtn');
    const totals = PizzaStorage.getCartTotals();

    if (logoEl) {
      logoEl.src = isUber ? '../assets/LOGO-UBER-EAT.png' : '../assets/logo-deliveroo.png';
      logoEl.alt = isUber ? 'Uber Eats' : 'Deliveroo';
    }
    if (titleEl) {
      titleEl.textContent = isUber ? 'Passerelle Uber Eats' : 'Passerelle Deliveroo';
    }
    if (countEl) {
      countEl.textContent = `${totals.count} article${totals.count > 1 ? 's' : ''} (${totals.subtotal.toFixed(2)} €)`;
    }
    if (btnEl) {
      btnEl.href = isUber ? 'https://www.ubereats.com/fr' : 'https://deliveroo.fr/fr';
      btnEl.textContent = isUber ? 'Ouvrir Uber Eats' : 'Ouvrir Deliveroo';
    }

    this.openModal('partner');
  },

  openPartnerModal(partner) {
    this.openPartnerGatewayModal(partner);
  },

  simulatePartnerOrder() {
    this.closeModal('partner');
    this.showToast("Redirection vers l'application partenaire");
  },

  openCheckoutModal() {
    const cart = PizzaStorage.getCart();
    if (cart.items.length === 0) {
      this.showToast("Votre panier est vide");
      return;
    }
    const totals = PizzaStorage.getCartTotals();
    const tot = document.getElementById('w3cCheckoutTotal');
    if (tot) tot.textContent = `${totals.total.toFixed(2)} €`;

    const user = PizzaStorage.getCurrentUser();
    const loc = PizzaStorage.getSavedLocation();
    const addrInput = document.getElementById('w3cCheckoutAddr');
    const addrLabel = document.getElementById('w3cCheckoutAddrLabel');
    if (addrInput) {
      if (totals.isPickup) {
        if (addrLabel) addrLabel.textContent = "Point de retrait au comptoir :";
        addrInput.value = "Pizzeria Opti'Noisy • 12 Avenue Foch, 93160 Noisy-le-Grand";
        addrInput.readOnly = true;
      } else {
        if (addrLabel) addrLabel.textContent = "Adresse de livraison validée :";
        addrInput.readOnly = false;
        if (user && user.addresses?.[0]) {
          addrInput.value = `${user.addresses[0].street}, ${user.addresses[0].postalCode} ${user.addresses[0].city}`;
        } else if (loc && loc.address) {
          addrInput.value = loc.address;
        }
      }
    }

    this.openModal('checkout');
  },

  setPaymentMethod(method) {
    this.selectedPaymentMethod = method;

    const bCB = document.getElementById('w3cPayCB');
    const bApple = document.getElementById('w3cPayApple');
    const bCash = document.getElementById('w3cPayCash');

    [bCB, bApple, bCash].forEach(b => {
      if (b) {
        b.className = 'btn-ui btn-ui-outline';
        b.style.color = '#333';
        b.style.borderColor = '#CBD5E1';
      }
    });

    const activeMap = { 'cb': bCB, 'applepay': bApple, 'especes': bCash };
    if (activeMap[method]) {
      activeMap[method].className = 'btn-ui btn-ui-primary';
      activeMap[method].style.color = '#FFF';
    }

    const cbForm = document.getElementById('w3cCBFormWrap');
    const vCard = document.getElementById('w3cVirtualCardWidget');
    const appleSec = document.getElementById('w3cApplePaySection');
    const cashSec = document.getElementById('w3cCashPaySection');

    if (method === 'cb') {
      if (cbForm) cbForm.style.display = 'block';
      if (vCard) vCard.style.display = 'block';
      if (appleSec) appleSec.style.display = 'none';
      if (cashSec) cashSec.style.display = 'none';
    } else if (method === 'applepay') {
      if (cbForm) cbForm.style.display = 'none';
      if (vCard) vCard.style.display = 'none';
      if (appleSec) appleSec.style.display = 'block';
      if (cashSec) cashSec.style.display = 'none';
    } else {
      if (cbForm) cbForm.style.display = 'none';
      if (vCard) vCard.style.display = 'none';
      if (appleSec) appleSec.style.display = 'none';
      if (cashSec) cashSec.style.display = 'block';
    }
  },

  onCardNumberInput(val) {
    let clean = val.replace(/\D/g, '').substring(0, 16);
    let formatted = clean.match(/.{1,4}/g)?.join(' ') || clean;
    const inp = document.getElementById('w3cCardNumber');
    if (inp) inp.value = formatted;
    const numDisplay = document.getElementById('w3cVCardNumber');
    if (numDisplay) numDisplay.textContent = formatted || '•••• •••• •••• ••••';
  },

  onCardExpInput(val) {
    let clean = val.replace(/\D/g, '').substring(0, 4);
    if (clean.length >= 2) clean = clean.substring(0, 2) + '/' + clean.substring(2);
    const inp = document.getElementById('w3cCardExp');
    if (inp) inp.value = clean;
    const expDisplay = document.getElementById('w3cVCardExp');
    if (expDisplay) expDisplay.textContent = clean || 'MM/AA';
  },

  onCardNameInput(val) {
    const holderDisplay = document.getElementById('w3cVCardHolder');
    if (holderDisplay) holderDisplay.textContent = val.toUpperCase() || 'VOTRE NOM';
  },

  currentReceiptOrderId: null,

  executePayment() {
    const btn = document.getElementById('w3cPayExecuteBtn');
    const loader = document.getElementById('w3cPayLoader');
    const addr = document.getElementById('w3cCheckoutAddr')?.value || PIZZERIA_CONFIG.address;

    if (btn) btn.style.display = 'none';
    if (loader) loader.style.display = 'block';

    setTimeout(() => {
      if (loader) loader.style.display = 'none';
      if (btn) btn.style.display = 'block';

      const cart = PizzaStorage.getCart();
      const totals = PizzaStorage.getCartTotals();
      const user = PizzaStorage.getCurrentUser();

      PizzaStorage.createOrder({
        cartItems: [...cart.items],
        totals: totals,
        customerInfo: user || { fullName: "Client Invite", email: "client@optinoisy.fr" },
        deliveryAddress: addr,
        paymentMethod: this.selectedPaymentMethod,
        deliveryChannel: cart.deliveryMode || "direct"
      });

      this.closeModal('checkout');
      this.showToast("Commande validee avec succes");
      this.updateAccountUI();
      this.switchTab('account');
    }, 1100);
  },

  // --- CARTE LEAFLET & GESTION SECTEURS LIVRAISON W3C ---
  initMap() {
    const mapEl = document.getElementById('w3c-leaflet-map');
    if (!mapEl || typeof L === 'undefined') return;

    try {
      this.leafletMap = L.map('w3c-leaflet-map').setView([PIZZERIA_CONFIG.coords.lat, PIZZERIA_CONFIG.coords.lng], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(this.leafletMap);

      const shopIcon = L.divIcon({
        className: 'w3c-map-pin',
        html: `<div style="background: #BE1C1F; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800; border: 2px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.35);">OPTI</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      this.shopMarker = L.marker([PIZZERIA_CONFIG.coords.lat, PIZZERIA_CONFIG.coords.lng], { icon: shopIcon })
        .addTo(this.leafletMap)
        .bindPopup(`<b>${PIZZERIA_CONFIG.name}</b><br>${PIZZERIA_CONFIG.address}`);

      this.deliveryCircle = L.circle([PIZZERIA_CONFIG.coords.lat, PIZZERIA_CONFIG.coords.lng], {
        color: '#13672F',
        fillColor: '#13672F',
        fillOpacity: 0.12,
        radius: PIZZERIA_CONFIG.deliveryZoneRadiusKm * 1000
      }).addTo(this.leafletMap);

      // Clic interactif sur la carte pour choisir son adresse
      this.leafletMap.on('click', (e) => {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        const label = `Position selectionnee (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
        const inp = document.getElementById('w3cManualAddressInput');
        if (inp) inp.value = label;
        this.updateUserMapPosition(lat, lng, label);
      });

      // Position initiale par defaut : Campus IUT
      this.selectDeliverySector(48.8415, 2.5855, "Campus IUT Noisy-Champs, 2 Allee de l'IUT", "iut", 2.4);
    } catch (e) {
      console.error(e);
    }
  },

  selectDeliverySector(lat, lng, addressLabel, sectorId, distKm) {
    this.hapticFeedback(15);
    ['iut', 'centre', 'gare', 'varenne'].forEach(id => {
      const card = document.getElementById(`w3cGeoCard-${id}`);
      if (card) {
        if (id === sectorId) {
          card.style.background = '#FFF5F5';
          card.style.borderColor = 'var(--primary)';
          const t = card.querySelector('div');
          if (t) t.style.color = 'var(--primary)';
        } else {
          card.style.background = '#FFF';
          card.style.borderColor = '#E2E8F0';
          const t = card.querySelector('div');
          if (t) t.style.color = '#1A1C20';
        }
      }
    });

    const inp = document.getElementById('w3cManualAddressInput');
    if (inp) inp.value = addressLabel;

    this.updateUserMapPosition(lat, lng, addressLabel);
  },

  locateMeGPS() {
    this.hapticFeedback(20);
    this.showToast("Localisation en cours...");
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const label = "Position GPS detectee";
          const inp = document.getElementById('w3cManualAddressInput');
          if (inp) inp.value = label;
          this.updateUserMapPosition(lat, lng, label);
          this.showToast("Position GPS actualisee avec succes");
        },
        () => {
          this.selectDeliverySector(48.8415, 2.5855, "Campus IUT Noisy-Champs, 2 Allee de l'IUT", "iut", 2.4);
          this.showToast("Localisation : Campus IUT applique");
        },
        { timeout: 6000 }
      );
    } else {
      this.selectDeliverySector(48.8415, 2.5855, "Campus IUT Noisy-Champs, 2 Allee de l'IUT", "iut", 2.4);
      this.showToast("Localisation : Campus IUT applique");
    }
  },

  setManualCoords(lat, lng, label) {
    this.updateUserMapPosition(lat, lng, label);
    const inp = document.getElementById('w3cManualAddressInput');
    if (inp) inp.value = label;
  },

  onAddressChange(val) {
    this.setManualCoords(48.8488, 2.5525, val || "Noisy-le-Grand");
  },

  updateUserMapPosition(lat, lng, label) {
    if (!this.leafletMap) return;

    const dist = PizzaStorage.calculateDistanceKm(
      PIZZERIA_CONFIG.coords.lat, PIZZERIA_CONFIG.coords.lng,
      lat, lng
    );
    const eligible = dist <= PIZZERIA_CONFIG.deliveryZoneRadiusKm;

    PizzaStorage.saveLocation({
      lat: lat,
      lng: lng,
      address: label,
      distanceKm: dist,
      isEligible: eligible
    });

    if (this.userMarker) this.leafletMap.removeLayer(this.userMarker);
    const userIcon = L.divIcon({
      className: 'w3c-user-pin',
      html: `<div style="background: #0284C7; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: bold; border: 2px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.35);">VOUS</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });
    this.userMarker = L.marker([lat, lng], { icon: userIcon }).addTo(this.leafletMap).bindPopup(`<b>Destination</b><br>${label}`).openPopup();

    if (this.routePolyline) this.leafletMap.removeLayer(this.routePolyline);
    this.routePolyline = L.polyline([
      [PIZZERIA_CONFIG.coords.lat, PIZZERIA_CONFIG.coords.lng],
      [lat, lng]
    ], { color: eligible ? '#BE1C1F' : '#6C757D', dashArray: '6, 8', weight: 3 }).addTo(this.leafletMap);

    const bounds = L.latLngBounds([
      [PIZZERIA_CONFIG.coords.lat, PIZZERIA_CONFIG.coords.lng],
      [lat, lng]
    ]);
    this.leafletMap.fitBounds(bounds, { padding: [35, 35] });

    // Compteurs KPI W3C
    const statTime = document.getElementById('w3cGeoStatTime');
    const statDist = document.getElementById('w3cGeoStatDistance');
    const statFee = document.getElementById('w3cGeoStatFee');
    const zoneBanner = document.getElementById('w3cGeoZoneBanner');
    const zoneText = document.getElementById('w3cGeoZoneStatusText');

    const estMin = Math.round(15 + dist * 3.5);
    if (statTime) statTime.textContent = eligible ? `~${estMin} min` : 'Indisponible';
    if (statDist) statDist.textContent = `${dist} km`;
    if (statFee) statFee.textContent = eligible ? 'Offerte > 25€' : 'Partenaires';

    if (zoneBanner && zoneText) {
      if (eligible) {
        zoneBanner.style.background = '#F0FDF4';
        zoneBanner.style.borderColor = '#BBF7D0';
        zoneText.style.color = '#13672F';
        zoneText.textContent = `Zone couverte : Livraison directe en scooter electrique (~${estMin} min)`;
      } else {
        zoneBanner.style.background = '#FEF2F2';
        zoneBanner.style.borderColor = '#FECACA';
        zoneText.style.color = '#C62828';
        zoneText.textContent = 'Hors zone directe (> 8 km) : Commandez via Uber Eats ou Deliveroo';
      }
    }
  },

  // --- COMPTE CLIENT & SUIVI DES COMMANDES W3C ---
  updateAccountUI() {
    const user = PizzaStorage.getCurrentUser();
    const guest = document.getElementById('w3cAccountGuest');
    const logged = document.getElementById('w3cAccountUser');

    if (!user) {
      if (guest) guest.style.display = 'block';
      if (logged) logged.style.display = 'none';
      this.renderGuestOrders();
      return;
    }

    if (guest) guest.style.display = 'none';
    if (logged) logged.style.display = 'block';

    const nameEl = document.getElementById('w3cUserName');
    const emailEl = document.getElementById('w3cUserEmail');
    const avEl = document.getElementById('w3cUserAvatar');
    const addrEl = document.getElementById('w3cUserAddress');

    if (nameEl) nameEl.textContent = user.fullName;
    if (emailEl) emailEl.textContent = user.email;
    if (avEl) avEl.textContent = user.firstName.charAt(0).toUpperCase();

    const addr = user.addresses?.[0];
    if (addrEl) addrEl.textContent = addr ? `${addr.street}, ${addr.postalCode} ${addr.city}` : 'Aucune adresse enregistree';

    this.renderUserOrders();
  },

  renderGuestOrders() {
    const orders = PizzaStorage.getOrders();
    const container = document.getElementById('w3cGuestActiveOrdersSection');
    if (!container) return;

    if (orders.length === 0) {
      container.innerHTML = '';
      return;
    }

    const latest = orders[0];
    const step = latest.step || 1;
    const dateFormatted = new Date(latest.createdAt).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });

    container.innerHTML = `
      <div style="background: #FFFFFF; border: 1px solid #FECACA; border-radius: var(--radius-lg); padding: 14px; margin-bottom: 12px; box-shadow: var(--shadow-sm);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: var(--primary);"></span>
            <strong style="color: #1A1C20; font-size: 0.85rem;">Commande en cours (${latest.orderNumber})</strong>
          </div>
          <span style="color: ${step === 4 ? '#13672F' : 'var(--primary)'}; font-size: 0.72rem; background: ${step === 4 ? '#E8F5E9' : '#FFF5F5'}; padding: 2px 6px; border-radius: 4px; font-weight: 800;">${latest.statusLabel}</span>
        </div>
        <div style="font-size: 0.72rem; color: #64748B; margin-bottom: 8px;">${dateFormatted} • Mode Invite • ${latest.channelName}</div>

        <!-- Stepper de suivi en direct -->
        <div class="order-tracking-stepper" style="margin-bottom: 10px;">
          <div class="step-node ${step >= 1 ? (step === 1 ? 'active' : 'completed') : ''}">
            <div class="step-circle">1</div>
            <div class="step-label">Validee</div>
          </div>
          <div class="step-node ${step >= 2 ? (step === 2 ? 'active' : 'completed') : ''}">
            <div class="step-circle">2</div>
            <div class="step-label">Au four</div>
          </div>
          <div class="step-node ${step >= 3 ? (step === 3 ? 'active' : 'completed') : ''}">
            <div class="step-circle">3</div>
            <div class="step-label">En route</div>
          </div>
          <div class="step-node ${step >= 4 ? 'completed' : ''}">
            <div class="step-circle">4</div>
            <div class="step-label">Livree</div>
          </div>
        </div>

        <div style="border-top: 1px dashed #CBD5E1; border-bottom: 1px dashed #CBD5E1; padding: 6px 0; margin-bottom: 8px; font-size: 0.78rem;">
          ${latest.items.map(it => `
            <div style="display: flex; justify-content: space-between; color: #64748B; margin-bottom: 2px;">
              <span>${it.quantity}x ${it.name} (${it.sizeName})</span>
              <strong style="color: #1A1C20;">${it.lineTotal.toFixed(2)} €</strong>
            </div>
          `).join('')}
          <div style="display: flex; justify-content: space-between; border-top: 1px solid #ECEFF1; margin-top: 4px; padding-top: 4px; font-weight: 800;">
            <span>Total regle :</span>
            <span style="color: var(--primary);">${latest.totals.total.toFixed(2)} €</span>
          </div>
        </div>

        <button type="button" class="btn-ui" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px; background: #FFF; border: 1px solid #1A1C20; color: #1A1C20; font-size: 0.8rem; font-weight: 700; padding: 7px;" onclick="W3CApp.openOrderReceipt('${latest.id}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
          Voir le Ticket de Caisse Officiel
        </button>
      </div>
    `;
  },

  toggleAuthMode(mode) {
    const fLogin = document.getElementById('w3cFormLogin');
    const fReg = document.getElementById('w3cFormReg');
    const bLogin = document.getElementById('w3cTabBtnLogin');
    const bReg = document.getElementById('w3cTabBtnReg');
    const alertBox = document.getElementById('w3cAuthAlertBanner');

    if (alertBox) alertBox.style.display = 'none';

    if (mode === 'login') {
      if (fLogin) fLogin.style.display = 'block';
      if (fReg) fReg.style.display = 'none';
      if (bLogin) bLogin.classList.add('active');
      if (bReg) bReg.classList.remove('active');
    } else {
      if (fLogin) fLogin.style.display = 'none';
      if (fReg) fReg.style.display = 'block';
      if (bLogin) bLogin.classList.remove('active');
      if (bReg) bReg.classList.add('active');
    }
  },

  quickDemoLogin() {
    const res = PizzaStorage.loginUser('demo@mmi.fr', 'demo123');
    if (res.success) {
      this.showToast(`Bienvenue, ${res.user.firstName} ! (Compte Démo Connecté)`);
      this.updateAccountUI();
    }
  },

  fillDemoLogin() {
    this.quickDemoLogin();
  },

  handleLogin(e) {
    e.preventDefault();
    const alertBox = document.getElementById('w3cAuthAlertBanner');
    const email = document.getElementById('w3cLoginEmail')?.value.trim();
    const pwd = document.getElementById('w3cLoginPwd')?.value;

    const res = PizzaStorage.loginUser(email, pwd);
    if (res.success) {
      if (alertBox) alertBox.style.display = 'none';
      this.showToast(`Bienvenue, ${res.user.firstName} !`);
      this.updateAccountUI();
    } else {
      if (alertBox) {
        alertBox.textContent = res.message || 'Identifiants incorrects. Utilisez le compte testeur ci-dessus.';
        alertBox.style.display = 'block';
      }
      this.showToast(res.message);
    }
  },

  handleRegister(e) {
    e.preventDefault();
    const alertBox = document.getElementById('w3cAuthAlertBanner');
    const firstName = document.getElementById('w3cRegFirst')?.value.trim();
    const lastName = document.getElementById('w3cRegLast')?.value.trim();
    const email = document.getElementById('w3cRegEmail')?.value.trim();
    const phone = document.getElementById('w3cRegPhone')?.value.trim();
    const address = document.getElementById('w3cRegAddr')?.value.trim();
    const password = document.getElementById('w3cRegPwd')?.value;

    const res = PizzaStorage.registerUser({
      firstName, lastName, email, phone, address, password
    });

    if (res.success) {
      if (alertBox) alertBox.style.display = 'none';
      this.showToast(`Compte créé avec succès ! Bienvenue, ${res.user.firstName}.`);
      this.updateAccountUI();
    } else {
      if (alertBox) {
        alertBox.textContent = res.message;
        alertBox.style.display = 'block';
      }
      this.showToast(res.message);
    }
  },

  logout() {
    PizzaStorage.logoutUser();
    this.showToast("Deconnexion effectuee");
  },

  renderUserOrders() {
    const orders = PizzaStorage.getOrders();
    const container = document.getElementById('w3cUserOrders');
    const badge = document.getElementById('w3cOrderCountBadge');

    if (badge) badge.textContent = `${orders.length} commande${orders.length > 1 ? 's' : ''}`;
    if (!container) return;

    if (orders.length === 0) {
      container.innerHTML = `<div style="text-align: center; padding: 24px; background: #F8F9FA; border-radius: var(--radius-md); border: 1px solid #ECEFF1;"><p style="font-size: 0.8rem; color: #64748B; margin: 0;">Aucune commande enregistree.</p></div>`;
      return;
    }

    let html = '';
    orders.forEach(ord => {
      const step = ord.step || 1;
      const date = new Date(ord.createdAt).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
      });

      html += `
        <div style="background: #FFFFFF; border: 1px solid #ECEFF1; border-radius: var(--radius-lg); padding: 14px; margin-bottom: 12px; box-shadow: var(--shadow-sm);">
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 800; margin-bottom: 2px;">
            <span style="color: #1A1C20;">${ord.orderNumber}</span>
            <span style="color: ${step === 4 ? '#13672F' : 'var(--primary)'}; font-size: 0.75rem; background: ${step === 4 ? '#E8F5E9' : '#FFF5F5'}; padding: 2px 6px; border-radius: 4px;">${ord.statusLabel}</span>
          </div>
          <div style="font-size: 0.72rem; color: #64748B; margin-bottom: 8px;">${date} • ${ord.channelName}</div>

          <!-- Stepper de suivi en direct (mis a jour depuis le back-office) -->
          <div class="order-tracking-stepper">
            <div class="step-node ${step >= 1 ? (step === 1 ? 'active' : 'completed') : ''}">
              <div class="step-circle">1</div>
              <div class="step-label">Validee</div>
            </div>
            <div class="step-node ${step >= 2 ? (step === 2 ? 'active' : 'completed') : ''}">
              <div class="step-circle">2</div>
              <div class="step-label">Au four</div>
            </div>
            <div class="step-node ${step >= 3 ? (step === 3 ? 'active' : 'completed') : ''}">
              <div class="step-circle">3</div>
              <div class="step-label">En route</div>
            </div>
            <div class="step-node ${step >= 4 ? 'completed' : ''}">
              <div class="step-circle">4</div>
              <div class="step-label">Livree</div>
            </div>
          </div>

          <div style="border-top: 1px dashed #CBD5E1; padding-top: 8px; font-size: 0.78rem; margin-top: 8px;">
            ${ord.items.map(it => `
              <div style="display: flex; justify-content: space-between; color: #64748B; margin-bottom: 2px;">
                <span>${it.quantity}x ${it.name} (${it.sizeName})</span>
                <strong style="color: #1A1C20;">${it.lineTotal.toFixed(2)} €</strong>
              </div>
            `).join('')}
          </div>
          <div style="display: flex; justify-content: space-between; border-top: 1px solid #ECEFF1; margin-top: 8px; padding-top: 8px; font-weight: 800; font-size: 0.92rem;">
            <span>Total regle :</span>
            <span style="color: var(--primary);">${ord.totals.total.toFixed(2)} €</span>
          </div>

          <!-- Bouton Ticket de caisse W3C -->
          <button type="button" class="btn-ui" style="width: 100%; margin-top: 8px; display: flex; align-items: center; justify-content: center; gap: 6px; background: #FFF; border: 1px solid #1A1C20; color: #1A1C20; font-size: 0.8rem; font-weight: 700; padding: 7px;" onclick="W3CApp.openOrderReceipt('${ord.id}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            Imprimer le Ticket de Caisse Officiel
          </button>
        </div>
      `;
    });
    container.innerHTML = html;
  },

  // --- GENERATION DU TICKET DE CAISSE HAUTE FIDELITE W3C ---
  openOrderReceipt(orderId) {
    const orders = PizzaStorage.getOrders();
    const ord = orders.find(o => o.id === orderId);
    if (!ord) return;

    this.currentReceiptOrderId = orderId;
    this.hapticFeedback(15);
    const subtotalHT = (ord.totals.subtotal / 1.10).toFixed(2);
    const tva = (ord.totals.subtotal - subtotalHT).toFixed(2);
    const dateFormatted = new Date(ord.createdAt).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const html = `
      <div id="printableReceiptAreaW3C" class="artisanal-receipt-card" style="background: #FFFFFF !important; padding: 4px; color: #1A1C20;">
        
        <!-- Ruban Tricolore & Header Marque -->
        <div class="italian-ribbon" style="height: 5px; background: linear-gradient(90deg, #13672F 0%, #13672F 33.3%, #ffffff 33.3%, #ffffff 66.6%, #BE1C1F 66.6%, #BE1C1F 100%); border-radius: 4px; margin-bottom: 12px;"></div>
        
        <div style="text-align: center; margin-bottom: 12px;">
          <img src="../assets/logo-opti-noisy.svg" alt="Opti'Noisy Pizza" style="height: 48px; margin-bottom: 6px; display: inline-block;">
          <div style="font-weight: 800; font-size: 1.1rem; color: #BE1C1F; letter-spacing: 0.5px;">OPTI'NOISY PIZZA</div>
          <div style="color: #64748B; font-size: 0.72rem; font-weight: 600;">Pizzeria Artisanale • Cuisson au Feu de Bois de Hetre</div>
          <div style="font-size: 0.75rem; font-weight: 600; color: #334155; margin-top: 2px;">12 Avenue du Marechal Foch • 93160 Noisy-le-Grand</div>
          <div style="color: #64748B; font-size: 0.68rem; margin-top: 2px;">Tel : 01 43 05 92 10 • SIRET : 842 190 357 00018</div>
          <div style="color: #64748B; font-size: 0.68rem;">TVA Intracommunautaire : FR 49 842190357</div>
        </div>

        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 10px 12px; margin-bottom: 12px; font-size: 0.78rem;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span style="color: #64748B;">COMMANDE :</span>
            <strong style="color: #BE1C1F; font-family: monospace; font-size: 0.88rem;">${ord.orderNumber}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span style="color: #64748B;">DATE & HEURE :</span>
            <strong style="color: #1E293B;">${dateFormatted}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span style="color: #64748B;">CANAL :</span>
            <strong style="color: #1E293B;">${ord.channelName || 'Opti\'Noisy Direct'}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span style="color: #64748B;">CLIENT :</span>
            <strong style="color: #1E293B;">${ord.customer?.fullName || 'Client Invite'}</strong>
          </div>
          <div style="color: #334155; margin-top: 4px; padding-top: 4px; border-top: 1px dashed #E2E8F0; font-size: 0.72rem;">
            <strong>LIVRAISON :</strong> ${ord.address || '12 Avenue du Marechal Foch, Noisy-le-Grand'}
          </div>
        </div>

        <div style="margin-bottom: 12px;">
          <div style="font-weight: 800; font-size: 0.72rem; color: #64748B; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 2px solid #E2E8F0; display: flex; justify-content: space-between; text-transform: uppercase;">
            <span>Articles Commandes</span>
            <span>Total TTC</span>
          </div>
          ${ord.items.map(it => `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; padding-bottom: 4px; border-bottom: 1px solid #F1F5F9; font-size: 0.82rem;">
              <div>
                <span style="background: #F1F5F9; color: #0F172A; font-weight: 800; padding: 1px 6px; border-radius: 4px; font-size: 0.75rem; margin-right: 4px; border: 1px solid #E2E8F0;">${it.quantity}x</span>
                <strong style="color: #0F172A;">${it.name}</strong><br>
                <span style="color: #64748B; font-size: 0.72rem;">Format: ${it.sizeName}${it.extrasDetails?.length ? ' • + ' + it.extrasDetails.map(e => e.name).join(', ') : ''}</span>
                ${it.instructions ? `<div style="color: #BE1C1F; font-style: italic; font-size: 0.68rem;">Note: ${it.instructions}</div>` : ''}
              </div>
              <div style="text-align: right; font-weight: 800; color: #0F172A;">
                ${it.lineTotal.toFixed(2)} €
              </div>
            </div>
          `).join('')}
        </div>

        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 10px 12px; margin-bottom: 12px; font-size: 0.78rem;">
          <div style="display: flex; justify-content: space-between; color: #64748B; margin-bottom: 3px;">
            <span>Sous-total HT (10%) :</span>
            <span>${subtotalHT} €</span>
          </div>
          <div style="display: flex; justify-content: space-between; color: #64748B; margin-bottom: 3px;">
            <span>TVA collectee (10%) :</span>
            <span>${tva} €</span>
          </div>
          ${ord.totals.deliveryFee > 0 ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
              <span style="color: #64748B;">Frais de livraison :</span>
              <span>${ord.totals.deliveryFee.toFixed(2)} €</span>
            </div>
          ` : `
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
              <span style="color: #64748B;">Frais de livraison :</span>
              <span style="color: #13672F; font-weight: 800;">OFFERTE (0.00 €)</span>
            </div>
          `}
          ${ord.totals.discount > 0 ? `
            <div style="display: flex; justify-content: space-between; color: #BE1C1F; font-weight: 800; margin-bottom: 3px;">
              <span>Remise Commerciale (${ord.totals.promoCode || 'MMI2026'}) :</span>
              <span>-${ord.totals.discount.toFixed(2)} €</span>
            </div>
          ` : ''}
          ${ord.totals.tip > 0 ? `
            <div style="display: flex; justify-content: space-between; color: #64748B; margin-bottom: 3px;">
              <span>Pourboire Pizzaiolo :</span>
              <span>+${ord.totals.tip.toFixed(2)} €</span>
            </div>
          ` : ''}
          <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 8px; margin-top: 6px; border-top: 2px solid #CBD5E1;">
            <strong style="font-size: 0.95rem; color: #0F172A;">TOTAL TTC REGLE :</strong>
            <strong style="font-size: 1.15rem; color: #BE1C1F;">${ord.totals.total.toFixed(2)} €</strong>
          </div>
        </div>

        <div style="text-align: center; padding: 8px 12px; border-radius: 8px; border: 1px solid #BBF7D0; background: #F0FDF4; margin-bottom: 8px;">
          <div style="font-weight: 700; font-size: 0.8rem; color: #166534;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display: inline-block; vertical-align: middle; margin-right: 4px;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            Paiement 3D-Secure valide • <strong>${ord.payment?.label || 'Carte Bancaire'}</strong>
          </div>
          <div style="color: #64748B; margin-top: 2px; font-size: 0.68rem; font-family: monospace;">AUTH-ID: OPTI-${ord.orderNumber.replace(/[^0-9]/g, '')}-OK • NF525</div>
        </div>

        <!-- Code-barres Thermique SVG -->
        <div style="text-align: center; margin-top: 10px; padding-top: 8px; border-top: 1px dashed #CBD5E1;">
          <svg width="200" height="34" viewBox="0 0 200 34" fill="#1A1C20" style="margin: 0 auto; display: block;">
            <rect x="0" y="0" width="3" height="26"></rect>
            <rect x="5" y="0" width="2" height="26"></rect>
            <rect x="9" y="0" width="4" height="26"></rect>
            <rect x="15" y="0" width="2" height="26"></rect>
            <rect x="19" y="0" width="5" height="26"></rect>
            <rect x="27" y="0" width="2" height="26"></rect>
            <rect x="31" y="0" width="3" height="26"></rect>
            <rect x="36" y="0" width="4" height="26"></rect>
            <rect x="42" y="0" width="2" height="26"></rect>
            <rect x="47" y="0" width="5" height="26"></rect>
            <rect x="54" y="0" width="3" height="26"></rect>
            <rect x="60" y="0" width="2" height="26"></rect>
            <rect x="64" y="0" width="4" height="26"></rect>
            <rect x="71" y="0" width="2" height="26"></rect>
            <rect x="75" y="0" width="3" height="26"></rect>
            <rect x="81" y="0" width="5" height="26"></rect>
            <rect x="88" y="0" width="2" height="26"></rect>
            <rect x="92" y="0" width="4" height="26"></rect>
            <rect x="99" y="0" width="3" height="26"></rect>
            <rect x="104" y="0" width="2" height="26"></rect>
            <rect x="109" y="0" width="5" height="26"></rect>
            <rect x="116" y="0" width="2" height="26"></rect>
            <rect x="121" y="0" width="4" height="26"></rect>
            <rect x="127" y="0" width="3" height="26"></rect>
            <rect x="133" y="0" width="2" height="26"></rect>
            <rect x="138" y="0" width="4" height="26"></rect>
            <rect x="144" y="0" width="3" height="26"></rect>
            <rect x="149" y="0" width="5" height="26"></rect>
            <rect x="156" y="0" width="2" height="26"></rect>
            <rect x="160" y="0" width="4" height="26"></rect>
            <rect x="166" y="0" width="2" height="26"></rect>
            <rect x="171" y="0" width="5" height="26"></rect>
            <rect x="178" y="0" width="3" height="26"></rect>
            <rect x="184" y="0" width="2" height="26"></rect>
            <rect x="189" y="0" width="4" height="26"></rect>
            <rect x="195" y="0" width="3" height="26"></rect>
            <text x="100" y="33" font-size="7" font-family="monospace" text-anchor="middle" fill="#64748B">3 760124 892015</text>
          </svg>
          <div style="text-align: center; color: #64748B; font-size: 0.68rem; margin-top: 4px;">
            Merci de votre confiance • Cuisson au feu de bois a deguster chaud !
          </div>
        </div>
      </div>
    `;

    document.getElementById('w3cReceiptContent').innerHTML = html;
    this.openModal('receipt');
  },

  printReceiptSafely() {
    const orders = PizzaStorage.getOrders();
    const ord = orders.find(o => o.id === this.currentReceiptOrderId) || orders[0];
    if (!ord) return;

    this.hapticFeedback(15);
    window.print();
  },

  downloadReceiptSafely() {
    const orders = PizzaStorage.getOrders();
    const ord = orders.find(o => o.id === this.currentReceiptOrderId) || orders[0];
    if (!ord) return;

    this.hapticFeedback(15);
    const receiptElement = document.getElementById('printableReceiptAreaW3C') || document.getElementById('w3cReceiptContent');
    const safeOrderNum = ord.orderNumber ? ord.orderNumber.replace(/[^a-zA-Z0-9-]/g, '') : 'COMMANDE';
    const filename = `Facture-OPTINOISY-${safeOrderNum}.pdf`;

    if (window.html2pdf && receiptElement) {
      const opt = {
        margin: [6, 6, 6, 6],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      this.showToast("Telechargement de votre PDF...");
      html2pdf().set(opt).from(receiptElement).save().then(() => {
        this.showToast("Facture PDF telechargee avec succes");
      }).catch(err => {
        console.warn("Generation PDF alternative:", err);
        window.print();
      });
    } else {
      window.print();
    }
  },

  simulateOrderStep(orderId, step) {
    this.hapticFeedback(20);
    PizzaStorage.setOrderStep(orderId, step);
    this.updateAccountUI();
    const labels = ["Validee", "Au four a bois", "En route", "Livree avec succes"];
    this.showToast(`Statut actualise : ${labels[step - 1]}`);
  },

  showToast(msg) {
    const toast = document.getElementById('w3cToast');
    const txt = document.getElementById('w3cToastText');
    if (txt) txt.textContent = msg;
    if (toast) {
      toast.style.display = 'flex';
      setTimeout(() => {
        toast.style.display = 'none';
      }, 2500);
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  W3CApp.init();
});
