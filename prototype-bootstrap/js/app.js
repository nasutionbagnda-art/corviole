/**
 * Opti'Noisy Pizza - Logique Applicative Prototype Bootstrap 5.3
 * TP MMI3 Web Mobile - Octobre 2026
 * Sans emojis, sans popups alert() parasites, haute fidelite
 */

const App = {
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

  bsProductModal: null,
  bsPartnerModal: null,
  bsCheckoutModal: null,
  bsReceiptModal: null,
  bsToast: null,

  hapticFeedback(pattern = 15) {
    if ('vibrate' in navigator) {
      try { navigator.vibrate(pattern); } catch (e) {}
    }
  },

  init() {
    if (window.self !== window.top) {
      document.body.classList.add('in-iframe');
    }
    const savedCart = PizzaStorage.getCart();
    this.initBootstrapComponents();
    this.renderCategoryPills();
    this.renderHomeBestSellers();
    this.renderMenuProducts();
    this.applyOrderModeUI(savedCart.deliveryMode || 'direct');
    this.updateCartUI();
    this.updateAccountUI();
    this.initEventListeners();
    this.initLeafletMap();

    // Enregistrement PWA Service Worker
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
      });
    }

    setInterval(() => {
      if (this.activeTab === 'account') {
        this.renderUserOrders();
      }
    }, 15000);
  },

  initBootstrapComponents() {
    const pModalEl = document.getElementById('productModal');
    if (pModalEl) this.bsProductModal = new bootstrap.Modal(pModalEl);

    const partModalEl = document.getElementById('partnerModal');
    if (partModalEl) this.bsPartnerModal = new bootstrap.Modal(partModalEl);

    const checkModalEl = document.getElementById('checkoutModal');
    if (checkModalEl) this.bsCheckoutModal = new bootstrap.Modal(checkModalEl);

    const recModalEl = document.getElementById('orderReceiptModal');
    if (recModalEl) this.bsReceiptModal = new bootstrap.Modal(recModalEl);

    const toastEl = document.getElementById('appToast');
    if (toastEl) this.bsToast = new bootstrap.Toast(toastEl, { delay: 2800 });
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

    window.addEventListener('optinoisy:loyalty-updated', () => {
      this.renderLoyaltyUI();
    });

    window.addEventListener('storage', (e) => {
      if (!e.key || e.key === 'optinoisy_orders' || e.key === 'optinoisy_active_user' || e.key === 'optinoisy_loyalty_data') {
        this.updateAccountUI();
      }
    });
  },

  switchTab(tabId) {
    this.activeTab = tabId;

    const sections = ['home', 'menu', 'geo', 'cart', 'account'];
    sections.forEach(s => {
      const el = document.getElementById(`tab-${s}`);
      if (el) el.style.display = (s === tabId) ? 'block' : 'none';
    });

    const navMap = {
      'home': 'navTabHome',
      'menu': 'navTabMenu',
      'cart': 'navTabCart',
      'geo': 'navTabGeo',
      'account': 'navTabAccount'
    };
    Object.keys(navMap).forEach(key => {
      const btn = document.getElementById(navMap[key]);
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

    // Mise a jour visuelle des 3 cartes de taille
    ['junior', 'moyenne', 'familiale'].forEach(s => {
      const card = document.getElementById(`homeSizeCard-${s}`);
      const label = document.getElementById(`homeSizeLabel-${s}`);
      if (card) {
        if (s === size) card.classList.add('selected');
        else card.classList.remove('selected');
      }
      if (label) {
        if (s === size) {
          label.classList.remove('text-dark');
          label.classList.add('text-danger');
        } else {
          label.classList.remove('text-danger');
          label.classList.add('text-dark');
        }
      }
    });

    // Re-rendre les 4 pizzas avec les prix de la taille choisie
    this.renderHomeBestSellers();
  },

  renderHomeBestSellers() {
    const container = document.getElementById('homeBestSellersGrid');
    if (!container) return;

    const bestSellers = MENU_ITEMS.filter(it => 
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
    bestSellers.forEach(item => {
      const currentPrice = item.prices[currentSize] || item.prices.moyenne || 12.00;
      const isFav = PizzaStorage.getFavorites().includes(item.id);

      html += `
        <div class="col-6">
          <div class="pizza-card" onclick="App.openProductModal('${item.id}', '${currentSize}')">
            <div class="pizza-card-image-wrap">
              <img src="../assets/${item.image}" alt="${item.name}" loading="lazy">
              ${item.badge ? `<span class="pizza-badge-overlay badge bg-danger">${item.badge}</span>` : ''}
              <button type="button" class="fav-btn-overlay ${isFav ? 'active' : ''}" 
                      onclick="event.stopPropagation(); App.toggleFavorite('${item.id}')" title="Favori">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="${isFav ? '#BE1C1F' : 'none'}" stroke="${isFav ? '#BE1C1F' : '#999'}" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              </button>
            </div>
            <div class="pizza-card-body p-2">
              <h4 class="pizza-card-title text-truncate mb-1">${item.name}</h4>
              <p class="pizza-card-desc mb-2">${item.description}</p>
              <div class="d-flex align-items-center justify-content-between mb-1">
                <span class="badge bg-light text-muted border py-1 px-2" style="font-size: 0.65rem;">
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
          </div>
        </div>
      `;
    });
    container.innerHTML = html;
  },

  // --- RENDU MENU ---
  renderCategoryPills() {
    const container = document.getElementById('categoryPillsContainer');
    if (!container) return;

    let html = '';
    MENU_CATEGORIES.forEach(cat => {
      const isActive = cat.id === this.activeCategory;
      html += `
        <button type="button" class="category-pill ${isActive ? 'active' : ''}" onclick="App.filterCategory('${cat.id}')">
          ${cat.label}
        </button>
      `;
    });
    container.innerHTML = html;
  },

  filterCategory(catId) {
    this.activeCategory = catId;
    this.renderCategoryPills();
    this.renderMenuProducts();
  },

  onSearchInput(query) {
    this.searchQuery = query.trim().toLowerCase();
    this.renderMenuProducts();
  },

  renderMenuProducts() {
    const container = document.getElementById('menuProductsGrid');
    if (!container) return;

    let filtered = MENU_ITEMS.filter(item => {
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

    const countLabel = document.getElementById('menuCountLabel');
    if (countLabel) {
      countLabel.textContent = `${filtered.length} produits`;
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="col-12 text-center py-5">
          <p class="text-muted small">Aucun produit ne correspond a votre recherche.</p>
          <button type="button" class="btn btn-outline-danger btn-sm rounded-pill" onclick="document.getElementById('menuSearchInput').value=''; App.onSearchInput(''); App.filterCategory('all');">
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
        <div class="col-6">
          <div class="pizza-card" onclick="App.openProductModal('${item.id}')">
            <div class="pizza-card-image-wrap">
              <img src="../assets/${item.image}" alt="${item.name}" loading="lazy">
              ${item.badge ? `<span class="pizza-badge-overlay badge bg-danger">${item.badge}</span>` : ''}
              <button type="button" class="fav-btn-overlay ${isFav ? 'active' : ''}" 
                      onclick="event.stopPropagation(); App.toggleFavorite('${item.id}')" title="Favori">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="${isFav ? '#BE1C1F' : 'none'}" stroke="${isFav ? '#BE1C1F' : '#999'}" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              </button>
            </div>
            <div class="pizza-card-body p-2">
              <h4 class="pizza-card-title text-truncate mb-1">${item.name}</h4>
              <p class="pizza-card-desc mb-2">${item.description}</p>
              
              ${!isSalad ? `
                <div class="d-flex align-items-center gap-1 mb-2 text-muted" style="font-size: 0.68rem;">
                  <span>26cm</span> •
                  <span class="text-danger fw-bold">31cm</span> •
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
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  },

  // --- MODAL PRODUIT ---
  openProductModal(itemId, initialSize = null) {
    const item = MENU_ITEMS.find(p => p.id === itemId);
    if (!item) return;

    this.selectedProduct = item;
    this.modalSelectedSize = initialSize || this.homeSelectedSize || 'moyenne';
    this.modalSelectedExtras = [];
    this.modalQty = 1;

    document.getElementById('modalProductName').textContent = item.name;
    document.getElementById('modalProductDesc').textContent = item.description;
    document.getElementById('modalProductImage').src = `../assets/${item.image}`;
    document.getElementById('modalProductImage').alt = item.name;
    
    const badgeEl = document.getElementById('modalProductBadge');
    if (item.badge) {
      badgeEl.textContent = item.badge;
      badgeEl.style.display = 'inline-block';
    } else {
      badgeEl.style.display = 'none';
    }

    const isSalad = !!item.isSalad || !!item.isDessert;
    const sizeSection = document.getElementById('modalSizeSection');

    if (isSalad) {
      sizeSection.style.display = 'none';
    } else {
      sizeSection.style.display = 'block';
      document.getElementById('sizePrice-junior').textContent = `${(item.prices.junior || 8.90).toFixed(2)} €`;
      document.getElementById('sizePrice-moyenne').textContent = `${(item.prices.moyenne || 12.90).toFixed(2)} €`;
      document.getElementById('sizePrice-familiale').textContent = `${(item.prices.familiale || 17.90).toFixed(2)} €`;
      this.updateModalSizeSelectionUI();
    }

    this.renderModalExtras();
    document.getElementById('modalInstructions').value = '';
    document.getElementById('modalQtyDisplay').textContent = '1';

    this.updateModalPriceCalculation();

    if (this.bsProductModal) this.bsProductModal.show();
  },

  selectProductModalSize(sizeId) {
    this.modalSelectedSize = sizeId;
    this.updateModalSizeSelectionUI();
    this.updateModalPriceCalculation();
  },

  updateModalSizeSelectionUI() {
    ['junior', 'moyenne', 'familiale'].forEach(s => {
      const card = document.getElementById(`sizeCard-${s}`);
      if (card) {
        if (s === this.modalSelectedSize) card.classList.add('selected');
        else card.classList.remove('selected');
      }
    });
  },

  renderModalExtras() {
    const container = document.getElementById('modalExtrasList');
    if (!container) return;

    let html = '';
    EXTRA_INGREDIENTS.forEach(ext => {
      const isChecked = this.modalSelectedExtras.includes(ext.id);
      html += `
        <label class="d-flex justify-content-between align-items-center p-2 mb-1 bg-light rounded-3 border cursor-pointer">
          <div class="d-flex align-items-center gap-2">
            <input type="checkbox" value="${ext.id}" ${isChecked ? 'checked' : ''} onchange="App.toggleModalExtra('${ext.id}')">
            <span class="small fw-semibold text-dark">${ext.name}</span>
          </div>
          <span class="small fw-bold text-danger">+${ext.price.toFixed(2)} €</span>
        </label>
      `;
    });
    container.innerHTML = html;
  },

  toggleModalExtra(extraId) {
    const idx = this.modalSelectedExtras.indexOf(extraId);
    if (idx > -1) this.modalSelectedExtras.splice(idx, 1);
    else this.modalSelectedExtras.push(extraId);
    this.updateModalPriceCalculation();
  },

  changeModalQty(delta) {
    this.modalQty = Math.max(1, this.modalQty + delta);
    document.getElementById('modalQtyDisplay').textContent = this.modalQty;
    this.updateModalPriceCalculation();
  },

  updateModalPriceCalculation() {
    if (!this.selectedProduct) return;
    const item = this.selectedProduct;
    const isSalad = !!item.isSalad || !!item.isDessert;
    const basePrice = isSalad ? item.prices.unique : (item.prices[this.modalSelectedSize] || item.prices.moyenne);
    
    const extrasTotal = this.modalSelectedExtras.reduce((sum, extId) => {
      const ext = EXTRA_INGREDIENTS.find(e => e.id === extId);
      return sum + (ext ? ext.price : 0);
    }, 0);

    const total = (basePrice + extrasTotal) * this.modalQty;
    const priceDisplay = document.getElementById('modalFinalPrice');
    if (priceDisplay) priceDisplay.textContent = `${total.toFixed(2)} €`;
  },

  confirmAddToCart() {
    if (!this.selectedProduct) return;
    const notes = document.getElementById('modalInstructions')?.value || '';

    PizzaStorage.addToCart({
      itemId: this.selectedProduct.id,
      sizeId: this.modalSelectedSize,
      quantity: this.modalQty,
      extras: [...this.modalSelectedExtras],
      instructions: notes
    });

    if (this.bsProductModal) this.bsProductModal.hide();
    this.showToast(`${this.selectedProduct.name} ajoute au panier`);
  },

  quickAddDessert(itemId) {
    const item = MENU_ITEMS.find(i => i.id === itemId);
    if (item) {
      this.hapticFeedback(20);
      PizzaStorage.addToCart({ itemId: item.id, sizeId: 'moyenne', quantity: 1 });
      this.updateCartUI();
      this.showToast(`${item.name} ajoute au panier`);
    }
  },

  toggleFavorite(itemId) {
    const isFav = PizzaStorage.toggleFavorite(itemId);
    this.renderHomeBestSellers();
    this.renderMenuProducts();
    this.showToast(isFav ? "Ajoute a vos favoris" : "Retire des favoris");
  },

  showToast(message) {
    const toastMsgEl = document.getElementById('appToastMessage');
    if (toastMsgEl) toastMsgEl.textContent = message;
    if (this.bsToast) this.bsToast.show();
  },

  // --- PANIER ---
  updateCartUI() {
    const cart = PizzaStorage.getCart();
    const totals = PizzaStorage.getCartTotals();

    const headerBadge = document.getElementById('headerCartBadge');
    const bottomBadge = document.getElementById('bottomNavCartBadge');

    if (headerBadge) {
      headerBadge.textContent = totals.count;
      headerBadge.style.display = totals.count > 0 ? 'inline-block' : 'none';
    }
    if (bottomBadge) {
      bottomBadge.textContent = totals.count;
      bottomBadge.style.display = totals.count > 0 ? 'flex' : 'none';
    }

    const floatBar = document.getElementById('floatingCartBar');
    const floatCount = document.getElementById('floatingCartCount');
    const floatTotal = document.getElementById('floatingCartTotal');
    if (floatBar) {
      if (totals.count > 0 && this.activeTab !== 'cart') {
        floatBar.style.display = 'flex';
        if (floatCount) floatCount.textContent = totals.count;
        if (floatTotal) floatTotal.textContent = `${totals.total.toFixed(2)} €`;
      } else {
        floatBar.style.display = 'none';
      }
    }

    const subtotalEl = document.getElementById('cartSubtotalText');
    const feeEl = document.getElementById('cartDeliveryFeeText');
    const totalEl = document.getElementById('cartTotalText');

    if (subtotalEl) subtotalEl.textContent = `${totals.subtotal.toFixed(2)} €`;
    if (feeEl) {
      if (totals.isPickup) {
        feeEl.innerHTML = '<span class="text-success fw-bold">0,00 € (Retrait)</span>';
      } else {
        feeEl.textContent = totals.deliveryFee > 0 ? `${totals.deliveryFee.toFixed(2)} €` : 'OFFERTE';
      }
    }
    if (totalEl) totalEl.textContent = `${totals.total.toFixed(2)} €`;

    // Synchronisation mode boutons dans le panier
    const modeBadge = document.getElementById('cartModeIndicatorBadge');
    const bDel = document.getElementById('cartModeDeliveryBtn');
    const bPick = document.getElementById('cartModePickupBtn');
    const pickNotice = document.getElementById('cartPickupNotice');
    const chanBox = document.getElementById('cartDeliveryChannelsBox');

    if (totals.isPickup) {
      if (modeBadge) { modeBadge.textContent = 'Retrait Magasin (0 €)'; modeBadge.className = 'badge bg-danger text-white fw-bold'; }
      if (bDel) bDel.classList.remove('active');
      if (bPick) bPick.classList.add('active');
      if (pickNotice) pickNotice.style.display = 'block';
      if (chanBox) chanBox.style.display = 'none';
    } else {
      if (modeBadge) { modeBadge.textContent = 'Livraison à domicile'; modeBadge.className = 'badge bg-danger-subtle text-danger fw-bold'; }
      if (bDel) bDel.classList.add('active');
      if (bPick) bPick.classList.remove('active');
      if (pickNotice) pickNotice.style.display = 'none';
      if (chanBox) chanBox.style.display = 'block';
    }

    // Lignes promo et pourboire
    const discountLine = document.getElementById('cartDiscountLine');
    const discountText = document.getElementById('cartDiscountText');
    if (discountLine && discountText) {
      if (totals.discount > 0) {
        discountLine.style.setProperty('display', 'flex', 'important');
        discountText.textContent = `-${totals.discount.toFixed(2)} €`;
      } else {
        discountLine.style.setProperty('display', 'none', 'important');
      }
    }

    const tipLine = document.getElementById('cartTipLine');
    const tipText = document.getElementById('cartTipText');
    if (tipLine && tipText) {
      if (totals.tip > 0) {
        tipLine.style.setProperty('display', 'flex', 'important');
        tipText.textContent = `+${totals.tip.toFixed(2)} €`;
      } else {
        tipLine.style.setProperty('display', 'none', 'important');
      }
    }

    const freeNoticeEl = document.getElementById('cartFreeDeliveryNotice');
    if (freeNoticeEl) {
      if (totals.isPickup) {
        freeNoticeEl.style.display = 'block';
        freeNoticeEl.className = 'card border-0 rounded-3 p-2 px-3 mb-3 bg-danger-subtle text-danger small';
        freeNoticeEl.innerHTML = `<strong>Retrait à l'Atelier sélectionné</strong> • 12 Avenue Foch (Frais : 0,00 €)`;
      } else if (totals.subtotal === 0) {
        freeNoticeEl.style.display = 'none';
      } else if (totals.isFreeDelivery) {
        freeNoticeEl.style.display = 'block';
        freeNoticeEl.className = 'card border-0 rounded-3 p-2 px-3 mb-3 bg-success-subtle text-success small';
        freeNoticeEl.innerHTML = `<strong>Livraison offerte</strong> sur votre commande`;
      } else {
        const remaining = (PIZZERIA_CONFIG.freeDeliveryThreshold - totals.subtotal).toFixed(2);
        freeNoticeEl.style.display = 'block';
        freeNoticeEl.className = 'card border-0 rounded-3 p-2 px-3 mb-3 bg-warning-subtle text-dark small';
        freeNoticeEl.innerHTML = `Plus que <strong>${remaining} €</strong> pour la livraison offerte`;
      }
    }

    const container = document.getElementById('cartItemsList');
    const emptyState = document.getElementById('cartEmptyState');
    const summaryBox = document.getElementById('cartSummaryBox');
    const clearBtn = document.getElementById('cartClearBtn');
    const crossSelling = document.getElementById('crossSellingSection');

    if (cart.items.length === 0) {
      if (container) container.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      if (summaryBox) summaryBox.style.display = 'none';
      if (clearBtn) clearBtn.style.display = 'none';
      if (crossSelling) crossSelling.style.display = 'none';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (summaryBox) summaryBox.style.display = 'block';
    if (clearBtn) clearBtn.style.display = 'inline-block';
    if (crossSelling) crossSelling.style.display = 'block';

    let html = '';
    cart.items.forEach(it => {
      const extrasText = it.extrasDetails?.map(e => `+ ${e.name}`).join(', ');
      html += `
        <div class="card border-0 rounded-3 shadow-sm p-2 mb-2 bg-white">
          <div class="d-flex align-items-center gap-2">
            <img src="../assets/${it.image}" alt="${it.name}" style="width: 52px; height: 52px; object-fit: cover;" class="rounded-3">
            <div class="flex-grow-1 min-w-0">
              <div class="fw-bold text-dark small text-truncate">${it.name}</div>
              <div class="text-danger fw-semibold" style="font-size: 0.72rem;">${it.sizeName} • ${it.unitPrice.toFixed(2)} €</div>
              ${extrasText ? `<div class="text-muted" style="font-size: 0.65rem;">${extrasText}</div>` : ''}
              ${it.instructions ? `<div class="text-muted fst-italic" style="font-size: 0.65rem;">Note: ${it.instructions}</div>` : ''}
            </div>
            <div class="d-flex align-items-center gap-1">
              <button type="button" class="btn btn-sm btn-outline-secondary rounded-circle p-0" style="width: 24px; height: 24px;" onclick="PizzaStorage.updateCartQuantity('${it.id}', -1)">-</button>
              <span class="small fw-bold px-1">${it.quantity}</span>
              <button type="button" class="btn btn-sm btn-outline-secondary rounded-circle p-0" style="width: 24px; height: 24px;" onclick="PizzaStorage.updateCartQuantity('${it.id}', 1)">+</button>
            </div>
            <div class="text-end ps-1" style="min-width: 48px;">
              <div class="fw-bold text-dark small">${it.lineTotal.toFixed(2)} €</div>
              <button type="button" class="btn btn-sm btn-link text-danger p-0" onclick="PizzaStorage.removeCartItem('${it.id}')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </div>
        </div>
      `;
    });

    if (container) container.innerHTML = html;
  },

  applyPromoAction() {
    const input = document.getElementById('cartPromoInput');
    const feedback = document.getElementById('promoFeedback');
    const res = PizzaStorage.applyPromoCode(input?.value);

    if (feedback) {
      if (res.success) {
        feedback.className = 'small text-success mt-1 fw-bold';
        feedback.textContent = `Code applique : -${res.discount.toFixed(2)} € !`;
      } else {
        feedback.className = 'small text-danger mt-1';
        feedback.textContent = res.message;
      }
    }
  },

  selectTip(amount, btn) {
    PizzaStorage.setTip(amount);
    document.querySelectorAll('.tip-btn').forEach(b => b.classList.remove('active', 'btn-danger'));
    btn.classList.add('active');
  },

  clearCartAction() {
    PizzaStorage.clearCart();
    this.showToast("Panier vide");
  },

  selectDeliveryChannel(channel) {
    PizzaStorage.setDeliveryMode(channel);

    const bDirect = document.getElementById('channelBtnDirect');
    const bUber = document.getElementById('channelBtnUber');
    const bDeliv = document.getElementById('channelBtnDeliveroo');

    if (bDirect) bDirect.className = 'partner-box bg-white py-2';
    if (bUber) bUber.className = 'partner-box bg-white py-2';
    if (bDeliv) bDeliv.className = 'partner-box bg-white py-2';

    if (channel === 'direct' && bDirect) bDirect.className = 'partner-box border-danger bg-white py-2';
    if (channel === 'ubereats' && bUber) bUber.className = 'partner-box border-success bg-white py-2';
    if (channel === 'deliveroo' && bDeliv) bDeliv.className = 'partner-box border-info bg-white py-2';

    if (channel === 'ubereats' || channel === 'deliveroo') {
      this.openPartnerGatewayModal(channel);
    }
  },

  openPartnerGatewayModal(partner) {
    const isUber = partner === 'ubereats';
    const logoEl = document.getElementById('partnerModalLogo');
    const titleEl = document.getElementById('partnerModalTitle');
    const btnEl = document.getElementById('partnerModalActionBtn');
    const countEl = document.getElementById('partnerModalCartCount');
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

    if (this.bsPartnerModal) this.bsPartnerModal.show();
  },

  proceedToCheckout() {
    const cart = PizzaStorage.getCart();
    if (cart.items.length === 0) {
      this.showToast("Votre panier est vide");
      return;
    }

    const totals = PizzaStorage.getCartTotals();
    const totalAmountEl = document.getElementById('checkoutTotalAmount');
    if (totalAmountEl) totalAmountEl.textContent = `${totals.total.toFixed(2)} €`;

    const user = PizzaStorage.getCurrentUser();
    const loc = PizzaStorage.getSavedLocation();
    const addrInput = document.getElementById('checkoutDeliveryAddress');
    const addrLabel = document.getElementById('checkoutAddressLabel');

    if (addrInput) {
      if (totals.isPickup) {
        if (addrLabel) addrLabel.textContent = "Point de retrait au comptoir :";
        addrInput.value = "Pizzeria Opti'Noisy • 12 Avenue Foch, 93160 Noisy-le-Grand";
        addrInput.readOnly = true;
      } else {
        if (addrLabel) addrLabel.textContent = "Adresse de livraison confirmée :";
        addrInput.readOnly = false;
        if (user && user.addresses?.[0]) {
          addrInput.value = `${user.addresses[0].street}, ${user.addresses[0].postalCode} ${user.addresses[0].city}`;
        } else if (loc && loc.address) {
          addrInput.value = loc.address;
        }
      }
    }

    if (this.bsCheckoutModal) this.bsCheckoutModal.show();
  },

  selectPaymentMethod(method) {
    this.selectedPaymentMethod = method;
    ['CB', 'Apple', 'Cash'].forEach(m => {
      const btn = document.getElementById(`payMethod${m}`);
      if (btn) {
        btn.classList.remove('active', 'btn-outline-danger');
        btn.classList.add('btn-outline-secondary');
      }
    });

    const activeMap = { 'cb': 'payMethodCB', 'applepay': 'payMethodApple', 'especes': 'payMethodCash' };
    const activeBtn = document.getElementById(activeMap[method]);
    if (activeBtn) {
      activeBtn.classList.remove('btn-outline-secondary');
      activeBtn.classList.add('active', 'btn-outline-danger');
    }

    const cbForm = document.getElementById('cbPaymentForm');
    const vCard = document.getElementById('virtualCardWidget');
    const appleSec = document.getElementById('applePaySection');
    const cashSec = document.getElementById('cashPaySection');

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
    document.getElementById('cbCardNumber').value = formatted;
    document.getElementById('vCardNumber').textContent = formatted || '•••• •••• •••• ••••';
  },

  onCardExpInput(val) {
    let clean = val.replace(/\D/g, '').substring(0, 4);
    if (clean.length >= 2) clean = clean.substring(0, 2) + '/' + clean.substring(2);
    document.getElementById('cbCardExp').value = clean;
    document.getElementById('vCardExp').textContent = clean || 'MM/AA';
  },

  onCardNameInput(val) {
    document.getElementById('vCardHolder').textContent = val.toUpperCase() || 'VOTRE NOM';
  },

  executeOnlinePayment() {
    const btn = document.getElementById('btnConfirmPay');
    const loader = document.getElementById('paymentProcessingLoader');
    const addr = document.getElementById('checkoutDeliveryAddress')?.value || PIZZERIA_CONFIG.address;

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

      if (this.bsCheckoutModal) this.bsCheckoutModal.hide();

      this.showToast("Commande validee avec succes");
      this.updateAccountUI();
      this.switchTab('account');
    }, 1100);
  },

  currentReceiptOrderId: null,

  // --- CARTE LEAFLET & GESTION SECTEURS LIVRAISON ---
  initLeafletMap() {
    const mapEl = document.getElementById('leaflet-map');
    if (!mapEl || typeof L === 'undefined') return;

    try {
      this.leafletMap = L.map('leaflet-map').setView([PIZZERIA_CONFIG.coords.lat, PIZZERIA_CONFIG.coords.lng], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(this.leafletMap);

      const shopIcon = L.divIcon({
        className: 'custom-shop-pin',
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
        const inp = document.getElementById('manualAddressInput');
        if (inp) inp.value = label;
        this.updateUserMapPosition(lat, lng, label);
      });

      // Position par defaut : Campus IUT
      this.selectDeliverySector(48.8415, 2.5855, "Campus IUT Noisy-Champs, 2 Allee de l'IUT", "iut", 2.4);
    } catch (e) {
      console.error(e);
    }
  },

  selectDeliverySector(lat, lng, addressLabel, sectorId, distKm) {
    this.hapticFeedback(15);
    ['iut', 'centre', 'gare', 'varenne'].forEach(id => {
      const card = document.getElementById(`geoCard-${id}`);
      if (card) {
        if (id === sectorId) card.classList.add('selected');
        else card.classList.remove('selected');
      }
    });

    const inp = document.getElementById('manualAddressInput');
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
          const inp = document.getElementById('manualAddressInput');
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
    const inp = document.getElementById('manualAddressInput');
    if (inp) inp.value = label;
  },

  onAddressChange(val) {
    this.setManualCoords(48.8488, 2.5525, val || "Noisy-le-Grand");
  },

  updateUserMapPosition(lat, lng, addressLabel) {
    if (!this.leafletMap) return;

    const dist = PizzaStorage.calculateDistanceKm(
      PIZZERIA_CONFIG.coords.lat, PIZZERIA_CONFIG.coords.lng,
      lat, lng
    );
    const isEligible = dist <= PIZZERIA_CONFIG.deliveryZoneRadiusKm;

    PizzaStorage.saveLocation({
      lat: lat,
      lng: lng,
      address: addressLabel,
      distanceKm: dist,
      isEligible: isEligible
    });

    if (this.userMarker) this.leafletMap.removeLayer(this.userMarker);
    const userIcon = L.divIcon({
      className: 'custom-user-pin',
      html: `<div style="background: #0284C7; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: bold; border: 2px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.35);">VOUS</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });
    this.userMarker = L.marker([lat, lng], { icon: userIcon }).addTo(this.leafletMap).bindPopup(`<b>Destination</b><br>${addressLabel}`).openPopup();

    if (this.routePolyline) this.leafletMap.removeLayer(this.routePolyline);
    this.routePolyline = L.polyline([
      [PIZZERIA_CONFIG.coords.lat, PIZZERIA_CONFIG.coords.lng],
      [lat, lng]
    ], { color: isEligible ? '#BE1C1F' : '#6C757D', dashArray: '6, 8', weight: 3 }).addTo(this.leafletMap);

    const bounds = L.latLngBounds([
      [PIZZERIA_CONFIG.coords.lat, PIZZERIA_CONFIG.coords.lng],
      [lat, lng]
    ]);
    this.leafletMap.fitBounds(bounds, { padding: [35, 35] });

    // Mise a jour des 3 Compteurs KPI
    const statTime = document.getElementById('geoStatTime');
    const statDist = document.getElementById('geoStatDistance');
    const statFee = document.getElementById('geoStatFee');
    const zoneBanner = document.getElementById('geoZoneBanner');
    const zoneText = document.getElementById('geoZoneStatusText');

    const estMinutes = Math.round(15 + dist * 3.5);
    if (statTime) statTime.textContent = isEligible ? `~${estMinutes} min` : 'Indisponible';
    if (statDist) statDist.textContent = `${dist} km`;
    if (statFee) statFee.textContent = isEligible ? 'Offerte > 25€' : 'Partenaires';

    if (zoneBanner && zoneText) {
      if (isEligible) {
        zoneBanner.style.background = '#F0FDF4';
        zoneBanner.style.borderColor = '#BBF7D0';
        zoneText.className = 'fw-bold text-success small';
        zoneText.textContent = `Zone couverte : Livraison directe en scooter electrique (~${estMinutes} min)`;
      } else {
        zoneBanner.style.background = '#FEF2F2';
        zoneBanner.style.borderColor = '#FECACA';
        zoneText.className = 'fw-bold text-danger small';
        zoneText.textContent = 'Hors zone directe (> 8 km) : Commandez via Uber Eats ou Deliveroo';
      }
    }
  },

  // --- ESPACE CLIENT & SUIVI DES COMMANDES ---
  updateAccountUI() {
    const user = PizzaStorage.getCurrentUser();
    const guestView = document.getElementById('accountGuestView');
    const loggedView = document.getElementById('accountLoggedInView');

    if (!user) {
      if (guestView) guestView.style.display = 'block';
      if (loggedView) loggedView.style.display = 'none';
      this.renderGuestOrders();
      return;
    }

    if (guestView) guestView.style.display = 'none';
    if (loggedView) loggedView.style.display = 'block';

    const nameEl = document.getElementById('userNameDisplay');
    const emailEl = document.getElementById('userEmailDisplay');
    const avEl = document.getElementById('userAvatarText');
    const addrEl = document.getElementById('userAddressDisplay');

    if (nameEl) nameEl.textContent = user.fullName;
    if (emailEl) emailEl.textContent = user.email;
    if (avEl) avEl.textContent = user.firstName.charAt(0).toUpperCase();

    const addr = user.addresses?.[0];
    if (addrEl) addrEl.textContent = addr ? `${addr.street}, ${addr.postalCode} ${addr.city}` : 'Aucune adresse enregistree';

    this.renderLoyaltyUI();
    this.renderUserOrders();
  },

  renderGuestOrders() {
    const orders = PizzaStorage.getOrders();
    const container = document.getElementById('guestActiveOrdersSection');
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
      <div class="card border-0 rounded-4 shadow-sm p-3 mb-3 bg-white border border-danger-subtle">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <div class="d-flex align-items-center gap-2">
            <span class="d-inline-block rounded-circle bg-danger" style="width: 8px; height: 8px;"></span>
            <span class="fw-bold text-dark small">Commande en cours (${latest.orderNumber})</span>
          </div>
          <span class="badge ${step === 4 ? 'bg-success' : 'bg-danger-subtle text-danger'} small">${latest.statusLabel}</span>
        </div>
        <div class="text-muted mb-2" style="font-size: 0.72rem;">${dateFormatted} • Mode Invite • ${latest.channelName}</div>

        <!-- Stepper de suivi en direct -->
        <div class="order-tracking-stepper mb-2">
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

        <div class="py-2 border-top border-bottom small text-muted">
          ${latest.items.map(it => `
            <div class="d-flex justify-content-between">
              <span>${it.quantity}x ${it.name} (${it.sizeName})</span>
              <span class="fw-semibold text-dark">${it.lineTotal.toFixed(2)} €</span>
            </div>
          `).join('')}
          <div class="d-flex justify-content-between fw-bold text-dark pt-1 mt-1 border-top">
            <span>Total regle :</span>
            <span class="text-danger">${latest.totals.total.toFixed(2)} €</span>
          </div>
        </div>

        <button type="button" class="btn btn-outline-dark btn-sm w-100 mt-2 d-flex align-items-center justify-content-center gap-2 rounded-3" onclick="App.openOrderReceipt('${latest.id}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
          Voir le Ticket de Caisse Officiel
        </button>
      </div>
    `;
  },

  applyOrderModeUI(mode) {
    const isPickup = mode === 'pickup';
    const btnDel = document.getElementById('btnGeoModeDelivery');
    const btnPick = document.getElementById('btnGeoModePickup');
    const cardPick = document.getElementById('pickupInfoCard');
    const flowDel = document.getElementById('deliveryFlowSection');

    if (btnDel) btnDel.classList.toggle('active', !isPickup);
    if (btnPick) btnPick.classList.toggle('active', isPickup);
    if (cardPick) cardPick.style.display = isPickup ? 'block' : 'none';
    if (flowDel) flowDel.style.display = isPickup ? 'none' : 'block';

    const bCartDel = document.getElementById('cartModeDeliveryBtn');
    const bCartPick = document.getElementById('cartModePickupBtn');
    if (bCartDel) bCartDel.classList.toggle('active', !isPickup);
    if (bCartPick) bCartPick.classList.toggle('active', isPickup);

    const btnAction = document.getElementById('btnConfirmPickupAction');
    const cart = PizzaStorage.getCart();
    if (btnAction) {
      btnAction.textContent = cart.items.length === 0 ? "Commander à emporter (0 € de frais)" : "Valider le retrait & Voir le panier";
    }
  },

  setOrderMode(mode) {
    const isPickup = mode === 'pickup';
    PizzaStorage.setDeliveryMode(isPickup ? 'pickup' : 'direct');
    this.applyOrderModeUI(isPickup ? 'pickup' : 'direct');
    this.updateCartUI();
    this.showToast(isPickup ? "Mode Retrait en Magasin activé (Frais : 0,00 €)" : "Mode Livraison à Domicile activé");
  },

  confirmPickupMode() {
    this.setOrderMode('pickup');
    const cart = PizzaStorage.getCart();
    if (cart.items.length === 0) {
      this.showToast("Mode Retrait sélectionné (0 € de frais). Choisissez vos pizzas !");
      this.switchTab('menu');
    } else {
      this.showToast("Retrait en magasin confirmé (12 Avenue Foch) !");
      this.switchTab('cart');
    }
  },

  // --- PROGRAMME FIDÉLITÉ (BURGER KING STYLE) ---
  renderLoyaltyUI() {
    const user = PizzaStorage.getCurrentUser();
    if (!user) return;

    const data = PizzaStorage.getLoyaltyData(user.email);
    const tierBadge = document.getElementById('loyaltyTierBadge');
    const ptsDisplay = document.getElementById('loyaltyPointsDisplay');
    const progressLabel = document.getElementById('loyaltyProgressLabel');
    const progressBar = document.getElementById('loyaltyProgressBar');
    const nextRewardTitle = document.getElementById('loyaltyNextRewardTitle');
    const rewardsList = document.getElementById('loyaltyRewardsList');
    const histBox = document.getElementById('loyaltyHistoryBox');

    if (tierBadge) tierBadge.textContent = data.tierName || 'NIVEAU BRONZE';
    if (ptsDisplay) ptsDisplay.textContent = data.points;

    // Récompenses Burger King style
    const rewards = [
      { id: 'boisson', name: 'Canette 33cl au choix', cost: 80, desc: 'Coca-Cola, San Pellegrino ou Fuze Tea' },
      { id: 'dessert', name: 'Tiramisu Artisanal Maison', cost: 180, desc: 'Recette traditionnelle au café italien' },
      { id: 'pizza', name: 'Pizza Margherita Junior', cost: 400, desc: 'Sauce tomate San Marzano & Mozzarella fior di latte' },
      { id: 'reine', name: 'Grande Pizza Reine au choix', cost: 600, desc: 'Taille familiale 40 cm pour 3-4 pers.' }
    ];

    // Prochain objectif
    const nextReward = rewards.find(r => r.cost > data.points) || rewards[rewards.length - 1];
    if (nextRewardTitle) nextRewardTitle.textContent = nextReward.name;
    if (progressLabel) progressLabel.textContent = `${data.points} / ${nextReward.cost} pts`;
    if (progressBar) {
      const pct = Math.min(100, Math.round((data.points / nextReward.cost) * 100));
      progressBar.style.width = `${pct}%`;
    }

    if (rewardsList) {
      rewardsList.innerHTML = rewards.map(r => {
        const canRedeem = data.points >= r.cost;
        return `
          <div class="d-flex align-items-center justify-content-between p-2 rounded-3" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);">
            <div class="me-2 text-truncate">
              <div class="fw-bold small text-white text-truncate">${r.name}</div>
              <div class="text-warning fw-bold" style="font-size: 0.72rem;">${r.cost} Opti'Points • <span class="text-light opacity-75">${r.desc}</span></div>
            </div>
            <button type="button" class="btn btn-sm ${canRedeem ? 'btn-warning fw-bold text-dark' : 'btn-outline-secondary text-muted disabled'} py-1 px-2 rounded-2" style="font-size: 0.72rem; white-space: nowrap;" ${canRedeem ? `onclick="App.redeemReward('${r.id}', ${r.cost}, '${r.name.replace(/'/g, "\\'")}')"` : 'disabled'}>
              ${canRedeem ? 'Débloquer' : `Manque ${r.cost - data.points} pts`}
            </button>
          </div>
        `;
      }).join('');
    }

    if (histBox) {
      if (!data.history || data.history.length === 0) {
        histBox.innerHTML = '<div class="text-muted">Aucun historique pour le moment.</div>';
      } else {
        histBox.innerHTML = data.history.map(h => `
          <div class="d-flex justify-content-between border-bottom border-secondary border-opacity-25 py-1">
            <span class="text-light">${h.label} <small class="opacity-50">(${h.date})</small></span>
            <strong class="${h.points > 0 ? 'text-success' : 'text-warning'}">${h.points > 0 ? '+' : ''}${h.points} pts</strong>
          </div>
        `).join('');
      }
    }
  },

  redeemReward(rewardId, cost, name) {
    const res = PizzaStorage.redeemLoyaltyReward(rewardId, cost, name);
    if (res.success) {
      this.showToast(`Récompense débloquée ! ${name} a été ajouté à 0 € à votre panier.`);
      this.renderLoyaltyUI();
      this.updateCartUI();
    } else {
      this.showToast(res.message);
    }
  },

  toggleLoyaltyHistory() {
    const histBox = document.getElementById('loyaltyHistoryBox');
    if (histBox) {
      const isHidden = histBox.style.display === 'none';
      histBox.style.display = isHidden ? 'block' : 'none';
    }
  },

  toggleAuthForm(type) {
    const fLogin = document.getElementById('formLogin');
    const fReg = document.getElementById('formRegister');
    const bLogin = document.getElementById('btnTabLogin');
    const bReg = document.getElementById('btnTabRegister');
    const alertBox = document.getElementById('authAlertBanner');

    if (alertBox) alertBox.style.display = 'none';

    if (type === 'login') {
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

  fillDemoAccount() {
    this.quickDemoLogin();
  },

  handleLoginSubmit(e) {
    e.preventDefault();
    const alertBox = document.getElementById('authAlertBanner');
    const email = document.getElementById('loginEmail')?.value.trim();
    const pwd = document.getElementById('loginPassword')?.value;

    const res = PizzaStorage.loginUser(email, pwd);
    if (res.success) {
      if (alertBox) alertBox.style.display = 'none';
      this.showToast(`Bienvenue, ${res.user.firstName} !`);
      this.updateAccountUI();
    } else {
      if (alertBox) {
        alertBox.className = 'alert alert-danger py-2 small mb-3 rounded-3';
        alertBox.textContent = res.message || 'Identifiants incorrects. Utilisez le compte testeur ci-dessus.';
        alertBox.style.display = 'block';
      }
      this.showToast(res.message);
    }
  },

  handleRegisterSubmit(e) {
    e.preventDefault();
    const alertBox = document.getElementById('authAlertBanner');
    const firstName = document.getElementById('regFirstName')?.value.trim();
    const lastName = document.getElementById('regLastName')?.value.trim();
    const email = document.getElementById('regEmail')?.value.trim();
    const phone = document.getElementById('regPhone')?.value.trim();
    const address = document.getElementById('regAddress')?.value.trim();
    const password = document.getElementById('regPassword')?.value;

    const res = PizzaStorage.registerUser({
      firstName, lastName, email, phone, address, password
    });

    if (res.success) {
      if (alertBox) alertBox.style.display = 'none';
      this.showToast(`Compte créé avec succès ! Bienvenue, ${res.user.firstName}.`);
      this.updateAccountUI();
    } else {
      if (alertBox) {
        alertBox.className = 'alert alert-danger py-2 small mb-3 rounded-3';
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
    const container = document.getElementById('userOrdersList');
    const badge = document.getElementById('userOrderCountBadge');

    if (badge) badge.textContent = `${orders.length} commande${orders.length > 1 ? 's' : ''}`;
    if (!container) return;

    if (orders.length === 0) {
      container.innerHTML = `
        <div class="text-center py-4 bg-light rounded-3 border">
          <p class="small text-muted mb-0">Aucune commande enregistree.</p>
        </div>
      `;
      return;
    }

    let html = '';
    orders.forEach(ord => {
      const step = ord.step || 1;
      const dateFormatted = new Date(ord.createdAt).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
      });

      html += `
        <div class="card border-0 rounded-4 shadow-sm p-3 mb-3 bg-white border">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <span class="fw-bold text-dark small">${ord.orderNumber}</span>
            <span class="badge ${step === 4 ? 'bg-success' : 'bg-danger-subtle text-danger'} small">${ord.statusLabel}</span>
          </div>
          <div class="text-muted" style="font-size: 0.72rem;">${dateFormatted} • ${ord.channelName}</div>

          <!-- Stepper de suivi en temps reel (mis a jour depuis le back-office cuisine) -->
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

          <div class="my-2 border-top pt-2">
            ${ord.items.map(it => `
              <div class="d-flex justify-content-between small text-muted">
                <span>${it.quantity}x ${it.name} (${it.sizeName})</span>
                <span class="fw-semibold text-dark">${it.lineTotal.toFixed(2)} €</span>
              </div>
            `).join('')}
          </div>
          <div class="d-flex justify-content-between align-items-center pt-1 border-top">
            <span class="small fw-bold">Total regle :</span>
            <span class="h6 fw-bold text-danger mb-0">${ord.totals.total.toFixed(2)} €</span>
          </div>

          <!-- Bouton Ticket de caisse officiel -->
          <button type="button" class="btn btn-outline-dark btn-sm w-100 mt-2 d-flex align-items-center justify-content-center gap-2 rounded-3" onclick="App.openOrderReceipt('${ord.id}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            Imprimer le Ticket de Caisse Officiel
          </button>
        </div>
      `;
    });

    container.innerHTML = html;
  },

  // --- GENERATION DU TICKET DE CAISSE HAUTE FIDELITE ---
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
      <div id="printableReceiptArea" class="artisanal-receipt-card" style="background: #FFFFFF !important; padding: 4px; color: #1A1C20;">
        
        <!-- Ruban Tricolore & Header Marque -->
        <div class="italian-ribbon" style="height: 5px; background: linear-gradient(90deg, #13672F 0%, #13672F 33.3%, #ffffff 33.3%, #ffffff 66.6%, #BE1C1F 66.6%, #BE1C1F 100%); border-radius: 4px; margin-bottom: 12px;"></div>
        
        <div class="text-center mb-3">
          <img src="../assets/logo-opti-noisy.svg" alt="Opti'Noisy Pizza" style="height: 48px; margin-bottom: 6px; display: inline-block;">
          <div class="fw-bold" style="font-size: 1.1rem; color: #BE1C1F; letter-spacing: 0.5px;">OPTI'NOISY PIZZA</div>
          <div class="text-muted" style="font-size: 0.72rem; font-weight: 600;">Pizzeria Artisanale • Cuisson au Feu de Bois de Hetre</div>
          <div class="small fw-semibold mt-1" style="color: #334155;">12 Avenue du Marechal Foch • 93160 Noisy-le-Grand</div>
          <div class="text-muted" style="font-size: 0.68rem; margin-top: 2px;">Tel : 01 43 05 92 10 • SIRET : 842 190 357 00018</div>
          <div class="text-muted" style="font-size: 0.68rem;">TVA Intracommunautaire : FR 49 842190357</div>
        </div>

        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 10px 12px; margin-bottom: 12px; font-size: 0.78rem;">
          <div class="d-flex justify-content-between mb-1">
            <span class="text-muted">COMMANDE :</span>
            <strong class="text-danger" style="font-family: monospace; font-size: 0.88rem;">${ord.orderNumber}</strong>
          </div>
          <div class="d-flex justify-content-between mb-1">
            <span class="text-muted">DATE & HEURE :</span>
            <strong style="color: #1E293B;">${dateFormatted}</strong>
          </div>
          <div class="d-flex justify-content-between mb-1">
            <span class="text-muted">CANAL :</span>
            <strong style="color: #1E293B;">${ord.channelName || 'Opti\'Noisy Direct'}</strong>
          </div>
          <div class="d-flex justify-content-between mb-1">
            <span class="text-muted">CLIENT :</span>
            <strong style="color: #1E293B;">${ord.customer?.fullName || 'Client Invite'}</strong>
          </div>
          <div class="text-muted mt-1 pt-1 border-top" style="font-size: 0.72rem; color: #334155;">
            <strong>LIVRAISON :</strong> ${ord.address || '12 Avenue du Marechal Foch, Noisy-le-Grand'}
          </div>
        </div>

        <div class="mb-3">
          <div class="fw-bold small text-muted mb-2 pb-1 border-bottom d-flex justify-content-between" style="font-size: 0.72rem; text-transform: uppercase;">
            <span>Articles Commandes</span>
            <span>Total TTC</span>
          </div>
          ${ord.items.map(it => `
            <div class="d-flex justify-content-between align-items-start mb-2 pb-1 border-bottom border-light">
              <div>
                <span class="badge bg-light text-dark me-1" style="border: 1px solid #E2E8F0;">${it.quantity}x</span> <span class="fw-bold text-dark">${it.name}</span><br>
                <span class="text-muted" style="font-size: 0.72rem;">Format: ${it.sizeName}${it.extrasDetails?.length ? ' • + ' + it.extrasDetails.map(e => e.name).join(', ') : ''}</span>
                ${it.instructions ? `<div class="text-danger fst-italic" style="font-size: 0.68rem;">Note: ${it.instructions}</div>` : ''}
              </div>
              <div class="text-end fw-bold text-dark">
                ${it.lineTotal.toFixed(2)} €
              </div>
            </div>
          `).join('')}
        </div>

        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 10px 12px; margin-bottom: 12px; font-size: 0.78rem;">
          <div class="d-flex justify-content-between text-muted mb-1">
            <span>Sous-total HT (10%) :</span>
            <span>${subtotalHT} €</span>
          </div>
          <div class="d-flex justify-content-between text-muted mb-1">
            <span>TVA collectee (10%) :</span>
            <span>${tva} €</span>
          </div>
          ${ord.totals.deliveryFee > 0 ? `
            <div class="d-flex justify-content-between mb-1">
              <span class="text-muted">Frais de livraison :</span>
              <span>${ord.totals.deliveryFee.toFixed(2)} €</span>
            </div>
          ` : `
            <div class="d-flex justify-content-between mb-1">
              <span class="text-muted">Frais de livraison :</span>
              <span class="text-success fw-bold">OFFERTE (0.00 €)</span>
            </div>
          `}
          ${ord.totals.discount > 0 ? `
            <div class="d-flex justify-content-between text-danger fw-bold mb-1">
              <span>Remise Commerciale (${ord.totals.promoCode || 'MMI2026'}) :</span>
              <span>-${ord.totals.discount.toFixed(2)} €</span>
            </div>
          ` : ''}
          ${ord.totals.tip > 0 ? `
            <div class="d-flex justify-content-between text-muted mb-1">
              <span>Pourboire Pizzaiolo :</span>
              <span>+${ord.totals.tip.toFixed(2)} €</span>
            </div>
          ` : ''}
          <div class="d-flex justify-content-between align-items-center pt-2 mt-2 border-top border-dark">
            <strong style="font-size: 0.95rem; color: #0F172A;">TOTAL TTC REGLE :</strong>
            <strong style="font-size: 1.15rem; color: #BE1C1F;">${ord.totals.total.toFixed(2)} €</strong>
          </div>
        </div>

        <div class="text-center p-2 rounded-3 border bg-white mb-2" style="background: #F0FDF4 !important; border-color: #BBF7D0 !important;">
          <div class="fw-semibold small" style="color: #166534;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display: inline-block; vertical-align: middle; margin-right: 4px;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            Paiement 3D-Secure valide • <strong>${ord.payment?.label || 'Carte Bancaire'}</strong>
          </div>
          <div class="text-muted mt-1" style="font-size: 0.68rem; font-family: monospace;">AUTH-ID: OPTI-${ord.orderNumber.replace(/[^0-9]/g, '')}-OK • NF525</div>
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
          <div class="text-center text-muted mt-1" style="font-size: 0.68rem;">
            Merci de votre confiance • Cuisson au feu de bois a deguster chaud !
          </div>
        </div>

      </div>
    `;

    document.getElementById('orderReceiptContent').innerHTML = html;
    if (this.bsReceiptModal) this.bsReceiptModal.show();
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
    const receiptElement = document.getElementById('printableReceiptArea') || document.getElementById('orderReceiptContent');
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
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
