// Entry point: load data, hold filter state, orchestrate render(). Data edits + reload = new site.

import * as ui from "./ui.js";
import { initMap, setMapOrgs, setCountryHighlight } from "./map.js";
import { toCSV, downloadCSV } from "./download.js";
import { initTooltips } from "./tooltip.js";

const state = {
  causes: new Set(), // empty = all causes
  // Tier 4 is absent on purpose: remote organisations are their own section further down
  // the page, not a filter option, so nothing is listed in two places at once.
  tiers: new Set([1, 2, 3]),
  countries: new Set(["BE", "NL", "LU"]),
  // Expanded state survives filter changes — silently re-collapsing the grid on every
  // chip click would be more disorienting than the long list it is meant to tame.
  cardsExpanded: false,
  openGroups: new Set(), // remote cause-area groups currently open
};

let orgs = [];
let meta = null;
let causeList = [];
let tierDefinitions = {};
let beneluxTotal = 0;
// Whatever is on screen right now, for the "current view" CSV export.
let currentView = { visible: [], remote: [] };

function normalize(raw) {
  return raw.map((org) => ({
    ...org,
    isMapped: Number.isFinite(org.lat) && Number.isFinite(org.lng) && org.tier !== 4,
    remoteNote: org.remote_note ?? "",
    shortCity: (org.city || "").split(" (")[0],
  }));
}

function deriveCauseList(metaObj, allOrgs) {
  // Legacy causes are frozen in meta.cause_taxonomy_legacy; new orgs use the canonical set.
  const list = [...(metaObj.cause_taxonomy || []), ...(metaObj.cause_taxonomy_legacy || [])];
  const seen = new Set(list);
  allOrgs.forEach((org) =>
    org.cause_areas.forEach((cause) => {
      if (!seen.has(cause)) {
        seen.add(cause);
        list.push(cause);
      }
    })
  );
  return list;
}

const matchesCauses = (org) =>
  state.causes.size === 0 || org.cause_areas.some((c) => state.causes.has(c));
// Remote orgs (no country) are governed by the Remote tier chip, not country chips.
const matchesCountry = (org) => !org.country || state.countries.has(org.country);
const matches = (org) =>
  matchesCauses(org) && state.tiers.has(org.tier) && matchesCountry(org);

function openModal(org) {
  ui.openOrgModal(org, tierDefinitions);
}

/* ---------- Gap banner ---------- */

function renderGapBanner() {
  const banner = document.getElementById("gap-banner");
  if (state.causes.size === 0) {
    banner.hidden = true;
    return;
  }
  // Gap check runs on the FULL dataset, ignoring the tier filter — otherwise
  // switching off tiers 1-2 would fake a "no core-EA org exists" message.
  const coreCovered = orgs.some(
    (org) => (org.tier === 1 || org.tier === 2) && org.isMapped && matchesCauses(org)
  );
  if (coreCovered) {
    banner.hidden = true;
    return;
  }

  const causeNames = [...state.causes].join(", ");
  const remoteMatches = orgs.filter((org) => org.tier === 4 && matchesCauses(org));

  banner.replaceChildren(
    ui.el(
      "span",
      {},
      "There's no BeNeLux core-EA organisation working on ",
      ui.el("strong", {}, causeNames),
      " yet — that's a gap, and gaps are opportunities. "
    )
  );
  if (remoteMatches.length) {
    banner.append(
      ui.el("span", {}, `${remoteMatches.length} remote EA org${remoteMatches.length > 1 ? "s" : ""} cover${remoteMatches.length > 1 ? "" : "s"} it: `)
    );
    remoteMatches.forEach((org, i) => {
      banner.append(
        ui.el("button", { class: "gap-org-link", onclick: () => openModal(org) }, org.name),
        i < remoteMatches.length - 1 ? ", " : ""
      );
    });
  } else {
    banner.append(ui.el("span", {}, "No remote EA org covers it either — wide open."));
  }
  banner.hidden = false;
}

/* ---------- Render ---------- */

function render() {
  // Two independent lists. BeNeLux orgs answer "who is near me" and obey every filter;
  // remote orgs answer "who could I work for from here" and only obey the cause filter,
  // since a country chip is meaningless for an organisation with no country.
  const visible = orgs.filter(matches);
  const mapped = visible.filter((org) => org.isMapped);
  const remote = orgs.filter((org) => org.tier === 4 && matchesCauses(org));
  currentView = { visible, remote };

  setMapOrgs(mapped);
  setCountryHighlight(state.countries);
  ui.renderShelf(
    document.getElementById("remote-list"),
    remote,
    openModal,
    state.openGroups,
    toggleGroup
  );

  const sorted = [...visible].sort(
    (a, b) => a.tier - b.tier || a.name.localeCompare(b.name)
  );
  const limit = state.cardsExpanded ? null : ui.CARD_LIMIT;
  ui.renderCards(document.getElementById("cards"), sorted, openModal, limit);
  ui.renderShowMore(
    document.getElementById("cards-more"),
    sorted.length,
    state.cardsExpanded ? sorted.length : Math.min(ui.CARD_LIMIT, sorted.length),
    toggleCardsExpanded
  );

  renderGapBanner();

  ui.renderCauseChips(document.getElementById("cause-chips"), causeList, state, toggleCause);
  ui.renderTierChips(document.getElementById("tier-chips"), state, toggleTier);
  ui.renderCountryChips(document.getElementById("country-chips"), state, toggleCountry);

  const line = document.getElementById("results-line");
  line.textContent =
    visible.length === beneluxTotal
      ? `Showing all ${beneluxTotal} BeNeLux organisations`
      : `Showing ${visible.length} of ${beneluxTotal} BeNeLux organisations`;
}

function toggleCause(cause) {
  if (cause === null) state.causes.clear();
  else if (state.causes.has(cause)) state.causes.delete(cause);
  else state.causes.add(cause);
  render();
}

function toggleTier(tier) {
  if (state.tiers.has(tier)) state.tiers.delete(tier);
  else state.tiers.add(tier);
  render();
}

function toggleCountry(code) {
  if (state.countries.has(code)) state.countries.delete(code);
  else state.countries.add(code);
  render();
}

function toggleCardsExpanded() {
  state.cardsExpanded = !state.cardsExpanded;
  render();
}

function toggleGroup(cause) {
  if (state.openGroups.has(cause)) state.openGroups.delete(cause);
  else state.openGroups.add(cause);
  render();
}

/* ---------- Cause key ---------- */

// The tooltips explain each cause on hover, which no phone has. The key is the same copy
// as a plain expandable list, so the vocabulary is reachable on every device.
function initCauseKey() {
  const toggle = document.getElementById("cause-key-toggle");
  const panel = document.getElementById("cause-key");
  ui.renderCauseKey(panel, causeList);
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    panel.hidden = open;
  });
}

/* ---------- Downloads ---------- */

// Built once at boot; the handler reads `currentView` so it always exports what is on
// screen at the moment of the click, filters and all.
function initDownloads() {
  const row = document.getElementById("download-row");
  row.replaceChildren(
    ui.el("span", { class: "download-label" }, "Download:"),
    ui.el(
      "button",
      {
        class: "download-btn",
        onclick: () => {
          const rows = [...currentView.visible, ...currentView.remote];
          downloadCSV("ea-benelux-orgs-current-view.csv", toCSV(rows));
        },
      },
      "Current view (CSV)"
    ),
    ui.el(
      "a",
      { class: "download-btn", href: "./ea_belgium_orgs.csv", download: "ea-benelux-orgs-full.csv" },
      "Full dataset (CSV)"
    )
  );
}

/* ---------- Boot ---------- */

function showLoadError() {
  document.querySelector("main").replaceChildren(
    ui.el(
      "div",
      { class: "load-error" },
      ui.el("h2", {}, "Couldn't load the data"),
      ui.el(
        "p",
        {},
        "If you opened this file directly, the browser blocks loading the JSON. Run a local server from the project folder:"
      ),
      ui.el("p", {}, ui.el("code", {}, "python3 -m http.server")),
      ui.el("p", {}, "then open ", ui.el("code", {}, "http://localhost:8000"))
    )
  );
}

async function boot() {
  let data;
  try {
    const res = await fetch("./ea_belgium_orgs.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data = await res.json();
  } catch (err) {
    console.error("Data load failed:", err);
    showLoadError();
    return;
  }

  meta = data.meta || {};
  tierDefinitions = meta.tier_definitions || {};
  orgs = normalize(data.organisations || []);
  causeList = deriveCauseList(meta, orgs);
  beneluxTotal = orgs.filter((org) => org.tier !== 4).length;

  const note = document.getElementById("dataset-note");
  const remoteCount = orgs.length - beneluxTotal;
  note.textContent =
    `Dataset v${meta.version || "?"} · researched ${meta.research_date || "?"} · ` +
    `${orgs.length} organisations (${beneluxTotal} in the BeNeLux, ${remoteCount} remote)`;

  ui.initModal();
  ui.renderConfidenceLegend(document.getElementById("conf-legend"));
  initCauseKey();
  initTooltips();
  initDownloads();
  initMap({ onDetails: openModal });
  render();
}

boot();
