# 02 — Comparable games research

**Ticket:** [02 — Comparable games research](../issues/02-comparable-games-research.md)  
**Scope:** Mechanics lessons for our pillars (industrial power, logistics-first economy, eras + logistics gates, strat-map Composition combat, on-rails Invention, rare Traction Settlements, multi-path Victory, SP Match ~4–8h).  
**Not:** reviews, IP clones, full Factorio-depth factories, separate battle layers, multiplayer netcode.

---

## Survey by category

### 1. Civ-like 4X arcs / victories / eras

| Game | Relevant systems | Sources |
|------|------------------|---------|
| **Civilization VI** | Multiple themed Victory Paths (Science milestone chain, Culture tourist race, Domination capitals, Religion, Diplomacy, Score). Eras as tech/civic bands; R&F World Era vs individual era; late-game production projects gate Science wins. | [Victory (Civ6 wiki)](https://civilization.fandom.com/wiki/Victory_(Civ6)), [Era (Civ6 wiki)](https://civilization.fandom.com/wiki/Era_(Civ6)) |
| **Humankind** | Eras advanced via **Era Stars** (multi-category achievement thresholds); game **ends** on turn limit / Mars / all endgame techs / pollution / all Contemporary stars — **winner is highest Fame**, not the end condition itself. | [End Condition wiki](https://humankind.fandom.com/wiki/End_Condition), [Ancient World Mag review notes](https://www.ancientworldmagazine.com/reviews/humankind-game/) |
| **Old World** (Soren Johnson) | Explicit rejection of heavily themed early-commit victories; prefers generic/legitimacy-style closure; events add variety without rules bloat; 1UPT strat-map combat with orders economy. | [Designer Notes — Mohawk](https://www.designer-notes.com/category/mohawk/) |

**Mechanics lessons**

- **Milestone Victory Paths** (Civ Science: sequential projects) give readable races and sabotage targets; they also create **production endgames** that can feel like a second game.
- **Themed victories force early specialization** — Johnson’s critique: high bars warp every prior choice (“always pick the religious option”). Our pillar wants **multiple equal paths weighted toward industry + invention** — design so mid-Match pivots remain viable.
- **Separate end condition vs winner** (Humankind Fame) is a useful split: a Match can *end* on an industrial/invention race clock while score/pressure still ranks runners-up — or we can keep pure “first to path wins” for clarity in a hobby SP product.
- **Eras as readability bands** work; **power should not be era-label alone**. Civ individual vs World Era is a warning: pure tech-era gates ignore whether Logistics Chains are actually ready (our locked pillar: eras + **logistics/industry gates as real locks**).
- SP Match length ~4–8h wants **fewer era bands and shorter milestone chains** than full Civ epic; avoid 9-era sprawl.

---

### 2. Logistics / production-forward strategy

| Game | Relevant systems | Sources |
|------|------------------|---------|
| **Anno 1800** | Explicit production chains (raw → intermediate → consumer good); building ratios; island/warehouse logistics; population tier needs drive demand. Steampunk-adjacent industrial tone. | [Production chains wiki](https://anno1800.fandom.com/wiki/Production_chains), [PC Gamer tips](https://www.pcgamer.com/anno-1800-tips-guide/) |
| **Hearts of Iron IV** (1.11+ supply) | Hub supply via capital → rail/ports → hubs; range falloff; motorization; map mode for throughput; supply as soft stacking limit (not produced crates). | [HOI4 Logistics wiki](https://hoi4.paradoxwikis.com/Logistics) |
| **Shadow Empire** | Same road/rail graph serves **military supply and civilian resource shipping**; infrastructure investment is strategy; overextension is a rubber band. Unit model design (see §4). | [Matchsticks: logistics as spine](https://www.matchstickeyes.com/2020/06/14/shadow-empire-a-4x-where-professionals-talk-logistics/), [Model Design Council wiki](https://shadowempire.fandom.com/wiki/Model_Design_Council) |
| **Offworld Trading Company** | Economic RTS: claim → extract → process → ship; player-driven market; stock-market Victory (not combat wipe); adaptive openers from random maps/prices/events. | [OTC Designer Notes — Stock Market](https://www.designer-notes.com/2016/05/), [Adaptive Gameplay](https://www.designer-notes.com/otc-designer-notes-18-adaptive-gameplay/), [GDC postmortem note](http://www.designer-notes.com/offworld-trading-company-gdc-postmortem/), [Steam store framing](https://store.steampowered.com/app/271240/Offworld_Trading_Company/) |

**Mechanics lessons**

- **Anno pattern (chain graph + demand sinks)** is the closest mainstream expression of extract → haul → refine → manufacture. Perfect ratios are teaching tools; early under-building is often correct — don’t force spreadsheet perfection in a 4–8h 4X.
- **HOI4 hub/rail model** is excellent for *military* logistics readability (map mode, choke on rail level) but **supplies are capacity, not cargo**. Our Logistics Chain fantasy wants **actual goods movement** (Shadow Empire / Anno hybrid), not only a soft stack limit.
- **Shadow Empire’s dual-use infrastructure** (civ + mil on one graph) is the strongest 4X precedent for “logistics-first binds empire and war.” Risk: simulation depth and UI opacity; late-game turn times.
- **Offworld** proves industrial/economic Victory can be primary; **ending the game without conquest was the hard design problem** (stock buyout dynamics ≈ rush/turtle/boom). For us: Industrial Supremacy / Invention Race need **clear finish lines and interactive denial**, not “highest coal at turn 300.”
- **Out of scope reminder:** full Factorio belt sandbox — keep chain depth **authored and shallow enough for continental turns**, not tile-perfect factories.

---

### 3. Composition-focused strat-map combat (no separate battle layer)

| Game | Relevant systems | Sources |
|------|------------------|---------|
| **Old World** | Full combat on strategy map; 1UPT; role lines (melee / ranged / mounted / siege) with hard counters (polearm vs mount, unlimber siege, Rout); Orders economy; designer notes on why no free defender counterattack. | [Units — official wiki](https://wiki.hoodedhorse.com/Old_World/Units), [Designer Notes combat](https://www.designer-notes.com/category/mohawk/) |
| **Civilization V/VI** | 1UPT strat-map combat; zone of control; terrain; tends toward front-line micromanagement and “unit carpet” tedium in late game. | Community critique pattern (e.g. CivFanatics 1UPT threads); contrast with stack eras |
| **Endless Legend (1)** | Armies on strat map; optional tactical battle with stance directives; auto-resolve. Still a **battle layer** (even if watchable). | [Battles wiki](https://endless-legend.fandom.com/wiki/Battles) |
| **Total War** | Campaign Composition matters, but **truth lives on battle map**; auto-resolve often diverges from player skill / favors certain rosters — bad model if we refuse a battle layer. | [Autoresolve wiki (TWW)](https://totalwarwarhammer.fandom.com/wiki/Autoresolve) |

**Mechanics lessons**

- **If there is no battle layer, Composition must be first-class on the strat map** — readable roles, counters, and positioning (Old World), not cosmetic unit art on a pure strength number (bad auto-resolve feel).
- Prefer **small armies / caps / Orders-like action budgets** over Civ late-game unit carpets; fits “combat important but not every Sitting.”
- **Stacks vs 1UPT:** stacks scale for continental 4X and faster Sitings; 1UPT teaches Composition via geometry. Hybrid option: **stack with role slots** (composition vector inside a stack) resolves on strat map with counter matrix + flanking/terrain modifiers — steals Old World clarity without Endless/TW battle popups.
- **Do not** ship a dishonest auto-resolve while “real” fight is elsewhere — we have no elsewhere. Previewed outcome ≈ true outcome.
- Neutral Threats can reuse the same Composition rules (pressure without Faction AI full stack).

---

### 4. Light factory / machine-crafting inside broader strategy

| Game | Relevant systems | Sources |
|------|------------------|---------|
| **Shadow Empire** | Discover model → design model with constrained choices; iterative marks; stats from design rolls/skills; production of designed equipment. Closest to **on-rails Invention**. | [Model Design Council](https://shadowempire.fandom.com/wiki/Model_Design_Council), [VR Designs snippets](https://www.vrdesigns.net/?p=1806) |
| **HighFleet** | Ship editor with modules, fuel/logistics on operational map, diegetic machine fantasy; combat is action-arcade (not our time model) but **crafted machines as strategic identity**. | [Game Developer interview](https://www.gamedeveloper.com/design/designing-i-highfleet-i-a-strategy-game-with-heavy-machinery-and-twirling-knobs), [Steam](https://store.steampowered.com/app/1434950/HighFleet/) |
| **Offworld** | Building graph and patents/upgrades, not freeform crafting — **authored economic machines**. | Designer notes above |
| **Anno** | Fixed recipes/buildings — no player parts budget; deep chain catalog instead. | Production chains wiki |

**Mechanics lessons**

- **Shadow Empire model design** is the best existing match for pillar **Invention: parts/tags/stat budgets; authored rules**. Steal: discover → design under constraints → produce → field; iterate marks. Avoid: opaque rolls and council micro without SP readability.
- **HighFleet** steals tone (grimy machines, fuel as lifeblood) and “my roster is my build,” not real-time dogfights.
- Keep Invention **combinatorial within a closed part catalog** (on rails); optional AI assist for combination/flavor only — never freeform runtime rules (map Out of scope).
- Light crafting must **feed Victory Paths and Composition** (invention race, unique counters), not be a side sandbox that steals Match time from logistics.

---

### 5. Mobile base / settlement adjacents (not full Mortal Engines)

| Game | Relevant systems | Sources |
|------|------------------|---------|
| **They Are Billions** | Fixed colony core; expand perimeter under pressure — **settlement as defended industrial heart**, not mobile. Wave/Neutral Threat pressure analog. | [Kotaku tips](https://kotaku.com/tips-for-playing-they-are-billions-1822005149) |
| **Frostpunk** | Single city survival; laws/heat/coal fantasy; not 4X map mobility. Tone adjacency (cost of industry/labor). | General design reputation; not a map-mobility source |
| **HighFleet** | Mobile **fleet** as base: fuel, repair, route choice — operational mobility without municipal predation. | PC Gamer / GD articles above |
| **Shadow Empire / HOI** | HQs and supply heads effectively “move” the operational base via infrastructure, not walking cities. | Logistics sources above |
| *Mortal Engines* (fiction inspiration only) | Municipal Darwinism — **explicitly out of scope as default**. | Map Out of scope |

**Mechanics lessons**

- Treat **Traction Settlements as rare late specials**: unlock cost, movement rules, and logistics interactions must stay exceptional (pillar), not default city type.
- Better adjacents than predator-cities: **movable supply heads / expeditionary works / rare traction for a strategic relocating factory or capital threat** — HighFleet-style “base is the column” without eating other cities.
- Mobile industry must **pay logistics taxes** (coal, rail gauge, damage risk) or it invalidates fixed Settlement investment.
- Neutral Threats + fixed industrial hearts (TAB-like pressure) can deliver tension without traction spam.

---

## Adopt / Avoid / Risks (mapped to our pillars)

### Adopt

| Pillar | Steal from | Pattern |
|--------|------------|---------|
| **Victory Paths** | Civ milestone chains + Offworld “must have a non-vague end” + Humankind end-vs-winner split (optional) | 3–4 equal paths; industry & invention get **staged, deniable objectives** (throughput monuments, patent races, wonder-machines), not only score. Domination remains valid but not mandatory. |
| **Eras + logistics gates** | Civ era readability + Shadow/Anno real bottlenecks | Era labels for UX; **hard locks** on chain capacity, fuel/coal, and haul range before era toys fully work. |
| **Logistics-first economy** | Anno chain shape + Shadow dual-use infrastructure + HOI map-mode honesty | Shallow authored chains; **routes and hubs visible**; cutting a line hurts factories *and* armies. |
| **Composition combat** | Old World roles/counters on strat map | Small force caps; counter matrix; terrain/flank; **outcome model is the combat model**. |
| **Invention on rails** | Shadow model design + HighFleet identity | Discover/design under part tags & budgets → produce → Composition hooks; marks/iterations. |
| **Traction rare** | HighFleet mobility / supply-head thinking | Special unlock; logistics cost; never default Settlement. |
| **SP Match 4–8h** | Offworld short decisive arc (adapted to TB) | Fewer eras; aggressive catch-up or shorter trees; Victory Path progress always visible. |
| **Diplomacy as logistics** | Offworld market interaction + HOI passage/rail intuition | Deals about **routes, coal, ports, passage, tech licenses** more than abstract openers. |

### Avoid

| Pattern | Why (for us) |
|---------|----------------|
| **Early-commit themed victories only** (classic Civ specialization trap) | Breaks “equal paths” and mid-Match pivots; industry path should not require ignoring army entirely until too late. |
| **Separate tactical battle map / TW-style auto-resolve gap** | Explicitly out of scope; Composition would be a lie. |
| **Factorio-depth belts / free tile factories** | Out of scope; destroys continental turn pace and AI authorship. |
| **HOI-only capacity supply with no cargo fantasy** | Undercuts extract→haul→refine→manufacture spine. |
| **Shadow-level simulation opacity + long AI turns** | Hobby SP; vertical slice must stay implementable. |
| **Full municipal Darwinism / traction-as-default** | Out of scope; rare special only. |
| **Open LLM rule generation for Invention** | Out of scope; keep authored part graph. |
| **1UPT unit carpets without action economy** | Late-game Sitting death; combat every turn. |
| **Victory = highest score at time only** | Weak industrial fantasy finish; Offworld struggled until buyout drama existed. |
| **Bargaining-table diplomacy minmax** (Civ3+ lesson per Johnson) | Prefer constrained deals/events tied to logistics leverage. |

### Risks

| Risk | Pillar stress | Mitigation direction (for later tickets) |
|------|---------------|------------------------------------------|
| **Chain depth vs 4–8h Match** | Logistics, sliceability | Cap recipe tiers; reuse buildings across eras; UI “chain health” not full spreadsheet. |
| **AI pathing and logistics fairness** | Logistics, Opposition | Simple hub graph; AI cheats only as last resort and must be spec’d; Neutral Threats simpler than full Faction logistics. |
| **Composition without battle layer feels thin** | Combat | Invest in counter clarity, preview accuracy, and positional verbs; optional short “resolution beat” animation, not a map. |
| **Invention side-sandbox** | Invention, Victory | Every part tag must touch Composition, logistics, or a Victory Path meter. |
| **Industrial Victory un-interactive** | Victory | Require contested map resources, sabotage, or diplomatic denial — Offworld buyout energy. |
| **Traction invalidates fixed cities** | Traction Settlements | Movement cooldowns, coal burn, vulnerability while moving, opportunity cost. |
| **Era gates ignored if logistics gates soft** | Progression | Soft era flavor, **hard** logistics thresholds for key Advances. |
| **Scope creep toward Shadow Empire** | Success bar (slice) | Spec vertical slice: one chain family, one counter matrix slice, one invention catalog subset. |
| **Tone clone of Mortal Engines / WWV** | Fantasy | Machinery/soot/empire; not IP plot or predation loop. |

---

## Shortlist: primary comps for the spec

1. **Anno 1800** — production chain UX and industrial fantasy (economy spine).  
2. **Shadow Empire** — logistics as empire binder + constrained unit/model design (logistics + Invention).  
3. **Old World** — strat-map Composition combat and anti-themed-victory design thinking.  
4. **Civilization VI** — era readability and milestone Victory structure (with Johnson/Humankind caveats).  
5. **Offworld Trading Company** — economic Victory finish lines and adaptive industrial play.  
6. **HighFleet** (lightly) — mobile machine column fantasy for rare traction / expeditionary bases.  
7. **HOI4 supply** (selectively) — hub/rail readability and map-mode communication — not full cargo model.

---

## Citation index

- Civilization VI Victory: https://civilization.fandom.com/wiki/Victory_(Civ6)  
- Civilization VI Era: https://civilization.fandom.com/wiki/Era_(Civ6)  
- Humankind End Condition: https://humankind.fandom.com/wiki/End_Condition  
- Soren Johnson Designer Notes (Old World / Mohawk): https://www.designer-notes.com/category/mohawk/  
- Offworld Designer Notes (May 2016 archive, stock market, adaptive gameplay): https://www.designer-notes.com/2016/05/  
- Offworld GDC postmortem note: http://www.designer-notes.com/offworld-trading-company-gdc-postmortem/  
- Offworld Steam: https://store.steampowered.com/app/271240/Offworld_Trading_Company/  
- Anno 1800 Production chains: https://anno1800.fandom.com/wiki/Production_chains  
- HOI4 Logistics: https://hoi4.paradoxwikis.com/Logistics  
- Shadow Empire logistics essay: https://www.matchstickeyes.com/2020/06/14/shadow-empire-a-4x-where-professionals-talk-logistics/  
- Shadow Empire Model Design Council: https://shadowempire.fandom.com/wiki/Model_Design_Council  
- Old World Units (Hooded Horse wiki): https://wiki.hoodedhorse.com/Old_World/Units  
- Endless Legend Battles: https://endless-legend.fandom.com/wiki/Battles  
- Total War Autoresolve: https://totalwarwarhammer.fandom.com/wiki/Autoresolve  
- HighFleet design interview: https://www.gamedeveloper.com/design/designing-i-highfleet-i-a-strategy-game-with-heavy-machinery-and-twirling-knobs  
- HighFleet Steam: https://store.steampowered.com/app/1434950/HighFleet/  
- They Are Billions tips: https://kotaku.com/tips-for-playing-they-are-billions-1822005149  
