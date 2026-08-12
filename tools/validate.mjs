// Dataset invariants for ea_belgium_orgs.json + CSV sync. Exits non-zero on failure.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { toCSV, CSV_COLUMNS } from "../js/download.js";

const REPO = fileURLToPath(new URL("..", import.meta.url));
const data = JSON.parse(readFileSync(`${REPO}/ea_belgium_orgs.json`, "utf8"));
const orgs = data.organisations;
const errors = [];
const err = (msg) => errors.push(msg);

const ORG_TYPES = ["community", "research", "think_tank", "ngo", "funder_advisor",
  "talent_program", "institution", "social_enterprise", "company"];
const REL_TYPES = ["closely_collaborates", "same_ecosystem", "same_organisation",
  "places_fellows_at", "spun_out_of", "spun_off", "hosts_fellows", "shared_founder",
  "member_of", "has_member", "co_founded", "campaign_partner", "sister_org",
  "hosted_by", "hosts", "has_chapter", "chapter_of", "same_network"];
const CAUSES = new Set([...data.meta.cause_taxonomy, ...(data.meta.cause_taxonomy_legacy || [])]);

// Orgs allowed (for now) to lack verify/sources: well-known tier-4 imports pending
// per-org checks. Burn this list down — the count is printed below.
const EXCEPTIONS = new Set([
  // empty verify AND no source (tier-4 imports pending per-org checks)
  "donorinfo", "govai", "bluedot", "magnify", "cea", "aim", "givewell",
  "founders-pledge", "ace", "faunalytics", "aac", "shrimp-welfare", "givedirectly",
  "malaria-consortium", "1day-sooner", "alfed", "owid",
  "catf-brussels", "ea-brussels",
  // verify present but no http source yet — the verify line names what is missing
  "fari", "hera", "itm", "damiaanactie", "bite-back", "animal-rights-be",
  "hsi-europe", "carbon-gap", "carbon-market-watch", "bellona-europa", "ecf",
  "can-europe", "e3g-brussels", "epoch-ai", "apart-research", "clr", "metaculus",
  "80000-hours", "successif", "tlycs", "wild-animal-initiative",
  "thl-uk", "sinergia", "iaps", "rethink-priorities", "hip", "gwwc",
  "anima-international", "leep", "eu-ai-office", "gha-brussels", "dsw-brussels",
  "four-paws-eu", "ikea-foundation",
]);
const SECOND_PERSON_ALLOW = /The Life You Can Save/g;

// 1. ids unique, non-empty slugs
const ids = new Set();
for (const o of orgs) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(o.id || "")) err(`${o.id}: bad id slug`);
  if (ids.has(o.id)) err(`${o.id}: duplicate id`);
  ids.add(o.id);
}

for (const o of orgs) {
  // 2. relationships resolve; types in vocabulary
  for (const r of o.relationships || []) {
    if (!ids.has(r.org)) err(`${o.id}: dangling relationship -> ${r.org}`);
    if (!REL_TYPES.includes(r.type)) err(`${o.id}: unknown relationship type ${r.type}`);
  }
  // 3. causes in taxonomy ∪ legacy
  for (const c of o.cause_areas || []) if (!CAUSES.has(c)) err(`${o.id}: unknown cause ${c}`);
  // 4. tier/coords/country/confidence shape
  if (![1, 2, 3, 4].includes(o.tier)) err(`${o.id}: bad tier ${o.tier}`);
  if (!["high", "medium", "low"].includes(o.confidence)) err(`${o.id}: bad confidence`);
  if (o.tier === 4) {
    if (o.lat !== null || o.lng !== null || o.country !== null)
      err(`${o.id}: tier 4 must have null lat/lng/country`);
  } else if (o.lat == null || o.lng == null || o.country == null) {
    err(`${o.id}: tiers 1-3 need lat/lng/country`);
  }
  // 5. verify + sources present, or on the exception list
  const hasSource = (o.sources || []).some((s) => /^https?:\/\//.test(s));
  if (!EXCEPTIONS.has(o.id)) {
    if (!o.verify) err(`${o.id}: empty verify`);
    if (!hasSource) err(`${o.id}: no http source`);
  }
  // 6. no second-person research notes in user-facing fields
  for (const f of ["name", "aka", "description", "verify", "key_people", "funding", "remote_note"]) {
    const v = (o[f] || "").replace(SECOND_PERSON_ALLOW, "");
    if (/\b(you|your|you're|you'll|yourself)\b/i.test(v)) err(`${o.id}.${f}: second-person text`);
  }
  // 7. high confidence requires a source — no exceptions
  if (o.confidence === "high" && !hasSource) err(`${o.id}: confidence high without source`);
  // 9. org_type in vocabulary
  if (!ORG_TYPES.includes(o.org_type)) err(`${o.id}: bad org_type ${JSON.stringify(o.org_type)}`);
}

// 8. CSV byte-identical to regeneration
const csv = readFileSync(`${REPO}/ea_belgium_orgs.csv`, "utf8");
if (csv.split("\r\n")[0] !== CSV_COLUMNS.join(",")) err("CSV: header mismatch");
if (csv !== toCSV(orgs)) err("CSV: not byte-identical to toCSV(json)");

// 9b. company badge count — update deliberately when a company is added/removed
const companies = orgs.filter((o) => o.org_type === "company").map((o) => o.id);
const EXPECTED_COMPANIES = ["mosa-meat", "farmless", "paebbl", "gray-swan", "elicit", "syntony", "metaculus", "futuresearch"];
if (companies.sort().join() !== [...EXPECTED_COMPANIES].sort().join())
  err(`company set drifted: ${companies.join(", ")}`);

// 10. meta.counts and version
const counts = { organisations: orgs.length, by_tier: {}, by_country: {} };
for (const o of orgs) {
  counts.by_tier[o.tier] = (counts.by_tier[o.tier] || 0) + 1;
  const c = o.country ?? "remote";
  counts.by_country[c] = (counts.by_country[c] || 0) + 1;
}
if (JSON.stringify(counts) !== JSON.stringify(data.meta.counts))
  err(`meta.counts stale: actual ${JSON.stringify(counts)}`);
if (data.meta.version !== "0.7") err(`meta.version is ${data.meta.version}, expected 0.7`);

const onException = orgs.filter((o) => EXCEPTIONS.has(o.id)).length;
console.log(`${orgs.length} orgs · ${errors.length} errors · ${onException} on the exception list`);
for (const e of errors) console.log("FAIL " + e);
process.exit(errors.length ? 1 : 0);
