import type { AxialCoord } from '../types'
import type { CombatRole } from '../invent/catalog'

export const ARMY_SLOT_CAP = 4
export const ORDERS_MAX = 3
export const ATTACK_ORDER_COST = 2
export const OUT_OF_SUPPLY_MULTIPLIER = 0.6
export const FUEL_STARVE_MULTIPLIER = 0.75

export type ArmyOwner = 'player' | 'enemy'

export type ArmyUnit = {
  id: string
  label: string
  role: CombatRole
  attack: number
  defense: number
  fuelUse: number
  /** Optional Mark design this unit was fielded from. */
  markDesignId?: string
}

export type Army = {
  id: string
  owner: ArmyOwner
  name: string
  at: AxialCoord
  units: ArmyUnit[]
  /** Current Orders budget (refreshes each turn). */
  orders: number
  ordersMax: number
  /** Hit points; 0 = broken. */
  hp: number
  hpMax: number
}

export type FightPreview = {
  playerPower: number
  enemyPower: number
  playerInSupply: boolean
  enemyInSupply: boolean
  playerFuelOk: boolean
  winner: 'player' | 'enemy' | 'draw'
  summary: string
}

export type FightResult = FightPreview & {
  playerHpAfter: number
  enemyHpAfter: number
  ordersSpent: number
}

/** Role wheel: attacker role vs defender role multiplier for attack. */
export function roleMultiplier(atk: CombatRole, def: CombatRole): number {
  if (atk === def) return 1
  const beats: Record<CombatRole, CombatRole> = {
    line: 'raid',
    raid: 'siege',
    siege: 'line',
    support: 'support',
  }
  if (beats[atk] === def) return 1.25
  if (beats[def] === atk) return 0.8
  if (atk === 'support') return 0.9
  if (def === 'support') return 1.1
  return 1
}

export function armyStrength(
  army: Army,
  opts: { inSupply: boolean; fuelOk: boolean },
): number {
  let supplyMod = opts.inSupply ? 1 : OUT_OF_SUPPLY_MULTIPLIER
  if (!opts.fuelOk) supplyMod *= FUEL_STARVE_MULTIPLIER

  let power = 0
  for (const u of army.units) {
    power += (u.attack + u.defense * 0.5) * supplyMod
  }
  // Support bonus: +10% to army if any support present
  if (army.units.some((u) => u.role === 'support')) {
    power *= 1.1
  }
  return Math.round(power * 10) / 10
}

export function computeFightPower(
  attacker: Army,
  defender: Army,
  atkOpts: { inSupply: boolean; fuelOk: boolean },
  defOpts: { inSupply: boolean; fuelOk: boolean },
): { atkPower: number; defPower: number } {
  let atk = 0
  let def = 0
  const atkMod =
    (atkOpts.inSupply ? 1 : OUT_OF_SUPPLY_MULTIPLIER) *
    (atkOpts.fuelOk ? 1 : FUEL_STARVE_MULTIPLIER)
  const defMod =
    (defOpts.inSupply ? 1 : OUT_OF_SUPPLY_MULTIPLIER) *
    (defOpts.fuelOk ? 1 : FUEL_STARVE_MULTIPLIER)

  for (const au of attacker.units) {
    for (const du of defender.units) {
      atk += au.attack * roleMultiplier(au.role, du.role) * atkMod
      def += du.defense * roleMultiplier(du.role, au.role) * defMod
    }
  }
  // Baseline so empty-ish armies still resolve
  if (attacker.units.length === 0) atk = 0
  else if (defender.units.length === 0) {
    atk = attacker.units.reduce((s, u) => s + u.attack, 0) * atkMod
  } else {
    // normalize by matchups count
    const pairs = attacker.units.length * defender.units.length
    atk = atk / Math.max(1, defender.units.length)
    def = def / Math.max(1, attacker.units.length)
    void pairs
  }

  // Mix in bulk strength so supply still matters on small armies
  atk += armyStrength(attacker, atkOpts) * 0.5
  def += armyStrength(defender, defOpts) * 0.5

  return {
    atkPower: Math.round(atk * 10) / 10,
    defPower: Math.round(def * 10) / 10,
  }
}

export function axialDist(a: AxialCoord, b: AxialCoord): number {
  return (
    (Math.abs(a.q - b.q) +
      Math.abs(a.q + a.r - b.q - b.r) +
      Math.abs(a.r - b.r)) /
    2
  )
}
