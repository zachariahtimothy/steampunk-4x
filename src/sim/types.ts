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

/** Content subset — sandbox is one Faction; compact can hold two. */
export type MatchPreset = 'sandbox' | 'compact'

export type FactionId = string

export type Faction = {
  id: FactionId
  name: string
}

export type Site = {
  id: string
  kind: SiteKind
  at: AxialCoord
  /** Faction that owns this site. */
  ownerFactionId: FactionId
  /** Extractor only: which deposit it works. */
  nodeId?: string
  /** Local stockpile (bulk + intermediates). */
  stock: Partial<Record<GoodId, number>>
  /** Hub factory finished goods (per-hub). */
  factoryOutput?: Partial<Record<FactoryRecipeId, number>>
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
  /** sandbox = one Faction; compact = two (same rules, content subset). */
  preset: MatchPreset
  factions: Faction[]
  playerFactionId: FactionId
  nodes: ResourceNode[]
  sites: Site[]
  routes: Route[]
  /**
   * Player-hub factory output (sandbox alias of that hub's factoryOutput).
   * Rival hubs store theirs on the Site.
   */
  factoryOutput: Partial<Record<FactoryRecipeId, number>>
  /** Last turn logistics log for UI/debug (serializable). */
  lastTickLog: string[]
  /** Intermediates crafted during the last endTurn refine phase. */
  lastRefineOutput: Partial<Record<IntermediateId, number>>
  /** Shortage Doctor alerts from the last diagnosis. */
  shortageAlerts: ShortageAlert[]
  /** Early Industrial invent door open. */
  inventUnlocked: boolean
  /** Current workshop draft loadout (slot → part id). */
  inventDraft: Record<string, string | null>
  /** Saved legal Mark designs. */
  markDesigns: import('./invent/validate').MarkDesign[]
  /** designId → produced count in pool. */
  producedMarks: Record<string, number>
  /** Strategy-map armies (player + dummy enemy). */
  armies: import('./combat/types').Army[]
  /** Last resolved fight preview/result for UI. */
  lastFight: import('./combat/types').FightResult | null
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
