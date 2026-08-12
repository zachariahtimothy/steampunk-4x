/** Pure domain types — no React, no Pixi. */

export type BulkResourceId = 'coal' | 'ore' | 'timber' | 'food'
export type IntermediateId = 'coke' | 'plates' | 'beams'
export type GoodId = BulkResourceId | IntermediateId
export type ResourceId = BulkResourceId

export type AxialCoord = {
  q: number
  r: number
}

export type ResourceNode = {
  id: string
  at: AxialCoord
  resource: BulkResourceId
  /** Extractable stock remaining (sandbox; infinite later via replenish rules). */
  remaining: number
}

/** Settlement / industrial site on the strategy map. */
export type SiteKind = 'hub' | 'extractor'

export type Site = {
  id: string
  kind: SiteKind
  at: AxialCoord
  /** Extractor only: which deposit it works. */
  nodeId?: string
  /** Local stockpile (bulk + intermediates). */
  stock: Partial<Record<GoodId, number>>
}

/**
 * Player-defined logistics link. Sandbox: tier-1 dual-use path assumed
 * between sites if the route exists (capacity is the gate).
 */
export type Route = {
  id: string
  fromSiteId: string
  toSiteId: string
  /** Max total goods moved this route per turn. */
  capacity: number
  /** Dual-use network tier tag (lite). */
  tier: 'road' | 'rail'
}

export type FactoryRecipeId = 'machine_frame'

/** Suggested fix class — not a full advisor brain (SPEC Shortage Doctor). */
export type FixClass =
  | 'connect_route'
  | 'raise_capacity'
  | 'exhausted_deposit'
  | 'need_bulk_at_hub'
  | 'need_intermediates'

export type ShortageAlert = {
  id: string
  severity: 'warning' | 'critical'
  title: string
  detail: string
  fixClass: FixClass
  relatedGood?: GoodId
}

export type GameState = {
  /** Turn index starting at 1. */
  turn: number
  /** Hand-authored map radius (axial distance from origin). */
  mapRadius: number
  nodes: ResourceNode[]
  sites: Site[]
  routes: Route[]
  /** Finished goods produced at the hub factory (not hauled). */
  factoryOutput: Partial<Record<FactoryRecipeId, number>>
  /** Last turn logistics log for UI/debug (serializable). */
  lastTickLog: string[]
  /** Intermediates crafted during the last endTurn refine phase. */
  lastRefineOutput: Partial<Record<IntermediateId, number>>
  /** Shortage Doctor alerts from the last diagnosis. */
  shortageAlerts: ShortageAlert[]
}

export const EXTRACT_RATE = 3
export const DEFAULT_ROUTE_CAPACITY = 6

/** Early refine recipes at the hub (inputs → output per craft). */
export const REFINE_RECIPES: {
  id: IntermediateId
  input: BulkResourceId
  inputQty: number
  outputQty: number
}[] = [
  { id: 'coke', input: 'coal', inputQty: 2, outputQty: 1 },
  { id: 'plates', input: 'ore', inputQty: 2, outputQty: 1 },
  { id: 'beams', input: 'timber', inputQty: 2, outputQty: 1 },
]

export const FACTORY_RECIPES: {
  id: FactoryRecipeId
  label: string
  cost: Partial<Record<GoodId, number>>
}[] = [
  {
    id: 'machine_frame',
    label: 'Machine Frame',
    cost: { coke: 1, plates: 2, beams: 1 },
  },
]

export function emptyStock(): Partial<Record<GoodId, number>> {
  return {}
}

export function stockOf(site: Site, good: GoodId): number {
  return site.stock[good] ?? 0
}

export function createInitialState(): GameState {
  const nodes: ResourceNode[] = [
    { id: 'n-coal', at: { q: -2, r: 0 }, resource: 'coal', remaining: 40 },
    { id: 'n-ore', at: { q: 2, r: -1 }, resource: 'ore', remaining: 40 },
    { id: 'n-timber', at: { q: 0, r: 2 }, resource: 'timber', remaining: 40 },
    { id: 'n-food', at: { q: 1, r: -2 }, resource: 'food', remaining: 40 },
  ]

  const sites: Site[] = [
    {
      id: 'hub',
      kind: 'hub',
      at: { q: 0, r: 0 },
      stock: emptyStock(),
    },
    {
      id: 'ex-coal',
      kind: 'extractor',
      at: { q: -2, r: 0 },
      nodeId: 'n-coal',
      stock: emptyStock(),
    },
    {
      id: 'ex-ore',
      kind: 'extractor',
      at: { q: 2, r: -1 },
      nodeId: 'n-ore',
      stock: emptyStock(),
    },
    {
      id: 'ex-timber',
      kind: 'extractor',
      at: { q: 0, r: 2 },
      nodeId: 'n-timber',
      stock: emptyStock(),
    },
    {
      id: 'ex-food',
      kind: 'extractor',
      at: { q: 1, r: -2 },
      nodeId: 'n-food',
      stock: emptyStock(),
    },
  ]

  return {
    turn: 1,
    mapRadius: 3,
    nodes,
    sites,
    routes: [],
    factoryOutput: {},
    lastTickLog: [],
    lastRefineOutput: {},
    shortageAlerts: [],
  }
}
