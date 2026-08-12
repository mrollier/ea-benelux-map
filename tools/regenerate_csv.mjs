// Regenerate ea_belgium_orgs.csv from the JSON via the app's own toCSV, so the
// shipped file and the in-app export can never diverge.
//   node tools/regenerate_csv.mjs [--check]
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { toCSV } from "../js/download.js";

const REPO = fileURLToPath(new URL("..", import.meta.url));
const data = JSON.parse(readFileSync(`${REPO}/ea_belgium_orgs.json`, "utf8"));
const csv = toCSV(data.organisations);

if (process.argv.includes("--check")) {
  const current = readFileSync(`${REPO}/ea_belgium_orgs.csv`, "utf8");
  console.log(current === csv ? "IN SYNC (byte-identical)" : "DIFFERS — rerun without --check");
  process.exit(current === csv ? 0 : 1);
}
writeFileSync(`${REPO}/ea_belgium_orgs.csv`, csv);
console.log(`wrote ${data.organisations.length} rows`);
