import type {
  FactoryRecipeId,
  FactionId,
  GameState,
  GoodId,
  IntermediateId,
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
import { diagnoseShortageDoctor } from './shortageDoctor'
import { cloneGameState } from './clone'
import { phaseArmiesEndTurn } from './combat/actions'
import { hubForFaction } from './factions'

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

/**
 * Early refine at every hub: convert bulk → intermediates while inputs last.
 * Returned counts are the **player** hub only (sandbox Shortage Doctor).
 */
export function phaseRefine(
  state: GameState,
  log: string[],
): Partial<Record<IntermediateId, number>> {
  const playerProduced: Partial<Record<IntermediateId, number>> = {}
  const hubs = state.sites.filter((s) => s.kind === 'hub')

  for (const hub of hubs) {
    for (const recipe of REFINE_RECIPES) {
      let crafts = 0
      while (stockOf(hub, recipe.input) >= recipe.inputQty) {
        takeStock(hub, recipe.input, recipe.inputQty)
        addStock(hub, recipe.id, recipe.outputQty)
        crafts += 1
      }
      if (crafts > 0) {
        const qty = crafts * recipe.outputQty
        log.push(
          `Refine ${crafts}× ${recipe.id} at ${hub.id} (−${crafts * recipe.inputQty} ${recipe.input})`,
        )
        if (hub.ownerFactionId === state.playerFactionId) {
          playerProduced[recipe.id] = (playerProduced[recipe.id] ?? 0) + qty
        }
      }
    }
  }
  return playerProduced
}

/**
 * Full logistics tick then advance turn.
 * Order: extract → haul → refine → Shortage Doctor (manufacture is player spend).
 */
export function endTurn(state: GameState): GameState {
  const next = cloneGameState(state)
  const log: string[] = []
  phaseExtract(next, log)
  phaseHaul(next, log)
  const refined = phaseRefine(next, log)
  phaseArmiesEndTurn(next, log)
  next.lastRefineOutput = refined
  next.lastTickLog = log
  next.turn += 1
  next.shortageAlerts = diagnoseShortageDoctor(next)
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
  const next = cloneGameState(state)
  next.routes = [...next.routes, route]
  next.shortageAlerts = diagnoseShortageDoctor(next)
  return { ok: true, state: next }
}

export function removeRoute(state: GameState, routeId: string): ActionResult {
  if (!state.routes.some((r) => r.id === routeId)) {
    return { ok: false, error: 'Route not found' }
  }
  const next = cloneGameState(state)
  next.routes = next.routes.filter((r) => r.id !== routeId)
  next.shortageAlerts = diagnoseShortageDoctor(next)
  return { ok: true, state: next }
}

/** Spend hub stock at that Faction's factory to produce a finished good. */
export function spendAtFactory(
  state: GameState,
  recipeId: FactoryRecipeId,
  factionId?: FactionId,
): ActionResult {
  const recipe = FACTORY_RECIPES.find((r) => r.id === recipeId)
  if (!recipe) return { ok: false, error: 'Unknown factory recipe' }

  const next = cloneGameState(state)
  const owner = factionId ?? next.playerFactionId
  const hub = hubForFaction(next, owner)
  if (!hub) return { ok: false, error: 'No hub' }

  for (const [good, qty] of Object.entries(recipe.cost) as [GoodId, number][]) {
    if (stockOf(hub, good) < qty) {
      next.shortageAlerts = diagnoseShortageDoctor(next)
      return {
        ok: false,
        error: `Need ${qty} ${good} at hub (have ${stockOf(hub, good)})`,
      }
    }
  }
  for (const [good, qty] of Object.entries(recipe.cost) as [GoodId, number][]) {
    takeStock(hub, good, qty)
  }
  if (!hub.factoryOutput) hub.factoryOutput = {}
  hub.factoryOutput[recipeId] = (hub.factoryOutput[recipeId] ?? 0) + 1
  if (owner === next.playerFactionId) {
    next.factoryOutput[recipeId] = (next.factoryOutput[recipeId] ?? 0) + 1
  }
  next.lastTickLog = [
    `Factory produced 1 ${recipe.label}`,
    ...next.lastTickLog,
  ]
  next.shortageAlerts = diagnoseShortageDoctor(next)
  return { ok: true, state: next }
}

export function hubStock(
  state: GameState,
  factionId?: FactionId,
): Partial<Record<GoodId, number>> {
  const hub = hubForFaction(state, factionId ?? state.playerFactionId)
  return hub ? { ...hub.stock } : {}
}
