# Soot Empire

Working title for the single-player turn-based strategy: build industrial power, advance through eras gated by logistics, win via multiple paths. Soft alt-Earth; grimy industrial steampunk.

## Language

**Match**:
One full single-player game on a procedural map, played to a victory condition.
_Avoid_: Run, session (use **Sitting** for real-world time), campaign (reserved if scenario mode is added later)

**Sitting**:
A real-world play period within a Match (e.g. one evening).
_Avoid_: Session (ambiguous with game session)

**Faction**:
A playable or AI power with light asymmetry on a shared rules skeleton.
_Avoid_: Race, civ, civilization (unless lore voice), empire (use when meaning territory-as-whole)

**Settlement**:
A fixed or (rarely) mobile population/industrial center the player develops.
_Avoid_: City (too specific when outposts exist), base

**Traction Settlement**:
A rare/late/special Settlement that can move on the strategy map.
_Avoid_: Traction city as the only term if non-city settlements can move

**Logistics Chain**:
The extract → haul → refine → manufacture path that feeds industry and machines.
_Avoid_: Economy (too broad), supply line (military-only connotation)

**Invention**:
A player-directed machine or weapon built within authored parts, tags, and stat budgets (optionally assisted by in-game AI generation for combination/flavor).
_Avoid_: Tech (use **Advance** or **Era tech** for tree unlocks), mod

**Advance**:
An unlock in the progression structure (eras + logistics gates).
_Avoid_: Tech when meaning a crafted Invention

**Era**:
A readable progression band; real power gates also depend on logistics readiness.
_Avoid_: Age only (synonym OK in flavor text)

**Composition**:
The mix of unit roles on the strategy map that drives combat outcomes via counters.
_Avoid_: Army ball, stack (implementation smell)

**Neutral Threat**:
A non-Faction pressure (automata, raiders, environment, etc.) that contests the map.
_Avoid_: Creep, monster (unless a specific threat type)

**Victory Path**:
One of several equal-priority ways to win a Match (domination, industrial supremacy, invention race, etc.).
_Avoid_: Score only, win con (jargon)

**Coke**:
Refined coal product used as industrial fuel and smelting input; a key early hauled intermediate.
_Avoid_: Charcoal (unless a Faction variant)

**Plate**:
Refined metal intermediate used in manufacture and Invention budgets.
_Avoid_: Ingot (synonym OK in flavor), steel (too specific as umbrella)

**Beam**:
Refined timber intermediate for construction and heavy frames.
_Avoid_: Lumber when meaning the intermediate output

**Precision Part**:
Complex-tier intermediate unlocked by Era + logistics gate; feeds advanced machines/Inventions.
_Avoid_: Gadget (flavor only)

**Compound Fuel**:
Complex-tier fuel intermediate for advanced machines, Traction, or high-power systems.
_Avoid_: Oil (unless added as a resource later)

**Route**:
Player-defined logistics link moving bulk and key intermediates along the dual-use network.
_Avoid_: Belt, conveyor

**Convoy**:
Optional cargo or military supply movement handled like a unit, for emergency or army supply — not the default economy path.
_Avoid_: Caravan as the only term

**Shortage Doctor**:
UI guidance that flags missing logistics inputs and suggests fixes without requiring spreadsheet play.
_Avoid_: Advisor (too generic)

