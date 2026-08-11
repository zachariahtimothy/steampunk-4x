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
A player-directed machine or weapon Mark built within authored parts, tags, and stat budgets; research-gated; Co-pilot may suggest legal builds and flavor only.
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

**Industrial Supremacy**:
Victory Path sealed by completing the Foundry Crown after industrial milestone projects.
_Avoid_: Economic victory (too vague), score win

**Foundry Crown**:
The final industrial victory project; public when started; completable under logistics readiness.
_Avoid_: Wonder (too Civ-generic as the only term)

**Invention Apex**:
Victory Path sealed by completing the World Machine after required showcase Inventions.
_Avoid_: Science victory

**World Machine**:
The final invention victory project; public when started.
_Avoid_: Spaceship (Civ residue), doomsday device (unless flavor)

**Domination**:
Victory Path sealed by holding a control threshold of Settlements/strategic hubs for Y turns.
_Avoid_: Conquest-only elimination as the definition

**Endgame Signal**:
Public knowledge that a Faction has entered a Victory Path's final phase (path band known; exact metrics gated).
_Avoid_: Score screen

**Mark**:
A concrete designed machine or weapon model produced from a chassis plus installed parts under rails.
_Avoid_: Prototype (unless meaning pre-produce design), unit type (implementation)

**Chassis Family**:
An authored movement/frame class that defines slot layout and hard constraints (e.g. Rail, Walker).
_Avoid_: Hull only, body type

**Part**:
An authored module with tags, costs, and stat/tax effects installed into a chassis slot.
_Avoid_: Component when meaning UI chrome

**Laboratory Points**:
Design-capacity currency from research buildings/activities required for mid/complex Marks alongside logistics goods.
_Avoid_: Science (too Civ-generic), mana

**Co-pilot**:
In-game AI assist that proposes legal Marks from the authored catalog for a player goal; player must approve.
_Avoid_: Autodesigner as default, generative mechanics

**Army**:
A strategy-map stack with a hard role-slot cap representing fielded Composition.
_Avoid_: Stack as the only term, blob

**Orders**:
Per-army action budget for move, attack, brace, and related combat/maneuver verbs.
_Avoid_: AP only, mana

**Line / Shock-Raid / Siege / Support**:
The four v1 combat roles that fill Army slots and drive the counter wheel.
_Avoid_: Infantry/cavalry/artillery as the only taxonomy (flavor OK)

**Raiders**:
Core Neutral Threat that primarily steals or destroys cargo on Routes and Convoys.
_Avoid_: Barbarians (Civ residue) as the only term

**Rogue Automata**:
Core Neutral Threat of runaway or abandoned machines that primarily contest hubs, extractors, and industrial works.
_Avoid_: Monsters, aliens

**Crisis**:
A timed modular neutral event (ash storm, labor strike, unstable prototype) distinct from standing core threats.
_Avoid_: Random event only, disaster movie

**Signature Tool**:
The single unique building, policy, or Mark branch allowed per Faction under light asymmetry.
_Avoid_: Race kit, civilization ability sprawl

**Cinder Crown / Sootwright Compact / Ironway Syndicate / Ashwalker Freeholds**:
Working names for the four v1 starter Factions.
_Avoid_: Treating names as final IP

**Anchor / March**:
Traction Settlement modes — Anchored for production/defense, March for movement at vulnerability and upkeep cost.
_Avoid_: Deployed/undeployed only as jargon without these names

**Track Scar**:
Environmental/logistics damage left by off-network Traction movement.
_Avoid_: Pollution only (related but broader)

**Region**:
A generation-scale area of the continent containing starts, deposits, or corridors.
_Avoid_: Province only, state

**Corridor**:
A strategic path between regions (gate, crossing, isthmus) that dual-use networks and armies contest.
_Avoid_: Lane only

**Strategic Hub**:
A map site that matters for logistics and counts toward Domination control.
_Avoid_: VP only, objective (too FPS)

**Invention License**:
A diplomatic deal granting rights to produce a Mark family or chassis line under shared invent rails.
_Avoid_: Patent as the only term (flavor OK)

**Passage**:
Negotiated right to move goods or armies through a Corridor or rail segment.
_Avoid_: Open borders only (too Civ-generic as sole name)

**Stance**:
Simple pairwise diplomatic temperature (Hostile to Partner) driven by contracts, borders, and victory threat.
_Avoid_: Granular modifier soup

