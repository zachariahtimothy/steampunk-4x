import { describe, expect, it } from 'vitest'
import {
  cloneGameState,
  createDualFactionState,
  createInitialState,
  endTurn,
  hubForFaction,
  hubStock,
  PLAYER_FACTION_ID,
  RIVAL_FACTION_ID,
  spendAtFactory,
  stockOf,
} from './index'

describe('Dual-Faction sim state (issue #32)', () => {
  it('sandbox is a one-Faction subset: sites and player army have that owner', () => {
    const state = createInitialState()
    expect(state.factions).toHaveLength(1)
    expect(state.playerFactionId).toBe(state.factions[0]!.id)
    expect(state.preset).toBe('sandbox')
    expect(state.sites.length).toBeGreaterThan(0)
    expect(
      state.sites.every((s) => s.ownerFactionId === state.playerFactionId),
    ).toBe(true)
    const player = state.armies.find((a) => a.owner === 'player')
    expect(player?.ownerFactionId).toBe(state.playerFactionId)
  })

  it('can represent two Factions with owned hubs and armies', () => {
    const state = createDualFactionState()
    expect(state.factions.map((f) => f.id).sort()).toEqual(
      [PLAYER_FACTION_ID, RIVAL_FACTION_ID].sort(),
    )
    expect(state.playerFactionId).toBe(PLAYER_FACTION_ID)

    const hubs = state.sites.filter((s) => s.kind === 'hub')
    expect(hubs).toHaveLength(2)
    expect(hubs.map((h) => h.ownerFactionId).sort()).toEqual(
      [PLAYER_FACTION_ID, RIVAL_FACTION_ID].sort(),
    )

    const playerArmy = state.armies.find(
      (a) => a.ownerFactionId === PLAYER_FACTION_ID,
    )
    const rivalArmy = state.armies.find(
      (a) => a.ownerFactionId === RIVAL_FACTION_ID,
    )
    expect(playerArmy).toBeDefined()
    expect(rivalArmy).toBeDefined()
    expect(playerArmy!.id).not.toBe(rivalArmy!.id)
  })

  it('cloneGameState keeps owners, second hub stock, and per-hub factory output', () => {
    const state = createDualFactionState()
    const rival = hubForFaction(state, RIVAL_FACTION_ID)!
    rival.stock.coal = 8
    rival.factoryOutput = { machine_frame: 2 }

    const cloned = cloneGameState(state)
    const clonedRival = hubForFaction(cloned, RIVAL_FACTION_ID)!
    expect(clonedRival.ownerFactionId).toBe(RIVAL_FACTION_ID)
    expect(clonedRival.stock.coal).toBe(8)
    expect(clonedRival.factoryOutput?.machine_frame).toBe(2)
    expect(cloned.factions).toHaveLength(2)
    expect(cloned.playerFactionId).toBe(PLAYER_FACTION_ID)

    clonedRival.stock.coal = 0
    clonedRival.factoryOutput!.machine_frame = 0
    cloned.factions.pop()
    expect(hubForFaction(state, RIVAL_FACTION_ID)!.stock.coal).toBe(8)
    expect(
      hubForFaction(state, RIVAL_FACTION_ID)!.factoryOutput?.machine_frame,
    ).toBe(2)
    expect(state.factions).toHaveLength(2)
  })

  it('refine and hubStock are per-hub / per-Faction', () => {
    const state = createDualFactionState()
    const playerHubSite = hubForFaction(state, PLAYER_FACTION_ID)!
    const rivalHubSite = hubForFaction(state, RIVAL_FACTION_ID)!
    playerHubSite.stock.coal = 4
    rivalHubSite.stock.coal = 6

    const next = endTurn(state)

    expect(hubStock(next, PLAYER_FACTION_ID).coke).toBe(2)
    expect(hubStock(next, RIVAL_FACTION_ID).coke).toBe(3)
    expect(hubStock(next, PLAYER_FACTION_ID).coal ?? 0).toBe(0)
    expect(hubStock(next, RIVAL_FACTION_ID).coal ?? 0).toBe(0)
    // Default hubStock is the player hub (sandbox path).
    expect(hubStock(next).coke).toBe(2)
    expect(stockOf(hubForFaction(next, PLAYER_FACTION_ID)!, 'coke')).toBe(2)
    expect(stockOf(hubForFaction(next, RIVAL_FACTION_ID)!, 'coke')).toBe(3)
  })

  it('factory spend is per-hub and does not steal the other Faction', () => {
    let state = createDualFactionState()
    const playerHubSite = hubForFaction(state, PLAYER_FACTION_ID)!
    const rivalHubSite = hubForFaction(state, RIVAL_FACTION_ID)!
    playerHubSite.stock = { coke: 1, plates: 2, beams: 1 }
    rivalHubSite.stock = { coke: 1, plates: 2, beams: 1 }

    const playerBuilt = spendAtFactory(state, 'machine_frame', PLAYER_FACTION_ID)
    expect(playerBuilt.ok).toBe(true)
    if (playerBuilt.ok) state = playerBuilt.state

    expect(state.factoryOutput.machine_frame).toBe(1)
    expect(
      hubForFaction(state, PLAYER_FACTION_ID)!.factoryOutput?.machine_frame,
    ).toBe(1)
    expect(
      hubForFaction(state, RIVAL_FACTION_ID)!.factoryOutput?.machine_frame ?? 0,
    ).toBe(0)
    expect(stockOf(hubForFaction(state, RIVAL_FACTION_ID)!, 'plates')).toBe(2)

    const rivalBuilt = spendAtFactory(state, 'machine_frame', RIVAL_FACTION_ID)
    expect(rivalBuilt.ok).toBe(true)
    if (rivalBuilt.ok) state = rivalBuilt.state

    expect(state.factoryOutput.machine_frame).toBe(1)
    expect(
      hubForFaction(state, RIVAL_FACTION_ID)!.factoryOutput?.machine_frame,
    ).toBe(1)
    expect(stockOf(hubForFaction(state, RIVAL_FACTION_ID)!, 'plates')).toBe(0)
    expect(stockOf(hubForFaction(state, PLAYER_FACTION_ID)!, 'plates')).toBe(0)
  })

  it('sim has no React or Pixi imports', async () => {
    const { readdirSync, readFileSync, statSync } = await import('node:fs')
    const { join } = await import('node:path')
    const root = join(process.cwd(), 'src/sim')
    const files: string[] = []
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const p = join(dir, name)
        if (statSync(p).isDirectory()) walk(p)
        else if (name.endsWith('.ts') && !name.endsWith('.test.ts')) files.push(p)
      }
    }
    walk(root)
    expect(files.length).toBeGreaterThan(5)
    for (const file of files) {
      const text = readFileSync(file, 'utf8')
      expect(text, file).not.toMatch(/from ['"]react['"]/)
      expect(text, file).not.toMatch(/from ['"]pixi\.js['"]/)
      expect(text, file).not.toMatch(/from ['"]@pixi\//)
    }
  })
})
