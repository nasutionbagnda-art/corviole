/**
 * Opti'Noisy Pizzeria - Géolocalisation interne et cartographie
 */

class GeoManager {
  constructor() {
    this.restaurant = {
      name: PIZZERIA_CONFIG.name,
      address: PIZZERIA_CONFIG.address,
      lat: PIZZERIA_CONFIG.lat,
      lng: PIZZERIA_CONFIG.lng
    };
    this.userLocation = null;
    this.map = null;
    this.markers = {};
  }

  // Calcul de distance par formule de Haversine (en km)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round((R * c) * 10) / 10;
  }

  estimateDeliveryTime(distanceKm) {
    // Préparation 15 min + trajet ~ 3 min/km
    const basePrep = 15;
    const transit = Math.round(distanceKm * 2.5);
    const total = basePrep + transit;
    return `${Math.max(20, total)} - ${Math.max(25, total + 10)} min`;
  }

  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("La géolocalisation n'est pas supportée par votre navigateur."));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const distance = this.calculateDistance(this.restaurant.lat, this.restaurant.lng, lat, lng);
          const estimatedTime = this.estimateDeliveryTime(distance);

          let address = "Position GPS détectée";
          try {
            // Reverse geocoding gratuit avec OpenStreetMap Nominatim
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
              headers: { 'Accept-Language': 'fr' }
            });
            if (res.ok) {
              const data = await res.json();
              address = data.display_name.split(',').slice(0, 3).join(', ');
            }
          } catch (e) {
            console.warn("Reverse geocoding unavailable:", e);
          }

          this.userLocation = {
            lat,
            lng,
            distance,
            estimatedTime,
            address
          };

          resolve(this.userLocation);
        },
        (error) => {
          let msg = "Impossible de récupérer votre position.";
          if (error.code === error.PERMISSION_DENIED) {
            msg = "Veuillez autoriser l'accès à votre position pour le calcul de livraison.";
          }
          reject(new Error(msg));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  }

  // Initialisation d'une carte Leaflet dans un conteneur HTML
  initMap(containerId, centerLat = 48.8485, centerLng = 2.5532, zoom = 13) {
    if (typeof L === 'undefined') {
      console.warn("Leaflet n'est pas chargé sur la page.");
      return null;
    }

    const container = document.getElementById(containerId);
    if (!container) return null;

    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    this.map = L.map(containerId).setView([centerLat, centerLng], zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors | Opti\'Noisy Pizzeria'
    }).addTo(this.map);

    // Marqueur Restaurant
    const pizzaIcon = L.divIcon({
      className: 'custom-map-marker pizzeria-marker',
      html: '<div style="background:#BE1C1F;color:white;padding:6px 10px;border-radius:20px;font-weight:bold;font-size:12px;box-shadow:0 3px 6px rgba(0,0,0,0.3);border:2px solid white;white-space:nowrap;">🍕 Opti\'Noisy</div>',
      iconSize: [110, 32],
      iconAnchor: [55, 16]
    });

    this.markers.restaurant = L.marker([this.restaurant.lat, this.restaurant.lng], { icon: pizzaIcon })
      .addTo(this.map)
      .bindPopup(`<b>${this.restaurant.name}</b><br>${this.restaurant.address}`);

    return this.map;
  }

  updateMapWithUser(userLat, userLng, addressLabel = "Votre adresse") {
    if (!this.map || typeof L === 'undefined') return;

    const userIcon = L.divIcon({
      className: 'custom-map-marker client-marker',
      html: '<div style="background:#13672F;color:white;padding:6px 10px;border-radius:20px;font-weight:bold;font-size:12px;box-shadow:0 3px 6px rgba(0,0,0,0.3);border:2px solid white;white-space:nowrap;">📍 Vous</div>',
      iconSize: [80, 32],
      iconAnchor: [40, 16]
    });

    if (this.markers.user) {
      this.map.removeLayer(this.markers.user);
    }
    if (this.markers.line) {
      this.map.removeLayer(this.markers.line);
    }

    this.markers.user = L.marker([userLat, userLng], { icon: userIcon })
      .addTo(this.map)
      .bindPopup(`<b>Destination de livraison</b><br>${addressLabel}`);

    // Tracer la ligne de livraison
    this.markers.line = L.polyline([
      [this.restaurant.lat, this.restaurant.lng],
      [userLat, userLng]
    ], {
      color: '#BE1C1F',
      weight: 4,
      dashArray: '6, 8',
      opacity: 0.8
    }).addTo(this.map);

    // Ajuster le zoom pour englober les deux points
    const bounds = L.latLngBounds([
      [this.restaurant.lat, this.restaurant.lng],
      [userLat, userLng]
    ]);
    this.map.fitBounds(bounds, { padding: [40, 40] });
  }
}

window.geoManager = new GeoManager();
