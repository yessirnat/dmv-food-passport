// Leaflet.js map logic — all pin/popup behavior lives here

let map = null;
let markers = {};

function initMap(containerId, centerLat, centerLng, zoom) {
  map = L.map(containerId, { zoomControl: false }).setView([centerLat, centerLng], zoom);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  }).addTo(map);

  // Zoom controls top-left, below HUD
  L.control.zoom({ position: 'topleft' }).addTo(map);

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
    });
  }
  if (isGoldStamp(restaurantId)) {
    return L.divIcon({
      className: "",
      html: `<div class="map-pin map-pin--gold">🍕</div>`,
      iconSize: [44, 44],
      iconAnchor: [22, 44],
    });
  }
  return L.divIcon({
    className: "",
    html: `<div class="map-pin map-pin--visited">🍕</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });
}

function loadPizzaPins(restaurants) {
  // Clear existing markers
  Object.values(markers).forEach(m => map.removeLayer(m));
  markers = {};

  restaurants.forEach(restaurant => {
    if (!restaurant.lat || !restaurant.lng) return;
    const icon = getPinIcon(restaurant.id);
    const marker = L.marker([restaurant.lat, restaurant.lng], { icon })
      .addTo(map)
      .on('click', () => {
        map.flyTo([restaurant.lat, restaurant.lng], 15, { duration: 0.8 });
        openBottomSheet(restaurant);
      });
    markers[restaurant.id] = marker;
  });
}

function refreshPin(restaurantId, restaurant) {
  if (!markers[restaurantId]) return;
  markers[restaurantId].setIcon(getPinIcon(restaurantId));
}

function flyToRestaurant(restaurantId) {
  const marker = markers[restaurantId];
  if (!marker) return;
  map.flyTo(marker.getLatLng(), 15, { duration: 0.8 });
}
