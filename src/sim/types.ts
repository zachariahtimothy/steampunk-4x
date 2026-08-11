/** Pure domain types — no React, no Pixi. */

export type ResourceId = 'coal' | 'ore' | 'timber' | 'food'

export type AxialCoord = {
  q: number
  r: number
}

export type ResourceNode = {
  id: string
  at: AxialCoord
  resource: ResourceId
  /** Extractable stock remaining (sandbox; infinite later via replenish rules). */
  remaining: number
}

export type GameState = {
  /** Turn index starting at 1. */
  turn: number
  /** Hand-authored map radius (axial distance from origin). */
  mapRadius: number
  nodes: ResourceNode[]
}

export function createInitialState(): GameState {
  return {
    turn: 1,
    mapRadius: 3,
    nodes: [
      { id: 'n-coal', at: { q: -2, r: 0 }, resource: 'coal', remaining: 40 },
      { id: 'n-ore', at: { q: 2, r: -1 }, resource: 'ore', remaining: 40 },
      { id: 'n-timber', at: { q: 0, r: 2 }, resource: 'timber', remaining: 40 },
      { id: 'n-food', at: { q: 1, r: -2 }, resource: 'food', remaining: 40 },
    ],
  }
}

export function endTurn(state: GameState): GameState {
  return {
    ...state,
    turn: state.turn + 1,
  }
}
