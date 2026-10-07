/**
 * Opti'Noisy Pizzeria - Logique du Prototype 2 (W3C Standard Pur)
 * Direction Artistique : Néo-Trattoria Napoletana Contemporaine
 */

document.addEventListener('DOMContentLoaded', () => {
  initW3CApp();
});

let currentW3CPizza = null;
let currentW3CSize = PIZZA_SIZES[1]; // Classica 31cm par défaut
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

  // Initialisation de la carte Leaflet sur la page principale
  setTimeout(() => {
    window.geoManager.initMap('w3c-page-restaurant-map');
  }, 400);

  // Gestion du scroll pour affiner le header glassmorphism
  window.addEventListener('scroll', () => {
    const header = document.getElementById('w3c-header');
    if (header) {
      if (window.scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  });
}

function renderW3CHeroSlider() {
  const slider = document.getElementById('w3c-hero-slider');
  if (!slider || !MENU_DATA.heroSlides) return;

  slider.innerHTML = MENU_DATA.heroSlides.map(slide => `
    <div class="w3c-hero-slide">
      <img src="${slide.image}" alt="${slide.title}">
      <div class="w3c-hero-overlay">
        <span style="display: inline-block; background: var(--primary-soft); border: 1px solid var(--primary); color: #FFA590; font-size: 0.72rem; font-weight: 800; padding: 4px 12px; border-radius: var(--radius-pill); margin-bottom: 12px; text-transform: uppercase;">
          ${slide.badge}
        </span>
        <h2 class="w3c-hero-title">${slide.title}</h2>
        <p class="w3c-hero-subtitle">${slide.subtitle}</p>
        <div style="margin-top: 18px;">
          <button class="w3c-btn-add" onclick="document.getElementById('w3c-menu-section').scrollIntoView({behavior: 'smooth'})">
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
      <h3 style="font-size: 1.25rem; font-weight: 800; margin: 10px 0 6px; color: #fff;">${deal.title}</h3>
      <p style="font-size: 0.86rem; color: var(--cream-muted); margin-bottom: 18px; flex-grow: 1; line-height: 1.5;">${deal.desc}</p>
      <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-color); padding-top: 14px; margin-top: auto;">
        <span style="font-family: var(--font-display); font-size: 1.35rem; font-weight: 900; color: var(--gold);">${deal.price}</span>
        <button class="w3c-btn-add" style="padding: 8px 18px; font-size: 0.8rem;" onclick="document.getElementById('w3c-menu-section').scrollIntoView({behavior: 'smooth'})">
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
      <div style="font-size: 2.4rem; margin-bottom: 12px;">${item.icon}</div>
      <h4 style="font-size: 1.1rem; font-weight: 800; margin-bottom: 8px; color: #fff;">${item.title}</h4>
      <p style="font-size: 0.84rem; color: var(--cream-muted); line-height: 1.5;">${item.desc}</p>
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
            ${pizza.badge || (pizza.isVegetarian ? 'Végétarien 🌿' : 'Artisanal 🔥')}
          </span>
        </div>
        <div class="w3c-card-body">
          <h3 class="w3c-card-title">${pizza.name}</h3>
          <p class="w3c-card-desc">${pizza.description}</p>
          <div class="w3c-card-footer">
            <div>
              <span style="font-size: 0.68rem; font-weight: 800; color: var(--cream-muted); display: block; text-transform: uppercase; letter-spacing: 0.5px;">Dès</span>
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

  // Événements boutons de sélection de pizza
  document.querySelectorAll('.w3c-btn-select-pizza').forEach(btn => {
    btn.addEventListener('click', (e) => {
      openW3CSizeModal(e.currentTarget.getAttribute('data-id'));
    });
  });

  // Événements boutons salades
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
  currentW3CSize = PIZZA_SIZES[1]; // Classica 31cm

  document.getElementById('w3c-modal-img').src = pizza.image;
  document.getElementById('w3c-modal-name').innerText = pizza.name;
  document.getElementById('w3c-modal-desc').innerText = pizza.description;

  const grid = document.getElementById('w3c-modal-sizes');
  grid.innerHTML = PIZZA_SIZES.map(s => `
    <div class="w3c-size-card ${s.id === currentW3CSize.id ? 'selected' : ''}" data-size="${s.id}">
      <img src="${s.icon}" alt="${s.name}">
      <h5>${s.name}</h5>
      <span>${s.size} &bull; ${s.label}</span>
      <div class="size-price-tag">${(pizza.basePrice + s.priceBonus).toFixed(2)} €</div>
    </div>
  `).join('');

  grid.querySelectorAll('.w3c-size-card').forEach(card => {
    card.addEventListener('click', (e) => {
      currentW3CSize = PIZZA_SIZES.find(s => s.id === e.currentTarget.getAttribute('data-size'));
      grid.querySelectorAll('.w3c-size-card').forEach(c => c.classList.remove('selected'));
      e.currentTarget.classList.add('selected');
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
  // Ajout au panier depuis la modale de taille
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
      showW3CNotification(`🍕 ${currentW3CPizza.name} ajoutée au panier !`);
    });
  }

  // Tiroir Panier Ouvrir / Fermer
  const btnOpenCart = document.getElementById('w3c-btn-cart');
  if (btnOpenCart) {
    btnOpenCart.addEventListener('click', () => openW3CDrawer());
  }
  const btnCloseCart = document.getElementById('w3c-btn-close-drawer');
  if (btnCloseCart) {
    btnCloseCart.addEventListener('click', () => closeW3CDrawer());
  }

  // Écouteur de mise à jour du panier
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
      const feedback = document.getElementById('w3c-promo-feedback');
      if (feedback) {
        feedback.style.display = 'block';
        feedback.style.color = res.success ? 'var(--secondary-light)' : 'var(--primary)';
        feedback.innerText = res.message;
      }
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

  // Connexion W3C
  const loginForm = document.getElementById('w3c-auth-login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
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

  // Inscription W3C
  const regForm = document.getElementById('w3c-auth-register-form');
  if (regForm) {
    regForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const userData = {
        firstName: document.getElementById('w3c-reg-first').value,
        lastName: document.getElementById('w3c-reg-last').value,
        email: document.getElementById('w3c-reg-email').value,
        phone: document.getElementById('w3c-reg-phone').value,
        password: document.getElementById('w3c-reg-pass').value
      };
      const res = window.authManager.register(userData);
      if (res.success) {
        closeW3CModal('w3c-auth-modal');
        showW3CNotification(`Bienvenue dans le Club, ${userData.firstName} !`);
        updateW3CAuthUI();
      } else {
        alert(res.message);
      }
    });
  }

  // Géolocalisation interne W3C
  const btnGeoloc = document.getElementById('w3c-btn-geoloc');
  if (btnGeoloc) {
    btnGeoloc.addEventListener('click', async () => {
      btnGeoloc.disabled = true;
      btnGeoloc.innerText = 'Recherche satellite GPS en cours...';
      try {
        const loc = await window.geoManager.getCurrentPosition();
        document.getElementById('w3c-checkout-addr').value = loc.address;
        document.getElementById('w3c-geoloc-info').innerHTML = `
          <div style="background: rgba(242, 166, 90, 0.15); border: 1px solid var(--gold); color: #fff; padding: 12px 14px; border-radius: var(--radius-sm); font-size: 0.85rem; margin-top: 10px; font-weight: 700;">
            📍 Distance : <b>${loc.distance} km</b> de la pizzeria &bull; Temps estimé : <b>${loc.estimatedTime}</b>
          </div>
        `;
        window.geoManager.updateMapWithUser(loc.lat, loc.lng, loc.address);
      } catch (err) {
        alert(err.message);
      } finally {
        btnGeoloc.disabled = false;
        btnGeoloc.innerText = '📍 UTILISER MA POSITION GPS';
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

  // Jauge de livraison offerte (Seuil 25€)
  const remaining = Math.max(0, PIZZERIA_CONFIG.freeDeliveryThreshold - totals.subtotal);
  const percent = Math.min(100, Math.round((totals.subtotal / PIZZERIA_CONFIG.freeDeliveryThreshold) * 100));
  
  const progBar = document.getElementById('w3c-delivery-progress');
  const remText = document.getElementById('w3c-delivery-remaining');
  const msgText = document.getElementById('w3c-delivery-msg');

  if (progBar && remText && msgText) {
    progBar.style.width = `${percent}%`;
    if (remaining === 0) {
      remText.innerText = "LIVRAISON OFFERTE ! 🎉";
      remText.style.color = "var(--secondary-light)";
      msgText.innerText = "Félicitations ! Vous bénéficiez des frais de port gratuits";
    } else {
      remText.innerText = `${remaining.toFixed(2)} € restants`;
      remText.style.color = "var(--gold)";
      msgText.innerText = `Livraison offerte dès ${PIZZERIA_CONFIG.freeDeliveryThreshold.toFixed(2)} €`;
    }
  }

  if (window.cartManager.cart.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 60px 10px; color: var(--cream-muted);">
        <div style="font-size: 3.5rem; margin-bottom: 14px;">🍕</div>
        <h4 style="font-weight: 900; color: #fff; font-size: 1.2rem;">VOTRE PANIER EST VIDE</h4>
        <p style="font-size: 0.86rem; margin-top: 6px;">Découvrez nos 22 recettes napolitaines et commencez votre commande !</p>
      </div>
    `;
    document.getElementById('w3c-drawer-footer').style.display = 'none';
    return;
  }

  document.getElementById('w3c-drawer-footer').style.display = 'block';

  container.innerHTML = window.cartManager.cart.map(item => `
    <div class="w3c-cart-item">
      <img src="${item.image}" alt="${item.name}" class="w3c-cart-item-img">
      <div class="w3c-cart-item-details">
        <div class="w3c-cart-item-name">${item.name}</div>
        <div class="w3c-cart-item-size">${item.sizeName}</div>
        <div class="w3c-cart-item-price">${(item.price * item.quantity).toFixed(2)} €</div>
      </div>
      <div class="w3c-cart-item-actions">
        <button class="w3c-btn-qty" onclick="window.cartManager.updateQuantity('${item.cartItemId}', -1)" aria-label="Diminuer">-</button>
        <span style="font-weight: 900; font-size: 0.95rem; min-width: 18px; text-align: center;">${item.quantity}</span>
        <button class="w3c-btn-qty" onclick="window.cartManager.updateQuantity('${item.cartItemId}', 1)" aria-label="Augmenter">+</button>
      </div>
    </div>
  `).join('');

  document.getElementById('w3c-subtotal').innerText = totals.subtotal.toFixed(2) + ' €';
  document.getElementById('w3c-delivery').innerText = totals.isFreeDelivery ? 'Offerte !' : totals.deliveryFee.toFixed(2) + ' €';
  
  const discountRow = document.getElementById('w3c-discount-row');
  const discountVal = document.getElementById('w3c-discount');
  if (discountRow && discountVal) {
    if (totals.discountAmount > 0) {
      discountRow.style.display = 'flex';
      discountVal.innerText = `-${totals.discountAmount.toFixed(2)} €`;
    } else {
      discountRow.style.display = 'none';
    }
  }

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
  }, 300);
}

function openW3CTrackingModal(order) {
  const currentOrder = order || window.orderManager.activeOrder || {
    id: 'OPT-492104',
    address: '12 Avenue Aristide Briand, Noisy-le-Grand',
    statusStep: 1,
    timeline: [
      { title: 'Commande confirmée', time: 'En direct', done: true },
      { title: 'Cuisson au four 450°C', time: 'En cours', done: true },
      { title: 'Livreur en route', time: 'À venir', done: false },
      { title: 'Livraison effectuée', time: 'À venir', done: false }
    ]
  };

  document.getElementById('w3c-track-id').innerText = currentOrder.id;
  document.getElementById('w3c-track-addr').innerText = currentOrder.address;
  
  renderW3CTrackingStepper(currentOrder);
  openW3CModal('w3c-tracking-modal');

  setTimeout(() => {
    window.geoManager.initMap('w3c-track-map');
    if (currentOrder.coords) {
      window.geoManager.updateMapWithUser(currentOrder.coords.lat, currentOrder.coords.lng, currentOrder.address);
    }
  }, 300);
}

function renderW3CTrackingStepper(order) {
  const currentOrder = order || window.orderManager.activeOrder;
  const stepperContainer = document.getElementById('w3c-tracking-stepper');
  if (!stepperContainer || !currentOrder) return;

  const steps = [
    { title: 'Commande Reçue', icon: '📝' },
    { title: 'Au Four à Bois (450°C)', icon: '🔥' },
    { title: 'Livreur en Route', icon: '🛵' },
    { title: 'Livré Chez Vous', icon: '🍕' }
  ];

  stepperContainer.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; text-align: center;">
      ${steps.map((st, idx) => {
        const isDone = idx <= currentOrder.statusStep;
        const isCurrent = idx === currentOrder.statusStep;
        return `
          <div style="display: flex; flex-direction: column; align-items: center;">
            <div style="
              width: 38px; height: 38px; border-radius: 50%;
              background: ${isCurrent ? 'var(--primary)' : isDone ? 'var(--secondary)' : 'var(--bg-elevated)'};
              border: 2px solid ${isDone ? 'transparent' : 'var(--border-color)'};
              color: #fff; display: flex; align-items: center; justify-content: center;
              font-size: 1.1rem; margin-bottom: 6px;
              box-shadow: ${isCurrent ? '0 0 12px var(--primary-glow)' : 'none'};
            ">
              ${st.icon}
            </div>
            <span style="font-size: 0.68rem; font-weight: 800; color: ${isDone ? '#fff' : 'var(--cream-muted)'}; text-transform: uppercase;">
              ${st.title}
            </span>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function openW3CAuthModal(defaultTab = 'login') {
  const user = window.authManager.getCurrentUser();
  const profileView = document.getElementById('w3c-auth-profile-view');
  const formsView = document.getElementById('w3c-auth-forms-view');

  if (user) {
    if (profileView) profileView.style.display = 'block';
    if (formsView) formsView.style.display = 'none';

    document.getElementById('w3c-profile-name').innerText = `${user.firstName} ${user.lastName}`;
    document.getElementById('w3c-profile-email').innerText = user.email;

    const ordersBox = document.getElementById('w3c-profile-orders');
    if (ordersBox) {
      if (!user.orders || user.orders.length === 0) {
        ordersBox.innerHTML = '<p style="font-size: 0.8rem; color: var(--cream-muted); text-align: center;">Aucune commande précédente.</p>';
      } else {
        ordersBox.innerHTML = user.orders.map(o => `
          <div style="background: var(--bg-surface); padding: 10px 14px; border-radius: var(--radius-sm); margin-bottom: 8px; border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 800; font-size: 0.85rem; color: #fff;">${o.id}</div>
              <div style="font-size: 0.72rem; color: var(--cream-muted);">${new Date(o.createdAt || o.date).toLocaleDateString()}</div>
            </div>
            <div style="font-family: var(--font-display); font-weight: 900; color: var(--gold); font-size: 0.95rem;">
              ${(o.totals ? o.totals.total : o.total).toFixed(2)} €
            </div>
          </div>
        `).join('');
      }
    }
  } else {
    if (profileView) profileView.style.display = 'none';
    if (formsView) formsView.style.display = 'block';
    switchW3CAuthTab(defaultTab);
  }

  openW3CModal('w3c-auth-modal');
}

function switchW3CAuthTab(tab) {
  const btnLogin = document.getElementById('w3c-tab-login');
  const btnReg = document.getElementById('w3c-tab-register');
  const formLogin = document.getElementById('w3c-auth-login-form');
  const formReg = document.getElementById('w3c-auth-register-form');

  if (tab === 'login') {
    btnLogin.classList.add('active');
    btnReg.classList.remove('active');
    formLogin.style.display = 'block';
    formReg.style.display = 'none';
  } else {
    btnReg.classList.add('active');
    btnLogin.classList.remove('active');
    formReg.style.display = 'block';
    formLogin.style.display = 'none';
  }
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
    notif.className = 'w3c-toast';
    document.body.appendChild(notif);
  }

  notif.innerText = text;
  notif.classList.add('show');
  setTimeout(() => {
    notif.classList.remove('show');
  }, 2600);
}
