import type { GoodId } from '../types'

export type ChassisFamilyId = 'emplacement'
export type SlotType = 'weapon' | 'armor' | 'utility'
export type CombatRole = 'line' | 'raid' | 'siege' | 'support'

export type ChassisSlot = {
  id: string
  type: SlotType
  /** Required slots must be filled for a legal Mark. */
  required: boolean
}

export type ChassisDef = {
  id: string
  family: ChassisFamilyId
  name: string
  slots: ChassisSlot[]
  /** Tags banned on this chassis (hard ban if any installed part has one). */
  bannedPartTags: string[]
  /** Soft heat ceiling — above this adds breakdown tax. */
  heatSoftCap: number
  baseCost: Partial<Record<GoodId, number>>
  /** Produced Machine Frames consumed when building one Mark of this chassis. */
  frameCost: number
}

export type PartDef = {
  id: string
  name: string
  slot: SlotType
  tags: string[]
  cost: Partial<Record<GoodId, number>>
  stats: {
    attack?: number
    defense?: number
    heat?: number
    fuelUse?: number
  }
  /** Primary combat role contribution (weapons). */
  role?: CombatRole
}

export const SANDBOX_CHASSIS: ChassisDef = {
  id: 'emplacement_i',
  family: 'emplacement',
  name: 'Emplacement I',
  slots: [
    { id: 'weapon', type: 'weapon', required: true },
    { id: 'armor', type: 'armor', required: false },
    { id: 'utility', type: 'utility', required: false },
  ],
  bannedPartTags: ['mobile_only', 'terrain:rail_only'],
  heatSoftCap: 3,
  baseCost: { plates: 1, beams: 1 },
  frameCost: 1,
}

export const SANDBOX_PARTS: PartDef[] = [
  {
    id: 'rivet_gun',
    name: 'Rivet Gun',
    slot: 'weapon',
    tags: ['role:line', 'fuel:coal'],
    cost: { plates: 1 },
    stats: { attack: 2, heat: 0, fuelUse: 0 },
    role: 'line',
  },
  {
    id: 'light_howitzer',
    name: 'Light Howitzer',
    slot: 'weapon',
    tags: ['role:siege', 'fuel:coke'],
    cost: { plates: 2, coke: 1 },
    stats: { attack: 4, heat: 2, fuelUse: 1 },
    role: 'siege',
  },
  {
    id: 'gyro_walker_legs',
    name: 'Gyro Walker Legs',
    slot: 'utility',
    tags: ['mobile_only', 'role:raid'],
    cost: { plates: 2, beams: 2, coke: 1 },
    stats: { attack: 1, heat: 1 },
    role: 'raid',
  },
  {
    id: 'plate_skirt',
    name: 'Plate Skirt',
    slot: 'armor',
    tags: ['armor:plate'],
    cost: { plates: 2, beams: 1 },
    stats: { defense: 2, heat: 0 },
  },
  {
    id: 'heat_vanes',
    name: 'Heat Vanes',
    slot: 'armor',
    tags: ['armor:vent'],
    cost: { plates: 1 },
    stats: { defense: 1, heat: -1 },
  },
  {
    id: 'boiler_boost',
    name: 'Boiler Boost',
    slot: 'utility',
    tags: ['fuel:coke', 'showman'],
    cost: { coke: 2, plates: 1 },
    stats: { attack: 1, heat: 3, fuelUse: 2 },
  },
  {
    id: 'crew_cabin',
    name: 'Crew Cabin',
    slot: 'utility',
    tags: ['crew:standard', 'grim'],
    cost: { beams: 1, plates: 1 },
    stats: { defense: 1, heat: 0 },
  },
]

export function partById(id: string): PartDef | undefined {
  return SANDBOX_PARTS.find((p) => p.id === id)
}

export function partsForSlot(slot: SlotType): PartDef[] {
  return SANDBOX_PARTS.filter((p) => p.slot === slot)
}
