// Leaflet map: init once, cluster layer rebuilt per render. Tier-4 orgs never reach here.

import { el, causeColor, tierBadge, confidenceBadge } from "./ui.js";

let map = null;
let clusterGroup = null;
let countryLayer = null;
let selectedCountries = new Set();
let didFitBounds = false;

// Selected countries are tinted and outlined; deselected ones are drawn with nothing at
// all. The fill is deliberately faint — the cause-coloured pins must stay the loudest
// marks on the map, and a country wash competing with them would bury the actual data.
function countryStyle(feature) {
  const on = selectedCountries.has(feature.properties.code);
  return {
    color: on ? "#2e7d46" : "transparent",
    weight: on ? 2 : 0,
    opacity: on ? 0.75 : 0,
    fillColor: "#2e7d46",
    fillOpacity: on ? 0.09 : 0,
  };
}

// Boundaries are bundled (data/benelux.geojson, 7 KB) rather than fetched from a CDN, so
// the map keeps working offline and adds no third-party request. If it fails to load the
// map is still fully usable — the highlight is an aid, not a dependency.
function initCountryLayer() {
  fetch("./data/benelux.geojson", { cache: "no-store" })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then((geojson) => {
      countryLayer = L.geoJSON(geojson, {
        style: countryStyle,
        interactive: false, // must never swallow a click meant for a pin
      });
      countryLayer.addTo(map);
      countryLayer.bringToBack();
      if (!didFitBounds) {
        // Framing the three countries rather than the pins keeps the view stable and
        // guarantees Luxembourg is in shot even though it holds a single organisation.
        map.fitBounds(countryLayer.getBounds(), { padding: [20, 20] });
        didFitBounds = true;
      }
    })
    .catch((err) => console.warn("Country outlines unavailable:", err));
}

export function setCountryHighlight(codes) {
  selectedCountries = new Set(codes);
  if (countryLayer) countryLayer.setStyle(countryStyle);
}

// Leaflet closes a popup when you click the map, but ignores the rest of the page — so a
// popup could sit open while you scrolled and clicked elsewhere. Close it on any click
// outside the map or the popup itself, and on Escape.
function initDismissPopup() {
  const container = map.getContainer();
  document.addEventListener("pointerdown", (e) => {
    if (!map._popup) return;
    const t = e.target;
    if (t instanceof Node && (container.contains(t) || t.closest?.(".leaflet-popup"))) return;
    map.closePopup();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && map._popup) map.closePopup();
  });
}

export function initMap({ onDetails, tierDefinitions }) {
  map = L.map("map", { scrollWheelZoom: true });

  L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  }).addTo(map);

  clusterGroup = L.markerClusterGroup({
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    maxClusterRadius: 40,
    iconCreateFunction: (cluster) =>
      L.divIcon({
        html: `<span class="cluster-badge">${cluster.getChildCount()}</span>`,
        className: "",
        iconSize: [34, 34],
      }),
  });
  map.addLayer(clusterGroup);

  // stash for popup building
  map._onDetails = onDetails;
  map._tierDefinitions = tierDefinitions;

  // sensible default until the country outlines (or the pins) fit real bounds
  map.setView([50.85, 4.4], 8);

  initCountryLayer();
  initDismissPopup();
}

function buildPopup(org) {
  const wrap = el(
    "div",
    {},
    el("p", { class: "popup-name" }, org.name),
    el(
      "p",
      { class: "popup-meta" },
      org.shortCity,
      tierBadge(org, map._tierDefinitions),
      confidenceBadge(org.confidence, true)
    ),
    el(
      "p",
      { class: "popup-desc" },
      org.description.length > 110 ? `${org.description.slice(0, 110)}…` : org.description
    ),
    el("button", { class: "popup-details-btn", onclick: () => map._onDetails(org) }, "Details →")
  );
  return wrap;
}

export function setMapOrgs(orgs) {
  if (!map) return;
  clusterGroup.clearLayers();

  orgs.forEach((org) => {
    const icon = L.divIcon({
      html: `<span class="leaf-pin" style="--c:${causeColor(org.cause_areas[0])}"></span>`,
      className: "",
      iconSize: [22, 22],
      iconAnchor: [11, 20], // tip of the rotated teardrop points at the location
      popupAnchor: [0, -18],
    });
    const marker = L.marker([org.lat, org.lng], {
      icon,
      keyboard: true,
      alt: org.name,
    });
    marker.bindPopup(() => buildPopup(org), { maxWidth: 260 });
    clusterGroup.addLayer(marker);
  });

  if (!didFitBounds && orgs.length > 0) {
    map.fitBounds(clusterGroup.getBounds(), { padding: [30, 30] });
    didFitBounds = true;
  }
}
