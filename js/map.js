// Leaflet.js map logic — all pin/popup behavior lives here

let map = null;
let markers = {};

function initMap(containerId, centerLat, centerLng, zoom) {
  map = L.map(containerId).setView([centerLat, centerLng], zoom);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  }).addTo(map);
  return map;
}

function getPinIcon(restaurantId) {
  const visit = getVisit(restaurantId);
  if (!visit?.checkedIn) {
    return L.divIcon({
      className: "",
      html: `<div class="map-pin map-pin--unvisited">🍕</div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40]
    });
  }
  if (isGoldStamp(restaurantId)) {
    return L.divIcon({
      className: "",
      html: `<div class="map-pin map-pin--gold">🍕</div>`,
      iconSize: [44, 44],
      iconAnchor: [22, 44],
      popupAnchor: [0, -44]
    });
  }
  return L.divIcon({
    className: "",
    html: `<div class="map-pin map-pin--visited">🍕</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });
}

function buildPopupHTML(restaurant) {
  const visit = getVisit(restaurant.id);
  const visited = visit?.checkedIn;
  const difficultyLabel = { easy: "🟢 Easy find", medium: "🟡 Worth the trek", hard: "🔴 Hidden gem" };
  const tagsHTML = restaurant.tags.map(t => `<span class="popup-tag">${t}</span>`).join("");

  return `
    <div class="map-popup">
      <div class="popup-header">
        <span class="popup-emoji">🍕</span>
        <div>
          <h3 class="popup-name">${restaurant.name}</h3>
          <p class="popup-neighborhood">${restaurant.neighborhood} · ${restaurant.city}</p>
        </div>
      </div>
      <p class="popup-description">${restaurant.description}</p>
      <div class="popup-tags">${tagsHTML}</div>
      <p class="popup-difficulty">${difficultyLabel[restaurant.difficulty] || ""}</p>
      ${visited
        ? `<div class="popup-visited-badge">✅ Stamped!</div>`
        : `<a href="restaurant.html?id=${restaurant.id}" class="popup-checkin-btn">Check In Here</a>`
      }
    </div>
  `;
}

function loadPizzaPins(restaurants) {
  markers = {};
  restaurants.forEach(restaurant => {
    const icon = getPinIcon(restaurant.id);
    const marker = L.marker([restaurant.lat, restaurant.lng], { icon })
      .addTo(map)
      .bindPopup(buildPopupHTML(restaurant), { maxWidth: 280 });
    markers[restaurant.id] = marker;
  });
}

function refreshPin(restaurantId, restaurant) {
  if (!markers[restaurantId]) return;
  markers[restaurantId].setIcon(getPinIcon(restaurantId));
  markers[restaurantId].setPopupContent(buildPopupHTML(restaurant));
}

function flyToRestaurant(restaurantId) {
  const marker = markers[restaurantId];
  if (!marker) return;
  map.flyTo(marker.getLatLng(), 15, { duration: 1 });
  setTimeout(() => marker.openPopup(), 1000);
}
