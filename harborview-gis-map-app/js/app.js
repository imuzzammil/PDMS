/* Harborview Explorer — Leaflet + OpenStreetMap demo.
   The named places below are fictional sample points, not real businesses. */
const initialCenter = [24.45, 54.38]; // Gulf coast-inspired demo area
const initialZoom = 14;

const places = [
  {
    id: "harborview", name: "Harborview Discovery Center",
    address: "18 Azure Quay · Luma Bay (fictional)",
    description: "A fictional waterfront learning hub with interactive exhibits, green spaces, and accessible walking routes. Select another marker to explore the demo.",
    category: "Community & culture", type: "culture", icon: "⌂",
    coords: [24.455, 54.372]
  },
  {
    id: "northlight", name: "Northlight Gardens",
    address: "Cedar Loop · Luma Bay (fictional)",
    description: "A made-up public garden with shaded paths, open lawns, and a small observation deck for this GIS portfolio demo.",
    category: "Park & green space", type: "parks", icon: "♧",
    coords: [24.466, 54.383]
  },
  {
    id: "azure-cafe", name: "Tideglass Café",
    address: "7 Marina Walk · Luma Bay (fictional)",
    description: "A fictional café point of interest beside the promenade. Use the map to practise exploring locations and selecting GIS features.",
    category: "Café & food", type: "food", icon: "☕",
    coords: [24.447, 54.363]
  },
  {
    id: "lookout", name: "Azure Point Lookout",
    address: "Coastal Path · Luma Bay (fictional)",
    description: "A sample coastal viewpoint for demonstrating map markers, feature popups, and map navigation.",
    category: "Scenic viewpoint", type: "parks", icon: "⌖",
    coords: [24.459, 54.397]
  },
  {
    id: "heritage", name: "Old Quay Gallery",
    address: "12 Lantern Street · Luma Bay (fictional)",
    description: "A fictional local gallery included as a sample cultural landmark for the interactive map.",
    category: "Art & culture", type: "culture", icon: "▤",
    coords: [24.439, 54.382]
  },
  {
    id: "market", name: "Seabreeze Market",
    address: "Pearl Lane · Luma Bay (fictional)",
    description: "A made-up neighbourhood market point. This sample data can be replaced with your own verified GIS locations later.",
    category: "Market & food", type: "food", icon: "✦",
    coords: [24.449, 54.391]
  }
];

const map = L.map("map", { zoomControl: false, scrollWheelZoom: true }).setView(initialCenter, initialZoom);
L.control.zoom({ position: "bottomright" }).addTo(map);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a>'
}).addTo(map);

const markerLayer = L.layerGroup().addTo(map);
const markerById = new Map();
let selectedPlace = places[0];
let currentFilter = "all";
let userMarker = null;
let routeLine = null;

const ui = {
  name: document.getElementById("placeName"),
  address: document.getElementById("placeAddress"),
  description: document.getElementById("placeDescription"),
  category: document.getElementById("placeCategory"),
  distance: document.getElementById("placeDistance"),
  card: document.querySelector(".place-card"),
  search: document.getElementById("searchInput"),
  hint: document.getElementById("searchHint")
};

function makeIcon(place, active = false) {
  const color = place.type === "parks" ? "#15885d" : place.type === "food" ? "#d18a13" : "#087f83";
  return L.divIcon({
    className: "",
    html: `<div class="custom-marker" style="--marker-color:${color};${active ? "width:42px;height:42px;" : ""}"><span>${place.icon}</span></div>`,
    iconSize: active ? [42, 42] : [36, 36],
    iconAnchor: active ? [21, 38] : [18, 33],
    popupAnchor: [0, -34]
  });
}

function selectPlace(place, shouldPan = false) {
  selectedPlace = place;
  ui.name.textContent = place.name;
  ui.address.textContent = place.address;
  ui.description.textContent = place.description;
  ui.category.textContent = place.category;
  ui.distance.textContent = "Demo point";
  ui.card.hidden = false;
  markerById.forEach(({ marker, data }) => marker.setIcon(makeIcon(data, data.id === place.id)));
  if (shouldPan) map.flyTo(place.coords, Math.max(map.getZoom(), 15), { duration: 0.55 });
}

places.forEach(place => {
  const marker = L.marker(place.coords, { icon: makeIcon(place), title: place.name, alt: place.name }).addTo(markerLayer);
  marker.bindPopup(`<div class="popup-title">${place.name}</div><div class="popup-type">${place.category} · demo location</div>`);
  marker.on("click", () => selectPlace(place));
  markerById.set(place.id, { marker, data: place });
});
selectPlace(places[0]);

function renderFilter(filter) {
  currentFilter = filter;
  markerLayer.clearLayers();
  places.filter(p => filter === "all" || p.type === filter).forEach(place => markerById.get(place.id).marker.addTo(markerLayer));
  document.querySelectorAll(".nav-item").forEach(btn => btn.classList.toggle("active", btn.dataset.view === filter));
  const visible = places.filter(p => filter === "all" || p.type === filter);
  if (visible.length) {
    const bounds = L.latLngBounds(visible.map(p => p.coords));
    map.flyToBounds(bounds.pad(0.22), { maxZoom: 15, duration: 0.45 });
    selectPlace(visible[0]);
  }
}
document.querySelectorAll(".nav-item").forEach(btn => btn.addEventListener("click", () => renderFilter(btn.dataset.view)));

document.getElementById("showAllBtn").addEventListener("click", () => renderFilter("all"));
document.getElementById("resetBtn").addEventListener("click", () => {
  renderFilter("all");
  map.flyTo(initialCenter, initialZoom, { duration: 0.5 });
});
document.getElementById("closeCardBtn").addEventListener("click", () => { ui.card.hidden = true; });

document.getElementById("searchForm").addEventListener("submit", async event => {
  event.preventDefault();
  const query = ui.search.value.trim();
  if (!query) { ui.hint.textContent = "Type a place name or latitude, longitude."; return; }

  const coordsMatch = query.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
  if (coordsMatch) {
    const lat = Number(coordsMatch[1]), lon = Number(coordsMatch[2]);
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      ui.hint.textContent = "Those coordinates are outside the valid latitude/longitude range."; return;
    }
    const temp = {
      id: "searched", name: "Searched coordinates",
      address: `${lat.toFixed(5)}, ${lon.toFixed(5)}`,
      description: "A location searched by coordinates. This is a temporary map result, not a verified place listing.",
      category: "Coordinate search", type: "culture", icon: "⌖", coords: [lat, lon]
    };
    if (window.tempSearchMarker) map.removeLayer(window.tempSearchMarker);
    window.tempSearchMarker = L.marker(temp.coords, { icon: makeIcon(temp, true) }).addTo(map).bindPopup("Searched coordinates").openPopup();
    selectPlace(temp);
    map.flyTo(temp.coords, 15);
    ui.hint.textContent = "Showing the coordinates you entered.";
    return;
  }

  ui.hint.textContent = "Searching OpenStreetMap…";
  try {
    // Nominatim public geocoder: use politely; do not send automated bulk queries.
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`, {
      headers: { "Accept": "application/json" }
    });
    if (!response.ok) throw new Error("Search service unavailable");
    const results = await response.json();
    if (!results.length) { ui.hint.textContent = "No result found. Try a city name or coordinates."; return; }
    const result = results[0];
    const lat = Number(result.lat), lon = Number(result.lon);
    const temp = {
      id: "searched", name: result.name || query,
      address: result.display_name || `${lat.toFixed(5)}, ${lon.toFixed(5)}`,
      description: "Search result from OpenStreetMap's public geocoding service. Map labels and details may vary by data coverage.",
      category: "OpenStreetMap search result", type: "culture", icon: "⌖", coords: [lat, lon]
    };
    if (window.tempSearchMarker) map.removeLayer(window.tempSearchMarker);
    window.tempSearchMarker = L.marker(temp.coords, { icon: makeIcon(temp, true) }).addTo(map).bindPopup(temp.name).openPopup();
    selectPlace(temp);
    map.flyTo(temp.coords, 15);
    ui.hint.textContent = "Search result found. Basemap and search data are provided by OpenStreetMap services.";
  } catch (error) {
    ui.hint.textContent = "Search failed right now. You can still explore the demo markers or search by coordinates.";
  }
});

document.getElementById("locateBtn").addEventListener("click", () => {
  if (!navigator.geolocation) { ui.hint.textContent = "Location is not supported by this browser."; return; }
  ui.hint.textContent = "Requesting your location permission…";
  navigator.geolocation.getCurrentPosition(position => {
    const coords = [position.coords.latitude, position.coords.longitude];
    if (userMarker) map.removeLayer(userMarker);
    userMarker = L.circleMarker(coords, { radius: 8, color: "#fff", weight: 3, fillColor: "#137bd1", fillOpacity: 1 }).addTo(map).bindPopup("Your current location").openPopup();
    map.flyTo(coords, 15);
    ui.hint.textContent = "Showing your current location on this device.";
  }, () => { ui.hint.textContent = "Location permission was denied or unavailable."; }, { enableHighAccuracy: true, timeout: 9000 });
});

document.getElementById("directionsBtn").addEventListener("click", () => {
  const [lat, lon] = selectedPlace.coords;
  const url = `https://www.openstreetmap.org/directions?to=${encodeURIComponent(`${lat},${lon}`)}`;
  window.open(url, "_blank", "noopener,noreferrer");
});

// Correct Leaflet sizing if the page is opened in a resized browser or mobile viewport.
window.addEventListener("resize", () => map.invalidateSize());
setTimeout(() => map.invalidateSize(), 150);
