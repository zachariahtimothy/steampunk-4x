# Soot Empire — Game Design / Product Spec

**Status:** v1.0 assembled from wayfinder map ([issue #1](https://github.com/zachariahtimothy/steampunk-4x/issues/1))  
**Audience:** Future implementers (human + AI) building a hobby single-player vertical slice and, later, a full Match.  
**Success bar:** Implement a vertical slice **without inventing a major system**. Numeric balance knobs may be tuned later; **rules shapes are locked**.

**Working title:** *Soot Empire*  
**Pitch:** A turn-based 4X where logistics is power: extract, haul, refine, and field steampunk machines while rare cities learn to walk.

**This is / isn’t**
- **Is:** SP turn-based industrial 4X about logistics and machines  
- **Isn’t:** Real-time base-builder or pure war micromanagement  
- **Isn’t:** Mortal Engines predator-cities as the whole game  

**Glossary:** root [`CONTEXT.md`](../../CONTEXT.md) is the language authority. Prefer those terms in code, UI, and docs.

**Source tickets:** [#2](https://github.com/zachariahtimothy/steampunk-4x/issues/2)–[#15](https://github.com/zachariahtimothy/steampunk-4x/issues/15) (closed). Research assets under `.scratch/wayfind-spec/assets/`.

---

## Table of contents

1. [Product intent](#1-product-intent)
2. [Pillars](#2-pillars)
3. [Match shape and progression](#3-match-shape-and-progression)
4. [Logistics Chain](#4-logistics-chain)
5. [Invention on rails](#5-invention-on-rails)
6. [Combat Composition](#6-combat-composition)
7. [Victory Paths](#7-victory-paths)
8. [Factions](#8-factions)
9. [Neutral Threats](#9-neutral-threats)
10. [Traction Settlements](#10-traction-settlements)
11. [Map generation](#11-map-generation)
12. [Diplomacy](#12-diplomacy)
13. [Vertical slice](#13-vertical-slice)
14. [Out of scope](#14-out-of-scope)
15. [Open balance knobs](#15-open-balance-knobs)
16. [Implementer checklist](#16-implementer-checklist)

---

## 1. Product intent

| Field | Decision |
|-------|----------|
| Deliverable of this effort | **Design/product spec** (this document), not a shipped game |
| Players | Solo / friends hobby |
| Mode | **Single-player** primary |
| Time model | **Turn-based 4X** |
| Match length target | ~**4–8 hours** (Standard preset) |
| Fantasy | **Industrial power** — factories, logistics, machines as the star |
| Tone | Grimy industrial power (soot, empire, cost of coal/labor) |
| World | Soft alt-Earth (familiar vibes, fictional map) |
| Scale | Continental / planetary command canvas |
| Engine | **Not chosen** in this spec — any prototype stack is fine |

Inspiration **energy** (not IP clones): *Wild Wild West* gadget machinery; *Mortal Engines* mobile-industry imagery **without** Municipal Darwinism as the core loop.

---

## 2. Pillars

1. **Logistics-first economy** — extract → haul → refine → manufacture is the spine of power.  
2. **Invention on rails** — players design Marks from authored parts/tags/budgets; research-gated; Co-pilot suggests, never freeform rules.  
3. **Multiple Victory Paths** — Domination, Industrial Supremacy, Invention Apex; weight fantasy toward industry + invention; domination stays viable.  
4. **Combat matters, not every Sitting** — strategy-map Composition + Orders; no separate battle layer.  
5. **Eras + Logistics Gates** — research opens content bands; throughput unlocks real power.  
6. **Traction is rare** — special/late logistics instrument, not default cities.  
7. **Light Faction asymmetry** — shared skeleton; traits + start kit + one Signature Tool.  
8. **AI rivals + Neutral Threats** — neutrals pressure industry; they do not replace Factions.

Comparable-games stance (steal / avoid): see [assets/02-comparable-games.md](../../.scratch/wayfind-spec/assets/02-comparable-games.md).  
Motif stance: see [assets/03-machinery-motifs.md](../../.scratch/wayfind-spec/assets/03-machinery-motifs.md).

---

## 3. Match shape and progression

### 3.1 Match

One procedural (or scenario) map played to a Victory Path seal. Real-world play chunks are **Sittings**.

### 3.2 Eras (exactly 3)

Working names (flavor rename later):

1. **Early Industrial**  
2. **Middle Industrial**  
3. **Late Industrial**

**Advancement rule**
- **Research / Advances** open the **Era door** (content becomes available).  
- **Logistics Gates** unlock **power inside** the Era (full rates, completion eligibility).  
- A Faction can be “in” an Era on the tree but **starved** if logistics lag — intentional.

| Era | Research opens (examples) | Logistics gate unlocks (examples) |
|-----|---------------------------|-------------------------------------|
| Early | Basic extract/refine, Line/Raid kit, first invent slots | Full-rate Coke / Plates / Beams; short-network supply |
| Middle | Complex recipes **visible**; better chassis; licenses matter | Full-rate Precision Parts / Compound Fuel; real mid rail throughput |
| Late | Traction project; Crown / World Machine legs; top Marks | **Completion** eligibility for Crowns/World Machine; top fuel economy |

**Invention tiers:** Mark I (Early, goods-heavy) → Mark II (Middle, + Lab points / complex goods) → Mark III / showcases (Late, gated).

**UX:** always show (1) Era research progress and (2) logistics readiness for the next gate. Shortage Doctor feeds (2).

---

## 4. Logistics Chain

### 4.1 Depth

**Two layers:** simple early game; one mid-game **complex goods** tier.  
- Era opens complex **recipes**.  
- Logistics gate opens **full-rate / efficient** use.

### 4.2 Resources (v1)

| Resource | Role | Continent-hauled? |
|----------|------|------------------|
| Coal | Fuel / coking input | Yes (bulk) |
| Ore | Metal input | Yes (bulk) |
| Timber | Construction / beams input | Yes (bulk) |
| Food | Workforce upkeep | Yes (bulk) |
| Water/Steam | Local power & process | **No** (local) |
| Labor/Workforce | Local capacity | **No** (local) |

### 4.3 Key intermediates (hauled)

- **Early:** Coke · Plates · Beams  
- **Complex tier:** Precision Parts · Compound Fuel  

Finished machines / Marks are **manufactured at factories** (not shipped as finished continental cargo).

### 4.4 Flow

```text
Extract (Coal, Ore, Timber, Food)
  → Refine early (Coke, Plates, Beams)
  → Haul bulk + key intermediates via Routes
  → Manufacture (buildings, units, Marks)
  → [Middle+] Complex goods after Era door + logistics gate
  → Advanced Marks / victory projects
```

### 4.5 Hauling and infrastructure

- **Default:** player-drawn **Routes** if path + capacity exist.  
- **Optional Convoys:** military / emergency supply (unit-like).  
- **Dual-use network:** roads / rail / ports serve **cargo and armies**.  
- **Player verbs:** place extractors · build processors · draw routes · upgrade hubs/rail · spend stock · **Shortage Doctor** UI.

### 4.6 Non-goals (economy)

- Factorio belts / tile-perfect factories  
- Hauling every finished good  
- HOI capacity-only supply as the whole fantasy  
- Deep Anno population-need webs  
- Separate civil vs military infrastructure graphs  
- Required rare aether/crystal resource for v1 spine  

---

## 5. Invention on rails

### 5.1 Player flow

1. **Research** unlocks invent capacity (slots / workshop rights / chassis branches).  
2. **Discover** an authored opportunity (chassis unlock, brief, salvage hook, lab breakthrough).  
3. **Design** a **Mark**: chassis family → tagged **Parts** in slots under budgets.  
4. **Validate:** hard bans reject impossible builds; soft taxes (heat / breakdown / fuel / crew) apply to janky-legal builds.  
5. **Produce** at factories; iterate Marks when slots/research allow.  
6. Showcases + **World Machine** use the same rails with heavier gates.

### 5.2 Data model (sketch)

- **ChassisFamily** (authored): day-one **Emplacement · Wagon/Tracked · Rail · Walker** (non-IP-safe leg silhouette). Further families via research.  
- **Chassis:** slot layout, weight class, hard tag requirements.  
- **Part:** tags, slot type, goods cost, optional Lab cost, stats, tax contributors.  
- **Mark:** chassis + parts; computed stats; legality; taxes; flavor.  
- **Tags (examples):** `role:*`, `fuel:coal|coke|compound`, `armor:*`, `crew:*`, `terrain:rail_only`, `showman|grim`, counter hooks.  
- **Budgets:** logistics goods always; **Laboratory Points** for mid/complex Marks.  
- **Catalog:** hand-authored. No runtime novel mechanics.

### 5.3 AI Co-pilot

- Default: **co-pilot only** — player states a goal; AI proposes **legal** builds; **player approves**.  
- May generate name / blurb / paint.  
- **Must not:** invent parts, tags, chassis rules, freeform behaviors, or one-click auto-win defaults.  
- Filter motif landmines (no ME jaws/Gut loop; no WWW tarantula-tank package).

### 5.4 Dual voice

Marks may lean **showman** or **grim logistics** via tags; taxes differ. Both valid.

---

## 6. Combat Composition

### 6.1 Map presence

- **Armies** = stacks with a **hard role-slot cap** (tunable, e.g. 5–8).  
- No separate battle layer; no 1UPT carpets.

### 6.2 Roles (v1)

1. **Line** — holds ground  
2. **Shock/Raid** — mobility / punch  
3. **Siege** — structures / breakthrough  
4. **Support** — repair, screen, aids  

Marks map into roles via primary role tag.

### 6.3 Counters

- **Role wheel** backbone (exact matrix is data).  
- **Tag modifiers** from Invention parts on top.  
- Player optimizes slot mix + tags + terrain + supply + Orders timing.

### 6.4 Resolve

- **Orders** budget per Army (move, attack, brace, force-march, …).  
- Resolution **mostly deterministic**; **preview ≈ truth**.  
- Multi-step fights can span turns; still on strat map.

### 6.5 Logistics linkage

- Dual-use network drives **supply state**.  
- Out of supply: degraded stats and/or restricted attack Orders.  
- Active machines may consume **Coke / Compound Fuel** upkeep.  
- Convoys can emergency-supply.

### 6.6 Non-goals

- TW-style battle maps / dishonest auto-resolve  
- High-chaos RNG as primary skill test  
- Combat that ignores logistics  

---

## 7. Victory Paths

Three equal-priority paths; fantasy weight favors Industrial + Invention; Domination remains fully viable.

| Path | Shape | Seal |
|------|-------|------|
| **Industrial Supremacy** | Industrial milestone projects | **Foundry Crown** completes |
| **Invention Apex** | 2–3 showcase Marks fielded | **World Machine** completes |
| **Domination** | Control ≥ X% Settlements and/or **Strategic Hubs** | Hold for **Y** consecutive turns (reset on break) |

**Interaction**
- First completed seal **wins** (Match ends).  
- No forced single-path lock-in; multi-path progress allowed.  
- Starting Crown / World Machine / Domination hold emits a public **Endgame Signal** (path band known).  

**Intel**
- Baseline: know a Faction is in endgame on a band.  
- Exact metrics via espionage / scouts / agents / tech — not free omniscience.

**Non-goals:** score-only winners; early-commit path warping; domination-only meta; hidden instant wins.

---

## 8. Factions

### 8.1 Count

- **Default 4** Factions per Match.  
- Scalable **3–5** without redesign.

### 8.2 Asymmetry budget (light)

Each Faction may differ by **only**:
1. **Traits** (mild numeric package)  
2. **Start kit** (goods, location bias, early affinity)  
3. **One Signature Tool** (one building line, policy, or Mark branch)

### 8.3 Must stay shared

Logistics model · Invention rails · combat roles/Orders · Victory Paths · neutral framework · no private resources · no unique win cons · no second invent systems.

### 8.4 Starter roster (working names)

| Faction | Lean | Signature tool (concept) |
|---------|------|---------------------------|
| **Cinder Crown** | Industrial / Foundry Crown | Royal Foundry works — industrial project discount/accel |
| **Sootwright Compact** | Invention / Lab diplo | Workshop League — Lab points + lighter licenses |
| **Ironway Syndicate** | Logistics network | Rail Patent — cheaper/faster hub/rail tiers |
| **Ashwalker Freeholds** | Military-logistics / Raid | Outriders — escort/Raid edge; softer raider pressure |

Signature tools are **data knobs**, not forked codepaths.

---

## 9. Neutral Threats

### 9.1 Structure

- **2 core** standing types.  
- **Light modular Crisis deck** for spice.  
- Pressure industry; **do not** replace Faction rivals.

### 9.2 Cores

| Type | Primary cost | Notes |
|------|--------------|-------|
| **Raiders** | Cargo on Routes/Convoys | Dens on corridors; Raid-leaning Armies |
| **Rogue Automata** | Hubs, extractors, industrial works | Scars near rich deposits; weirder Composition |

### 9.3 Crises (v1)

1. **Ash storm** — regional Route/vision penalties  
2. **Labor strike** — local Labor collapse until addressed  
3. **Unstable prototype outbreak** — short automata spike / hazard  

Timed, telegraphed, resolvable. No city-eating growth. Neutrals don’t take Domination credit by default.

---

## 10. Traction Settlements

- **Special / rare / late** — not default Settlements.  
- **Unlock:** Era opens project; logistics + heavy goods complete it. Low per-Match cap (sense: 0–1 meaningful).  
- **Move:** rail/road preferred; off-network crawl = throughput penalty + **Track Scar** + fuel tax.  
- **Modes:** **Anchor** (produce/defend) vs **March** (move; production cut; vulnerable; escort).  
- **Niche:** flexible postures; **best as mobile factory/forward hub**; war posture taxed.  
- Still needs **Routes/Convoys**. Not a super-Army. No jaws/Gut urbivore loop. Not required for any Victory Path (may help).

---

## 11. Map generation

- **Default tiles:** hex; design in **Regions**, **Corridors**, hubs.  
- **Presets:** **Standard** (~4–8h, default) and **Compact** (shorter).  
- **Starts:** separated home regions; **asymmetric but guaranteed viable** minimums of bulk resources.  
- **Topology:** **2–4 strategic corridors**; clustered rich deposits forcing cross-region Routes; rail spine *opportunities*; coastal ports as multipliers (rail-and-road continent primary, not pure naval 4X).  
- **Neutrals:** raider dens on corridors; automata scars on industrial riches.  
- **Strategic Hubs:** contestable sites for logistics + Domination %.  
- Soft alt-Earth fictional continents — no true-Earth homework; no perfect mirror MP maps as default.

Named knobs (tune later): `region_count`, `min_start_distance`, `corridor_count`, `neutral_density`, `deposit_richness`, `hub_count`, `port_frequency`, size preset.

---

## 12. Diplomacy

**Depth:** logistics + tech leverage — not UN/congress.

### Verbs (v1)

| Verb | Effect |
|------|--------|
| Declare war / sue peace | Hostilities on/off |
| Open **Passage** | Corridor/rail rights |
| Port access | Use port hub for Routes |
| Resource shipment | Timed goods/turn |
| Advance share | Share/swap an Advance |
| **Invention License** | Produce rights for a Mark family/chassis line |
| Embargo | Block shipments / economic contact |

**Out:** defensive pacts, world congress, diplo victory, religion-diplo trees.

### Contracts and Stance

- Deals are **timed contracts**; early break → severe Stance hit (+ backlash).  
- Simple pairwise **Stance** (Hostile → Partner) from contracts, borders, Endgame Signals, generosity.  
- **SP AI bar:** optimize for goods need + victory threat; sell surplus; fear enabling rival Apex; use embargo/passage as weapons. No 20-layer hidden agenda matrix.

---

## 13. Vertical slice

### Fantasy to prove (~30–90 min)

**Logistics is power** *and* **invent a Mark and field it** in a supply-linked fight.

### Ladder

| Milestone | Scope |
|-----------|--------|
| **Slice v1 — Sandbox** | Hand-authored tiny hex region; scripted deposits; player + dummy/scripted enemy Army |
| **Slice v2 — Compact** | Compact gen; 2 Factions; few corridors; same rules |

**Spec “vertical slice done” = v1 complete.** v2 is immediate follow-on.

### Real in sandbox v1

- Hex map (tiny)  
- Bulk resources + early intermediates + Routes  
- Dual-use rail/road **tier-1**; supply affects combat  
- Factory spend; basic Shortage Doctor  
- Early Industrial only (lite research door + early logistics gate)  
- Invention subset: **1 chassis family**, small parts, bans+taxes, goods budget  
- Armies with slot cap; enough roles to fight; Orders; deterministic preview  
- Field a produced Mark in combat  

### Stubbed in sandbox v1

Traction · complex tier · Mid/Late Eras · Victory seals · full diplo · 3–4 AI Factions / Signature Tools · automata & crises (raiders optional later) · Co-pilot · naval · full catalog · production art/audio · engine final choice  

### Acceptance checks (v1)

1. Route extractors → processors → factory without cheats.  
2. Cut/starve an input → Shortage Doctor + reduced output.  
3. Unlock invent → legal Mark → produce.  
4. Field Mark; Orders fight; out-of-supply worse than in-supply.  
5. No new major system invented beyond this spec.  
6. Teachable in ~30–90 minutes (scripted scenario OK).  

Prefer **feature flags / content subsets** over forked rules between sandbox and Compact.

---

## 14. Out of scope

- Shipping a complete commercial product in the wayfind effort  
- Competitive multiplayer / ranked netcode as first-class destination  
- RTS as primary time model  
- Separate tactical battle maps  
- Open-ended LLM mechanics generation  
- Full Factorio-depth factory sandbox  
- Faithful ME / WWW IP adaptations; Municipal Darwinism core; signature set-piece clones  
- Traction as default city type  
- Engine lock, full art/audio bible, accessibility deep-dive (thin notes only as needed)  

---

## 15. Open balance knobs

These are **data**, not missing systems:

- Recipe ratios and throughput targets  
- Exact X% / Y turns for Domination  
- Milestone lists, showcase counts, Crown/World Machine costs  
- Full part catalog and numeric budgets  
- Counter matrix values, Orders regen, slot cap number  
- Neutral spawn rates and crisis weights  
- Faction trait tables  
- Traction project costs, scar magnitude, mode wind-up  
- Map gen numeric presets  
- Diplo Stance weights and contract durations  
- Turns-per-era targets  

---

## 16. Implementer checklist

Before coding a system, confirm:

- [ ] Term exists in `CONTEXT.md` (or add it there first)  
- [ ] Behavior is specified in this SPEC (or is an explicit knob in §15)  
- [ ] Vertical slice: is it **real**, **stub**, or **v2**?  
- [ ] Does not violate non-goals (Factorio depth, battle layer, freeform invent, city-eating, etc.)  
- [ ] Dual-use logistics still binds military and economy where relevant  

### Suggested build order (post-spec)

1. Sandbox map + resource nodes + Routes + early refine + factory  
2. Shortage Doctor signals  
3. Early research door + invent subset + produce Mark  
4. Army + Orders + one fight + supply modifier  
5. Acceptance checks §13  
6. Compact gen + second Faction pressure  
7. Expand toward Middle Era, neutrals, diplo, victories, Traction  

---

## Document control

| Version | Date | Notes |
|---------|------|-------|
| 1.0 | 2026-08-11 | Assembled from wayfinder issues #2–#15 |

**Wayfinder map:** keep [issue #1](https://github.com/zachariahtimothy/steampunk-4x/issues/1) as index; this file is the destination artifact.  
**Changes:** prefer PR + issue comment linking the ticket that forced the change; update Decisions on the map for material deltas.
