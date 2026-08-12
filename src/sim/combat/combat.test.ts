import { describe, expect, it } from 'vitest'
import {
  addRoute,
  attackWithOrders,
  createInitialState,
  endTurn,
  fieldMark,
  isInSupply,
  marchToContact,
  playerArmy,
  previewFight,
  produceMark,
  removeRoute,
  saveMarkDesign,
  setDraftPart,
  spendAtFactory,
  unlockInvent,
} from '../index'

function prepMarkReady() {
  let state = createInitialState()
  for (const id of ['ex-coal', 'ex-ore', 'ex-timber'] as const) {
    const r = addRoute(state, id, 'hub')
    if (r.ok) state = r.state
  }
  for (let i = 0; i < 8; i++) state = endTurn(state)
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
  const prod = produceMark(state, designId)
  if (prod.ok) state = prod.state
  return { state, designId }
}

describe('Army + Orders + supply fight (SPEC §13 acceptance #4)', () => {
  it('fields a Mark into the player army', () => {
    let { state, designId } = prepMarkReady()
    const before = playerArmy(state)!.units.length
    const res = fieldMark(state, designId)
    expect(res.ok).toBe(true)
    if (res.ok) state = res.state
    expect(playerArmy(state)!.units.length).toBe(before + 1)
    expect(state.producedMarks[designId] ?? 0).toBe(0)
  })

  it('out-of-supply combat power is worse than in-supply', () => {
    let { state, designId } = prepMarkReady()
    const f = fieldMark(state, designId)
    if (f.ok) state = f.state

    let m = marchToContact(state)
    if (m.ok) state = m.state
    expect(isInSupply(state, playerArmy(state)!)).toBe(true)
    const supplied = previewFight(state)!
    expect(supplied.playerInSupply).toBe(true)

    // Drop every route → army at contact is no longer network-linked to hub.
    for (const route of [...state.routes]) {
      const cut = removeRoute(state, route.id)
      if (cut.ok) state = cut.state
    }
    expect(isInSupply(state, playerArmy(state)!)).toBe(false)
    const starved = previewFight(state)!
    expect(starved.playerInSupply).toBe(false)
    expect(starved.playerPower).toBeLessThan(supplied.playerPower)
  })

  it('attack spends Orders and damages deterministically', () => {
    let { state, designId } = prepMarkReady()
    const fielded = fieldMark(state, designId)
    if (fielded.ok) state = fielded.state
    const marched = marchToContact(state)
    if (marched.ok) state = marched.state

    const enemyHpBefore = state.armies.find((a) => a.owner === 'enemy')!.hp
    const ordersBefore = playerArmy(state)!.orders
    const preview = previewFight(state)!

    const atk = attackWithOrders(state)
    expect(atk.ok).toBe(true)
    if (atk.ok) state = atk.state

    expect(playerArmy(state)!.orders).toBe(ordersBefore - 2)
    expect(state.armies.find((a) => a.owner === 'enemy')!.hp).toBeLessThan(
      enemyHpBefore,
    )
    expect(state.lastFight?.playerPower).toBe(preview.playerPower)
  })
})
