import { describe, expect, it } from 'vitest'
import {
  addRoute,
  createInitialState,
  endTurn,
  hubStock,
  removeRoute,
  spendAtFactory,
  stockOf,
} from './index'

describe('logistics happy path (SPEC §13 acceptance #1)', () => {
  it('extracts, hauls on Routes, refines early intermediates, spends at factory', () => {
    let state = createInitialState()

    // No routes: extract piles at extractors; hub stays empty of bulk.
    state = endTurn(state)
    const coalEx = state.sites.find((s) => s.id === 'ex-coal')!
    expect(stockOf(coalEx, 'coal')).toBe(3)
    expect(hubStock(state).coal ?? 0).toBe(0)

    // Draw Routes: bulk extractors → hub (tier-1 road).
    for (const id of ['ex-coal', 'ex-ore', 'ex-timber'] as const) {
      const res = addRoute(state, id, 'hub', { tier: 'road', capacity: 6 })
      expect(res.ok).toBe(true)
      if (res.ok) state = res.state
    }

    // Enough turns to fill refine inputs and craft intermediates.
    for (let i = 0; i < 6; i++) {
      state = endTurn(state)
    }

    const hub = hubStock(state)
    expect(hub.coke ?? 0).toBeGreaterThanOrEqual(1)
    expect(hub.plates ?? 0).toBeGreaterThanOrEqual(2)
    expect(hub.beams ?? 0).toBeGreaterThanOrEqual(1)

    const built = spendAtFactory(state, 'machine_frame')
    expect(built.ok).toBe(true)
    if (built.ok) {
      state = built.state
      expect(state.factoryOutput.machine_frame).toBe(1)
      // Costs deducted at hub
      expect(hubStock(state).plates ?? 0).toBe((hub.plates ?? 0) - 2)
    }
  })

  it('does not haul without a Route', () => {
    let state = createInitialState()
    state = endTurn(state)
    state = endTurn(state)
    expect(hubStock(state).coal ?? 0).toBe(0)
    expect(stockOf(state.sites.find((s) => s.id === 'ex-coal')!, 'coal')).toBe(6)
  })

  it('removeRoute stops further haul', () => {
    let state = createInitialState()
    const added = addRoute(state, 'ex-coal', 'hub')
    expect(added.ok).toBe(true)
    if (added.ok) state = added.state
    state = endTurn(state)
    const afterOne = hubStock(state).coal ?? 0
    expect(afterOne).toBeGreaterThan(0)

    const routeId = state.routes[0]!.id
    const removed = removeRoute(state, routeId)
    expect(removed.ok).toBe(true)
    if (removed.ok) state = removed.state

    const coalBefore = hubStock(state).coal ?? 0
    state = endTurn(state)
    // Hub coal only changes via refine (consumes coal) or haul; no haul ⇒ coal should not increase.
    expect(hubStock(state).coal ?? 0).toBeLessThanOrEqual(coalBefore)
  })

  it('factory spend fails when short intermediates', () => {
    const state = createInitialState()
    const res = spendAtFactory(state, 'machine_frame')
    expect(res.ok).toBe(false)
  })
})
