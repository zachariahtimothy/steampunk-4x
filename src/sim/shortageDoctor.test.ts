import { describe, expect, it } from 'vitest'
import {
  addRoute,
  createInitialState,
  endTurn,
  removeRoute,
  stockOf,
} from './index'

function connectIndustrial(state: ReturnType<typeof createInitialState>) {
  let s = state
  for (const id of ['ex-coal', 'ex-ore', 'ex-timber'] as const) {
    const res = addRoute(s, id, 'hub')
    expect(res.ok).toBe(true)
    if (res.ok) s = res.state
  }
  return s
}

describe('Shortage Doctor (SPEC §13 acceptance #2)', () => {
  it('flags connect_route and drops refine output after cutting a Route', () => {
    let state = connectIndustrial(createInitialState())

    for (let i = 0; i < 4; i++) state = endTurn(state)
    const cokeBefore = state.lastRefineOutput.coke ?? 0
    expect(cokeBefore).toBeGreaterThan(0)
    expect(
      state.shortageAlerts.some((a) => a.id === 'route-coal'),
    ).toBe(false)

    const coalRoute = state.routes.find((r) => r.fromSiteId === 'ex-coal')!
    const cut = removeRoute(state, coalRoute.id)
    expect(cut.ok).toBe(true)
    if (cut.ok) state = cut.state

    // Immediate diagnosis: missing route while deposit still live.
    expect(
      state.shortageAlerts.some(
        (a) => a.fixClass === 'connect_route' && a.relatedGood === 'coal',
      ),
    ).toBe(true)

    state = endTurn(state)
    expect(state.lastRefineOutput.coke ?? 0).toBe(0)
    expect(state.lastRefineOutput.coke ?? 0).toBeLessThan(cokeBefore)
    expect(
      state.shortageAlerts.some(
        (a) =>
          a.fixClass === 'connect_route' &&
          a.relatedGood === 'coal' &&
          a.severity === 'critical',
      ),
    ).toBe(true)

    // Coal piles at extractor instead of refining.
    const ex = state.sites.find((s) => s.id === 'ex-coal')!
    expect(stockOf(ex, 'coal')).toBeGreaterThan(0)
  })

  it('reports exhausted_deposit when the node is gone', () => {
    let state = createInitialState()
    const coal = state.nodes.find((n) => n.id === 'n-coal')!
    coal.remaining = 0
    // re-create immutable-ish: mutate via clone path
    state = {
      ...state,
      nodes: state.nodes.map((n) =>
        n.id === 'n-coal' ? { ...n, remaining: 0 } : n,
      ),
    }
    const linked = addRoute(state, 'ex-coal', 'hub')
    if (linked.ok) state = linked.state
    state = endTurn(state)

    expect(
      state.shortageAlerts.some(
        (a) =>
          a.fixClass === 'exhausted_deposit' && a.relatedGood === 'coal',
      ),
    ).toBe(true)
  })

  it('healthy connected industry does not spam route alerts for coal/ore/timber', () => {
    let state = connectIndustrial(createInitialState())
    for (let i = 0; i < 3; i++) state = endTurn(state)

    const industrialRouteAlerts = state.shortageAlerts.filter(
      (a) =>
        a.fixClass === 'connect_route' &&
        (a.relatedGood === 'coal' ||
          a.relatedGood === 'ore' ||
          a.relatedGood === 'timber'),
    )
    expect(industrialRouteAlerts).toEqual([])
  })
})
