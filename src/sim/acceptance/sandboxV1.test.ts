/**
 * Sandbox v1 end-to-end acceptance (SPEC §13).
 * Scripted scenario — no cheats, pure sim public API only.
 */
import { describe, expect, it } from 'vitest'
import {
  addRoute,
  attackWithOrders,
  createInitialState,
  endTurn,
  fieldMark,
  hubStock,
  isInSupply,
  marchToContact,
  playerArmy,
  previewFight,
  produceMark,
  removeRoute,
  SANDBOX_CHASSIS,
  SANDBOX_PARTS,
  saveMarkDesign,
  setDraftPart,
  spendAtFactory,
  unlockInvent,
} from '../index'

function connectIndustrial(state: ReturnType<typeof createInitialState>) {
  let s = state
  for (const id of ['ex-coal', 'ex-ore', 'ex-timber'] as const) {
    const res = addRoute(s, id, 'hub', { tier: 'road' })
    expect(res.ok, `route ${id}`).toBe(true)
    if (res.ok) s = res.state
  }
  return s
}

function runTurns(state: ReturnType<typeof createInitialState>, n: number) {
  let s = state
  for (let i = 0; i < n; i++) s = endTurn(s)
  return s
}

describe('Sandbox v1 acceptance pass (SPEC §13)', () => {
  it('§13.1 Route extractors → refine → factory without cheats', () => {
    let state = createInitialState()
    expect(state.mapRadius).toBeGreaterThan(0)
    expect(state.nodes.length).toBeGreaterThanOrEqual(3)
    expect(state.armies.some((a) => a.owner === 'enemy')).toBe(true)

    state = connectIndustrial(state)
    expect(state.routes.every((r) => r.tier === 'road' || r.tier === 'rail')).toBe(
      true,
    )

    state = runTurns(state, 6)
    const hub = hubStock(state)
    expect((hub.coke ?? 0) + (hub.plates ?? 0) + (hub.beams ?? 0)).toBeGreaterThan(
      0,
    )

    const frame = spendAtFactory(state, 'machine_frame')
    expect(frame.ok).toBe(true)
    if (frame.ok) {
      state = frame.state
      expect(state.factoryOutput.machine_frame).toBeGreaterThanOrEqual(1)
    }
  })

  it('§13.2 Cut/starve input → Shortage Doctor + reduced refine output', () => {
    let state = connectIndustrial(createInitialState())
    state = runTurns(state, 4)
    const cokeBefore = state.lastRefineOutput.coke ?? 0
    expect(cokeBefore).toBeGreaterThan(0)

    const coalRoute = state.routes.find((r) => r.fromSiteId === 'ex-coal')!
    const cut = removeRoute(state, coalRoute.id)
    expect(cut.ok).toBe(true)
    if (cut.ok) state = cut.state

    expect(
      state.shortageAlerts.some(
        (a) => a.fixClass === 'connect_route' && a.relatedGood === 'coal',
      ),
    ).toBe(true)

    state = endTurn(state)
    expect(state.lastRefineOutput.coke ?? 0).toBe(0)
    expect(state.lastRefineOutput.coke ?? 0).toBeLessThan(cokeBefore)
    expect(
      state.shortageAlerts.some((a) => a.fixClass === 'connect_route'),
    ).toBe(true)
  })

  it('§13.3 Unlock invent → legal Mark → produce', () => {
    let state = connectIndustrial(createInitialState())
    state = runTurns(state, 8)
    for (let i = 0; i < 2; i++) {
      const f = spendAtFactory(state, 'machine_frame')
      expect(f.ok).toBe(true)
      if (f.ok) state = f.state
    }

    const unlocked = unlockInvent(state)
    expect(unlocked.ok).toBe(true)
    if (unlocked.ok) state = unlocked.state
    expect(state.inventUnlocked).toBe(true)
    expect(SANDBOX_CHASSIS.family).toBe('emplacement')
    expect(SANDBOX_PARTS.length).toBeGreaterThan(3)

    // Illegal: walker legs on emplacement
    let d = setDraftPart(state, 'weapon', 'rivet_gun')
    if (d.ok) state = d.state
    d = setDraftPart(state, 'utility', 'gyro_walker_legs')
    if (d.ok) state = d.state
    const banned = saveMarkDesign(state, 'Illegal Walker')
    expect(banned.ok).toBe(false)

    d = setDraftPart(state, 'utility', null)
    if (d.ok) state = d.state
    d = setDraftPart(state, 'weapon', 'light_howitzer')
    if (d.ok) state = d.state
    d = setDraftPart(state, 'armor', 'plate_skirt')
    if (d.ok) state = d.state

    const saved = saveMarkDesign(state, 'Ash Throat')
    expect(saved.ok).toBe(true)
    if (saved.ok) state = saved.state
    expect(state.markDesigns).toHaveLength(1)

    const designId = state.markDesigns[0]!.id
    const produced = produceMark(state, designId)
    expect(produced.ok).toBe(true)
    if (produced.ok) {
      state = produced.state
      expect(state.producedMarks[designId]).toBe(1)
    }
  })

  it('§13.4 Field Mark; Orders fight; OOS worse than in-supply', () => {
    let state = connectIndustrial(createInitialState())
    state = runTurns(state, 8)
    for (let i = 0; i < 2; i++) {
      const f = spendAtFactory(state, 'machine_frame')
      if (f.ok) state = f.state
    }
    let u = unlockInvent(state)
    if (u.ok) state = u.state
    let d = setDraftPart(state, 'weapon', 'light_howitzer')
    if (d.ok) state = d.state
    d = setDraftPart(state, 'armor', 'plate_skirt')
    if (d.ok) state = d.state
    const saved = saveMarkDesign(state, 'Ash Throat')
    if (saved.ok) state = saved.state
    const designId = state.markDesigns[0]!.id
    const produced = produceMark(state, designId)
    if (produced.ok) state = produced.state

    const fielded = fieldMark(state, designId)
    expect(fielded.ok).toBe(true)
    if (fielded.ok) state = fielded.state
    expect(playerArmy(state)!.units.some((x) => x.markDesignId === designId)).toBe(
      true,
    )

    const marched = marchToContact(state)
    expect(marched.ok).toBe(true)
    if (marched.ok) state = marched.state

    expect(isInSupply(state, playerArmy(state)!)).toBe(true)
    const inSup = previewFight(state)!
    expect(inSup.playerInSupply).toBe(true)

    for (const route of [...state.routes]) {
      const cut = removeRoute(state, route.id)
      if (cut.ok) state = cut.state
    }
    expect(isInSupply(state, playerArmy(state)!)).toBe(false)
    const oos = previewFight(state)!
    expect(oos.playerPower).toBeLessThan(inSup.playerPower)

    // Reconnect one route for a real attack still in contact
    const recon = addRoute(state, 'ex-ore', 'hub')
    if (recon.ok) state = recon.state
    // May be in supply again via ore site — either way attack must resolve
    const enemyHp = state.armies.find((a) => a.owner === 'enemy')!.hp
    const atk = attackWithOrders(state)
    expect(atk.ok).toBe(true)
    if (atk.ok) {
      state = atk.state
      expect(state.lastFight).not.toBeNull()
      expect(state.armies.find((a) => a.owner === 'enemy')!.hp).toBeLessThan(
        enemyHp,
      )
      expect(playerArmy(state)!.orders).toBeLessThan(playerArmy(state)!.ordersMax)
    }
  })

  it('§13.5 systems stay within SPEC surface (no major inventions)', () => {
    // Structural guardrails: public sim surface matches vertical-slice real list.
    const state = createInitialState()
    const realSystems = {
      hexMap: state.mapRadius >= 1,
      routes: true,
      earlyIntermediates: ['coke', 'plates', 'beams'] as const,
      factory: true,
      shortageDoctor: true,
      inventSubset: SANDBOX_CHASSIS.family === 'emplacement',
      armiesOrders: state.armies.length >= 2,
      coPilotStubbed: true, // no co-pilot API exported
      tractionAbsent: true,
      victoryAbsent: !('victory' in state),
      complexTierAbsent: true,
    }
    expect(realSystems.hexMap).toBe(true)
    expect(realSystems.inventSubset).toBe(true)
    expect(realSystems.armiesOrders).toBe(true)
    expect(realSystems.victoryAbsent).toBe(true)
    // Stub list must not appear as first-class state keys
    for (const forbidden of [
      'traction',
      'diplomacy',
      'coPilot',
      'complexGoods',
      'midEra',
      'lateEra',
    ] as const) {
      expect(Object.prototype.hasOwnProperty.call(state, forbidden)).toBe(false)
    }
  })

  it('§13.6 scripted scenario is short (teachable path length)', () => {
    // Count player-facing actions in the golden path — not wall-clock.
    // Target: under ~25 deliberate actions (fits a 30–90 min sitting with reading).
    const actions: string[] = []
    let state = createInitialState()
    for (const id of ['ex-coal', 'ex-ore', 'ex-timber'] as const) {
      const r = addRoute(state, id, 'hub')
      if (r.ok) state = r.state
      actions.push(`connect ${id}`)
    }
    for (let i = 0; i < 6; i++) {
      state = endTurn(state)
      actions.push('endTurn')
    }
    const frame = spendAtFactory(state, 'machine_frame')
    if (frame.ok) state = frame.state
    actions.push('factory')
    const unlocked = unlockInvent(state)
    if (unlocked.ok) state = unlocked.state
    actions.push('unlockInvent')
    for (const [slot, part] of [
      ['weapon', 'light_howitzer'],
      ['armor', 'plate_skirt'],
    ] as const) {
      const d = setDraftPart(state, slot, part)
      if (d.ok) state = d.state
      actions.push(`draft ${slot}`)
    }
    const saved = saveMarkDesign(state, 'Ash Throat')
    if (saved.ok) state = saved.state
    actions.push('saveMark')
    // may need another frame
    if ((state.factoryOutput.machine_frame ?? 0) < 1) {
      const f2 = spendAtFactory(state, 'machine_frame')
      if (f2.ok) state = f2.state
      actions.push('factory2')
    }
    const designId = state.markDesigns[0]!.id
    const prod = produceMark(state, designId)
    if (prod.ok) state = prod.state
    actions.push('produceMark')
    const field = fieldMark(state, designId)
    if (field.ok) state = field.state
    actions.push('fieldMark')
    const march = marchToContact(state)
    if (march.ok) state = march.state
    actions.push('march')
    const atk = attackWithOrders(state)
    if (atk.ok) state = atk.state
    actions.push('attack')

    expect(actions.length).toBeLessThanOrEqual(25)
    expect(state.lastFight).not.toBeNull()
    expect(playerArmy(state)!.units.some((u) => u.markDesignId)).toBe(true)
  })
})
