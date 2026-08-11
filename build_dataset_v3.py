"""
V3 of the EA Belgium organisations dataset.

Adds tier 4: remote-first EA(-aligned) organisations with NO Belgian office that
plausibly hire people living in Belgium. New field for these: `remote_note`
(what is verified about their remote-hiring policy, incl. timezone caveats).

Caveats encoded per-entry:
- "Remote" almost never means "hires anywhere": employer-of-record limits,
  timezone overlap, and citizenship requirements vary. confidence reflects how
  sure I am they can/do hire EU-based staff.
- Tier-4 orgs have lat/lng = None -> render in a side panel, not on the map.

Run AFTER build_dataset.py and build_dataset_v2.py.
"""

import json, csv

with open("ea_belgium_orgs.json", encoding="utf-8") as f:
    data = json.load(f)
orgs = data["organisations"]

# Probably Good belongs in the new tier 4
for o in orgs:
    if o["id"] == "probably-good":
        o["tier"] = 4
        o["name"] = "Probably Good"
        o["remote_note"] = "Remote-first; career advising open globally"
        o["description"] = ("EA-aligned career guidance org (guides, job board, 1:1 advising) "
                            "funded by Coefficient Giving's Effective Giving & Careers Fund.")

def r(id, name, causes, desc, remote_note, conf, verify="", web="", careers="",
      funding="", people="", founded=None, hq="", sources=None):
    return {"id": id, "name": name, "aka": "", "city": f"Remote (HQ: {hq})" if hq else "Remote",
            "lat": None, "lng": None, "cause_areas": causes, "tier": 4,
            "org_type": "remote_ea_org", "founded": founded, "key_people": people,
            "website": web, "careers_url": careers, "funding": funding, "description": desc,
            "remote_note": remote_note, "confidence": conf, "verify": verify,
            "sources": sources or [], "relationships": []}

T4 = [
    # ---- AI safety & governance ----
    r("iaps", "Institute for AI Policy and Strategy (IAPS)", ["AI safety & governance"],
      "Nonpartisan think tank on advanced-AI policy (compute policy, frontier security, international strategy); runs an AI Policy Fellowship.",
      "VERIFIED: 'fully remote, able to legally hire in most countries'; salary premium for DC/SF/London", "high",
      web="https://www.iaps.ai", careers="https://www.iaps.ai/careers", hq="Washington DC",
      sources=["https://www.iaps.ai/careers", "https://onthinktanks.org/job/researchers-senior-researchers-artificial-intelligence-ai-policy-and-strategy/"]),
    r("rethink-priorities", "Rethink Priorities", ["AI safety & governance", "Animal welfare & food systems", "Global health & development", "Effective giving & meta"],
      "EA think tank researching AI governance, animal welfare (incl. invertebrates), global health, and EA movement questions.",
      "VERIFIED: 100% remote, staff in 15 countries, 'welcomes applicants from anywhere in the world'", "high",
      web="https://rethinkpriorities.org", careers="https://careers.rethinkpriorities.org",
      funding="Open Philanthropy, Survival and Flourishing Fund, individual donors", hq="US-incorporated",
      sources=["https://careers.rethinkpriorities.org/"]),
    r("epoch-ai", "Epoch AI", ["AI safety & governance"],
      "Research org producing data and analysis on AI trends (compute, capabilities, economics) widely used in AI governance.",
      "Remote-first with international team; per-role hiring constraints to verify", "medium",
      verify="Current EU hiring", web="https://epoch.ai", careers="https://epoch.ai/careers", hq="distributed"),
    r("govai", "Centre for the Governance of AI (GovAI)", ["AI safety & governance"],
      "Research institution on AI governance; fellowships and research roles.",
      "Oxford-based with hybrid/remote flexibility for some roles; verify per role", "medium",
      web="https://www.governance.ai", careers="https://www.governance.ai/careers", hq="Oxford"),
    r("apart-research", "Apart Research", ["AI safety & governance"],
      "Decentralised AI safety research lab; runs global research sprints/hackathons and remote research teams — very accessible entry point.",
      "Remote-first by design; global participation", "medium",
      verify="Paid vs volunteer role mix", web="https://apartresearch.com", hq="distributed"),
    r("bluedot", "BlueDot Impact", ["AI safety & governance", "Biosecurity & pandemic preparedness"],
      "Runs the AI Safety Fundamentals and biosecurity courses (originally with Cambridge EA) — the standard on-ramp courses, fully online.",
      "Courses fully remote/global; staff roles London-leaning — verify", "medium",
      web="https://bluedot.org", hq="London"),
    r("ai-safety-camp", "AI Safety Camp", ["AI safety & governance"],
      "Part-time remote research programme matching aspiring researchers with mentors.",
      "Fully remote programme, global", "medium", web="https://aisafety.camp", hq="distributed"),
    r("clr", "Center on Long-Term Risk (CLR)", ["AI safety & governance"],
      "Research on reducing worst-case risks (s-risks) from advanced AI.",
      "London-based, has offered remote flexibility; verify per role", "low",
      verify="Current hiring & remote policy", web="https://longtermrisk.org", hq="London"),
    r("metaculus", "Metaculus", ["AI safety & governance", "Effective giving & meta"],
      "Forecasting platform used across EA for AI/bio/geopolitical predictions.",
      "Remote team; verify EU hiring", "low", web="https://www.metaculus.com", hq="distributed"),

    # ---- Careers & meta ----
    r("80000-hours", "80,000 Hours", ["Careers & talent"],
      "The flagship EA careers org: research-driven career guide, job board, podcast, 1:1 advising. Its job board is also your best data source for 'currently hiring' status.",
      "London-based, hybrid; advising/job board fully global; some remote roles", "high",
      web="https://80000hours.org", careers="https://80000hours.org/about/meet-the-team/#vacancies",
      funding="Open Philanthropy a.o.", hq="London"),
    r("hip", "High Impact Professionals", ["Careers & talent"],
      "Impact Accelerator Program + Talent Directory for mid/senior professionals transitioning to high-impact work.",
      "Remote org; programmes global and free", "high",
      web="https://www.highimpactprofessionals.org", hq="distributed",
      sources=["https://www.highimpactprofessionals.org/"]),
    r("successif", "Successif", ["Careers & talent", "AI safety & governance"],
      "Career-transition support for mid/senior professionals moving into AI risk work.",
      "Remote; verify current programmes", "low", web="https://www.successif.org", hq="distributed"),
    r("magnify", "Magnify Mentoring", ["Careers & talent"],
      "Mentoring for women, non-binary and trans people pursuing high-impact careers.",
      "Fully remote, global mentor/mentee pool", "medium", web="https://www.magnifymentoring.org", hq="distributed"),
    r("effective-thesis", "Effective Thesis", ["Careers & talent"],
      "Helps students pick high-impact research topics (thesis coaching) — directly useful for your student audience.",
      "Fully remote/global; org's current operational status to verify", "low",
      verify="Whether still active in 2026", web="https://effectivethesis.org", hq="distributed"),
    r("cea", "Centre for Effective Altruism", ["Community building", "Careers & talent"],
      "Runs EA Global(x) conferences, the EA Forum, groups support — the movement's infrastructure org, incl. support for groups like yours.",
      "Oxford/remote hybrid; hires internationally for many roles", "medium",
      web="https://www.centreforeffectivealtruism.org", hq="Oxford"),
    r("aim", "Ambitious Impact / Charity Entrepreneurship (AIM)", ["Careers & talent", "Global health & development", "Animal welfare & food systems"],
      "Incubator that launches new effective charities (LEEP, FEM, etc.); its Incubation Program is the EA route to founding an org.",
      "London-based programme with in-person components; incubated charities are often remote", "medium",
      web="https://www.charityentrepreneurship.com", hq="London"),

    # ---- Effective giving ----
    r("gwwc", "Giving What We Can", ["Effective giving & meta"],
      "The 10% Pledge org; effective-giving education and donation platform (Effectief Geven's international sister network hub).",
      "Fully remote, hires internationally", "high",
      web="https://www.givingwhatwecan.org", hq="distributed",
      sources=["https://www.effectiefgeven.be/ons-ecosysteem"]),
    r("givewell", "GiveWell", ["Global health & development", "Effective giving & meta"],
      "The charity evaluator behind Effectief Geven's recommendations.",
      "US remote-friendly but roles typically require US-hours overlap — hard from CET; verify per role", "medium",
      web="https://www.givewell.org", careers="https://www.givewell.org/about/jobs", hq="Oakland"),
    r("founders-pledge", "Founders Pledge", ["Effective giving & meta", "Climate"],
      "Gets entrepreneurs to pledge equity to effective charities; runs research incl. the Climate Fund that recommends CATF.",
      "London/Berlin/US offices + some remote; verify EU remote roles", "medium",
      web="https://www.founderspledge.com", hq="London"),
    r("tlycs", "The Life You Can Save", ["Effective giving & meta", "Global health & development"],
      "Peter Singer-founded effective-giving org.",
      "Remote; small team; verify hiring", "low", web="https://www.thelifeyoucansave.org", hq="distributed"),
    r("doneer-effectief", "Doneer Effectief (NL — BeNeLux neighbour)", ["Effective giving & meta"],
      "Dutch sister org of Effectief Geven. Not remote-hiring-focused and not Belgian — included only because you mentioned possible BeNeLux scope.",
      "Netherlands-based; include only if scope becomes BeNeLux", "high",
      web="https://doneereffectief.nl", hq="Netherlands",
      sources=["https://doneereffectief.nl/"]),

    # ---- Animal welfare ----
    r("anima-international", "Anima International", ["Animal welfare & food systems"],
      "Coalition of European farmed-animal orgs; corporate campaigns and investigations.",
      "VERIFIED: advertises roles as 'remote worldwide'", "high",
      web="https://animainternational.org", careers="https://animainternational.org/jobs", hq="distributed (Europe)",
      sources=["https://forum.effectivealtruism.org/posts/Lsq6fdek6k6FdhxWZ"]),
    r("ace", "Animal Charity Evaluators", ["Animal welfare & food systems", "Effective giving & meta"],
      "The 'GiveWell for animals': evaluates and recommends animal charities.",
      "Fully remote; historically hires internationally", "medium",
      web="https://animalcharityevaluators.org", hq="distributed"),
    r("faunalytics", "Faunalytics", ["Animal welfare & food systems"],
      "Research library + original studies for animal advocates.",
      "Remote, North-America-leaning; timezone overlap needed", "medium",
      web="https://faunalytics.org", hq="distributed (NA)"),
    r("aac", "Animal Advocacy Careers", ["Animal welfare & food systems", "Careers & talent"],
      "Career advice, courses and job board specifically for animal advocacy.",
      "Fully remote services, global", "medium",
      web="https://www.animaladvocacycareers.org", hq="distributed"),
    r("shrimp-welfare", "Shrimp Welfare Project", ["Animal welfare & food systems"],
      "AIM-incubated charity on shrimp welfare (huge numbers, extremely neglected).",
      "Remote, distributed team", "medium", web="https://www.shrimpwelfareproject.org", hq="distributed"),
    r("wild-animal-initiative", "Wild Animal Initiative", ["Animal welfare & food systems"],
      "Research on wild animal welfare.",
      "US-based remote; intl. hiring per role — verify", "low",
      web="https://www.wildanimalinitiative.org", hq="US"),
    r("thl-uk", "The Humane League UK", ["Animal welfare & food systems"],
      "Corporate campaigns for farmed animals (ACE top charity lineage).",
      "Remote within the UK only — likely NOT hireable from Belgium; listed for completeness", "medium",
      verify="Confirm UK-only hiring", web="https://thehumaneleague.org.uk", hq="UK"),
    r("sinergia", "Sinergia Animal", ["Animal welfare & food systems"],
      "Corporate campaigns in Global South + some European work.",
      "Remote, campaign-country-leaning; verify EU roles", "low", web="https://www.sinergiaanimal.org", hq="distributed"),

    # ---- Global health / bio / mental health / x-risk ----
    r("leep", "Lead Exposure Elimination Project (LEEP)", ["Global health & development"],
      "AIM-incubated charity against childhood lead poisoning; a poster child of cost-effective policy advocacy.",
      "Remote-first, distributed team incl. Europe", "medium",
      web="https://leadelimination.org", hq="distributed",
      sources=["https://forum.effectivealtruism.org/posts/aj4PQaLqSMWffyhFD/ea-landscape-in-the-uk"]),
    r("givedirectly", "GiveDirectly", ["Global health & development"],
      "Unconditional cash transfers; GiveWell-recommended.",
      "Global org; many roles remote or in program countries; EU-friendly roles exist — verify per role", "medium",
      web="https://www.givedirectly.org", careers="https://www.givedirectly.org/careers/", hq="US/global"),
    r("malaria-consortium", "Malaria Consortium", ["Global health & development"],
      "Runs GiveWell's top-rated seasonal malaria chemoprevention programme.",
      "London HQ + program countries; most roles NOT remote-EU; listed because of GiveWell status", "medium",
      web="https://www.malariaconsortium.org", hq="London"),
    r("1day-sooner", "1Day Sooner", ["Biosecurity & pandemic preparedness"],
      "Advocacy for human challenge trials and faster medical countermeasures.",
      "Remote, distributed", "medium", web="https://www.1daysooner.org", hq="distributed"),
    r("alfed", "ALLFED (Alliance to Feed the Earth in Disasters)", ["Biosecurity & pandemic preparedness", "Climate"],
      "Research on resilient foods for global catastrophes (nuclear winter, etc.).",
      "Fully remote, global volunteers + staff", "medium", web="https://allfed.info", hq="distributed"),
    r("hli", "Happier Lives Institute", ["Mental health", "Effective giving & meta"],
      "Research on wellbeing-based charity evaluation (e.g. StrongMinds analysis) — the main EA mental-health research org.",
      "Remote; org size/status to verify", "medium",
      verify="Current operational status", web="https://www.happierlivesinstitute.org", hq="distributed"),
    r("owid", "Our World in Data", ["Global health & development", "Effective giving & meta"],
      "Data publication used across EA; Oxford-based charity (Global Change Data Lab).",
      "Remote within ~UK-overlapping timezones for many roles — CET works; verify per role", "medium",
      web="https://ourworldindata.org", careers="https://ourworldindata.org/jobs", hq="Oxford"),
]

orgs.extend(T4)

data["meta"]["version"] = "0.3"
data["meta"]["tier_definitions"]["4"] = ("Remote EA orgs: no Belgian office, but remote-first EA(-aligned) "
                                          "organisations that plausibly hire people based in Belgium "
                                          "(see remote_note per org for caveats)")

with open("ea_belgium_orgs.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

fields = ["id", "name", "aka", "city", "lat", "lng", "cause_areas", "tier", "org_type",
          "founded", "key_people", "website", "careers_url", "funding", "description",
          "remote_note", "confidence", "verify", "sources", "relationships"]
with open("ea_belgium_orgs.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=fields)
    w.writeheader()
    for o in orgs:
        row = {k: o.get(k, "") for k in fields}
        row["cause_areas"] = "; ".join(o["cause_areas"])
        row["sources"] = "; ".join(o.get("sources", []))
        row["relationships"] = "; ".join(f'{x["org"]}:{x["type"]}' for x in o.get("relationships", []))
        w.writerow(row)

tiers = {}
for o in orgs:
    tiers[o["tier"]] = tiers.get(o["tier"], 0) + 1
print(f"Total: {len(orgs)} orgs | by tier: {dict(sorted(tiers.items()))}")
