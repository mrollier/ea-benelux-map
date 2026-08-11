// DOM builders: chips, cards, remote shelf, modal. No innerHTML with data — ever.

// Categorical palette (validated for CVD + normal-vision separation on the page
// surface). Fixed assignment; less-frequent causes share the neutral fallback —
// text labels always accompany color.
export const CAUSE_COLORS = {
  "AI safety & governance": "#2a6fc2",
  "Biosecurity & pandemic preparedness": "#c25a1a",
  "Animal welfare & food systems": "#00a08d",
  "Global health & development": "#d19b00",
  "Effective giving & meta": "#b85f9e",
  "Climate": "#1d8a34",
  "Careers & talent": "#5a4fae",
  "Community building": "#c0453e",
};
const FALLBACK_COLOR = "#8f8a68";

export const causeColor = (cause) => CAUSE_COLORS[cause] || FALLBACK_COLOR;

export const TIER_SHORT = { 1: "Core EA", 2: "EA-funded", 3: "Cause-adjacent", 4: "Remote" };

// The underlying data field is still high/medium/low — this is a display-layer rename.
// "High confidence" told a newcomer nothing about what had actually been done; these
// labels name the act of checking instead of grading an invisible quantity.
const CONF_LABEL = {
  high: "Verified",
  medium: "Partly verified",
  low: "Unverified",
};

const CONF_EXPLAIN = {
  high: "Verified: the key facts about this organisation were checked against multiple independent sources.",
  medium: "Partly verified: the core facts check out, but some details are unconfirmed — check the specifics on their own site.",
  low: "Unverified: the details here are largely unconfirmed. Treat this entry as a pointer to look into, not a fact sheet.",
};

// Tiny element helper: attrs via setters, children via append (strings become text nodes).
export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "class") node.className = value;
    else if (key === "dataset") Object.assign(node.dataset, value);
    else if (key === "style") Object.assign(node.style, value);
    else if (key.startsWith("on") && typeof value === "function") {
      node.addEventListener(key.slice(2), value);
    } else if (key in node && key !== "type" && key !== "href") {
      node[key] = value;
    } else {
      node.setAttribute(key, value);
    }
  }
  node.append(...children.filter((c) => c !== null && c !== undefined));
  return node;
}

const safeHref = (url) => (typeof url === "string" && /^https?:\/\//.test(url) ? url : null);

// `compact` no longer shortens the text — the labels are short already, and truncating
// "Partly verified" to its first word would have said the opposite of what it means.
// It now only drops the badge's own padding so it can sit inline in a dense row.
export function confidenceBadge(level, compact = false) {
  const label = CONF_LABEL[level] || CONF_LABEL.low;
  return el(
    "span",
    {
      class: `confidence conf-${level || "low"}${compact ? " conf-compact" : ""}`,
      title: CONF_EXPLAIN[level] || CONF_EXPLAIN.low,
    },
    el("span", { class: "conf-dot" }),
    label
  );
}

// Spelling the scale out on the page, not only in a tooltip: tooltips are invisible on
// touch devices, and this is the one thing a newcomer most needs in order to calibrate.
export function renderConfidenceLegend(container) {
  container.replaceChildren(
    el("span", { class: "legend-intro" }, "How sure are we? "),
    ...["high", "medium", "low"].flatMap((level, i) => [
      i > 0 ? el("span", { class: "legend-sep", "aria-hidden": "true" }, "·") : null,
      // Deliberately NOT `.confidence`: that class is nowrap so a badge never breaks
      // mid-label, which in a paragraph of legend text forces horizontal overflow.
      // Only the `conf-*` class comes along, to colour the dot.
      el(
        "span",
        { class: `legend-item conf-${level}` },
        el("span", { class: "conf-dot" }),
        el("strong", {}, CONF_LABEL[level]),
        " ",
        CONF_EXPLAIN[level].split(": ")[1]
      ),
    ]).filter(Boolean)
  );
}

export function tierBadge(org, tierDefinitions) {
  return el(
    "span",
    { class: "tier-badge", title: `Tier ${org.tier}: ${tierDefinitions[org.tier] || ""}` },
    TIER_SHORT[org.tier] || `Tier ${org.tier}`
  );
}

// Companies entered the dataset in v0.5. A newcomer scanning the directory should be able
// to tell a for-profit from a charity at a glance, so company entries carry a visible mark.
// Returns null for everything else — callers spread it, and el() ignores null children.
export function orgTypeBadge(org) {
  if (org.org_type !== "company") return null;
  return el(
    "span",
    {
      class: "type-badge",
      title: "For-profit company working on an EA cause area — not a charity",
    },
    "Company"
  );
}

function causeTags(org, max = 3) {
  const wrap = el("div", { class: "cause-chips" });
  org.cause_areas.slice(0, max).forEach((cause) => {
    const tag = el("span", { class: "cause-tag" }, cause);
    tag.style.setProperty("--tag-color", causeColor(cause));
    wrap.append(tag);
  });
  if (org.cause_areas.length > max) {
    wrap.append(el("span", { class: "cause-tag" }, `+${org.cause_areas.length - max}`));
  }
  return wrap;
}

/* ---------- Filter chips ---------- */

export function renderCauseChips(container, causeList, state, onToggle) {
  container.replaceChildren();
  const allChip = el(
    "button",
    {
      class: "chip",
      "aria-pressed": String(state.causes.size === 0),
      onclick: () => onToggle(null),
    },
    "All causes"
  );
  container.append(allChip);
  causeList.forEach((cause) => {
    const chip = el(
      "button",
      {
        class: "chip",
        "aria-pressed": String(state.causes.has(cause)),
        onclick: () => onToggle(cause),
      },
      el("span", { class: "dot" }),
      cause
    );
    chip.style.setProperty("--chip-color", causeColor(cause));
    container.append(chip);
  });
}

const COUNTRY_LABELS = { BE: "Belgium", NL: "Netherlands", LU: "Luxembourg" };

// Country is a different kind of question from cause or type — "where", not "what" — so
// it gets a different control: one joined segmented switch rather than three loose chips.
export function renderCountryChips(container, state, onToggle) {
  const group = el("div", { class: "segmented" });
  Object.keys(COUNTRY_LABELS).forEach((code) => {
    group.append(
      el(
        "button",
        {
          class: "seg-btn",
          "aria-pressed": String(state.countries.has(code)),
          title: `Show organisations in ${COUNTRY_LABELS[code]}`,
          onclick: () => onToggle(code),
        },
        COUNTRY_LABELS[code]
      )
    );
  });
  container.replaceChildren(group);
}

// Tier 4 (remote) is deliberately absent: remote organisations have their own section
// further down the page rather than a filter chip, so they are never listed twice.
export function renderTierChips(container, tierDefinitions, state, onToggle) {
  container.replaceChildren();
  [1, 2, 3].forEach((tier) => {
    container.append(
      el(
        "button",
        {
          class: "chip tier-chip",
          "aria-pressed": String(state.tiers.has(tier)),
          title: `Tier ${tier}: ${tierDefinitions[tier] || ""}`,
          onclick: () => onToggle(tier),
        },
        `${TIER_SHORT[tier]}`
      )
    );
  });
}

/* ---------- Cards ---------- */

export const CARD_LIMIT = 9;

// `limit` caps how many cards are drawn (null = all). Dropping 113 tiles on someone at
// once reads as a wall rather than a directory, so the grid opens on a readable handful.
export function renderCards(container, orgs, tierDefinitions, onOpen, limit = null) {
  container.replaceChildren();
  if (orgs.length === 0) {
    container.append(
      el("p", { class: "empty-state" }, "No organisations match these filters — try widening them.")
    );
    return;
  }
  const shown = limit === null ? orgs : orgs.slice(0, limit);
  shown.forEach((org) => {
    const card = el(
      "article",
      {
        class: "card",
        tabindex: "0",
        role: "button",
        "aria-label": `${org.name} — open details`,
        onclick: () => onOpen(org),
        onkeydown: (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen(org);
          }
        },
      },
      el(
        "div",
        { class: "card-top" },
        el("h3", {}, org.name),
        confidenceBadge(org.confidence, true)
      ),
      el(
        "p",
        { class: "meta" },
        org.shortCity,
        tierBadge(org, tierDefinitions),
        orgTypeBadge(org)
      ),
      causeTags(org),
      el("p", { class: "desc" }, org.description)
    );
    card.style.setProperty("--card-color", causeColor(org.cause_areas[0]));
    container.append(card);
  });
}

export function renderShowMore(container, total, shown, onToggle) {
  container.replaceChildren();
  if (shown >= total) {
    // Only offer "show fewer" once expanding actually did something.
    if (total > CARD_LIMIT) {
      container.append(
        el("button", { class: "show-more", onclick: onToggle }, `Show fewer ▲`)
      );
    }
    return;
  }
  container.append(
    el(
      "button",
      { class: "show-more", onclick: onToggle },
      `Show all ${total} organisations ▼`
    )
  );
}

/* ---------- Remote shelf ---------- */

// 95 remote organisations grouped by primary cause area — the same dimension the dot
// already encodes, so the grouping teaches the colour key rather than adding a new one.
// Groups start closed: the counts alone show the shape of the remote landscape, and a
// reader opens only the cause they came for.
export function renderShelf(container, orgs, onOpen, openGroups, onToggleGroup) {
  container.replaceChildren();
  if (orgs.length === 0) {
    container.append(
      el("p", { class: "shelf-empty" }, "No remote organisations match the current filters.")
    );
    return;
  }

  const groups = new Map();
  orgs.forEach((org) => {
    const key = org.cause_areas[0] || "Other";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(org);
  });
  // Biggest groups first, so the shelf opens on the densest part of the remote landscape.
  const ordered = [...groups.entries()].sort(
    (a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0])
  );

  ordered.forEach(([cause, members], i) => {
    const open = openGroups.has(cause);
    const panelId = `shelf-panel-${i}`;
    const heading = el(
      "button",
      {
        class: "shelf-group",
        "aria-expanded": String(open),
        "aria-controls": panelId,
        onclick: () => onToggleGroup(cause),
      },
      el("span", { class: "shelf-chevron", "aria-hidden": "true" }, open ? "▾" : "▸"),
      el("span", { class: "shelf-group-name" }, cause),
      el("span", { class: "shelf-group-count" }, String(members.length))
    );
    heading.style.setProperty("--group-color", causeColor(cause));

    const panel = el("div", { class: "shelf-panel", id: panelId });
    if (!open) panel.hidden = true;
    else {
      members.forEach((org) => {
        const dot = el("span", { class: "dot", "aria-hidden": "true" });
        dot.style.background = causeColor(org.cause_areas[0]);
        panel.append(
          el(
            "button",
            { class: "shelf-row", onclick: () => onOpen(org), title: org.name },
            dot,
            el("span", { class: "name" }, org.name),
            orgTypeBadge(org),
            confidenceBadge(org.confidence, true)
          )
        );
      });
    }
    container.append(heading, panel);
  });
}

/* ---------- Modal ---------- */

const dialog = () => document.getElementById("org-modal");

function section(title, ...children) {
  return el("div", { class: "modal-section" }, el("h4", {}, title), ...children);
}

export function openOrgModal(org, tierDefinitions) {
  const dlg = dialog();
  const content = document.getElementById("modal-content");
  content.replaceChildren();

  content.append(
    el("button", {
      class: "modal-close",
      "aria-label": "Close",
      textContent: "✕",
      onclick: () => dlg.close(),
    }),
    el("h2", { id: "modal-title" }, org.name)
  );
  if (org.aka) content.append(el("p", { class: "modal-aka" }, `Also known as: ${org.aka}`));

  const metaBits = [org.city];
  if (org.founded) metaBits.push(`founded ${org.founded}`);
  content.append(
    el(
      "p",
      { class: "modal-meta" },
      metaBits.join(" · "),
      tierBadge(org, tierDefinitions),
      orgTypeBadge(org),
      confidenceBadge(org.confidence)
    )
  );

  content.append(section("What they do", el("p", {}, org.description)));
  content.append(
    section("Where they sit in the EA landscape", el("p", { class: "tier-note" }, tierDefinitions[org.tier] || ""))
  );
  if (org.remoteNote) content.append(section("Remote work", el("p", {}, org.remoteNote)));
  if (org.key_people) content.append(section("Key people", el("p", {}, org.key_people)));
  if (org.funding) content.append(section("Funding", el("p", {}, org.funding)));

  const causeWrap = section("Cause areas");
  causeWrap.append(causeTags({ cause_areas: org.cause_areas }, org.cause_areas.length));
  content.append(causeWrap);

  content.append(
    el(
      "div",
      { class: "modal-conf" },
      confidenceBadge(org.confidence),
      el("p", { style: { margin: "4px 0 0" } }, CONF_EXPLAIN[org.confidence] || CONF_EXPLAIN.low)
    )
  );

  const links = el("div", { class: "modal-links" });
  const site = safeHref(org.website);
  const careers = safeHref(org.careers_url);
  if (site) links.append(el("a", { class: "primary", href: site, target: "_blank", rel: "noopener" }, "Visit website →"));
  if (careers) links.append(el("a", { class: "secondary", href: careers, target: "_blank", rel: "noopener" }, "See their site for openings →"));
  if (links.childElementCount) content.append(links);

  const sources = (org.sources || []).map(safeHref).filter(Boolean);
  if (sources.length) {
    content.append(
      section(
        "Sources",
        el("ul", {}, ...sources.map((src) => el("li", {}, el("a", { href: src, target: "_blank", rel: "noopener" }, src))))
      )
    );
  }

  dlg.showModal();
}

export function initModal() {
  const dlg = dialog();
  dlg.addEventListener("click", (e) => {
    if (e.target === dlg) dlg.close(); // backdrop click
  });
}
