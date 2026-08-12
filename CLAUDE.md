# EA BeNeLux Landscape Map

## Goal
Interactive web app helping people new to Effective Altruism discover the landscape of
EA-aligned organisations in the BeNeLux (employers, NGOs, programmes) per cause area.
Primary action: **discovery** (not job applications, not donations — those are secondary).
Audience: students, mid-career professionals, and event attendees of EA chapters (esp. EA Ghent).
Language: English only for v1 (NL/FR later).

## Data
- **`ea_belgium_orgs.json` is the single source of truth** (dataset v0.7, 193 orgs,
  researched Aug 2026; file name kept for stability). `ea_belgium_orgs.csv` is a flattened
  export for manual editing by volunteers — if edited, changes must be merged back into the
  JSON, then regenerate the CSV with `node tools/regenerate_csv.mjs` (it reuses the app's own
  `toCSV`, so the shipped file and the in-app export cannot diverge). After any JSON edit,
  run `node tools/validate.mjs` — it enforces every structural rule in this file and must
  print 0 errors before a commit.
- **Dataset version ≠ site version.** `meta.version` tracks the data (v0.6); the "UI
  conventions (v0.6)/(v0.7)" headings below and commit messages track the app. They move
  independently — do not bump one to match the other.
- Data model: see `meta` in the JSON. Key fields per org: `tier`, `cause_areas`,
  `country` (BE/NL/LU; null for tier 4), `confidence` (high/medium/low), `verify` (what a
  human must check), `remote_note` (tier 4 only), `org_type` (`"company"` is rendered as a
  visible badge), `relationships` (future network view), `sources`.
- **`cause_areas` is a closed vocabulary**, not free text. The canonical eight live in
  `meta.cause_taxonomy` and match the keys of `CAUSE_COLORS` in `js/ui.js`: AI safety &
  governance · Biosecurity & pandemic preparedness · Animal welfare & food systems · Global
  health & development · Effective giving & meta · Climate · Careers & talent · Community
  building. Three frozen legacy values live in `meta.cause_taxonomy_legacy` (Mental health ·
  Emerging tech governance · EU policy (general)) — existing holders keep them, new orgs
  never get them. `tools/validate.mjs` rejects anything outside the union.
- **`org_type` is a closed vocabulary too** (since v0.6): community · research · think_tank ·
  ngo · funder_advisor · talent_program · institution · social_enterprise · company. Only
  `company` changes the UI (a "Company" badge, `orgTypeBadge` in `js/ui.js`) — assign it
  only when the for-profit status is solid, and update the expected-companies list in
  `tools/validate.mjs` in the same commit.
- **`relationships[].type` values** (direction matters, many edges are deliberately
  one-directional for now): member_of / has_member · has_chapter / chapter_of · hosts /
  hosted_by · hosts_fellows / places_fellows_at · spun_off / spun_out_of · same_organisation ·
  sister_org · same_ecosystem · same_network · shared_founder · co_founded ·
  closely_collaborates · campaign_partner. The validator holds the authoritative list.
- `inbox/` holds manually saved exports of sources that block automated access (job boards,
  event apps, LinkedIn). It is staging material — the app never reads it. See `inbox/SOURCES.md`.
  **`inbox/` and `designs/` are gitignored and must stay that way**: `inbox/` is ~291 MB and
  the EAGx attendee export contains personal data for ~550 people. Never commit either.
- **Tiers**: 1 = core EA/Moral Ambition · 2 = EA-funded/endorsed, no EA identity ·
  3 = cause-adjacent, BeNeLux presence, no known EA link · 4 = remote EA orgs, NO BeNeLux
  office (`lat`/`lng` are null — never render as map pins; use a side panel/"remote" shelf).
- **Tier conventions (consolidated in the v0.6 cleanup — these supersede v0.4/v0.5):**
  - Local/university EA groups ⇒ tier 1, no exceptions. **AI-safety community and student
    groups follow the same rule** (they are the same ecosystem: reading groups, fellowships,
    hackathons) — this is why safe-ai-netherlands, the SAIN chapters, delft/tilburg-ai-safety
    and dnais sit at tier 1.
  - **Tier 2 requires entity-level evidence**: verified EA funding to the listed entity
    (OP/Coefficient grant, EA Funds, Meta Charity Funders…) or an explicit EA
    evaluator/talent-org relationship (ACE considered-charities, an evaluator
    recommendation, Talos/Training-for-Good placement host). **A job-board listing alone
    (80,000 Hours, Probably Good) is tier-3 evidence, not tier-2** — this is the rule that
    demoted allai in v0.6, reversing the v0.5 convention.
  - Funding or a recommendation of an org covers that org's **own offices and fundraising
    arms** (catf-brussels, one-acre-stichting) but does **not transfer to
    separately-governed affiliates** (why hsi-europe and ciwf-eu are tier 3).
  - A globally-remote role on the 80,000 Hours job board remains sufficient evidence for
    **tier 4** (that listing *is* the tier-4 criterion).
  - No EA link at all ⇒ tier 3 regardless of quality — and since v0.6 tier 3 also requires
    **real cause-area substance**: generic development NGOs, careers-only think tanks and
    industry associations are out, however large (21 such entries were removed; see
    RESEARCH_LOG). An entry whose own description argues against inclusion is out.
- **For-profit companies are in scope** (since v0.5) when the EA cause work *is* the product —
  not merely a company in an adjacent industry. Set `org_type: "company"`; the UI badges it so
  newcomers don't read a for-profit as a charity. Being for-profit is not itself grounds for
  exclusion or for a lower tier.
- Luxembourg has exactly one entry (`uni-luxembourg-snt`, added v0.5). The v0.7 research
  round re-swept Luxembourg in French, German and Luxembourgish and francophone Belgium in
  French: both absences are real, not search gaps (EA Belgium itself lists no francophone
  group and solicits founders). Do not "fix" these gaps by lowering the bar.
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
- Country outlines come from the bundled `data/benelux.geojson` (28 KB, Natural Earth
  **1:10m**, 1636 vertices, rebuilt only if boundaries change). Never fetch boundaries
  from a CDN — the site must work offline. The layer is `interactive: false` so it cannot
  swallow pin clicks.

## UI conventions (v0.7)
- **`CAUSE_EXPLAIN` in `js/ui.js` is the single source of cause-area copy.** It feeds the
  chip tooltips, the on-page cause key and the note at the top of each open remote group.
  Adding a cause area to the data without adding a sentence here leaves it unexplained in
  three places at once. `TIER_EXPLAIN` is the same idea for tiers and is display-layer
  only — `meta.tier_definitions` in the JSON stays as it is.
- **No native `title=` tooltips.** Everything explanatory uses `data-tip` and the shared
  component in `js/tooltip.js` (450 ms delay, instant on keyboard focus, suppressed for
  touch pointers, moved into an open `<dialog>` so the modal doesn't cover it).
- Because touch has no hover, every tooltip's copy is also reachable on the page: causes
  via the "What do these mean?" key, confidence via the legend above the cards.
- **`.directory-zone` bounds the sticky filter bar.** A sticky element is limited by its
  parent's box, so the bar releases where the directory ends instead of following past
  the remote section it does not filter. Do not move `#remote-section` inside it, and do
  not give the zone `overflow`, `transform` or `filter` — each silently breaks sticky.
- The country layer **fades out above zoom 10 and is gone by zoom 12**: 1:10m boundaries
  are roughly 2 km between vertices and would visibly miss the real border at street
  level, where a country tint tells you nothing anyway.
- On screens under 800 px each filter row is a **single horizontally scrollable line**,
  not a wrapping block. Wrapping the 12 filter chips (All + 11 causes) at phone width
  produced a 529 px sticky bar (65% of the screen); this keeps it near 136 px.
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
Rebuilt after the v0.7 research round — see RESEARCH_LOG v0.6 (cleanup) and v0.7
(research round) for everything resolved.
1. **Identity gaps still open**: the-protein-project (the two unnamed funders — tier-2
   restoration hinges on them; legal entity), dnais (city, legal form — nothing public),
   cellular-agriculture-nl (office city), safe-ai-netherlands (legal form, founders),
   pise-rotterdam (registration), wur-animal-welfare (chair group),
   animal-litigation-network (KVK/RSIN + claimed ANBI status),
   ai-alignment-foundation (identity vs the original sighting; named officers),
   the-mission-motor + varkens-in-nood (confirm addresses via a KVK extract).
2. **Status checks**: ea-nijmegen (site 404s), consultants-for-impact (unfinished site),
   doneer-effectief (careers 404); gain-netherlands (Utrecht office still staffed?).
3. **Watchlist** (re-check occasionally; none currently qualifies): ENAIS (no legal
   entity anywhere), Resolution (Timaeus + UK AISI alignment team merged June 2026 —
   future tier-4 candidate), AI Standards Lab (virtual US non-profit, co-lead in
   Eindhoven), Law for AI Safety (Brussels LinkedIn only, no KBO entity),
   Nederlandse Malaria Stichting (MalariaWorld — not AMF's arm despite the domain),
   Cercle Antispéciste ULB (no effectiveness framing), Sciensano SBB (re-add case if
   BE/NL biosecurity symmetry is ever wanted), Trustworthy AI Luxembourg (meetup only).
4. **Exception-list burn-down**: `tools/validate.mjs` excuses ~53 legacy ids from the
   verify+source rule. Every research pass should shrink that list — it prints the
   count on every run.
5. Email summit@eabrussels.org for their org-fair list (best unexploited source).
6. One manual scan of GiveWell's full Airtable grants database for BeNeLux grantees
   (the fetchable pages showed none; the Airtable could not be enumerated by tooling).
7. Tier-4 EU-remote hiring re-checks (policies change yearly); `key_people`/founding gaps. fields

## Conventions
- The historical Python build scaffolding was deleted in v0.6 (it would have overwritten
  manual edits). The only dataset tooling is `tools/validate.mjs` and
  `tools/regenerate_csv.mjs` — run both after any JSON edit.
- New orgs: always include `tier`, `confidence`, `verify`, and at least one source URL.
  The validator enforces this for every org not on its legacy exception list.
- ids are stable slugs; `relationships` reference ids — check referential integrity when
  adding/removing orgs.
