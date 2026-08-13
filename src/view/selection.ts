import type { Army } from '../sim/combat/types'
import type { GameState, Route, Site } from '../sim/types'

export type MapSelection =
  | { kind: 'site'; id: string }
  | { kind: 'army'; id: string }
  | { kind: 'route'; id: string }

export type AttentionTarget = MapSelection & {
  reason: 'unlinked' | 'orders' | 'doctor'
  label: string
}

export function selectionKey(sel: MapSelection | null): string {
  if (!sel) return ''
  return `${sel.kind}:${sel.id}`
}

export function sameSelection(
  a: MapSelection | null,
  b: MapSelection | null,
): boolean {
  return selectionKey(a) === selectionKey(b)
}

export function siteById(state: GameState, id: string): Site | undefined {
  return state.sites.find((s) => s.id === id)
}

export function armyById(state: GameState, id: string): Army | undefined {
  return state.armies.find((a) => a.id === id)
}

export function routeById(state: GameState, id: string): Route | undefined {
  return state.routes.find((r) => r.id === id)
}

export function routeToHub(
  state: GameState,
  fromSiteId: string,
): Route | undefined {
  return state.routes.find(
    (r) => r.fromSiteId === fromSiteId && r.toSiteId === 'hub',
  )
}

export function isExtractorLinked(state: GameState, siteId: string): boolean {
  return Boolean(routeToHub(state, siteId))
}

/** Map-attention queue for Next attention (deterministic order). */
export function listAttention(state: GameState): AttentionTarget[] {
  const out: AttentionTarget[] = []

  const extractors = state.sites.filter((s) => s.kind === 'extractor')
  const order = ['ex-coal', 'ex-ore', 'ex-timber', 'ex-food']
  extractors
    .slice()
    .sort((a, b) => {
      const ia = order.indexOf(a.id)
      const ib = order.indexOf(b.id)
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib)
    })
    .forEach((site) => {
      if (!isExtractorLinked(state, site.id)) {
        const node = state.nodes.find((n) => n.id === site.nodeId)
        const res = node?.resource ?? 'resource'
        out.push({
          kind: 'site',
          id: site.id,
          reason: 'unlinked',
          label: `Link ${res} extractor`,
        })
      }
    })

  const player = state.armies.find((a) => a.owner === 'player')
  if (player && player.orders > 0) {
    out.push({
      kind: 'army',
      id: player.id,
      reason: 'orders',
      label: `${player.name} has Orders`,
    })
  }

  if (state.shortageAlerts.some((a) => a.severity === 'critical')) {
    out.push({
      kind: 'site',
      id: 'hub',
      reason: 'doctor',
      label: 'Critical shortage at Hub',
    })
  }

  return out
}

export function nextAttention(
  state: GameState,
  current: MapSelection | null,
): MapSelection | null {
  const list = listAttention(state)
  if (list.length === 0) return null
  if (!current) return { kind: list[0]!.kind, id: list[0]!.id }

  const idx = list.findIndex(
    (t) => t.kind === current.kind && t.id === current.id,
  )
  const next = list[(idx + 1) % list.length]!
  return { kind: next.kind, id: next.id }
}
