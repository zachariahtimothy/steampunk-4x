import type { Faction, FactionId, GameState, Site } from './types'

/** Sandbox / Compact player Faction (SPEC §8 roster, no Signature Tool). */
export const PLAYER_FACTION_ID: FactionId = 'cinder-crown'

/** Second Faction for dual-hub Compact-off tests (SPEC §8 roster). */
export const RIVAL_FACTION_ID: FactionId = 'sootwright-compact'

export const PLAYER_FACTION: Faction = {
  id: PLAYER_FACTION_ID,
  name: 'Cinder Crown',
}

export const RIVAL_FACTION: Faction = {
  id: RIVAL_FACTION_ID,
  name: 'Sootwright Compact',
}

export function hubForFaction(
  state: GameState,
  factionId: FactionId,
): Site | undefined {
  return state.sites.find(
    (s) => s.kind === 'hub' && s.ownerFactionId === factionId,
  )
}

export function playerHub(state: GameState): Site | undefined {
  return hubForFaction(state, state.playerFactionId)
}
