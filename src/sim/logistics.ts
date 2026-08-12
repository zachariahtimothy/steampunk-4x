import type {
  FactoryRecipeId,
  GameState,
  GoodId,
  Route,
  Site,
} from './types'
import {
  DEFAULT_ROUTE_CAPACITY,
  EXTRACT_RATE,
  FACTORY_RECIPES,
  REFINE_RECIPES,
  stockOf,
} from './types'

function cloneState(state: GameState): GameState {
  return {
    ...state,
    nodes: state.nodes.map((n) => ({ ...n })),
    sites: state.sites.map((s) => ({
      ...s,
      stock: { ...s.stock },
      at: { ...s.at },
    })),
    routes: state.routes.map((r) => ({ ...r })),
    factoryOutput: { ...state.factoryOutput },
    lastTickLog: [...state.lastTickLog],
  }
}

function getSite(state: GameState, id: string): Site {
  const site = state.sites.find((s) => s.id === id)
  if (!site) throw new Error(`Unknown site: ${id}`)
  return site
}

function addStock(site: Site, good: GoodId, qty: number): void {
  if (qty === 0) return
  site.stock[good] = stockOf(site, good) + qty
}

function takeStock(site: Site, good: GoodId, qty: number): boolean {
  if (stockOf(site, good) < qty) return false
  site.stock[good] = stockOf(site, good) - qty
  if (site.stock[good] === 0) delete site.stock[good]
  return true
}

const HAUL_ORDER: GoodId[] = [
  'coal',
  'ore',
  'timber',
  'food',
  'coke',
  'plates',
  'beams',
]

/** Extract bulk at extractor sites from linked deposits. */
export function phaseExtract(state: GameState, log: string[]): void {
  for (const site of state.sites) {
    if (site.kind !== 'extractor' || !site.nodeId) continue
    const node = state.nodes.find((n) => n.id === site.nodeId)
    if (!node || node.remaining <= 0) continue
    const qty = Math.min(EXTRACT_RATE, node.remaining)
    node.remaining -= qty
    addStock(site, node.resource, qty)
    log.push(`Extract ${qty} ${node.resource} at ${site.id}`)
  }
}

/** Move goods along Routes up to each route's capacity. */
export function phaseHaul(state: GameState, log: string[]): void {
  for (const route of state.routes) {
    const from = getSite(state, route.fromSiteId)
    const to = getSite(state, route.toSiteId)
    let remainingCap = route.capacity
    for (const good of HAUL_ORDER) {
      if (remainingCap <= 0) break
      const available = stockOf(from, good)
      if (available <= 0) continue
      const moved = Math.min(available, remainingCap)
      takeStock(from, good, moved)
      addStock(to, good, moved)
      remainingCap -= moved
      log.push(
        `Haul ${moved} ${good} ${route.fromSiteId}→${route.toSiteId} (${route.tier})`,
      )
    }
  }
}

/** Early refine at hub: convert bulk → intermediates while inputs last. */
export function phaseRefine(state: GameState, log: string[]): void {
  const hub = state.sites.find((s) => s.kind === 'hub')
  if (!hub) return

  for (const recipe of REFINE_RECIPES) {
    let crafts = 0
    while (stockOf(hub, recipe.input) >= recipe.inputQty) {
      takeStock(hub, recipe.input, recipe.inputQty)
      addStock(hub, recipe.id, recipe.outputQty)
      crafts += 1
    }
    if (crafts > 0) {
      log.push(
        `Refine ${crafts}× ${recipe.id} at hub (−${crafts * recipe.inputQty} ${recipe.input})`,
      )
    }
  }
}

/**
 * Full logistics tick then advance turn.
 * Order: extract → haul → refine (manufacture is a player spend action).
 */
export function endTurn(state: GameState): GameState {
  const next = cloneState(state)
  const log: string[] = []
  phaseExtract(next, log)
  phaseHaul(next, log)
  phaseRefine(next, log)
  next.lastTickLog = log
  next.turn += 1
  return next
}

export type ActionResult =
  | { ok: true; state: GameState }
  | { ok: false; error: string }

export function addRoute(
  state: GameState,
  fromSiteId: string,
  toSiteId: string,
  opts?: { capacity?: number; tier?: 'road' | 'rail' },
): ActionResult {
  if (fromSiteId === toSiteId) {
    return { ok: false, error: 'Route must connect two different sites' }
  }
  try {
    getSite(state, fromSiteId)
    getSite(state, toSiteId)
  } catch {
    return { ok: false, error: 'Unknown site on route' }
  }
  const exists = state.routes.some(
    (r) => r.fromSiteId === fromSiteId && r.toSiteId === toSiteId,
  )
  if (exists) {
    return { ok: false, error: 'Route already exists' }
  }

  const route: Route = {
    id: `route-${fromSiteId}-${toSiteId}`,
    fromSiteId,
    toSiteId,
    capacity: opts?.capacity ?? DEFAULT_ROUTE_CAPACITY,
    tier: opts?.tier ?? 'road',
  }
  const next = cloneState(state)
  next.routes = [...next.routes, route]
  return { ok: true, state: next }
}

export function removeRoute(state: GameState, routeId: string): ActionResult {
  if (!state.routes.some((r) => r.id === routeId)) {
    return { ok: false, error: 'Route not found' }
  }
  const next = cloneState(state)
  next.routes = next.routes.filter((r) => r.id !== routeId)
  return { ok: true, state: next }
}

/** Spend hub stock at the factory to produce a finished good. */
export function spendAtFactory(
  state: GameState,
  recipeId: FactoryRecipeId,
): ActionResult {
  const recipe = FACTORY_RECIPES.find((r) => r.id === recipeId)
  if (!recipe) return { ok: false, error: 'Unknown factory recipe' }

  const next = cloneState(state)
  const hub = next.sites.find((s) => s.kind === 'hub')
  if (!hub) return { ok: false, error: 'No hub' }

  for (const [good, qty] of Object.entries(recipe.cost) as [GoodId, number][]) {
    if (stockOf(hub, good) < qty) {
      return {
        ok: false,
        error: `Need ${qty} ${good} at hub (have ${stockOf(hub, good)})`,
      }
    }
  }
  for (const [good, qty] of Object.entries(recipe.cost) as [GoodId, number][]) {
    takeStock(hub, good, qty)
  }
  next.factoryOutput[recipeId] = (next.factoryOutput[recipeId] ?? 0) + 1
  next.lastTickLog = [
    `Factory produced 1 ${recipe.label}`,
    ...next.lastTickLog,
  ]
  return { ok: true, state: next }
}

export function hubStock(state: GameState): Partial<Record<GoodId, number>> {
  const hub = state.sites.find((s) => s.kind === 'hub')
  return hub ? { ...hub.stock } : {}
}
