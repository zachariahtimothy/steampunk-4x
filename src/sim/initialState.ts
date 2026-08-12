import { createSandboxArmies } from './combat/actions'
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
