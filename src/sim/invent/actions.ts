import type { GameState, GoodId } from '../types'
import { stockOf } from '../types'
import { diagnoseShortageDoctor } from '../shortageDoctor'
import { cloneGameState } from '../clone'
import { SANDBOX_CHASSIS } from './catalog'
import {
  emptyLoadout,
  validateMark,
  type MarkDesign,
  type MarkLoadout,
} from './validate'

export type ActionResult =
  | { ok: true; state: GameState }
  | { ok: false; error: string }

function takeHub(state: GameState, good: GoodId, qty: number): boolean {
  const hub = state.sites.find((s) => s.kind === 'hub')
  if (!hub || stockOf(hub, good) < qty) return false
  hub.stock[good] = stockOf(hub, good) - qty
  if (hub.stock[good] === 0) delete hub.stock[good]
  return true
}

/** Lite Early Industrial research door — sandbox scenario flag. */
export function unlockInvent(state: GameState): ActionResult {
  if (state.inventUnlocked) {
    return { ok: false, error: 'Invent already unlocked' }
  }
  const next = cloneGameState(state)
  next.inventUnlocked = true
  next.lastTickLog = ['Early Invent unlocked (research door)', ...next.lastTickLog]
  return { ok: true, state: next }
}

export function setDraftPart(
  state: GameState,
  slotId: string,
  partId: string | null,
): ActionResult {
  if (!state.inventUnlocked) {
    return { ok: false, error: 'Invent is locked — open the research door first' }
  }
  const slot = SANDBOX_CHASSIS.slots.find((s) => s.id === slotId)
  if (!slot) return { ok: false, error: `Unknown slot ${slotId}` }

  const next = cloneGameState(state)
  next.inventDraft = { ...next.inventDraft, [slotId]: partId }
  return { ok: true, state: next }
}

export function clearDraft(state: GameState): ActionResult {
  const next = cloneGameState(state)
  next.inventDraft = emptyLoadout()
  return { ok: true, state: next }
}

export function saveMarkDesign(
  state: GameState,
  name: string,
): ActionResult {
  if (!state.inventUnlocked) {
    return { ok: false, error: 'Invent is locked' }
  }
  const trimmed = name.trim()
  if (!trimmed) return { ok: false, error: 'Name required' }

  const validation = validateMark(state.inventDraft)
  if (!validation.legal) {
    return {
      ok: false,
      error: `Illegal Mark: ${validation.bans.join('; ')}`,
    }
  }

  const design: MarkDesign = {
    id: `mark-${state.markDesigns.length + 1}-${Date.now().toString(36)}`,
    name: trimmed,
    chassisId: SANDBOX_CHASSIS.id,
    loadout: { ...state.inventDraft },
    stats: validation.stats,
    taxes: validation.taxes,
    totalCost: validation.totalCost,
    role: validation.role,
  }

  const next = cloneGameState(state)
  next.markDesigns = [...next.markDesigns, design]
  next.lastTickLog = [
    `Saved Mark design "${design.name}" (${design.role})`,
    ...next.lastTickLog,
  ]
  return { ok: true, state: next }
}

/** Produce one copy of a saved Mark at the hub factory. */
export function produceMark(state: GameState, designId: string): ActionResult {
  if (!state.inventUnlocked) {
    return { ok: false, error: 'Invent is locked' }
  }
  const design = state.markDesigns.find((d) => d.id === designId)
  if (!design) return { ok: false, error: 'Unknown Mark design' }

  const validation = validateMark(design.loadout)
  if (!validation.legal) {
    return { ok: false, error: 'Design no longer legal' }
  }

  const chassis = SANDBOX_CHASSIS
  const frames = state.factoryOutput.machine_frame ?? 0
  if (frames < chassis.frameCost) {
    return {
      ok: false,
      error: `Need ${chassis.frameCost} Machine Frame (have ${frames})`,
    }
  }

  const next = cloneGameState(state)
  const hub = next.sites.find((s) => s.kind === 'hub')
  if (!hub) return { ok: false, error: 'No hub' }

  for (const [good, qty] of Object.entries(validation.totalCost) as [
    GoodId,
    number,
  ][]) {
    if (stockOf(hub, good) < qty) {
      next.shortageAlerts = diagnoseShortageDoctor(next)
      return {
        ok: false,
        error: `Need ${qty} ${good} at hub (have ${stockOf(hub, good)})`,
      }
    }
  }

  for (const [good, qty] of Object.entries(validation.totalCost) as [
    GoodId,
    number,
  ][]) {
    takeHub(next, good, qty)
  }
  next.factoryOutput.machine_frame =
    (next.factoryOutput.machine_frame ?? 0) - chassis.frameCost
  if (next.factoryOutput.machine_frame === 0) {
    delete next.factoryOutput.machine_frame
  }

  next.producedMarks[designId] = (next.producedMarks[designId] ?? 0) + 1
  next.shortageAlerts = diagnoseShortageDoctor(next)
  next.lastTickLog = [
    `Produced Mark "${design.name}" (ATK ${design.stats.attack}/DEF ${design.stats.defense})`,
    ...next.lastTickLog,
  ]
  return { ok: true, state: next }
}

export function draftValidation(state: GameState) {
  return validateMark(state.inventDraft as MarkLoadout)
}
