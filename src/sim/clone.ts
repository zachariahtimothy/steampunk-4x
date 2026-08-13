import type { GameState } from './types'

/** Deep-ish clone of serializable game state for pure updates. */
export function cloneGameState(state: GameState): GameState {
  return {
    ...state,
    nodes: state.nodes.map((n) => ({ ...n, at: { ...n.at } })),
    factions: state.factions.map((f) => ({ ...f })),
    sites: state.sites.map((s) => ({
      ...s,
      stock: { ...s.stock },
      at: { ...s.at },
      factoryOutput: s.factoryOutput ? { ...s.factoryOutput } : undefined,
    })),
    routes: state.routes.map((r) => ({ ...r })),
    factoryOutput: { ...state.factoryOutput },
    lastTickLog: [...state.lastTickLog],
    lastRefineOutput: { ...state.lastRefineOutput },
    shortageAlerts: state.shortageAlerts.map((a) => ({ ...a })),
    inventUnlocked: state.inventUnlocked,
    inventDraft: { ...state.inventDraft },
    markDesigns: state.markDesigns.map((d) => ({
      ...d,
      loadout: { ...d.loadout },
      stats: { ...d.stats },
      taxes: { ...d.taxes },
      totalCost: { ...d.totalCost },
    })),
    producedMarks: { ...state.producedMarks },
    armies: state.armies.map((a) => ({
      ...a,
      at: { ...a.at },
      units: a.units.map((u) => ({ ...u })),
    })),
    lastFight: state.lastFight ? { ...state.lastFight } : null,
  }
}
