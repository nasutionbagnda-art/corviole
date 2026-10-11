/**
 * Opti'Noisy Pizza - Script Storytelling
 * Gestion des filtres de la carte signature, navigation et passerelles de commande
 */

document.addEventListener('DOMContentLoaded', () => {
  initMenuFilters();
  initMobileNav();
});

function initMenuFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.story-pizza-card');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      cards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

function initMobileNav() {
  const toggleBtn = document.getElementById('mobileNavToggle');
  const menu = document.getElementById('mobileNavDrawer');
  const closeBtn = document.getElementById('closeMobileNav');

  if (toggleBtn && menu) {
    toggleBtn.addEventListener('click', () => {
      menu.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  }

  if (closeBtn && menu) {
    closeBtn.addEventListener('click', () => {
      menu.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  // Fermeture lors du clic sur un lien du menu
  const navLinks = document.querySelectorAll('.mobile-drawer-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (menu) menu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

function redirectToOrder(prototypeType, productId) {
  let targetUrl = prototypeType === 'w3c' 
    ? '../prototype-w3c/index.html' 
    : '../prototype-bootstrap/index.html';
  
  if (productId) {
    targetUrl += `#item-${productId}`;
  }
  window.location.href = targetUrl;
}
