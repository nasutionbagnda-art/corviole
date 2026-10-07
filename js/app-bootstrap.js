/**
 * Opti'Noisy Pizzeria - Logique du Prototype 1 (Bootstrap 5)
 */

document.addEventListener('DOMContentLoaded', () => {
  initBootstrapApp();
});

let currentSelectedPizza = null;
let currentSelectedSize = PIZZA_SIZES[1]; // Moyenne par défaut
let currentCategoryFilter = 'all';

function initBootstrapApp() {
  renderHeroCarousel();
  renderCategoryPills();
  renderMenu();
  setupEventListeners();
  updateCartBadge();
  updateAuthUI();
  setupActiveOrderListener();
}

function renderHeroCarousel() {
  const inner = document.getElementById('hero-carousel-inner');
  if (!inner) return;

  inner.innerHTML = MENU_DATA.heroSlides.map((slide, idx) => `
    <div class="carousel-item ${idx === 0 ? 'active' : ''}">
      <img src="${slide.image}" alt="${slide.title}">
      <div class="hero-caption">
        <h5 class="fw-bold mb-1">${slide.title}</h5>
        <p class="small text-light mb-0">${slide.subtitle}</p>
      </div>
    </div>
  `).join('');
}

function renderCategoryPills() {
  const container = document.getElementById('category-pills-container');
  if (!container) return;

  // Extraire les catégories uniques
  const categories = ['all', 'Classique', 'Fromagère', 'Carnivore', 'Épicée', 'Marinière', 'Spécialité', 'salades'];

  container.innerHTML = categories.map(cat => {
    const label = cat === 'all' ? '🍕 Tout le menu' : (cat === 'salades' ? '🥗 Nos Salades' : cat);
    return `
      <button class="category-pill ${cat === currentCategoryFilter ? 'active' : ''}" data-cat="${cat}">
        ${label}
      </button>
    `;
  }).join('');

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
    filteredPizzas = MENU_DATA.pizzas.filter(p => p.category.toLowerCase() === currentCategoryFilter.toLowerCase());
  }

  if (currentCategoryFilter === 'salades') {
    pizzaContainer.parentElement.classList.add('d-none');
  } else {
    pizzaContainer.parentElement.classList.remove('d-none');
    pizzaContainer.innerHTML = filteredPizzas.map(pizza => `
      <div class="col-12 col-sm-6 col-lg-4">
        <div class="pizza-card h-100 d-flex flex-column">
          <div class="pizza-img-wrapper">
            <img src="${pizza.image}" alt="${pizza.name}" class="pizza-img" loading="lazy">
            <span class="card-badge ${pizza.isVegetarian ? 'card-badge-veggie' : ''}">
              ${pizza.badge || (pizza.isVegetarian ? 'Végétarien' : 'Artisanal')}
            </span>
          </div>
          <div class="p-3 d-flex flex-column flex-grow-1">
            <div class="d-flex justify-content-between align-items-start mb-1">
              <h5 class="fw-bold mb-0">${pizza.name}</h5>
              <span class="badge bg-secondary">${pizza.category}</span>
            </div>
            <p class="small text-muted flex-grow-1 mb-3">${pizza.description}</p>
            <div class="d-flex justify-content-between align-items-center mt-auto pt-2 border-top border-secondary border-opacity-25">
              <div>
                <span class="small text-muted d-block" style="font-size: 0.7rem; font-weight: 700; text-transform: uppercase;">Dès</span>
                <span class="five-price-tag">${pizza.basePrice.toFixed(2)} €</span>
              </div>
              <button class="btn btn-five-yellow btn-select-pizza" data-id="${pizza.id}">
                Choisir la taille 🍕
              </button>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  if (saladContainer) {
    if (currentCategoryFilter !== 'all' && currentCategoryFilter !== 'salades') {
      saladContainer.parentElement.classList.add('d-none');
    } else {
      saladContainer.parentElement.classList.remove('d-none');
      saladContainer.innerHTML = MENU_DATA.salades.map(salade => `
        <div class="col-12 col-sm-6 col-lg-4">
          <div class="pizza-card h-100 d-flex flex-column">
            <div class="pizza-img-wrapper">
              <img src="${salade.image}" alt="${salade.name}" class="pizza-img" loading="lazy">
              <span class="card-badge card-badge-veggie">${salade.badge}</span>
            </div>
            <div class="p-3 d-flex flex-column flex-grow-1">
              <h5 class="fw-bold mb-1">${salade.name}</h5>
              <p class="small text-muted flex-grow-1 mb-3">${salade.description}</p>
              <div class="d-flex justify-content-between align-items-center mt-auto pt-2 border-top border-secondary border-opacity-25">
                <span class="five-price-tag">${salade.price.toFixed(2)} €</span>
                <button class="btn btn-five-outline btn-add-salad" data-id="${salade.id}">
                  Ajouter +
                </button>
              </div>
            </div>
          </div>
        </div>
      `).join('');
    }
  }

  // Attach button listeners
  document.querySelectorAll('.btn-select-pizza').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const pizzaId = e.currentTarget.getAttribute('data-id');
      openPizzaSizeModal(pizzaId);
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
  currentSelectedSize = PIZZA_SIZES[1]; // Moyenne par défaut

  document.getElementById('modal-pizza-img').src = pizza.image;
  document.getElementById('modal-pizza-name').innerText = pizza.name;
  document.getElementById('modal-pizza-desc').innerText = pizza.description;

  const sizeContainer = document.getElementById('modal-size-cards');
  sizeContainer.innerHTML = PIZZA_SIZES.map(s => {
    const price = pizza.basePrice + s.priceBonus;
    return `
      <div class="col-4">
        <div class="size-option-card ${s.id === currentSelectedSize.id ? 'selected' : ''}" data-size-id="${s.id}">
          <img src="${s.icon}" alt="${s.name}">
          <div class="fw-bold fs-6">${s.name}</div>
          <div class="small text-muted mb-1">${s.size}</div>
          <div class="badge bg-danger fs-6">${price.toFixed(2)} €</div>
        </div>
      </div>
    `;
  }).join('');

  sizeContainer.querySelectorAll('.size-option-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const sizeId = e.currentTarget.getAttribute('data-size-id');
      currentSelectedSize = PIZZA_SIZES.find(s => s.id === sizeId);
      sizeContainer.querySelectorAll('.size-option-card').forEach(c => c.classList.remove('selected'));
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
  document.getElementById('modal-btn-add-text').innerText = `Ajouter au panier • ${totalPrice.toFixed(2)} €`;
}

function setupEventListeners() {
  // Confirmation d'ajout de pizza avec taille
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
      showToast(`🍕 Pizza ${currentSelectedPizza.name} (${currentSelectedSize.name}) ajoutée !`);
    });
  }

  // Événement panier mis à jour
  window.addEventListener('cartUpdated', () => {
    updateCartBadge();
    renderCartOffcanvas();
  });

  // Appliquer code promo
  const btnApplyPromo = document.getElementById('btn-apply-promo');
  if (btnApplyPromo) {
    btnApplyPromo.addEventListener('click', () => {
      const codeInput = document.getElementById('promo-code-input');
      const res = window.cartManager.applyPromo(codeInput.value);
      alert(res.message);
      renderCartOffcanvas();
    });
  }

  // Bouton Passer la commande dans le panier
  const btnCheckout = document.getElementById('btn-checkout-start');
  if (btnCheckout) {
    btnCheckout.addEventListener('click', () => {
      const offcanvasEl = document.getElementById('cartOffcanvas');
      bootstrap.Offcanvas.getInstance(offcanvasEl).hide();
      openCheckoutModal();
    });
  }

  // Authentification
  const loginForm = document.getElementById('form-login');
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

  const registerForm = document.getElementById('form-register');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = {
        firstName: document.getElementById('reg-firstname').value,
        lastName: document.getElementById('reg-lastname').value,
        email: document.getElementById('reg-email').value,
        phone: document.getElementById('reg-phone').value,
        address: document.getElementById('reg-address').value,
        password: document.getElementById('reg-password').value
      };
      const res = window.authManager.register(data);
      if (res.success) {
        bootstrap.Modal.getInstance(document.getElementById('authModal')).hide();
        showToast('Compte créé avec succès ! Bienvenue.');
        updateAuthUI();
      } else {
        alert(res.message);
      }
    });
  }

  // Géolocalisation interne
  const btnGeoloc = document.getElementById('btn-geoloc-locate');
  if (btnGeoloc) {
    btnGeoloc.addEventListener('click', async () => {
      btnGeoloc.disabled = true;
      btnGeoloc.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Recherche GPS...`;
      try {
        const loc = await window.geoManager.getCurrentPosition();
        document.getElementById('checkout-address').value = loc.address;
        document.getElementById('geoloc-result-badge').innerHTML = `
          <div class="alert alert-success py-2 px-3 small mt-2 mb-0">
            📍 Position détectée à <b>${loc.distance} km</b> de la pizzeria.<br>
            ⏱ Temps de livraison estimé : <b>${loc.estimatedTime}</b>
          </div>
        `;
        window.geoManager.updateMapWithUser(loc.lat, loc.lng, loc.address);
      } catch (err) {
        alert(err.message);
      } finally {
        btnGeoloc.disabled = false;
        btnGeoloc.innerHTML = `📍 Me géolocaliser automatiquement`;
      }
    });
  }

  // Soumission finale de commande & Paiement
  const checkoutForm = document.getElementById('form-checkout');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const totals = window.cartManager.getTotals();
      if (totals.count === 0) {
        alert('Votre panier est vide.');
        return;
      }

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
        <div class="fs-1 mb-2">🍕</div>
        <h5 class="fw-bold">Votre panier est vide</h5>
        <p class="text-muted small">Ajoutez vos pizzas artisanales préférées pour commencer la commande !</p>
      </div>
    `;
    document.getElementById('cart-checkout-box').classList.add('d-none');
    return;
  }

  document.getElementById('cart-checkout-box').classList.remove('d-none');

  container.innerHTML = window.cartManager.cart.map(item => `
    <div class="d-flex align-items-center justify-content-between p-2 mb-2 bg-dark rounded border border-secondary border-opacity-25">
      <img src="${item.image}" alt="${item.name}" style="width: 55px; height: 55px; object-fit: cover; border-radius: 8px;">
      <div class="flex-grow-1 mx-3">
        <h6 class="mb-0 fw-bold">${item.name}</h6>
        <div class="small text-muted">${item.sizeName}</div>
        <div class="fw-bold text-warning small">${(item.price * item.quantity).toFixed(2)} €</div>
      </div>
      <div class="d-flex align-items-center gap-2">
        <button class="btn btn-sm btn-outline-secondary py-0 px-2 btn-cart-minus" data-id="${item.cartItemId}">-</button>
        <span class="fw-bold">${item.quantity}</span>
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
  document.getElementById('cart-discount').innerText = totals.discountAmount > 0 ? `-${totals.discountAmount.toFixed(2)} €` : '0.00 €';
  document.getElementById('cart-total').innerText = totals.total.toFixed(2) + ' €';
}

function openCheckoutModal() {
  const totals = window.cartManager.getTotals();
  document.getElementById('checkout-final-total').innerText = totals.total.toFixed(2) + ' €';

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

  // Initialiser la carte Leaflet dans le checkout après ouverture
  modalEl.addEventListener('shown.bs.modal', () => {
    window.geoManager.initMap('checkout-map');
  }, { once: true });
}

function openTrackingModal(order) {
  document.getElementById('track-order-id').innerText = order.id;
  document.getElementById('track-order-eta').innerText = PIZZERIA_CONFIG.estimatedTime;
  document.getElementById('track-order-address').innerText = order.address;

  const modalEl = document.getElementById('trackingModal');
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  modal.show();

  modalEl.addEventListener('shown.bs.modal', () => {
    const map = window.geoManager.initMap('tracking-map');
    if (order.coords) {
      window.geoManager.updateMapWithUser(order.coords.lat, order.coords.lng, order.address);
    }
  }, { once: true });
}

function setupActiveOrderListener() {
  window.addEventListener('activeOrderChanged', (e) => {
    const order = e.detail;
    if (order) {
      document.getElementById('btn-active-order-floating').classList.remove('d-none');
    } else {
      document.getElementById('btn-active-order-floating').classList.add('d-none');
    }
  });

  const btnSimulate = document.getElementById('btn-simulate-step');
  if (btnSimulate) {
    btnSimulate.addEventListener('click', () => {
      window.orderManager.advanceOrderStatus();
      updateTrackingUI();
    });
  }
}

function updateTrackingUI() {
  const order = window.orderManager.activeOrder;
  if (!order) return;

  const steps = document.querySelectorAll('#tracking-steps-container .order-step');
  steps.forEach((step, idx) => {
    step.classList.remove('completed', 'current');
    if (idx < order.statusStep) {
      step.classList.add('completed');
    } else if (idx === order.statusStep) {
      step.classList.add('current');
    }
  });
}

function updateAuthUI() {
  const user = window.authManager.getCurrentUser();
  const authBtnText = document.getElementById('auth-btn-label');
  if (user) {
    if (authBtnText) authBtnText.innerText = user.firstName;
  } else {
    if (authBtnText) authBtnText.innerText = 'Compte';
  }
}

function showToast(msg) {
  const toastContainer = document.getElementById('toast-container');
  if (!toastContainer) return;

  const toastEl = document.createElement('div');
  toastEl.className = 'toast align-items-center text-white bg-danger border-0';
  toastEl.setAttribute('role', 'alert');
  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body fw-bold">${msg}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;
  toastContainer.appendChild(toastEl);
  const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
  toast.show();
  toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
}
