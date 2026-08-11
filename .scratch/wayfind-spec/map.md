# Wayfinder map: Steampunk industrial 4X spec

Label: `wayfinder:map`

## Destination

A sharp **game design / product spec** that future-you (with AI help) can use to implement a **vertical slice without inventing a major system**. Scope: **single-player**, **hobby/friends**, **turn-based 4X**, steampunk industrial fantasy. Not a shipped game and not a full engine choice — the spec is the destination.

## Notes

- **Tracker:** local markdown (see `docs/agents/issue-tracker.md`). GitHub later.
- **Skills every session:** `wayfinder`, `grilling`, `domain-modeling`; `research` / `prototype` when ticket type says so.
- **Domain language:** root `CONTEXT.md` — update when terms crystallize.
- **Phone-friendly:** prefer one grilling question at a time when Zach is on mobile.
- **Inspirations (tone/machinery, not IP clones):** *Wild Wild West*, *Mortal Engines*; rare traction settlements.
- **Pillars locked in charting (not ticket answers — standing constraints):**
  - Turn-based 4X; continental/planetary canvas; target Match length ~4–8 hours to start
  - Primary fantasy: **industrial power** (factories, logistics, machines)
  - Tone: industrial grimy power (soot, empire, cost of coal/labor)
  - World: soft alt-Earth (familiar vibes, fictional map)
  - Economy spine: **logistics-first** (extract → haul → refine → manufacture)
  - Progression: eras for readability + **logistics/industry gates** as real locks
  - Combat: important but not every sitting; **strategy-map Composition/counters**; no separate battle layer
  - Opposition: AI Factions + Neutral Threats
  - Factions: light asymmetry, shared skeleton
  - Victory: multiple equal paths, weighted toward industry + invention
  - Diplomacy: logistics (routes, coal, ports, passage) + tech/invention leverage
  - Player Invention: **on rails** (parts/tags/stat budgets; authored rules); in-game AI may assist combination/flavor
  - Traction Settlements: **special/rare/late**, not default for all cities
  - Success bar: vertical slice implementable without inventing a major system

## Decisions so far

<!-- index only — one line per resolved ticket -->

_(none yet)_

## Not yet specified

- Exact resource set and recipe graph depth
- Measurable definitions for each Victory Path
- Invention part catalog, tags, budget math, and when AI assist appears in a Match
- Unit role roster and counter matrix
- Neutral Threat roster and spawn/pressure rules
- Faction trait patterns and how many Factions in a Match
- Traction Settlement unlock costs, movement rules, and logistics interactions
- Map generation: size bands, choke points, resource placement for 4–8h continental play
- Diplomacy verb list and AI deal logic depth
- Vertical slice boundary (which systems must be real vs stubbed)
- Presentation/camera (2D hex vs other) — only as far as the spec must constrain feel
- Audio/art direction beyond grimy industrial steampunk
- Save/load, UX, accessibility
- Engine/tech stack (explicitly later effort unless a ticket proves the spec cannot proceed)
- Multiplayer (out unless destination redrawn)
- Full Mortal Engines “municipal Darwinism” predation as default (we chose rare traction, not predator-cities-as-core)

## Out of scope

- Shipping a complete commercial product in this effort
- Competitive multiplayer / ranked netcode as a first-class destination
- Real-time strategy as the primary time model
- Separate tactical battle maps
- Open-ended LLM mechanics generation (freeform runtime rules invention)
- Full Factorio-depth factory sandbox inside the 4X
- Faithful adaptations of *Mortal Engines* or *Wild Wild West* IP
