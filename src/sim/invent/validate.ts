import type { GoodId } from '../types'
import {
  partById,
  SANDBOX_CHASSIS,
  type ChassisDef,
  type CombatRole,
  type PartDef,
} from './catalog'

/** Slot id → installed part id (null = empty). */
export type MarkLoadout = Record<string, string | null>

export type MarkDesign = {
  id: string
  name: string
  chassisId: string
  /** Filled slots. */
  loadout: MarkLoadout
  /** Snapshot at save time. */
  stats: MarkStats
  taxes: MarkTaxes
  totalCost: Partial<Record<GoodId, number>>
  role: CombatRole
}

export type MarkStats = {
  attack: number
  defense: number
  heat: number
  fuelUse: number
}

export type MarkTaxes = {
  /** Soft tax: extra breakdown pressure from heat over soft cap. */
  breakdown: number
  /** Soft tax: ongoing coke-class fuel pressure. */
  fuelPressure: number
}

export type ValidationResult = {
  legal: boolean
  bans: string[]
  taxes: MarkTaxes
  stats: MarkStats
  totalCost: Partial<Record<GoodId, number>>
  role: CombatRole
  parts: PartDef[]
}

function sumCost(
  parts: PartDef[],
  chassis: ChassisDef,
): Partial<Record<GoodId, number>> {
  const total: Partial<Record<GoodId, number>> = { ...chassis.baseCost }
  for (const p of parts) {
    for (const [g, n] of Object.entries(p.cost) as [GoodId, number][]) {
      total[g] = (total[g] ?? 0) + n
    }
  }
  return total
}

export function emptyLoadout(chassis: ChassisDef = SANDBOX_CHASSIS): MarkLoadout {
  const loadout: MarkLoadout = {}
  for (const slot of chassis.slots) {
    loadout[slot.id] = null
  }
  return loadout
}

export function validateMark(
  loadout: MarkLoadout,
  chassis: ChassisDef = SANDBOX_CHASSIS,
): ValidationResult {
  const bans: string[] = []
  const parts: PartDef[] = []

  for (const slot of chassis.slots) {
    const partId = loadout[slot.id] ?? null
    if (!partId) {
      if (slot.required) {
        bans.push(`Required slot "${slot.id}" is empty`)
      }
      continue
    }
    const part = partById(partId)
    if (!part) {
      bans.push(`Unknown part "${partId}"`)
      continue
    }
    if (part.slot !== slot.type) {
      bans.push(`${part.name} does not fit ${slot.type} slot`)
      continue
    }
    parts.push(part)
    for (const tag of part.tags) {
      if (chassis.bannedPartTags.includes(tag)) {
        bans.push(
          `${part.name} banned on ${chassis.name} (tag ${tag})`,
        )
      }
    }
  }

  // Hard ban: heat pathologically high even with vents (jank ceiling).
  let heat = 0
  let attack = 0
  let defense = 0
  let fuelUse = 0
  let role: CombatRole = 'support'
  for (const p of parts) {
    heat += p.stats.heat ?? 0
    attack += p.stats.attack ?? 0
    defense += p.stats.defense ?? 0
    fuelUse += p.stats.fuelUse ?? 0
    if (p.role && p.slot === 'weapon') role = p.role
  }

  if (heat > 6) {
    bans.push(`Heat ${heat} exceeds hard ban ceiling (6)`)
  }

  const overHeat = Math.max(0, heat - chassis.heatSoftCap)
  const taxes: MarkTaxes = {
    breakdown: overHeat,
    fuelPressure: fuelUse,
  }

  const stats: MarkStats = { attack, defense, heat, fuelUse }
  const totalCost = sumCost(parts, chassis)

  return {
    legal: bans.length === 0,
    bans,
    taxes,
    stats,
    totalCost,
    role,
    parts,
  }
}
