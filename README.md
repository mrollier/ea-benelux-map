# EA BeNeLux Landscape Map

**Live: <https://mrollier.github.io/ea-benelux-map/>**

An interactive map and directory of organisations across Belgium, the Netherlands and
Luxembourg working on the causes effective altruism cares about — core EA groups,
EA-funded organisations, cause-adjacent NGOs and think tanks, plus remote EA employers
with no BeNeLux office.

Built for people new to EA who want to see the landscape before deciding where to look
harder. **193 organisations** as of dataset v0.7 — 95 in the BeNeLux (46 Belgium ·
48 Netherlands · 1 Luxembourg), 98 remote.

Plain HTML, CSS and JavaScript. No build step, no framework, no bundler.
[Leaflet](https://leafletjs.com/) (+ markercluster) via CDN for the map.

## Are you on this map?

If your organisation is listed and something is wrong, missing, or out of date — or if
you should be listed and aren't — please get in touch via
[eabelgium.org](https://eabelgium.org). Corrections from the organisations themselves are
the single most valuable input this project gets.

Every entry shows how well it has been checked (**Verified** / **Partly verified** /
**Unverified**), and the underlying data records what a human still needs to confirm.
Nothing here is endorsed by the organisations listed unless a cited source says so.

## Run it locally

The app fetches `ea_belgium_orgs.json` at runtime, which browsers block on `file://`, so
serve the folder with any static server:

```sh
cd ea-benelux-map        # the folder holding index.html, not its parent
python3 -m http.server 8000
```

Then open <http://localhost:8000>. If you see a bare list of file names instead of the
map, the server is running one directory too high up.

## The data

`ea_belgium_orgs.json` is the single source of truth. Edit it and reload — no rebuild
(the app fetches with `cache: no-store`). `ea_belgium_orgs.csv` is a flattened export for
volunteers editing in a spreadsheet; merge changes back into the JSON, then run
`node tools/regenerate_csv.mjs` (and `node tools/validate.mjs` to check the data rules).
The site also offers both a filtered and a full CSV download.

- `CLAUDE.md` — data model, tier definitions, the closed cause-area vocabulary, and the
  verification backlog.
- `RESEARCH_LOG.md` — how each expansion was researched: what every source yielded, what
  was rejected and why, and which findings were later corrected.

Each organisation sits in one of four tiers: **1** core EA · **2** EA-funded or endorsed ·
**3** cause-adjacent with a BeNeLux presence · **4** remote EA organisation, no BeNeLux
office. Tier 4 has no coordinates and appears in its own section rather than on the map.

## Deploy

Every path is relative, so any static host works unchanged — GitHub Pages, Netlify, a
plain web server. Upload the folder as-is.

## Licence

Two licences, because this repository is two things:

| What | Licence |
|---|---|
| Code — HTML, CSS, JS, build scripts | [MIT](LICENSE) |
| Dataset — `ea_belgium_orgs.json` / `.csv` | [CC BY 4.0](LICENSE-DATA) |

Reuse is welcome, including forking this for another region — that is partly the point.
If you reuse the dataset, please carry the confidence levels with it rather than
presenting every row as established fact.

`data/benelux.geojson` is derived from [Natural Earth](https://www.naturalearthdata.com/)
(public domain). Map tiles are © [OpenStreetMap](https://www.openstreetmap.org/copyright)
contributors, served by [CARTO](https://carto.com/attributions).
