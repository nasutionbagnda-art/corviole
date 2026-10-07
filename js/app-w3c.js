/**
 * Opti'Noisy Pizzeria - Logique du Prototype 2 (W3C Standard)
 * Structure & Style inspirés de Five Pizza Original
 */

document.addEventListener('DOMContentLoaded', () => {
  initW3CApp();
});

let currentW3CPizza = null;
let currentW3CSize = PIZZA_SIZES[1]; // Moyenne
let currentW3CFilter = 'all';

function initW3CApp() {
  renderW3CHeroSlider();
  renderW3CDeals();
  renderW3CConcepts();
  renderW3CFilters();
  renderW3CProducts();
  setupW3CEventListeners();
  updateW3CCartCount();
  updateW3CAuthUI();

  // Initialisation carte restaurant sur la page principale
  setTimeout(() => {
    window.geoManager.initMap('w3c-page-restaurant-map');
  }, 500);
}

function renderW3CHeroSlider() {
  const slider = document.getElementById('w3c-hero-slider');
  if (!slider) return;

  slider.innerHTML = MENU_DATA.heroSlides.map(slide => `
    <div class="w3c-hero-slide">
      <img src="${slide.image}" alt="${slide.title}">
      <div class="w3c-hero-overlay">
        <h2 class="w3c-hero-title">${slide.title}</h2>
        <p class="w3c-hero-subtitle">${slide.subtitle}</p>
        <div style="margin-top: 14px;">
          <button class="w3c-btn-add" style="padding: 12px 26px; font-size: 0.9rem;" onclick="document.getElementById('w3c-menu-section').scrollIntoView({behavior: 'smooth'})">
            COMMANDER MAINTENANT ➔
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function renderW3CDeals() {
  const container = document.getElementById('w3c-deals-grid');
  if (!container || !MENU_DATA.deals) return;

  container.innerHTML = MENU_DATA.deals.map(deal => `
    <div class="w3c-deal-card ${deal.highlight ? 'featured' : ''}">
      <span class="w3c-deal-badge">${deal.badge}</span>
      <h3 style="font-size: 1.25rem; font-weight: 900; margin: 10px 0 6px;">${deal.title}</h3>
      <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 14px; flex-grow: 1;">${deal.desc}</p>
      <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-color); padding-top: 12px;">
        <span style="font-size: 1.25rem; font-weight: 900; color: var(--primary);">${deal.price}</span>
        <button class="w3c-btn-add" onclick="document.getElementById('w3c-menu-section').scrollIntoView({behavior: 'smooth'})">
          PROFITER ➔
        </button>
      </div>
    </div>
  `).join('');
}

function renderW3CConcepts() {
  const container = document.getElementById('w3c-concept-grid');
  if (!container || !MENU_DATA.concepts) return;

  container.innerHTML = MENU_DATA.concepts.map(item => `
    <div class="w3c-concept-item">
      <div style="font-size: 2.5rem; margin-bottom: 12px;">${item.icon}</div>
      <h4 style="font-size: 1.1rem; font-weight: 900; margin-bottom: 8px;">${item.title}</h4>
      <p style="font-size: 0.82rem; color: var(--text-muted);">${item.desc}</p>
    </div>
  `).join('');
}

function renderW3CFilters() {
  const container = document.getElementById('w3c-category-bar');
  if (!container) return;

  const categories = [
    { id: 'all', label: '🍕 TOUT LE MENU' },
    { id: 'tomate', label: '🥫 BASE TOMATE' },
    { id: 'creme', label: '🥛 BASE CRÈME' },
    { id: 'speciale', label: '⭐ SPÉCIALITÉS' },
    { id: 'salades', label: '🥗 SALADES & DESSERTS' }
  ];

  container.innerHTML = categories.map(cat => `
    <button class="w3c-pill ${cat.id === currentW3CFilter ? 'active' : ''}" data-cat="${cat.id}">
      ${cat.label}
    </button>
  `).join('');

  container.querySelectorAll('.w3c-pill').forEach(btn => {
    btn.addEventListener('click', (e) => {
      currentW3CFilter = e.currentTarget.getAttribute('data-cat');
      container.querySelectorAll('.w3c-pill').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      renderW3CProducts();
    });
  });
}

function renderW3CProducts() {
  const pizzaGrid = document.getElementById('w3c-pizzas-grid');
  const saladGrid = document.getElementById('w3c-salades-grid');

  if (!pizzaGrid) return;

  let filtered = MENU_DATA.pizzas;
  if (currentW3CFilter !== 'all' && currentW3CFilter !== 'salades') {
    filtered = MENU_DATA.pizzas.filter(p => p.base === currentW3CFilter);
  }

  if (currentW3CFilter === 'salades') {
    document.getElementById('w3c-pizza-section').style.display = 'none';
  } else {
    document.getElementById('w3c-pizza-section').style.display = 'block';
    pizzaGrid.innerHTML = filtered.map(pizza => `
      <article class="w3c-card">
        <div class="w3c-card-thumb">
          <img src="${pizza.image}" alt="${pizza.name}" loading="lazy">
          <span class="w3c-tag ${pizza.isVegetarian ? 'veggie' : ''}">
            ${pizza.badge || (pizza.isVegetarian ? 'Végétarien' : 'Artisanal')}
          </span>
        </div>
        <div class="w3c-card-body">
          <h3 class="w3c-card-title">${pizza.name}</h3>
          <p class="w3c-card-desc">${pizza.description}</p>
          <div class="w3c-card-footer">
            <div>
              <span style="font-size: 0.7rem; font-weight: 800; color: var(--text-muted); display: block; text-transform: uppercase;">Dès</span>
              <span class="w3c-price">${pizza.basePrice.toFixed(2)} €</span>
            </div>
            <button class="w3c-btn-add w3c-btn-select-pizza" data-id="${pizza.id}">
              CHOISIR LA TAILLE 🍕
            </button>
          </div>
        </div>
      </article>
    `).join('');
  }

  if (saladGrid) {
    if (currentW3CFilter !== 'all' && currentW3CFilter !== 'salades') {
      document.getElementById('w3c-salad-section').style.display = 'none';
    } else {
      document.getElementById('w3c-salad-section').style.display = 'block';
      saladGrid.innerHTML = MENU_DATA.salades.map(salad => `
        <article class="w3c-card">
          <div class="w3c-card-thumb">
            <img src="${salad.image}" alt="${salad.name}" loading="lazy">
            <span class="w3c-tag veggie">${salad.badge}</span>
          </div>
          <div class="w3c-card-body">
            <h3 class="w3c-card-title">${salad.name}</h3>
            <p class="w3c-card-desc">${salad.description}</p>
            <div class="w3c-card-footer">
              <span class="w3c-price">${salad.price.toFixed(2)} €</span>
              <button class="w3c-btn-add w3c-btn-add-salad" data-id="${salad.id}">
                AJOUTER +
              </button>
            </div>
          </div>
        </article>
      `).join('');
    }
  }

  // Événements boutons
  document.querySelectorAll('.w3c-btn-select-pizza').forEach(btn => {
    btn.addEventListener('click', (e) => {
      openW3CSizeModal(e.currentTarget.getAttribute('data-id'));
    });
  });

  document.querySelectorAll('.w3c-btn-add-salad').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const salad = MENU_DATA.salades.find(s => s.id === e.currentTarget.getAttribute('data-id'));
      if (salad) {
        window.cartManager.addItem({
          id: salad.id,
          name: salad.name,
          category: 'Salade',
          sizeId: 'standard',
          sizeName: 'Portion généreuse',
          price: salad.price,
          image: salad.image
        });
        showW3CNotification(`🥗 ${salad.name} ajoutée !`);
      }
    });
  });
}

function openW3CSizeModal(pizzaId) {
  const pizza = MENU_DATA.pizzas.find(p => p.id === pizzaId);
  if (!pizza) return;

  currentW3CPizza = pizza;
  currentW3CSize = PIZZA_SIZES[1];

  document.getElementById('w3c-modal-img').src = pizza.image;
  document.getElementById('w3c-modal-name').innerText = pizza.name;
  document.getElementById('w3c-modal-desc').innerText = pizza.description;

  const grid = document.getElementById('w3c-modal-sizes');
  grid.innerHTML = PIZZA_SIZES.map(s => `
    <div class="w3c-size-card ${s.id === currentW3CSize.id ? 'active' : ''}" data-size="${s.id}">
      <img src="${s.icon}" alt="${s.name}">
      <div class="w3c-size-name">${s.name}</div>
      <div class="w3c-size-cm">${s.size}</div>
      <div class="w3c-size-price">${(pizza.basePrice + s.priceBonus).toFixed(2)} €</div>
    </div>
  `).join('');

  grid.querySelectorAll('.w3c-size-card').forEach(card => {
    card.addEventListener('click', (e) => {
      currentW3CSize = PIZZA_SIZES.find(s => s.id === e.currentTarget.getAttribute('data-size'));
      grid.querySelectorAll('.w3c-size-card').forEach(c => c.classList.remove('active'));
      e.currentTarget.classList.add('active');
      updateW3CModalButton();
    });
  });

  updateW3CModalButton();
  openW3CModal('w3c-size-modal');
}

function updateW3CModalButton() {
  if (!currentW3CPizza || !currentW3CSize) return;
  const price = currentW3CPizza.basePrice + currentW3CSize.priceBonus;
  document.getElementById('w3c-btn-modal-add').innerText = `AJOUTER AU PANIER • ${price.toFixed(2)} €`;
}

function setupW3CEventListeners() {
  const btnAdd = document.getElementById('w3c-btn-modal-add');
  if (btnAdd) {
    btnAdd.addEventListener('click', () => {
      if (!currentW3CPizza || !currentW3CSize) return;
      window.cartManager.addItem({
        id: currentW3CPizza.id,
        name: currentW3CPizza.name,
        category: 'Pizza',
        sizeId: currentW3CSize.id,
        sizeName: `${currentW3CSize.name} (${currentW3CSize.size})`,
        price: currentW3CPizza.basePrice + currentW3CSize.priceBonus,
        image: currentW3CPizza.image
      });
      closeW3CModal('w3c-size-modal');
      showW3CNotification(`🍕 ${currentW3CPizza.name} ajoutée !`);
    });
  }

  // Tiroir Panier
  const btnOpenCart = document.getElementById('w3c-btn-cart');
  if (btnOpenCart) {
    btnOpenCart.addEventListener('click', () => openW3CDrawer());
  }
  const btnCloseCart = document.getElementById('w3c-btn-close-drawer');
  if (btnCloseCart) {
    btnCloseCart.addEventListener('click', () => closeW3CDrawer());
  }

  window.addEventListener('cartUpdated', () => {
    updateW3CCartCount();
    renderW3CDrawer();
  });

  // Code promo
  const btnPromo = document.getElementById('w3c-btn-promo');
  if (btnPromo) {
    btnPromo.addEventListener('click', () => {
      const code = document.getElementById('w3c-input-promo').value;
      const res = window.cartManager.applyPromo(code);
      alert(res.message);
      renderW3CDrawer();
    });
  }

  // Démarrer Checkout
  const btnCheckout = document.getElementById('w3c-btn-start-checkout');
  if (btnCheckout) {
    btnCheckout.addEventListener('click', () => {
      closeW3CDrawer();
      openW3CCheckoutModal();
    });
  }

  // Authentification W3C
  const authForm = document.getElementById('w3c-auth-form');
  if (authForm) {
    authForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('w3c-auth-email').value;
      const pass = document.getElementById('w3c-auth-pass').value;
      const res = window.authManager.login(email, pass);
      if (res.success) {
        closeW3CModal('w3c-auth-modal');
        showW3CNotification(res.message);
        updateW3CAuthUI();
      } else {
        alert(res.message);
      }
    });
  }

  // Géolocalisation W3C
  const btnGeoloc = document.getElementById('w3c-btn-geoloc');
  if (btnGeoloc) {
    btnGeoloc.addEventListener('click', async () => {
      btnGeoloc.disabled = true;
      btnGeoloc.innerText = 'Recherche GPS en cours...';
      try {
        const loc = await window.geoManager.getCurrentPosition();
        document.getElementById('w3c-checkout-addr').value = loc.address;
        document.getElementById('w3c-geoloc-info').innerHTML = `
          <div style="background: rgba(253,227,84,0.15); border: 1px solid var(--primary); color: #fff; padding: 10px 14px; border-radius: var(--radius-sm); font-size: 0.85rem; margin-top: 10px; font-weight: 700;">
            📍 Distance : <b>${loc.distance} km</b> • Temps estimé : <b>${loc.estimatedTime}</b>
          </div>
        `;
        window.geoManager.updateMapWithUser(loc.lat, loc.lng, loc.address);
      } catch (err) {
        alert(err.message);
      } finally {
        btnGeoloc.disabled = false;
        btnGeoloc.innerText = '📍 ME GÉOLOCALISER AUTOMATIQUEMENT';
      }
    });
  }

  // Checkout W3C
  const checkoutForm = document.getElementById('w3c-checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const totals = window.cartManager.getTotals();
      if (totals.count === 0) return alert('Votre panier est vide.');

      const orderData = {
        customer: {
          name: document.getElementById('w3c-checkout-name').value,
          phone: document.getElementById('w3c-checkout-phone').value,
          email: document.getElementById('w3c-checkout-email').value
        },
        address: document.getElementById('w3c-checkout-addr').value,
        paymentMethod: document.querySelector('input[name="w3cPayMethod"]:checked')?.value || 'CB',
        deliveryType: 'livraison',
        items: [...window.cartManager.cart],
        totals: totals,
        coords: window.geoManager.userLocation
      };

      const order = window.orderManager.createOrder(orderData);
      closeW3CModal('w3c-checkout-modal');
      openW3CTrackingModal(order);
    });
  }
}

function updateW3CCartCount() {
  const totals = window.cartManager.getTotals();
  const badges = document.querySelectorAll('.w3c-cart-badge-count');
  badges.forEach(b => {
    b.innerText = totals.count;
    b.style.display = totals.count > 0 ? 'flex' : 'none';
  });
}

function openW3CDrawer() {
  renderW3CDrawer();
  document.getElementById('w3c-cart-drawer-overlay').classList.add('active');
}

function closeW3CDrawer() {
  document.getElementById('w3c-cart-drawer-overlay').classList.remove('active');
}

function renderW3CDrawer() {
  const container = document.getElementById('w3c-drawer-items');
  const totals = window.cartManager.getTotals();
  if (!container) return;

  if (window.cartManager.cart.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 50px 10px; color: var(--text-muted);">
        <div style="font-size: 3rem; margin-bottom: 12px;">🍕</div>
        <h4 style="font-weight: 900; color: #fff;">VOTRE PANIER EST VIDE</h4>
        <p style="font-size: 0.85rem; margin-top: 6px;">Ajoutez vos pizzas préférées pour commencer la commande !</p>
      </div>
    `;
    document.getElementById('w3c-drawer-footer').style.display = 'none';
    return;
  }

  document.getElementById('w3c-drawer-footer').style.display = 'block';

  container.innerHTML = window.cartManager.cart.map(item => `
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; margin-bottom: 12px; background: var(--bg-elevated); border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
      <img src="${item.image}" alt="${item.name}" style="width: 55px; height: 55px; object-fit: cover; border-radius: 8px;">
      <div style="flex-grow: 1; margin: 0 14px;">
        <div style="font-weight: 900; font-size: 0.95rem;">${item.name}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted);">${item.sizeName}</div>
        <div style="font-weight: 900; color: var(--primary); font-size: 0.95rem; margin-top: 2px;">${(item.price * item.quantity).toFixed(2)} €</div>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <button class="w3c-btn-icon" style="width: 32px; height: 32px;" onclick="window.cartManager.updateQuantity('${item.cartItemId}', -1)">-</button>
        <span style="font-weight: 900; font-size: 0.95rem;">${item.quantity}</span>
        <button class="w3c-btn-icon" style="width: 32px; height: 32px;" onclick="window.cartManager.updateQuantity('${item.cartItemId}', 1)">+</button>
      </div>
    </div>
  `).join('');

  document.getElementById('w3c-subtotal').innerText = totals.subtotal.toFixed(2) + ' €';
  document.getElementById('w3c-delivery').innerText = totals.isFreeDelivery ? 'Offerte !' : totals.deliveryFee.toFixed(2) + ' €';
  document.getElementById('w3c-total').innerText = totals.total.toFixed(2) + ' €';
}

function openW3CCheckoutModal() {
  const totals = window.cartManager.getTotals();
  document.getElementById('w3c-checkout-total-display').innerText = totals.total.toFixed(2) + ' €';

  const user = window.authManager.getCurrentUser();
  if (user) {
    document.getElementById('w3c-checkout-name').value = `${user.firstName} ${user.lastName}`;
    document.getElementById('w3c-checkout-email').value = user.email;
    document.getElementById('w3c-checkout-phone').value = user.phone;
    if (user.address) document.getElementById('w3c-checkout-addr').value = user.address;
  }

  openW3CModal('w3c-checkout-modal');
  setTimeout(() => {
    window.geoManager.initMap('w3c-checkout-map');
  }, 250);
}

function openW3CTrackingModal(order) {
  document.getElementById('w3c-track-id').innerText = order.id;
  document.getElementById('w3c-track-addr').innerText = order.address;
  openW3CModal('w3c-tracking-modal');

  setTimeout(() => {
    window.geoManager.initMap('w3c-track-map');
    if (order.coords) {
      window.geoManager.updateMapWithUser(order.coords.lat, order.coords.lng, order.address);
    }
  }, 250);
}

function openW3CModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('active');
}

function closeW3CModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

function updateW3CAuthUI() {
  const user = window.authManager.getCurrentUser();
  const label = document.getElementById('w3c-auth-user-label');
  if (label) {
    label.innerText = user ? user.firstName : 'Club';
  }
}

function showW3CNotification(text) {
  let notif = document.getElementById('w3c-toast');
  if (!notif) {
    notif = document.createElement('div');
    notif.id = 'w3c-toast';
    notif.style.cssText = `
      position: fixed;
      top: 24px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--primary);
      color: var(--primary-text);
      padding: 12px 24px;
      border-radius: var(--radius-pill);
      font-weight: 900;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      box-shadow: 0 6px 20px rgba(0,0,0,0.5);
      z-index: 2000;
      transition: opacity 0.3s ease;
      opacity: 0;
      pointer-events: none;
    `;
    document.body.appendChild(notif);
  }

  notif.innerText = text;
  notif.style.opacity = '1';
  setTimeout(() => {
    notif.style.opacity = '0';
  }, 2500);
}
