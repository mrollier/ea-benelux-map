# EA BeNeLux Landscape Map

## Goal
Interactive web app helping people new to Effective Altruism discover the landscape of
EA-aligned organisations in the BeNeLux (employers, NGOs, programmes) per cause area.
Primary action: **discovery** (not job applications, not donations — those are secondary).
Audience: students, mid-career professionals, and event attendees of EA chapters (esp. EA Ghent).
Language: English only for v1 (NL/FR later).

## Data
- **`ea_belgium_orgs.json` is the single source of truth** (v0.5, 208 orgs across the BeNeLux,
  researched Aug 2026; file name kept for stability). `ea_belgium_orgs.csv` is a flattened
  export for manual editing by volunteers — if edited, changes must be merged back into the
  JSON, and the CSV must be regenerated after JSON edits (it now includes a `country` column).
- Data model: see `meta` in the JSON. Key fields per org: `tier`, `cause_areas`,
  `country` (BE/NL/LU; null for tier 4), `confidence` (high/medium/low), `verify` (what a
  human must check), `remote_note` (tier 4 only), `org_type` (`"company"` is rendered as a
  visible badge), `relationships` (future network view), `sources`.
- **`cause_areas` is a closed vocabulary**, not free text. The eight valid values are the keys
  of `CAUSE_COLORS` in `js/ui.js`: AI safety & governance · Biosecurity & pandemic preparedness ·
  Animal welfare & food systems · Global health & development · Effective giving & meta ·
  Climate · Careers & talent · Community building. Anything else renders grey and splits the
  filter chips into near-duplicates. (Three legacy values — EU policy (general), Emerging tech
  governance, Mental health — predate this rule; don't add more.)
- `inbox/` holds manually saved exports of sources that block automated access (job boards,
  event apps, LinkedIn). It is staging material — the app never reads it. See `inbox/SOURCES.md`.
  **`inbox/` and `designs/` are gitignored and must stay that way**: `inbox/` is ~291 MB and
  the EAGx attendee export contains personal data for ~550 people. Never commit either.
- **Tiers**: 1 = core EA/Moral Ambition · 2 = EA-funded/endorsed, no EA identity ·
  3 = cause-adjacent, BeNeLux presence, no known EA link · 4 = remote EA orgs, NO BeNeLux
  office (`lat`/`lng` are null — never render as map pins; use a side panel/"remote" shelf).
- Tier conventions applied in the v0.4 expansion: ACE considered-charities shortlist or an
  EA-evaluator recommendation ⇒ tier 2; explicit-EA university groups ⇒ tier 1 (matches the
  Belgian group entries); no EA link at all ⇒ tier 3 regardless of quality.
- Tier conventions added in v0.5: local/university EA groups ⇒ tier 1, both countries, no
  exceptions; **a globally-remote role on the 80,000 Hours job board is sufficient evidence
  for tier 4** (that listing *is* the tier-4 criterion); an EA job board listing an org under
  a core cause area counts as EA endorsement for tier-2 purposes.
- **For-profit companies are in scope** (since v0.5) when the EA cause work *is* the product —
  not merely a company in an adjacent industry. Set `org_type: "company"`; the UI badges it so
  newcomers don't read a for-profit as a charity. Being for-profit is not itself grounds for
  exclusion or for a lower tier.
- Luxembourg has exactly one entry (`uni-luxembourg-snt`, added v0.5). v0.4's "verified absence"
  finding is superseded — it was correct for the sources it used, not as a general claim.
- Coordinates are approximate (city-level). Refine only if a verified address exists.
- Do not present low-confidence facts as certain in the UI; surface `confidence` and link
  to `website`/`careers_url` rather than asserting hiring status.
- **The `confidence` field stays `high`/`medium`/`low` in the data**; the UI renders it as
  Verified / Partly verified / Unverified (v0.6). Display-layer rename only — do not
  rewrite the data to match the labels, and keep the on-page legend in sync with
  `CONF_LABEL`/`CONF_EXPLAIN` in `js/ui.js`.

## UI conventions (v0.6)
- **Tier 4 is not a filter.** Remote orgs have their own section below the directory and
  are excluded from `state.tiers` (which holds 1–3). Nothing may appear in both the card
  directory and the remote section — the split is the whole point of the section.
- Remote orgs obey the **cause filter only**; country chips are meaningless for an org
  with `country: null`.
- The map is full width. `.map-frame` carries `position: relative; z-index: 0` to create a
  stacking context — Leaflet's controls are `z-index: 1000` in its own stylesheet and will
  paint over the sticky filter bar without it. Don't remove it.
- Country outlines come from the bundled `data/benelux.geojson` (7 KB, Natural Earth
  1:50m, rebuilt only if boundaries change). Never fetch boundaries from a CDN — the site
  must work offline. The layer is `interactive: false` so it cannot swallow pin clicks.
- Long lists collapse: the card grid opens at `CARD_LIMIT` (9) and the remote cause groups
  start closed. Expanded state persists across filter changes on purpose.
- Filter rows are labelled (Cause / Type / Country) and country uses a **segmented
  control**, not chips — a different question deserves a different control.

## Product decisions made so far
- v1 views: filterable directory + **map** + **topic (cause area) filter**. Tier is a visible
  filter, not a cutoff. Timeline and network views are later phases.
- Show cause-area gaps explicitly (e.g. no Belgian core-EA org in global health or mental
  health) — framed as opportunities, not hidden.
- Keep dataset editable by non-developers (CSV round-trip or a simple admin flow).
- Quality over quantity: don't pad with weak-fit orgs; a newcomer who clicks three
  irrelevant orgs stops trusting the map.

## Success metrics (draft)
- ≥15 listed orgs confirm/correct their entry within 3 months (doubles as validation)
- Linked from eabelgium.org; used at the next EA Summit Brussels org fair

## Verification backlog (priority order)
0a. New v0.5 entries needing checks: `the-mission-motor` (base city unpublished — Amsterdam pin
   is a placeholder), `the-protein-project` (city and the two funders unnamed), `ai-safety-amsterdam`
   vs a possible SAIN Amsterdam chapter (**potential duplicate — resolve before adding either**),
   `ai-safety-camp` (LinkedIn says Diemen NL; if a Dutch entity is confirmed it becomes tier 1),
   `ea-nijmegen` (own site 404s — group may be dormant), `consultants-for-impact` (site reads as
   an unfinished draft), `norrsken-amsterdam` (may not have opened yet), `allai` (does it have a
   frontier-AI-risk workstream?), `wur-animal-welfare` (which chair group holds the grants).
   Also: find real URLs for **Good Impressions** and the **AI Alignment Foundation** — both are
   genuine EA orgs that had to be dropped because their websites couldn't be confirmed.
0. New v0.4 (BeNeLux) entries needing checks: dnais (base city + legal form — map pin is a
   placeholder), cellular-agriculture-nl (office city unpublished — pin is a placeholder),
   safe-ai-netherlands (legal form, founders), geefrevolutie (Coefficient grant amount seen
   only in a search snippet), existential-risk-observatory (site blocks fetches — team/funders),
   delft-ai-safety + tilburg-ai-safety (2025/26 activity), pise-rotterdam (registration),
   doneer-effectief (careers page 404s), varkens-in-nood (founding year 1997-99 discrepancy)
1. Low-confidence Belgian entries: give-for-good, carbon-gap, pour-demain (Brussels office?),
   wap-eu, animal-law-europe, impactful-policy-careers (may not be a standalone org),
   training-for-good (still active?), clean-air-fund (Brussels office?)
2. Tier-4 orgs with medium/low confidence on current EU-remote hiring (policies change yearly)
3. Status checks: effective-thesis, hli (some small EA orgs have wound down)
4. Email summit@eabrussels.org for their org-fair list (best unexploited source)
5. Fill `key_people` gaps and founding years marked in `verify` fields

## Conventions
- Python build scripts (`build_dataset*.py`) are historical scaffolding from the research
  phase — do not re-run them (they would overwrite manual edits to the JSON).
- New orgs: always include `tier`, `confidence`, `verify`, and at least one source URL.
- ids are stable slugs; `relationships` reference ids — check referential integrity when
  adding/removing orgs.
