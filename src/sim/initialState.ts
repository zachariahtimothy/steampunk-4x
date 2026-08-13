import { createSandboxArmies } from './combat/actions'
import { ORDERS_MAX, type Army } from './combat/types'
import {
  PLAYER_FACTION,
  PLAYER_FACTION_ID,
  RIVAL_FACTION,
  RIVAL_FACTION_ID,
} from './factions'
import {
  emptyStock,
  type GameState,
  type ResourceNode,
  type Site,
} from './types'

export function createInitialState(): GameState {
  const nodes: ResourceNode[] = [
    { id: 'n-coal', at: { q: -2, r: 0 }, resource: 'coal', remaining: 40 },
    { id: 'n-ore', at: { q: 2, r: -1 }, resource: 'ore', remaining: 40 },
    { id: 'n-timber', at: { q: 0, r: 2 }, resource: 'timber', remaining: 40 },
    { id: 'n-food', at: { q: 1, r: -2 }, resource: 'food', remaining: 40 },
  ]

  const owner = PLAYER_FACTION_ID
  const sites: Site[] = [
    {
      id: 'hub',
      kind: 'hub',
      at: { q: 0, r: 0 },
      ownerFactionId: owner,
      stock: emptyStock(),
      factoryOutput: {},
    },
    {
      id: 'ex-coal',
      kind: 'extractor',
      at: { q: -2, r: 0 },
      ownerFactionId: owner,
      nodeId: 'n-coal',
      stock: emptyStock(),
    },
    {
      id: 'ex-ore',
      kind: 'extractor',
      at: { q: 2, r: -1 },
      ownerFactionId: owner,
      nodeId: 'n-ore',
      stock: emptyStock(),
    },
    {
      id: 'ex-timber',
      kind: 'extractor',
      at: { q: 0, r: 2 },
      ownerFactionId: owner,
      nodeId: 'n-timber',
      stock: emptyStock(),
    },
    {
      id: 'ex-food',
      kind: 'extractor',
      at: { q: 1, r: -2 },
      ownerFactionId: owner,
      nodeId: 'n-food',
      stock: emptyStock(),
    },
  ]

  return {
    turn: 1,
    mapRadius: 3,
    preset: 'sandbox',
    factions: [{ ...PLAYER_FACTION }],
    playerFactionId: PLAYER_FACTION_ID,
    nodes,
    sites,
    routes: [],
    factoryOutput: {},
    lastTickLog: [],
    lastRefineOutput: {},
    shortageAlerts: [],
    inventUnlocked: false,
    inventDraft: {
      weapon: null,
      armor: null,
      utility: null,
    },
    markDesigns: [],
    producedMarks: {},
    armies: createSandboxArmies(),
    lastFight: null,
  }
}

/** Hand fixture: two Factions, two hubs. Not Compact map gen (#33). */
export function createDualFactionState(): GameState {
  const state = createInitialState()
  state.preset = 'compact'
  state.mapRadius = 5
  state.factions = [{ ...PLAYER_FACTION }, { ...RIVAL_FACTION }]

  const rivalHub: Site = {
    id: 'hub-rival',
    kind: 'hub',
    at: { q: 4, r: -2 },
    ownerFactionId: RIVAL_FACTION_ID,
    stock: emptyStock(),
    factoryOutput: {},
  }
  state.sites = [...state.sites, rivalHub]

  const line = (
    id: string,
    label: string,
    atk: number,
    def: number,
  ): Army['units'][number] => ({
    id,
    label,
    role: 'line',
    attack: atk,
    defense: def,
    fuelUse: 0,
  })

  const rivalArmy: Army = {
    id: 'army-rival',
    owner: 'enemy',
    ownerFactionId: RIVAL_FACTION_ID,
    name: 'Workshop Column',
    at: { ...rivalHub.at },
    units: [
      line('r-line-1', 'Workshop Line', 2, 2),
      line('r-line-2', 'Workshop Line', 2, 2),
    ],
    orders: ORDERS_MAX,
    ordersMax: ORDERS_MAX,
    hp: 12,
    hpMax: 12,
  }

  state.armies = [
    ...state.armies.filter((a) => a.owner === 'player'),
    rivalArmy,
  ]
  return state
}
