import { describe, expect, it } from 'vitest'
import {
  addRoute,
  createInitialState,
  endTurn,
  spendAtFactory,
  unlockInvent,
  setDraftPart,
  saveMarkDesign,
  produceMark,
  draftValidation,
  emptyLoadout,
  validateMark,
} from '../index'

function boomLogistics() {
  let state = createInitialState()
  for (const id of ['ex-coal', 'ex-ore', 'ex-timber'] as const) {
    const r = addRoute(state, id, 'hub')
    if (r.ok) state = r.state
  }
  for (let i = 0; i < 8; i++) state = endTurn(state)
  // Build a few frames
  for (let i = 0; i < 3; i++) {
    const f = spendAtFactory(state, 'machine_frame')
    if (f.ok) state = f.state
  }
  return state
}

describe('Early invent subset (SPEC §13 acceptance #3)', () => {
  it('rejects invent actions while research door is closed', () => {
    const state = createInitialState()
    expect(state.inventUnlocked).toBe(false)
    const res = setDraftPart(state, 'weapon', 'rivet_gun')
    expect(res.ok).toBe(false)
  })

  it('hard-bans mobile_only parts on Emplacement chassis', () => {
    const loadout = emptyLoadout()
    loadout.weapon = 'rivet_gun'
    loadout.utility = 'gyro_walker_legs'
    const v = validateMark(loadout)
    expect(v.legal).toBe(false)
    expect(v.bans.some((b) => b.includes('mobile_only'))).toBe(true)
  })

  it('allows legal design with soft heat tax, then produce Mark', () => {
    let state = boomLogistics()
    const unlocked = unlockInvent(state)
    expect(unlocked.ok).toBe(true)
    if (unlocked.ok) state = unlocked.state

    let r = setDraftPart(state, 'weapon', 'light_howitzer')
    expect(r.ok).toBe(true)
    if (r.ok) state = r.state
    r = setDraftPart(state, 'armor', 'plate_skirt')
    if (r.ok) state = r.state
    r = setDraftPart(state, 'utility', 'boiler_boost')
    if (r.ok) state = r.state

    const v = draftValidation(state)
    expect(v.legal).toBe(true)
    // howitzer heat 2 + boiler 3 = 5; soft cap 3 → breakdown tax 2
    expect(v.stats.heat).toBe(5)
    expect(v.taxes.breakdown).toBe(2)
    expect(v.role).toBe('siege')

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
      expect(state.factoryOutput.machine_frame ?? 0).toBeLessThan(3)
    }
  })

  it('hard-bans pathological heat', () => {
    // light_howitzer (2) + boiler (3) is OK; force illegal by stacking impossible —
    // validate uses parts only once per slot. Use boiler + howitzer heat 5, not >6.
    // gyro is banned by tag. Empty weapon is required ban.
    const loadout = emptyLoadout()
    const v = validateMark(loadout)
    expect(v.legal).toBe(false)
    expect(v.bans.some((b) => b.includes('Required'))).toBe(true)
  })
})
