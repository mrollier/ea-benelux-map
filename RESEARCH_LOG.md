# Research log

Two expansions and one cleanup so far, in chronological order. The v0.5 section supersedes
several v0.4 decisions (local groups, companies, tier-4 breadth, and the Luxembourg
"verified absence" finding); the v0.6 section at the bottom is not an expansion but a
quality pass that removed entries and tightened the tier rules.

> **A note on reading this file.** These are working research notes, published so the
> dataset's provenance is inspectable rather than taken on trust. Where an entry is
> recorded as uncertain — a site that seems inactive, a detail that could not be
> confirmed, an organisation left out for lack of evidence — that describes the state of
> **our checking**, not a judgement about the organisation. Anything listed under "open
> items" is a question we have not answered yet. If you work at an organisation named
> here and something is wrong or out of date, please tell us (see the README) and we will
> correct it.

---

# v0.4 — BeNeLux expansion (dataset v0.3 → v0.4)

**Date:** 2026-08-09
**Scope change:** Belgium-only → BeNeLux (Belgium, Netherlands, Luxembourg). Tiers 1–3 now mean
"physical BeNeLux presence"; tier 4 = remote, no BeNeLux office. New per-org `country` field
(BE/NL/LU; null for tier 4). Inclusion bar: **strict** — explicit EA identity, EA funding or
endorsement (Open Philanthropy/Coefficient Giving, ACE, GiveWell, Founders Pledge, TLYCS,
EA funds), or unmistakable EA-cause fit. "Quality over quantity" per CLAUDE.md.

**Result:** 94 → **119 organisations** (+25 new, 1 upgraded). NL 26 · BE 57 · LU 0 · remote 36.

## Method

Four parallel research tracks (AI-assisted web search + direct page fetches, 2026-08-09),
each returning structured candidates with per-claim source URLs; then a central pass for
dedupe against the existing 94 ids, tier/confidence normalisation, and website spot-checks
(7/7 new-org sites returned HTTP 200 on 2026-08-09). Facts that could not be verified from a
fetched page were downgraded (confidence medium/low) and put in each entry's `verify` field
and the CLAUDE.md backlog. Coordinates are city-level, consistent with the rest of the dataset;
two entries (DNAIS, Cellular Agriculture NL) have **placeholder pins** at Amsterdam because
their base city is unpublished — both are marked low-confidence with explicit verify notes.

### Sources consulted (with what they yielded)

| Source | Yield |
|---|---|
| effectiefaltruisme.nl (+ groups directory, about) | EAN itself; the ~16 Dutch local groups (not separately included — see rejects); Effective Environmentalism |
| forum.effectivealtruism.org — "EA Netherlands: 2025 in Review and Plans for 2026", allGroups directory, group pages | EAN staffing/funding, PISE, EAAN, group inventory |
| doneereffectief.nl (+ about) & openphilanthropy.org grant page (via index; site now redirects to coefficientgiving.org after the Nov-2025 rebrand) | Doneer Effectief upgrade to tier 1 (Coefficient + ASML Foundation funding, €8M in 2025) |
| geefrevolutie.nl + tienprocent.substack.com + coefficientgiving.org RFP post | De Geefrevolutie (ex-Tien Procent Club; $210k Coefficient grant — snippet-only, verify) |
| moralambition.org (+ jobs, fellowships) + Wikipedia | SMA Amsterdam HQ entry (Dutch stichting, 2024) |
| aisafety.com/communities directory | The 8 Dutch AI-safety groups; zero Luxembourg entries |
| existentialriskobservatory.org (403s to bots; via EA Forum intro + TIME) | ERO entry |
| pauseai.info (+ vacancies, communities) + Wikipedia | PauseAI (Utrecht stichting, KVK 92951031) |
| safeainetherlands.org + launch Substack; dnais.co; aisafetyamsterdam.org; delftaisafety.org; eatilburg.nl | SAIN, DNAIS, AISA, DAISI, TAISI |
| ACE evaluation-process archives (2021, 2022 considered charities) | Wakker Dier, Vissenbescherming, Varkens in Nood shortlist evidence → tier 2 |
| EA Animal Welfare Fund grants API (all 1,663 grants) | Zero NL/LU grantees — negative finding |
| openphilanthropy.org/grants/wakker-dier-…-2024 (indexed text) | €890,600 OP litigation grant to Wakker Dier |
| eurogroupforanimals.org member list | NL member seats; sole LU member is a companion-animal shelter league (reject) |
| wakkerdier.nl, dierenrecht.nl, varkensinnood.nl, vissenbescherming.nl, proveg.org/nl, en.cellulaireagricultuur.nl, eyesonanimals.com, tappcoalition.eu + Wikipedia | Animal-welfare entries |
| oneacrefund.org + thelifeyoucansave.org | One Acre Stichting (The Hague, TLYCS-recommended parent) |
| iavi.org + cepi.net | IAVI Europe Amsterdam office (CEPI/Wellcome Lassa vaccine work) |
| ikeafoundation.org + Wikipedia + northdata | IKEA Foundation (Leiden) |
| accesstomedicinefoundation.org | Access to Medicine Foundation |
| erasmusmc.nl / eur.nl / tudelft.nl | Pandemic & Disaster Preparedness Center (2021) |
| Luxembourg sweep: EA Forum, aisafety.com, pauseai.info/communities, vegansociety.lu, deierenasyl.lu, adaimpact.lu, Fondation de Luxembourg | **Zero qualifying orgs** — see below |

Note: the 80,000 Hours job board is a JS application that could not be cleanly queried;
per-country job counts were left **unverified** and are not used as evidence anywhere in the
dataset. Manual browsing of jobs.80000hours.org with a country filter is the reliable check.

## Added (25 new + 1 upgraded)

| id | Country | Tier | Conf. | Basis |
|---|---|---|---|---|
| ea-netherlands | NL | 1 | high | National EA org, CEA/EAIF-funded |
| geefrevolutie | NL | 1 | high | EA-aligned pledge community; Coefficient RFP grant (verify amount) |
| sma-amsterdam | NL | 1 | high | Global HQ of SMA (office-entry pattern, cf. FLI Brussels) |
| doneer-effectief *(upgraded 4→1)* | NL | 1 | high | Coefficient + ASML-funded; Amsterdam office |
| pise-rotterdam | NL | 1 | med | Explicit-EA student association (Belgian-group precedent) |
| existential-risk-observatory | NL | 1 | high | Flagship Dutch x-risk org |
| pauseai | NL | 1 | high | Dutch stichting, x-risk advocacy |
| proveg-nederland | NL | 1 | high | Explicit EA principles; ProVeg network (BE entry precedent) |
| effective-environmentalism | NL | 2 | med | Meta Charity Funders-funded, EAN-hosted |
| safe-ai-netherlands | NL | 2 | med | National AI-safety umbrella (2026) |
| dnais | NL | 2 | low | Frontier-AI-safety professional network; base city unverified |
| ai-safety-amsterdam | NL | 2 | high | ELLIS-backed, named leadership |
| delft-ai-safety | NL | 2 | med | AISF-programming TU group |
| tilburg-ai-safety | NL | 2 | med | Governance fellowship, nested in EA Tilburg |
| wakker-dier | NL | 2 | high | OP grant €890,600 (2024) + ACE shortlists |
| varkens-in-nood | NL | 2 | high | ACE shortlist 2021 |
| vissenbescherming | NL | 2 | med | ACE shortlists 2021+2022; neglected aquatic animals |
| one-acre-stichting | NL | 2 | high | TLYCS-recommended parent; The Hague office |
| dier-en-recht | NL | 3 | high | Legal advocacy; no EA link found |
| cellular-agriculture-nl | NL | 3 | low | Field-building; government-funded; office unpublished |
| eyes-on-animals | NL | 3 | med | Neglected niche (transport/slaughter inspection) |
| tapp-coalition | NL | 3 | med | True-pricing policy; Coller Foundation funding |
| iavi-europe | NL | 3 | high | CEPI-funded pandemic-preparedness R&D; not EA-funded |
| ikea-foundation | NL | 3 | high | GiveDirectly funder; else mainstream (KBF precedent) |
| access-to-medicine | NL | 3 | med | Evidence-based global health; no EA funder |
| pdpc | NL | 3 | med | Academic pandemic-preparedness centre |

Tier normalisations applied consistently (differ from some per-track suggestions):
ACE shortlist/evaluator recommendation ⇒ 2; no EA link ⇒ 3 (Dier&Recht, IAVI, CAN);
explicit-EA university groups ⇒ 1 (PISE, matching EA Ghent/Leuven/UCLouvain).

## Rejected (strict bar) — with reasons

- **EAAN** (NL) — informal WhatsApp community (~140 members), no legal entity or site. Watchlist.
- **Dutch local EA groups** (Amsterdam, Delft, Utrecht, Groningen, Maastricht, etc., ~16) —
  volunteer groups under the EAN umbrella; reachable via effectiefaltruisme.nl/join-a-group.
  PISE included as the exception (university-recognised association). Watchlist for formalisation.
- **Eindhoven AI Safety Team, AI Safety Maastricht, ERET Nijmegen** — directory-only listings,
  no site/named organisers. Watchlist.
- **ENAIS** — significant European AI-safety network with NL-based director, but legal seat
  unverified; revisit if NL registration confirmed.
- **Catalyze Impact, Timaeus, AI Standards Lab** — Dutch founders/individuals but US-registered,
  no NL office. **TNO, Rathenau Instituut, HCSS/GC REAIM** — no frontier-AI-safety/x-risk
  workstream. **ALLAI** — responsible-AI, not x-risk. **Dynamo AI** — commercial company.
- **Mosa Meat** (Maastricht) — explicit edge case: for-profit cultivated-meat company; dataset
  has no companies track. Revisit if one is added.
- **ProVeg International** — legal seat Washington DC, European office Berlin; only the NL entity qualifies.
- **Dierenbescherming, Proefdiervrij, Nederlandse Vegetariërsbond** — generalist/companion/lab-animal
  or traditional membership orgs without effectiveness framing.
- **GiveDirectly (NL)** — ANBI tax registration only, no office; stays tier 4.
- **Giving What We Can (NL)** — no Dutch entity; UK org holds the ANBI registration.
- **Effective Giving NL / Ergo Impact** — dormant site; successor US-registered.
- **IKEA Foundation** was *included* despite mainstream methodology (GiveDirectly funding +
  King Baudouin Foundation precedent) — noted here because it was a judgement call.
- **Luxembourg (all candidates)** — **verified absence**: no EA group (EA Forum directory),
  no AI-safety presence (aisafety.com, PauseAI chapters), zero EA Animal Welfare Fund or
  OP/Coefficient grantees seated in LU. Closest non-qualifiers: Vegan Society Luxembourg
  (small volunteer association), Lëtzebuerger Déiereschutzliga (companion-animal shelters),
  ADA (government-funded microfinance), Fondation de Luxembourg (generic DAF host).
  The LU country chip is kept for future data.

## Changes to existing entries

- **doneer-effectief**: tier 4 → 1, country NL, Amsterdam coordinates, refreshed facts
  (founded 2022, Coefficient + ASML funding, director Bram Schaper), remote_note cleared.
- **sma**: added `same_organisation` relationship to the new sma-amsterdam entry.
- All other tier 1–3 entries: `country: "BE"` added; all tier 4: `country: null`.
- CSV regenerated with a trailing `country` column.

## Open items

Fed into the CLAUDE.md verification backlog (item 0): DNAIS base city, Cellular Agriculture NL
office, SAIN legal form, Geefrevolutie grant amount, ERO team/funders, DAISI/TAISI activity,
PISE registration, Doneer Effectief careers page, Varkens in Nood founding year.

---

# v0.5 — inbox source review (dataset v0.4 → v0.5)

**Date:** 2026-08-11
**Result:** 119 → **208 organisations** (+89). NL 49 · BE 63 · **LU 1** · remote 95.
Tiers: 32 / 27 / 54 / 95.

## Why this round exists

v0.4 hit a wall: the 80,000 Hours job board, Swapcard event directories and LinkedIn are
JavaScript-rendered or login-gated and unreachable from a fetch tool, so they were logged as
gaps. The maintainer manually exported **14 files** into `inbox/` (provenance table in
`inbox/SOURCES.md`), which closed exactly those gaps. This round is a review of that material
rather than a fresh web search.

## Scope decisions taken this round

These are product decisions, made by the maintainer when asked, and they **relax the v0.4 bar**:

1. **Dutch local EA groups are in, at tier 1.** v0.4 rejected them as "informal". Belgium's
   equivalents were already tier 1, so the exclusion was an inconsistency, not a standard.
2. **Tier 4 takes everything that qualifies from the 80k Remote-Global export.** An org listing
   a globally-remote role *is* the tier-4 criterion, so the listing is direct evidence rather
   than a judgement call. Tier 4 went 36 → 95.
3. **For-profit companies are now in scope** when strongly EA-aligned. New `org_type: "company"`,
   surfaced as a visible badge in the UI so a newcomer cannot mistake one for a charity.
4. **Cause-adjacent BeNeLux orgs from Probably Good are in, at tier 3** — the tier that already
   exists for "BeNeLux presence, no known EA link".

## Source-by-source verdict

| Source | Verdict |
|---|---|
| 80k — Belgium (12 roles, 8 orgs) | Closes the v0.4 gap. Most orgs already present (Effectief Geven, Pour Demain, CFG, GMF, EU AI Office). New: Egmont Institute, SolarPower Europe, Syntony |
| 80k — Netherlands (3 roles, 3 orgs) | Confirms how thin the NL 80k presence is. New: ALLAI (reversing the v0.4 rejection — an 80k listing is the EA-endorsement signal that was missing). Dynamo AI rejected |
| 80k — Remote, Global (173 roles, **97 orgs**) | The single richest source. 83 not in the dataset; **47 added**, the rest excluded (below) |
| Probably Good — BeNeLux (47 roles) | Best source for cause-adjacent BeNeLux orgs, and the only source that has ever produced a **Luxembourg** hit |
| EAGxAmsterdam 2025 exhibitors (40 orgs) | High signal. New: Impact Lab Amsterdam, The Mission Motor, SAIN Groningen, Catalyze, CeSIA, Giving Green, DIL, Helen Keller, ICAN, Institute for Law & AI, Lafiya, Race Against Waste, Sentinel Bio, Social Movement Lab, Compassionate Future |
| EA Summit Brussels 2026 exhibitors (15 orgs) | Mostly already present. New: The Protein Project, Consultants for Impact, ML4Good, Future Matters |
| EAGxAmsterdam attendees (550 records, 479 affiliations) | **Low yield.** Individual employers, heavily international and mostly one-off (Kraft Heinz, Adecco, World Bank). Only real find: GOAL 3 (4 attendees) |
| LinkedIn × 5 (36 company hits) | **~40% keyword noise** — "Jewelry for animal welfare", Signify Animal Lighting, a Luxembourg health *insurer*, an Indiana poultry firm. Useful for: Dutch EA groups, SAIN chapters, AI Safety Camp's Diemen listing |
| Goodshift — Belgium (71 roles, 39 employers) | **Zero additions.** All for-profit climate/health tech with no EA link (imec, Umicore, argenx, Veolia, OTIV). Goodshift itself is already tier 3 |
| Coefficient Giving / Open Phil mirror (921 grants, 491 donees) | **One addition:** Wageningen University & Research (2 farm-animal-welfare grants, ~$608k). Otherwise confirms existing entries (Wakker Dier, CIWF, Eurogroup for Animals). See the caveat below |

## The Coefficient Giving mirror — what it is and is not

`github.com/vipulnaik/donations` carries a full Open Philanthropy dump split by cause area.
Three things a future reader needs to know:

- **Four of the 13 files as supplied were GitHub rate-limit HTML error pages, not data**
  (animal welfare, biosecurity, other-GCR, other — 1,474 bytes each). They were re-fetched
  during the review. Check file sizes before trusting this source.
- **Coverage ends 2019–2023 depending on cause area** (AI safety runs to 2023-11, global health
  only to 2019). It is a historical backfill and misses 2024–2026 entirely — which is most of
  what a BeNeLux search needs.
- **coefficientgiving.org returns 403 to every automated client**, including `/robots.txt`.
  A current export requires a human browser; there is no automated route.

## Corrections to earlier findings

- **Luxembourg is no longer a verified absence.** v0.4 recorded zero qualifying LU orgs across
  four tracks. Probably Good surfaced a University of Luxembourg SnT doctoral post in machine
  learning security testing; SnT is now the dataset's first LU entry. The v0.4 finding was
  correct for the sources it used, and wrong as a general claim.
- **The EA Animal Welfare Fund "zero NL/LU grantees" claim in the v0.4 log is wrong.**
  The Mission Motor is a Dutch stichting and lists the EA Animal Welfare Fund among its
  supporters. Treat that v0.4 line as unreliable.
- **Catalyze Impact:** v0.4 rejected it as US-registered. That fact is confirmed (501(c)(3),
  incorporated in Colorado) but the conclusion was wrong — it belongs in tier 4, not excluded.
- **ALLAI:** v0.4 rejected it as "responsible-AI, not x-risk". Added at tier 2 because 80,000
  Hours lists its roles under AI safety & policy. The original concern is preserved in its
  `verify` field rather than discarded.

## Added (89)

**Dutch local EA groups — tier 1, NL (9).** Sourced from EA Netherlands' own directory at
`effectiefaltruisme.nl/en/join-a-group`, which is better evidence than the LinkedIn sweep and
was used in preference to it: `ea-amsterdam`, `ea-delft`, `ea-eindhoven`, `ea-leiden`,
`ea-nijmegen`, `ea-roosevelt` (Middelburg), `ea-the-hague`, `ea-tilburg`, `ea-zwolle`.
The directory also lists groups the LinkedIn sweep found that it does *not* carry
(EA Groningen, EA Wageningen, EA Maastricht) — those are treated as dormant and left out.

**New BeNeLux organisations — tiers 1–2 (8).**

| id | Country | Tier | Basis |
|---|---|---|---|
| `impact-lab-amsterdam` | NL | 1 | UvA lab on effective giving, Prof. Paul Smeets; EAGx exhibitor |
| `the-mission-motor` | NL | 1 | Dutch stichting; funded by EA Animal Welfare Fund, Charity Entrepreneurship, Effektiv Spenden |
| `goal-3` | NL | 2 | €260k Founders Pledge grant; IMPALA patient monitor; 's-Hertogenbosch |
| `sain-groningen` | NL | 2 | SAIN's founding chapter (ex-AISIG, 2023) |
| `sain-utrecht` | NL | 2 | SAIN chapter |
| `wur-animal-welfare` | NL | 2 | Two Open Philanthropy farm-animal-welfare grants (~$608k) |
| `the-protein-project` | BE | 2 | EA Summit Brussels exhibitor; philanthropically funded EU protein policy |
| `allai` | NL | 2 | 80k-listed under AI safety & policy; founded by the Dutch EU HLEG-AI members |

**Cause-adjacent — tier 3 (10):** `uni-luxembourg-snt` (**first LU entry**), `rivm`,
`clingendael`, `cordaid`, `global-health-edctp3`, `egmont-institute`, `solarpower-europe`,
`eit-food`, `journalismfund-europe`, `norrsken-amsterdam`.

**Companies — new `org_type` (6):** `mosa-meat`, `farmless`, `paebbl` (BeNeLux, tier 3);
`gray-swan`, `elicit`, `syntony` (remote, tier 4).

**Remote — tier 4 (56).** Full list in the dataset; sourced from the 80k Remote-Global export
and the two exhibitor lists. Highlights: `coefficient-giving`, `ea-funds`, `longview`,
`manifund`, `sff`, `far-ai`, `metr`, `kairos`, `forecasting-research-institute`, `averi`,
`blueprint-biosecurity`, `securedna`, `mirror-biology-dialogues`, `jhu-chs`, `chai-berkeley`,
`xlab-chicago`, `helen-keller-intl`, `institute-for-progress`, `catalyze-impact`, `law-ai`.

## Rejected — with reasons

- **All 39 Goodshift Belgian employers** — for-profit climate and health tech with no EA link
  or EA-cause core product (imec, Umicore, argenx, Veolia, OTIV, VIB, Aquafin…). The new
  companies rule requires the cause work to *be* the product; these fail that, not the
  for-profit test. Artsen Zonder Grenzen already in the dataset as `msf-ocb`.
- **LinkedIn keyword noise** — Jewelry for animal welfare, Signify Animal Lighting Solutions
  (Minnesota), Global Health (a Luxembourg *insurer*), Kipster (Indiana), Animal Heroes
  Foundation, AI Summit Brussels (a commercial conference), The Witness Protocol.
- **Law for AI Safety** and **Animal Litigation Network** (both Brussels/Amsterdam, both real
  LinkedIn pages) — no website or independent record could be found. Watchlist.
- **Encode Europe, ClusterFree, AlignIQ, Formical, 7 Billion Presidents** — surfaced only as
  single attendee affiliations, no verifiable organisational record. Watchlist.
- **Frontier labs and general tech on the 80k remote list** — OpenAI, Google DeepMind, Gensyn,
  Alignerr, AE Studio, Carbon Direct, Deep Science Ventures, Electric Sheep, Alice, Myrias,
  Outcapped, Marketing Growth Lab, Lens Academy, Paradigm 3, Thirdlaw, 0Labs, Concentric
  Policies, Principles of Intelligence: the remote roles are not cause work, or the entity
  could not be identified.
- **Generalist policy/academic bodies on the 80k remote list** — Aspen Institute, Pulitzer
  Center, Renaissance Philanthropy, University of Virginia, Charles University, GMU Mercatus,
  Peace Research Institute Frankfurt, INHR, fp21, Asia Accountability Initiative.
- **Career-capital employers from Probably Good** — McKinsey, Bain, Goldman Sachs, and the EU
  traineeship programmes (Blue Book, Schuman, EIT) — generic, and listing them would dilute
  the map for a newcomer.
- **Dynamo AI** — 80k-listed, but an AI-compliance vendor rather than an AI-safety organisation.
- **Good Impressions** and **AI Alignment Foundation** — genuine EA organisations, but **dropped
  late in the process because their websites could not be confirmed.** `good-impressions.com`
  turned out to be a New Jersey print shop; `.co`, `.agency` and `.io` all resolve to unrelated
  businesses. `alignmentfoundation.org` returns 200 with no content. Linking a newcomer to the
  wrong business is worse than omitting the entry. Both are watchlist items — add them back
  once someone confirms the real URL.
- **The four `Various …` placeholder rows** in the 80k export (Various Hosts, Various Event
  Organisers, etc.) — not organisations.

## Verification performed

- Merge script asserts: unique ids, tier ∈ 1–4, confidence ∈ high/medium/low, tier 4 ⇔ null
  coordinates, tier 4 ⇔ null country, relationships resolve, non-empty cause areas, every new
  org has a website, every company has a website.
- **New assert: cause areas must be canonical.** The first merge attempt silently introduced a
  parallel vocabulary ("AI safety" alongside "AI safety & governance"), which would have split
  the filter chips into near-duplicates and dropped the new entries to the grey fallback colour.
  New records are now normalised onto the eight `CAUSE_COLORS` keys and the merge fails if
  anything falls outside them.
- **Every website and careers URL HTTP-checked** (108 URLs): 25 problems found and fixed —
  12 dead careers pages blanked or corrected, 6 wrong domains replaced (AVERI, Mirror Biology
  Dialogues, Compassionate Future, EA Hong Kong, CeSIA, The AI Policy Network), 3 dead group
  sites rerouted, 4 Cloudflare-403 sites confirmed real and annotated.
- **Page titles scraped for all 59 remote orgs** to confirm identity — HTTP 200 does not prove
  the domain belongs to the right organisation. This is what caught the print shop.
- One pre-existing org (`impactful-policy-careers`) has no website; already a CLAUDE.md backlog
  item, deliberately not papered over.

## Open items (added to the CLAUDE.md backlog)

The Mission Motor's base city (Amsterdam pin is a placeholder); The Protein Project's city and
funders; whether AI Safety Amsterdam has become the SAIN Amsterdam chapter (possible duplicate);
AI Safety Camp's legal seat (Diemen listing would make it tier 1 NL); whether EA Nijmegen is
still running (we could not reach their site); whether Consultants for Impact is operating yet
(their site appears to still be in progress); whether Norrsken House Amsterdam has opened;
ALLAI's x-risk workstream; the specific WUR
chair group holding the Coefficient grants; real URLs for Good Impressions and AI Alignment
Foundation.

---

# v0.6 — cleanup & tier-rule tightening (dataset v0.5 → v0.6)

**Date:** 2026-08-12
**Not an expansion.** A full audit of the v0.5 dataset against our own inclusion criteria
("quality over quantity — a newcomer who clicks three irrelevant orgs stops trusting the
map") found entries that failed them, an inconsistently applied tier-2 rule, and private
research notes that had leaked into public copy. **Result: 208 → 187 organisations**
(92 BeNeLux: BE 45 · NL 46 · LU 1; 95 remote). NL now outnumbers BE among mapped orgs.

## Removed (21, all tier 3)

Entries that argued against their own inclusion in user-facing copy:
- **msf-ocb** — description said "Not EA-aligned … but high interest for your audience".
- **sciensano** — description said "You flagged doubt about including it … cut if you prefer".
- **vlesp** — "No EA link"; kept only as the closest Belgian match to EA mental-health
  interventions. Its removal leaves Mental health with no mapped org — the gap banner
  now shows that honestly, pointing to the remote org (hli).

Generic development / philanthropy bodies with no cause-specific substance and no EA link:
- **11-11-11** (umbrella of Flemish North-South orgs), **enabel** (federal development
  agency), **cordaid** (generic Dutch development NGO), **kbf** (King Baudouin Foundation —
  fiscal plumbing for transnational giving, not effective giving).

Think tanks and coalitions included only as "career capital", tagged with no real cause:
- **clingendael**, **egmont-institute** (Careers & talent only), **bruegel** (zero sources,
  "growing" AI workstream), **epha** (umbrella of public-health NGOs), **ai4belgium**
  (responsible-AI ethics coalition, not AI safety).

Industry / impact-generic:
- **solarpower-europe** (solar trade association), **goodshift** (broader "impact" scope
  than EA), **norrsken-amsterdam** (impact-entrepreneurship hub that may not have opened),
  **journalismfund-europe** (one farm-animal grant line, possibly one-off).

Existence or identity itself unverified — should not be on a map at all yet:
- **wap-eu**, **animal-law-europe** (existence of Brussels offices unverified),
  **give-for-good** (verify field read "EVERYTHING"), **impactful-policy-careers** (no
  website; possibly not a standalone org), **clean-air-fund** (its only source URL pointed
  at a different organisation, Clean Air Task Force).

None of the 21 had inbound relationship edges from surviving orgs.

## Tier rule tightened (supersedes the v0.5 job-board rule)

v0.5 said "an EA job board listing an org under a core cause area counts as EA endorsement
for tier-2 purposes" — but applied it to exactly one org (allai) while 13 tier-3 entries
with identical evidence stayed at tier 3. v0.6 resolves the contradiction the other way:
**tier 2 requires entity-level EA funding or an explicit evaluator/talent-org
relationship; a job-board listing alone is tier-3 evidence** (it remains sufficient for
tier 4). Parent-org funding does not transfer to separately-governed affiliates, but does
cover an org's own offices and fundraising arms.

Demoted 2 → 3 under the new rule: **allai** (evidence was the 80k listing), **hsi-europe**
and **ciwf-eu** (EA funding belongs to the global parents, not the EU entities),
**carbon-gap** (no verifiable evidence at all), **the-protein-project** (funders unnamed;
restore to tier 2 if research names an EA funder). Stayed tier 2 on entity-level evidence:
ceps, epc, pour-demain, gmf-brussels (Talos / Training-for-Good placement hosts — the
missing gmf edge was added), catf-brussels and one-acre-stichting (own-office rule), plus
all grant/evaluator-backed entries.

## Re-tiered 2 → 1 (AI-safety community groups follow the EA-groups rule)

effective-environmentalism (legally hosted by EA Netherlands, Meta Charity Funders-funded —
tier 1 by the literal definition), safe-ai-netherlands, sain-groningen, sain-utrecht,
ai-safety-amsterdam (duplicate question vs a SAIN Amsterdam chapter stays open in its
verify field), delft-ai-safety, tilburg-ai-safety (hosted by tier-1 ea-tilburg), dnais
(professional AI-safety community; confidence stays low).

## Confidence honesty pass

New rule: **high confidence requires at least one source URL** — "Verified" is the label
a newcomer trusts most. Demoted high → medium (each with a new verify line): hera, itm,
damiaanactie, carbon-market-watch, bellona-europa, can-europe, 80000-hours. Five orgs had
low confidence with an empty verify field (nothing said what was unverified): metaculus,
successif, tlycs, wild-animal-initiative, sinergia — each now names its open checks.
Assertive descriptions on low-confidence entries were softened (syntony, dnais,
the-protein-project, cellular-agriculture-nl, consultants-for-impact). Second-person
research notes were stripped from all surviving public copy (ea-ghent, 80000-hours,
effective-thesis).

## Structural

Closed `org_type` vocabulary (9 values) — near-duplicates merged (community_group →
community, research_institute → research, advocacy → ngo, government_agency → institution,
capacity_builder → ngo) and all 91 tier-4 placeholder values ("", remote_ea_org) replaced
with real types. Two orgs newly typed `company` on public knowledge: metaculus (public
benefit corporation) and futuresearch (for-profit startup). Relationship type names
normalised (member_group → member_of, member_org → has_member, spun_out → spun_off,
parent_of → has_chapter). Empty `remote_note` keys dropped from non-tier-4 orgs. `meta`
now declares the canonical 8 causes plus a frozen 3-value legacy list, and carries
machine-checked `counts`. New tooling: `tools/validate.mjs` (enforces every rule above;
carries a printed exception list of ~56 legacy entries still lacking verify/sources — to
be burned down) and `tools/regenerate_csv.mjs`. The unrunnable `build_dataset_v3.py`
scaffolding was deleted.

## Open items

Carried into the CLAUDE.md backlog: the SAIN-Amsterdam duplicate, the watchlist re-adds
(Good Impressions, AI Alignment Foundation, ENAIS, Timaeus, AI Standards Lab, Law for AI
Safety, Animal Litigation Network), placeholder pins and identity gaps, status checks,
and the validator exception-list burn-down.
