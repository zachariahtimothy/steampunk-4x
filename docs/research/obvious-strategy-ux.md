# Research: Obvious strategy UX (Civ / StarCraft class)

**Question:** How do games like Civilization and StarCraft make general gameplay obvious without a tutorial video — and what does that imply for *Soot Empire* Sandbox?

**Prompting observation (Zach):** One scrollable side panel packing every system is bad. UX must make the loop obvious in the product.

**Date:** 2026-08-12  
**Unit:** Separate from steampunk skin; presentation / interaction architecture only (no new sim systems).

---

## 1. What “obvious without a tutorial” actually means

Players of Civ / classic StarCraft still use guides for *optimization*. What they rarely need is a video for **where to look and what kind of thing to click first**. That clarity comes from **spatial information architecture**, not from a coach paragraph.

High-trust patterns (industry UX + long-running strategy chrome):

| Pattern | What it does | Source / lineage |
|--------|----------------|------------------|
| **World is the stage** | Largest fixed region is the map; chrome is peripheral bands, not a document | Universal RTS/4X chrome (SC bottom bar, Civ map-first frame) |
| **Always-on economy pulse** | Core stocks (minerals/gas; science/gold/faith ribbons) live in a **fixed non-scrolling** strip | SC resource strip; Civ HUD ribbons (community still tells new players to “show yields”) |
| **Selection → verbs** | Empty or quiet command area until you select a unit/city; then **only legal actions for that object** | SC2 “command card” / available-actions model (also used in SC2LE agent observations: actions gated by selection) |
| **Needs-orders affordance** | Units/cities that still need input are **visually noisy** on the map; End Turn is secondary until clear | Civ unit flags / “next unit” cycle; glowing end-turn when idle |
| **Progressive disclosure** | First show few important options; bury advanced on secondary surfaces | Nielsen Norman Group progressive disclosure; game onboarding literature (defer complexity, optional skip) |
| **Mode by context, not by scroll position** | Build / research / fight are **different panels or modes** opened from map or bar — not equal-weight chapters in one list | Strategy UI histories: side bar (Westwood) vs bottom command (Blizzard) vs widget pull-outs — all **zoned**, not one long form |

Secondary sources that restate the same design consensus (useful, not primary ownership of the games): strategy UI surveys (e.g. treeform’s battle-UI history), progressive disclosure explainers (NN/g), games-UX onboarding pieces (first hour teaches core loop by doing, not by wall-of-text).

---

## 2. Why our Sandbox fails that bar today

Current shell (`App.tsx`):

- Map + **one scrollable right column**
- Sections stacked with equal visual weight: Combat → Invention → Shortage Doctor → Hub stock → Factory → Routes → Last tick → Sandbox path checklist

Failure modes vs the table above:

1. **Document UX, not command UX** — understanding requires reading and scrolling, not looking at the map and clicking the obvious object.
2. **No selection model** — routes/army/invent are not “what I clicked on the map”; they’re always-on form controls.
3. **Economy is buried** — hub stock is mid-scroll; StarCraft/Civ put the pulse where the eye already rests every second.
4. **Primary verb (connect extractors / end turn / next army action) competes with everything** — checklist at the bottom is a confession that the layout doesn’t teach.
5. **Coach-on-top of the same scroll** would paper over the architecture problem Zach named.

---

## 3. Implications for *Soot Empire* (sandbox constraints)

Fantasy to make obvious without a video:

**Logistics is power** → see deposits on map → link them to hub → watch stocks move → spend at factory → invent/field → fight while supplied.

Design moves that match Civ/SC-class obviousness **without** cloning their IP chrome:

1. **Rezone the shell** — map-dominant; fixed top: turn + goods pulse + end turn; context region (bottom or side) that is **short and mode-based**, not a full-game manual.
2. **Map is the noun picker** — click hub / extractor / army / (later) route endpoint → context panel shows **that** object’s verbs and status only.
3. **Routes as map verbs** — connect/disconnect from selected extractor (or drag later); don’t lead with a list of Connect buttons above the fold of a novel.
4. **Attention cues on the world** — unconnected extractors, idle army with orders left, Doctor critical — badges on hexes/sites, not only text in a list.
5. **End Turn as “I’m done”** — enabled/emphasized when no blocking “you still have a free obvious setup action” if we want rails; or always available but never the only labeled next step.
6. **Invent/factory as station panels** — open from hub selection or a single Works button; not permanent equal peers to combat forever.
7. **Optional thin coach** only after layout works — one line “Select a coal pit on the map” beats a permanent essay. Docs remain secondary.

Out of scope for this research (and likely for the UX unit): new sim rules, full tech tree UX, multiplayer command cards, production art.

---

## 4. Recommended product stance (for grilling)

- **Primary deliverable:** interaction architecture + shell rezone so first Sitting is obvious **from layout**.
- **Not primary:** tutorial modal, README walkthrough, or “Now/Why/Next” strip bolted onto the current scroll stack.
- **Success test:** cold player can connect logistics, run a turn, and see stock change **without reading the Sandbox path list** (list can remain as advanced help).

---

## 5. Open decisions (human)

Captured for the playability unit grill — not answered here:

- Bottom command deck vs right context inspector (SC-like vs Civ-like hybrid)
- How much first-Sitting progressive disclosure vs full sandbox always reachable
- Whether map click selection is in v1 of this unit or staged

---

## References (entry points)

- Progressive disclosure (NN/g): https://www.nngroup.com/articles/progressive-disclosure/
- Games UX / first-hour onboarding framing: https://uxdesign.cc/games-ux-building-the-right-onboarding-experience-a6e99cf4aaea
- Strategy battle UI lineage (side bar vs bottom bar vs widgets): https://medium.com/@treeform/strategy-game-battle-ui-3b313ffd3769
- SC2LE notes on selection-gated available actions (agent-facing, mirrors human command card): https://ar5iv.labs.arxiv.org/html/1708.04782
- Civ community HUD literacy (yields/ribbons as “must enable” knowledge) — e.g. beginner guide discourse around Civ VI UI overview videos and official Civ VII beginners materials on civilization.2k.com

*Note: Franchise UIs are references for **information architecture**, not art or feature clones.*
