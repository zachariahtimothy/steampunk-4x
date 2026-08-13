import type {
  BulkResourceId,
  FixClass,
  GameState,
  GoodId,
  IntermediateId,
  ShortageAlert,
  Site,
} from './types'
import { REFINE_RECIPES, stockOf } from './types'
import { playerHub } from './factions'

export type { FixClass, ShortageAlert }

const BULK_EXTRACTOR: Record<BulkResourceId, string> = {
  coal: 'ex-coal',
  ore: 'ex-ore',
  timber: 'ex-timber',
  food: 'ex-food',
}

const GOOD_LABEL: Record<GoodId, string> = {
  coal: 'Coal',
  ore: 'Ore',
  timber: 'Timber',
  food: 'Food',
  coke: 'Coke',
  plates: 'Plates',
  beams: 'Beams',
}

function hubOf(state: GameState): Site | undefined {
  return playerHub(state)
}

function hasRouteToHub(state: GameState, fromSiteId: string): boolean {
  const hub = hubOf(state)
  if (!hub) return false
  return state.routes.some(
    (r) => r.fromSiteId === fromSiteId && r.toSiteId === hub.id,
  )
}

function routeCapacityToHub(state: GameState, fromSiteId: string): number {
  const hub = hubOf(state)
  if (!hub) return 0
  return state.routes
    .filter((r) => r.fromSiteId === fromSiteId && r.toSiteId === hub.id)
    .reduce((sum, r) => sum + r.capacity, 0)
}

/**
 * Diagnose logistics pain after a tick (or anytime).
 * Pure: does not mutate state.
 */
export function diagnoseShortageDoctor(state: GameState): ShortageAlert[] {
  const alerts: ShortageAlert[] = []
  const hub = hubOf(state)
  if (!hub) return alerts

  const refineOut = state.lastRefineOutput

  for (const recipe of REFINE_RECIPES) {
    const extractorId = BULK_EXTRACTOR[recipe.input]
    const extractor = state.sites.find((s) => s.id === extractorId)
    const node = extractor?.nodeId
      ? state.nodes.find((n) => n.id === extractor.nodeId)
      : undefined
    const routed = hasRouteToHub(state, extractorId)
    const piled = extractor ? stockOf(extractor, recipe.input) : 0
    const hubBulk = stockOf(hub, recipe.input)
    const produced = refineOut[recipe.id] ?? 0
    const labelIn = GOOD_LABEL[recipe.input]
    const labelOut = GOOD_LABEL[recipe.id]

    if (node && node.remaining <= 0 && piled === 0 && hubBulk < recipe.inputQty) {
      alerts.push({
        id: `deposit-${recipe.input}`,
        severity: 'critical',
        title: `${labelIn} deposit exhausted`,
        detail: `No more ${labelIn} in the ground — ${labelOut} refine is starved.`,
        fixClass: 'exhausted_deposit',
        relatedGood: recipe.input,
      })
      continue
    }

    if (!routed && (piled > 0 || (node && node.remaining > 0))) {
      alerts.push({
        id: `route-${recipe.input}`,
        severity: piled > 0 || produced === 0 ? 'critical' : 'warning',
        title: `${labelOut} missing ${labelIn} feed`,
        detail: `Connect a Route from the ${labelIn.toLowerCase()} site to the Hub.`,
        fixClass: 'connect_route',
        relatedGood: recipe.input,
      })
      continue
    }

    if (routed && piled > 0) {
      const cap = routeCapacityToHub(state, extractorId)
      if (piled >= cap && produced === 0 && hubBulk < recipe.inputQty) {
        alerts.push({
          id: `cap-${recipe.input}`,
          severity: 'warning',
          title: `${labelIn} route congested`,
          detail: `Raise Route capacity or free capacity so ${labelIn} reaches the Hub.`,
          fixClass: 'raise_capacity',
          relatedGood: recipe.input,
        })
        continue
      }
    }

    if (
      routed &&
      produced === 0 &&
      hubBulk < recipe.inputQty &&
      piled === 0 &&
      node &&
      node.remaining > 0
    ) {
      alerts.push({
        id: `bulk-${recipe.input}`,
        severity: 'warning',
        title: `Hub short on ${labelIn}`,
        detail: `End turns to haul ${labelIn}, or check the ${labelIn.toLowerCase()} Route.`,
        fixClass: 'need_bulk_at_hub',
        relatedGood: recipe.input,
      })
    }
  }

  const frameCost = { coke: 1, plates: 2, beams: 1 } as const
  const missing: string[] = []
  for (const [good, need] of Object.entries(frameCost) as [
    IntermediateId,
    number,
  ][]) {
    if (stockOf(hub, good) < need) missing.push(`${need} ${GOOD_LABEL[good]}`)
  }
  if (missing.length > 0 && missing.length < 3) {
    const anyIntermediate =
      stockOf(hub, 'coke') + stockOf(hub, 'plates') + stockOf(hub, 'beams') > 0
    const anyRefine =
      (refineOut.coke ?? 0) + (refineOut.plates ?? 0) + (refineOut.beams ?? 0) > 0
    if (anyIntermediate || anyRefine) {
      alerts.push({
        id: 'factory-machine_frame',
        severity: 'warning',
        title: 'Factory short for Machine Frame',
        detail: `Need ${missing.join(', ')} at Hub.`,
        fixClass: 'need_intermediates',
        relatedGood: 'plates',
      })
    }
  }

  const rank = { critical: 0, warning: 1 }
  alerts.sort(
    (a, b) => rank[a.severity] - rank[b.severity] || a.id.localeCompare(b.id),
  )
  return alerts
}

export function fixClassLabel(fix: FixClass): string {
  switch (fix) {
    case 'connect_route':
      return 'Connect Route'
    case 'raise_capacity':
      return 'Raise capacity'
    case 'exhausted_deposit':
      return 'Deposit empty'
    case 'need_bulk_at_hub':
      return 'Haul bulk'
    case 'need_intermediates':
      return 'Refine more'
    default: {
      const _exhaustive: never = fix
      return _exhaustive
    }
  }
}
