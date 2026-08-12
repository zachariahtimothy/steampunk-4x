# Sandbox v1 — Acceptance record (SPEC §13)

**Status:** Pass (automated + manual play path)  
**Milestone:** [Sandbox v1](https://github.com/zachariahtimothy/steampunk-4x/milestone/1)  
**Spec:** [SPEC.md §13](./spec/SPEC.md#13-vertical-slice)

## Fantasy proven

**Logistics is power** and **invent a Mark and field it** in a supply-linked fight.

## Automated proof

```bash
npm test
```

Suite includes `src/sim/acceptance/sandboxV1.test.ts` covering checks 1–6.

| # | Check | Evidence |
|---|--------|----------|
| 1 | Route extractors → processors → factory without cheats | Routes + endTurn refine + `spendAtFactory` |
| 2 | Cut/starve input → Shortage Doctor + reduced output | Disconnect coal → coke refine 0 + `connect_route` alert |
| 3 | Unlock invent → legal Mark → produce | Research door, bans, save + produce |
| 4 | Field Mark; Orders fight; OOS worse than in-supply | Field, march, preview, cut routes, attack |
| 5 | No new major system beyond SPEC | Guard: no traction/diplo/coPilot/era keys; subset chassis only |
| 6 | Teachable in ~30–90 min | Golden path ≤ 25 deliberate actions |

## Manual play path (~15–40 min first time)

1. `npm install && npm run dev`
2. **Connect** coal, ore, timber routes
3. **End turn** several times — watch hub stock + last refine
4. **Produce Machine Frame**
5. Optional: disconnect coal — Shortage Doctor + coke drops; reconnect
6. **Unlock Early Invent** → design Emplacement (try Walker Legs = ban)
7. **Save Mark** → **Produce** → **Field**
8. **March to contact** → read preview → **Attack**
9. Disconnect routes → preview power drops (out of supply)

## Real vs stub (v1)

**Real:** hex sandbox, routes, early intermediates, factory, Shortage Doctor, invent subset, armies/Orders, supply-linked fight, field Mark.

**Stubbed / absent:** Traction, complex tier, Mid/Late eras, victories, full diplo, multi-faction AI, automata/crises, Co-pilot, naval, full catalog, production art, engine lock.

## Next

Slice **v2 — Compact** (SPEC §13 ladder): compact map gen + second Faction pressure, same rules/feature flags.
