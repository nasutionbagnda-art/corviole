/**
 * Opti'Noisy Pizzeria - Logique du Prototype 1 (Bootstrap 5.3)
 * Direction Artistique : Néo-Trattoria Napoletana Contemporaine
 */

document.addEventListener('DOMContentLoaded', () => {
  initBootstrapApp();
});

let currentSelectedPizza = null;
let currentSelectedSize = PIZZA_SIZES[1]; // Classica 31cm
let currentCategoryFilter = 'all';

function initBootstrapApp() {
  renderHeroCarousel();
  renderDeals();
  renderConcepts();
  renderCategoryPills();
  renderMenu();
  setupEventListeners();
  updateCartBadge();
  updateAuthUI();
  setupActiveOrderListener();

  // Carte restaurant sur la page principale
  setTimeout(() => {
    window.geoManager.initMap('bootstrap-page-restaurant-map');
  }, 400);
}

function renderHeroCarousel() {
  const inner = document.getElementById('hero-carousel-inner');
  if (!inner || !MENU_DATA.heroSlides) return;

  inner.innerHTML = MENU_DATA.heroSlides.map((slide, idx) => `
    <div class="carousel-item ${idx === 0 ? 'active' : ''}">
      <img src="${slide.image}" alt="${slide.title}" class="d-block w-100" style="min-height: 400px; max-height: 460px; object-fit: cover;">
      <div class="carousel-caption text-start p-4 p-md-5 rounded-4" style="background: linear-gradient(0deg, rgba(13, 14, 18, 0.95) 20%, rgba(13, 14, 18, 0.4) 80%, transparent 100%); backdrop-filter: blur(8px); bottom: 20px; left: 20px; right: 20px; max-width: 650px;">
        <span class="badge text-uppercase fw-bold mb-2" style="background: var(--primary-soft); border: 1px solid var(--primary); color: #FFA590; font-size: 0.72rem; letter-spacing: 0.5px;">${slide.badge}</span>
        <h3 class="fw-bold mb-1 text-white font-display display-6">${slide.title}</h3>
        <p class="small text-light mb-3" style="color: var(--cream-muted) !important;">${slide.subtitle}</p>
        <button class="btn btn-five-yellow" onclick="document.getElementById('pizzas-section').scrollIntoView({behavior: 'smooth'})">
          COMMANDER MAINTENANT ➔
        </button>
      </div>
    </div>
  `).join('');
}

function renderDeals() {
  const container = document.getElementById('deals-container');
  if (!container || !MENU_DATA.deals) return;

  container.innerHTML = MENU_DATA.deals.map(deal => `
    <div class="col-12 col-md-4">
      <div class="pizza-card h-100 p-4 d-flex flex-column border-2 ${deal.highlight ? 'border-warning' : ''}" style="border-radius: 20px;">
        <span class="badge rounded-pill align-self-start px-3 py-2 fw-bold mb-2" style="background: ${deal.highlight ? 'var(--gold-glow)' : 'var(--primary-soft)'}; color: ${deal.highlight ? 'var(--gold)' : '#FFA590'}; border: 1px solid ${deal.highlight ? 'var(--gold)' : 'var(--primary)'};">
          ${deal.badge}
        </span>
        <h4 class="fw-bold text-white mb-2 font-display fs-5">${deal.title}</h4>
        <p class="small text-muted flex-grow-1 mb-3" style="color: var(--cream-muted) !important;">${deal.desc}</p>
        <div class="d-flex justify-content-between align-items-center pt-3 border-top border-secondary border-opacity-25 mt-auto">
          <span class="five-price-tag">${deal.price}</span>
          <button class="btn btn-five-yellow btn-sm" onclick="document.getElementById('pizzas-section').scrollIntoView({behavior: 'smooth'})">
            PROFITER ➔
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function renderConcepts() {
  const container = document.getElementById('concepts-container');
  if (!container || !MENU_DATA.concepts) return;

  container.innerHTML = MENU_DATA.concepts.map(item => `
    <div class="col-6 col-md-3">
      <div class="pizza-card h-100 p-4 text-center" style="border-radius: 20px;">
        <div class="display-6 mb-2">${item.icon}</div>
        <h5 class="fw-bold text-white mb-2 fs-6 font-display">${item.title}</h5>
        <p class="small text-muted mb-0" style="font-size: 0.82rem; color: var(--cream-muted) !important;">${item.desc}</p>
      </div>
    </div>
  `).join('');
}

function renderCategoryPills() {
  const container = document.getElementById('category-pills-container');
  if (!container) return;

  const categories = [
    { id: 'all', label: '🍕 TOUT LE MENU' },
    { id: 'tomate', label: '🥫 BASE TOMATE' },
    { id: 'creme', label: '🥛 BASE CRÈME' },
    { id: 'speciale', label: '⭐ SPÉCIALITÉS' },
    { id: 'salades', label: '🥗 SALADES & DESSERTS' }
  ];

  container.innerHTML = categories.map(cat => `
    <button class="category-pill ${cat.id === currentCategoryFilter ? 'active' : ''}" data-cat="${cat.id}">
      ${cat.label}
    </button>
  `).join('');

  container.querySelectorAll('.category-pill').forEach(btn => {
    btn.addEventListener('click', (e) => {
      currentCategoryFilter = e.currentTarget.getAttribute('data-cat');
      container.querySelectorAll('.category-pill').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      renderMenu();
    });
  });
}

function renderMenu() {
  const pizzaContainer = document.getElementById('pizzas-grid');
  const saladContainer = document.getElementById('salades-grid');

  if (!pizzaContainer) return;

  let filteredPizzas = MENU_DATA.pizzas;
  if (currentCategoryFilter !== 'all' && currentCategoryFilter !== 'salades') {
    filteredPizzas = MENU_DATA.pizzas.filter(p => p.base === currentCategoryFilter);
  }

  if (currentCategoryFilter === 'salades') {
    document.getElementById('pizzas-section').classList.add('d-none');
  } else {
    document.getElementById('pizzas-section').classList.remove('d-none');
    pizzaContainer.innerHTML = filteredPizzas.map(pizza => `
      <div class="col-12 col-sm-6 col-lg-4">
        <div class="pizza-card h-100 d-flex flex-column">
          <div class="pizza-img-wrapper">
            <img src="${pizza.image}" alt="${pizza.name}" class="pizza-img" loading="lazy">
            <span class="card-badge ${pizza.isVegetarian ? 'card-badge-veggie' : ''}">
              ${pizza.badge || (pizza.isVegetarian ? 'Végétarien 🌿' : 'Artisanal 🔥')}
            </span>
          </div>
          <div class="p-3 d-flex flex-column flex-grow-1">
            <h4 class="fw-bold mb-1 text-white font-display fs-5">${pizza.name}</h4>
            <p class="small text-muted flex-grow-1 mb-3" style="color: var(--cream-muted) !important;">${pizza.description}</p>
            <div class="d-flex justify-content-between align-items-center mt-auto pt-2 border-top border-secondary border-opacity-25">
              <div>
                <span class="small text-muted d-block" style="font-size: 0.7rem; font-weight: 800; text-transform: uppercase;">Dès</span>
                <span class="five-price-tag">${pizza.basePrice.toFixed(2)} €</span>
              </div>
              <button class="btn btn-five-yellow btn-select-pizza" data-id="${pizza.id}">
                CHOISIR LA TAILLE 🍕
              </button>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  if (saladContainer) {
    if (currentCategoryFilter !== 'all' && currentCategoryFilter !== 'salades') {
      document.getElementById('salades-section').classList.add('d-none');
    } else {
      document.getElementById('salades-section').classList.remove('d-none');
      saladContainer.innerHTML = MENU_DATA.salades.map(salade => `
        <div class="col-12 col-sm-6 col-lg-4">
          <div class="pizza-card h-100 d-flex flex-column">
            <div class="pizza-img-wrapper">
              <img src="${salade.image}" alt="${salade.name}" class="pizza-img" loading="lazy">
              <span class="card-badge card-badge-veggie">${salade.badge}</span>
            </div>
            <div class="p-3 d-flex flex-column flex-grow-1">
              <h4 class="fw-bold mb-1 text-white font-display fs-5">${salade.name}</h4>
              <p class="small text-muted flex-grow-1 mb-3" style="color: var(--cream-muted) !important;">${salade.description}</p>
              <div class="d-flex justify-content-between align-items-center mt-auto pt-2 border-top border-secondary border-opacity-25">
                <span class="five-price-tag">${salade.price.toFixed(2)} €</span>
                <button class="btn btn-five-outline btn-add-salad" data-id="${salade.id}">
                  AJOUTER +
                </button>
              </div>
            </div>
          </div>
        </div>
      `).join('');
    }
  }

  // Événements
  document.querySelectorAll('.btn-select-pizza').forEach(btn => {
    btn.addEventListener('click', (e) => {
      openPizzaSizeModal(e.currentTarget.getAttribute('data-id'));
    });
  });

  document.querySelectorAll('.btn-add-salad').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const saladId = e.currentTarget.getAttribute('data-id');
      const salade = MENU_DATA.salades.find(s => s.id === saladId);
      if (salade) {
        window.cartManager.addItem({
          id: salade.id,
          name: salade.name,
          category: 'Salade',
          sizeId: 'standard',
          sizeName: 'Portion généreuse',
          price: salade.price,
          image: salade.image
        });
        showToast(`🥗 ${salade.name} ajoutée au panier !`);
      }
    });
  });
}

function openPizzaSizeModal(pizzaId) {
  const pizza = MENU_DATA.pizzas.find(p => p.id === pizzaId);
  if (!pizza) return;

  currentSelectedPizza = pizza;
  currentSelectedSize = PIZZA_SIZES[1];

  document.getElementById('modal-pizza-img').src = pizza.image;
  document.getElementById('modal-pizza-name').innerText = pizza.name;
  document.getElementById('modal-pizza-desc').innerText = pizza.description;

  const cardsContainer = document.getElementById('modal-size-cards');
  cardsContainer.innerHTML = PIZZA_SIZES.map(s => {
    const isSel = s.id === currentSelectedSize.id;
    const finalPrice = pizza.basePrice + s.priceBonus;
    return `
      <div class="col-4">
        <div class="size-option-card h-100 d-flex flex-column align-items-center justify-content-center p-2 rounded-3 ${isSel ? 'selected' : ''}" data-size-id="${s.id}">
          <img src="${s.icon}" alt="${s.name}" class="mb-2" style="width: 44px; height: 44px;">
          <h6 class="fw-bold mb-0 text-white font-display">${s.name}</h6>
          <span class="small text-muted" style="font-size: 0.72rem;">${s.size}</span>
          <span class="badge mt-2 ${isSel ? 'bg-primary' : 'bg-dark'} text-white fw-bold">${finalPrice.toFixed(2)} €</span>
        </div>
      </div>
    `;
  }).join('');

  cardsContainer.querySelectorAll('.size-option-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const sizeId = e.currentTarget.getAttribute('data-size-id');
      currentSelectedSize = PIZZA_SIZES.find(s => s.id === sizeId);
      cardsContainer.querySelectorAll('.size-option-card').forEach(c => c.classList.remove('selected'));
      e.currentTarget.classList.add('selected');
      updateModalTotal();
    });
  });

  updateModalTotal();

  const modalEl = document.getElementById('pizzaSizeModal');
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  modal.show();
}

function updateModalTotal() {
  if (!currentSelectedPizza || !currentSelectedSize) return;
  const totalPrice = currentSelectedPizza.basePrice + currentSelectedSize.priceBonus;
  document.getElementById('modal-btn-add-text').innerText = `AJOUTER AU PANIER • ${totalPrice.toFixed(2)} €`;
}

function setupEventListeners() {
  const btnConfirmAdd = document.getElementById('btn-modal-confirm-add');
  if (btnConfirmAdd) {
    btnConfirmAdd.addEventListener('click', () => {
      if (!currentSelectedPizza || !currentSelectedSize) return;
      const price = currentSelectedPizza.basePrice + currentSelectedSize.priceBonus;
      window.cartManager.addItem({
        id: currentSelectedPizza.id,
        name: currentSelectedPizza.name,
        category: 'Pizza',
        sizeId: currentSelectedSize.id,
        sizeName: `${currentSelectedSize.name} (${currentSelectedSize.size})`,
        price: price,
        image: currentSelectedPizza.image
      });

      const modalEl = document.getElementById('pizzaSizeModal');
      bootstrap.Modal.getInstance(modalEl).hide();
      showToast(`🍕 Pizza ${currentSelectedPizza.name} ajoutée !`);
    });
  }

  window.addEventListener('cartUpdated', () => {
    updateCartBadge();
    renderCartOffcanvas();
  });

  const btnApplyPromo = document.getElementById('btn-apply-promo');
  if (btnApplyPromo) {
    btnApplyPromo.addEventListener('click', () => {
      const codeInput = document.getElementById('promo-code-input');
      const res = window.cartManager.applyPromo(codeInput.value);
      alert(res.message);
      renderCartOffcanvas();
    });
  }

  const btnCheckout = document.getElementById('btn-checkout-start');
  if (btnCheckout) {
    btnCheckout.addEventListener('click', () => {
      const offcanvasEl = document.getElementById('cartOffcanvas');
      bootstrap.Offcanvas.getInstance(offcanvasEl).hide();
      openCheckoutModal();
    });
  }

  // Connexion
  const loginForm = document.getElementById('loginForm') || document.getElementById('form-login');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const pass = document.getElementById('login-password').value;
      const res = window.authManager.login(email, pass);
      if (res.success) {
        bootstrap.Modal.getInstance(document.getElementById('authModal')).hide();
        showToast(res.message);
        updateAuthUI();
      } else {
        alert(res.message);
      }
    });
  }

  // Inscription
  const registerForm = document.getElementById('registerForm') || document.getElementById('form-register');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = {
        firstName: document.getElementById('reg-firstname').value,
        lastName: document.getElementById('reg-lastname').value,
        email: document.getElementById('reg-email').value,
        phone: document.getElementById('reg-phone').value,
        password: document.getElementById('reg-password').value
      };
      const res = window.authManager.register(data);
      if (res.success) {
        bootstrap.Modal.getInstance(document.getElementById('authModal')).hide();
        showToast('Compte Club Gourmet créé avec succès !');
        updateAuthUI();
      } else {
        alert(res.message);
      }
    });
  }

  // Géolocalisation interne
  const btnGeoloc = document.getElementById('btn-geoloc-checkout') || document.getElementById('btn-geoloc-locate');
  if (btnGeoloc) {
    btnGeoloc.addEventListener('click', async () => {
      btnGeoloc.disabled = true;
      btnGeoloc.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Recherche GPS...`;
      try {
        const loc = await window.geoManager.getCurrentPosition();
        const addrInput = document.getElementById('checkout-address');
        if (addrInput) addrInput.value = loc.address;
        
        const feedback = document.getElementById('geoloc-feedback') || document.getElementById('geoloc-result-badge');
        if (feedback) {
          feedback.innerHTML = `
            <div class="alert alert-warning py-2 px-3 small mt-2 mb-0 fw-bold text-dark">
              📍 Position détectée à <b>${loc.distance} km</b> de la pizzeria.<br>
              ⏱ Temps de livraison estimé : <b>${loc.estimatedTime}</b>
            </div>
          `;
        }
        window.geoManager.updateMapWithUser(loc.lat, loc.lng, loc.address);
      } catch (err) {
        alert(err.message);
      } finally {
        btnGeoloc.disabled = false;
        btnGeoloc.innerHTML = `📍 GPS`;
      }
    });
  }

  // Checkout submit
  const checkoutForm = document.getElementById('checkoutForm') || document.getElementById('form-checkout');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const totals = window.cartManager.getTotals();
      if (totals.count === 0) return alert('Votre panier est vide.');

      const orderData = {
        customer: {
          name: document.getElementById('checkout-name').value,
          phone: document.getElementById('checkout-phone').value,
          email: document.getElementById('checkout-email').value
        },
        address: document.getElementById('checkout-address').value,
        paymentMethod: document.querySelector('input[name="paymentMethod"]:checked')?.value || 'CB',
        deliveryType: 'livraison',
        items: [...window.cartManager.cart],
        totals: totals,
        coords: window.geoManager.userLocation
      };

      const order = window.orderManager.createOrder(orderData);
      bootstrap.Modal.getInstance(document.getElementById('checkoutModal')).hide();
      openTrackingModal(order);
    });
  }

  // Déconnexion
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      window.authManager.logout();
      updateAuthUI();
      bootstrap.Modal.getInstance(document.getElementById('authModal')).hide();
    });
  }
}

function updateCartBadge() {
  const totals = window.cartManager.getTotals();
  const badges = document.querySelectorAll('.cart-count-badge');
  badges.forEach(b => {
    b.innerText = totals.count;
    b.style.display = totals.count > 0 ? 'inline-block' : 'none';
  });
}

function renderCartOffcanvas() {
  const container = document.getElementById('cart-items-list');
  const totals = window.cartManager.getTotals();
  if (!container) return;

  if (window.cartManager.cart.length === 0) {
    container.innerHTML = `
      <div class="text-center py-5">
        <div class="display-4 mb-2">🍕</div>
        <h4 class="fw-bold text-white font-display">VOTRE PANIER EST VIDE</h4>
        <p class="text-muted small" style="color: var(--cream-muted) !important;">Ajoutez vos pizzas préférées pour commencer la commande !</p>
      </div>
    `;
    document.getElementById('cart-checkout-box').classList.add('d-none');
    return;
  }

  document.getElementById('cart-checkout-box').classList.remove('d-none');

  container.innerHTML = window.cartManager.cart.map(item => `
    <div class="d-flex align-items-center justify-content-between p-2 mb-2 rounded border border-secondary border-opacity-25" style="background: var(--bg-elevated);">
      <img src="${item.image}" alt="${item.name}" style="width: 55px; height: 55px; object-fit: cover; border-radius: 8px;">
      <div class="flex-grow-1 mx-3">
        <h6 class="mb-0 fw-bold text-white font-display">${item.name}</h6>
        <div class="small" style="color: var(--gold);">${item.sizeName}</div>
        <div class="fw-bold small" style="color: var(--gold);">${(item.price * item.quantity).toFixed(2)} €</div>
      </div>
      <div class="d-flex align-items-center gap-2">
        <button class="btn btn-sm btn-outline-secondary py-0 px-2 btn-cart-minus" data-id="${item.cartItemId}">-</button>
        <span class="fw-bold text-white">${item.quantity}</span>
        <button class="btn btn-sm btn-outline-secondary py-0 px-2 btn-cart-plus" data-id="${item.cartItemId}">+</button>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.btn-cart-minus').forEach(b => {
    b.addEventListener('click', (e) => {
      window.cartManager.updateQuantity(e.currentTarget.getAttribute('data-id'), -1);
    });
  });

  container.querySelectorAll('.btn-cart-plus').forEach(b => {
    b.addEventListener('click', (e) => {
      window.cartManager.updateQuantity(e.currentTarget.getAttribute('data-id'), 1);
    });
  });

  document.getElementById('cart-subtotal').innerText = totals.subtotal.toFixed(2) + ' €';
  document.getElementById('cart-delivery').innerText = totals.isFreeDelivery ? 'Offerte !' : totals.deliveryFee.toFixed(2) + ' €';
  
  const discountRow = document.getElementById('cart-discount-row');
  const discountEl = document.getElementById('cart-discount');
  if (discountRow && discountEl) {
    if (totals.discountAmount > 0) {
      discountRow.style.display = 'flex';
      discountEl.innerText = `-${totals.discountAmount.toFixed(2)} €`;
    } else {
      discountRow.style.display = 'none';
    }
  }

  document.getElementById('cart-total').innerText = totals.total.toFixed(2) + ' €';
}

function openCheckoutModal() {
  const totals = window.cartManager.getTotals();
  const totalDisplay = document.getElementById('checkout-total-badge') || document.getElementById('checkout-final-total');
  if (totalDisplay) totalDisplay.innerText = totals.total.toFixed(2) + ' €';

  const user = window.authManager.getCurrentUser();
  if (user) {
    document.getElementById('checkout-name').value = `${user.firstName} ${user.lastName}`;
    document.getElementById('checkout-email').value = user.email;
    document.getElementById('checkout-phone').value = user.phone;
    if (user.address) document.getElementById('checkout-address').value = user.address;
  }

  const modalEl = document.getElementById('checkoutModal');
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  modal.show();

  modalEl.addEventListener('shown.bs.modal', () => {
    window.geoManager.initMap('checkout-map');
  }, { once: true });
}

function openTrackingModal(order) {
  const currentOrder = order || window.orderManager.activeOrder || {
    id: 'OPT-102938',
    address: '12 Avenue Aristide Briand, Noisy-le-Grand',
    statusStep: 1,
    timeline: [
      { title: 'Commande confirmée', time: 'En direct', done: true },
      { title: 'Cuisson au four à 450°C', time: 'En cours', done: true },
      { title: 'Livreur en route', time: 'À venir', done: false },
      { title: 'Livraison effectuée', time: 'À venir', done: false }
    ]
  };

  const idEl = document.getElementById('tracking-order-id') || document.getElementById('track-order-id');
  if (idEl) idEl.innerText = currentOrder.id;

  const addrEl = document.getElementById('tracking-address') || document.getElementById('track-order-address');
  if (addrEl) addrEl.innerText = currentOrder.address;

  renderBootstrapTrackingStepper(currentOrder);

  const modalEl = document.getElementById('trackingModal');
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  modal.show();

  modalEl.addEventListener('shown.bs.modal', () => {
    window.geoManager.initMap('tracking-map-container');
    if (currentOrder.coords) {
      window.geoManager.updateMapWithUser(currentOrder.coords.lat, currentOrder.coords.lng, currentOrder.address);
    }
  }, { once: true });
}

function renderBootstrapTrackingStepper(order) {
  const container = document.getElementById('tracking-stepper');
  if (!container || !order) return;

  const steps = [
    { title: 'Reçue', icon: '📝' },
    { title: 'Au Four 450°C', icon: '🔥' },
    { title: 'Livreur en Route', icon: '🛵' },
    { title: 'Livrée', icon: '🍕' }
  ];

  container.innerHTML = `
    <div class="row g-1 text-center">
      ${steps.map((st, idx) => {
        const isDone = idx <= order.statusStep;
        const isCurrent = idx === order.statusStep;
        return `
          <div class="col-3">
            <div class="d-inline-flex align-items-center justify-content-center rounded-circle mb-1" style="width: 36px; height: 36px; background: ${isCurrent ? 'var(--primary)' : isDone ? 'var(--secondary)' : 'var(--bg-elevated)'}; color: #fff; font-size: 1.1rem; box-shadow: ${isCurrent ? '0 0 10px var(--primary-glow)' : 'none'};">
              ${st.icon}
            </div>
            <div class="small fw-bold text-uppercase" style="font-size: 0.68rem; color: ${isDone ? '#fff' : 'var(--cream-muted)'};">${st.title}</div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function setupActiveOrderListener() {
  const btnAdvance = document.getElementById('btn-advance-order-step');
  if (btnAdvance) {
    btnAdvance.addEventListener('click', () => {
      window.orderManager.advanceOrderStatus();
      renderBootstrapTrackingStepper(window.orderManager.activeOrder);
    });
  }
}

function updateAuthUI() {
  const user = window.authManager.getCurrentUser();
  const authBtnText = document.getElementById('auth-btn-label');
  if (authBtnText) {
    authBtnText.innerText = user ? user.firstName : 'Club';
  }

  const profileBox = document.getElementById('auth-profile-box');
  const formsBox = document.getElementById('auth-forms-box');

  if (user) {
    if (profileBox) {
      profileBox.style.display = 'block';
      document.getElementById('profile-user-name').innerText = `${user.firstName} ${user.lastName}`;
      document.getElementById('profile-user-email').innerText = user.email;

      const ordersList = document.getElementById('profile-orders-list');
      if (ordersList) {
        if (!user.orders || user.orders.length === 0) {
          ordersList.innerHTML = '<p class="small text-muted text-center my-2">Aucune commande passée pour le moment.</p>';
        } else {
          ordersList.innerHTML = user.orders.map(o => `
            <div class="p-2 mb-2 rounded border border-secondary border-opacity-25 d-flex justify-content-between align-items-center" style="background: var(--bg-surface);">
              <div>
                <span class="fw-bold small text-white d-block">${o.id}</span>
                <span class="small text-muted" style="font-size: 0.72rem;">${new Date(o.createdAt || o.date).toLocaleDateString()}</span>
              </div>
              <span class="fw-bold font-display" style="color: var(--gold);">${(o.totals ? o.totals.total : o.total).toFixed(2)} €</span>
            </div>
          `).join('');
        }
      }
    }
    if (formsBox) formsBox.style.display = 'none';
  } else {
    if (profileBox) profileBox.style.display = 'none';
    if (formsBox) formsBox.style.display = 'block';
  }
}

function showToast(msg) {
  const toastEl = document.getElementById('appToast');
  if (toastEl) {
    document.getElementById('toast-message').innerText = msg;
    const toast = bootstrap.Toast.getOrCreateInstance(toastEl);
    toast.show();
  }
}
