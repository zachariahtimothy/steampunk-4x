import type { GameState } from '../types'
import { stockOf } from '../types'
import { cloneGameState } from '../clone'
import {
  ARMY_SLOT_CAP,
  ATTACK_ORDER_COST,
  ORDERS_MAX,
  axialDist,
  computeFightPower,
  type Army,
  type ArmyUnit,
  type FightPreview,
  type FightResult,
} from './types'

export type ActionResult =
  | { ok: true; state: GameState }
  | { ok: false; error: string }

function hub(state: GameState) {
  return state.sites.find((s) => s.kind === 'hub')
}

/** In supply when within 1 hex of hub or any site that has a Route to hub. */
export function isInSupply(state: GameState, army: Army): boolean {
  const h = hub(state)
  if (!h) return false
  if (axialDist(army.at, h.at) <= 1) return true

  for (const site of state.sites) {
    const linked = state.routes.some(
      (r) =>
        (r.fromSiteId === site.id && r.toSiteId === 'hub') ||
        (r.toSiteId === site.id && r.fromSiteId === 'hub'),
    )
    if (linked && axialDist(army.at, site.at) <= 1) return true
  }
  return false
}

export function fuelOk(state: GameState, army: Army): boolean {
  const need = army.units.reduce((s, u) => s + u.fuelUse, 0)
  if (need <= 0) return true
  const h = hub(state)
  if (!h) return false
  // Fielded machines draw coke from hub network when in supply path; else starve.
  if (!isInSupply(state, army)) return false
  return stockOf(h, 'coke') >= need
}

export function getArmy(state: GameState, id: string): Army | undefined {
  return state.armies.find((a) => a.id === id)
}

export function playerArmy(state: GameState): Army | undefined {
  return state.armies.find((a) => a.owner === 'player')
}

export function enemyArmy(state: GameState): Army | undefined {
  return state.armies.find((a) => a.owner === 'enemy')
}

function recomputeHpMax(army: Army): void {
  const max = Math.max(
    1,
    army.units.reduce((s, u) => s + 4 + u.defense, 0),
  )
  army.hpMax = max
  army.hp = Math.min(army.hp, max)
  if (army.units.length === 0) {
    army.hpMax = 1
    army.hp = 0
  }
}

export function previewFight(state: GameState): FightPreview | null {
  const player = playerArmy(state)
  const enemy = enemyArmy(state)
  if (!player || !enemy) return null
  if (player.hp <= 0 || enemy.hp <= 0) {
    return {
      playerPower: 0,
      enemyPower: 0,
      playerInSupply: isInSupply(state, player),
      enemyInSupply: isInSupply(state, enemy),
      playerFuelOk: fuelOk(state, player),
      winner: player.hp > 0 ? 'player' : enemy.hp > 0 ? 'enemy' : 'draw',
      summary: 'One side is already broken.',
    }
  }

  const pSup = isInSupply(state, player)
  const eSup = isInSupply(state, enemy)
  const pFuel = fuelOk(state, player)
  const eFuel = fuelOk(state, enemy)

  const { atkPower, defPower } = computeFightPower(
    player,
    enemy,
    { inSupply: pSup, fuelOk: pFuel },
    { inSupply: eSup, fuelOk: eFuel },
  )

  let winner: FightPreview['winner'] = 'draw'
  if (atkPower > defPower) winner = 'player'
  else if (defPower > atkPower) winner = 'enemy'

  const supplyNote = !pSup
    ? 'Player out of supply (−40% combat).'
    : !pFuel
      ? 'Player machines fuel-starved.'
      : 'Player in supply.'

  return {
    playerPower: atkPower,
    enemyPower: defPower,
    playerInSupply: pSup,
    enemyInSupply: eSup,
    playerFuelOk: pFuel,
    winner,
    summary: `${supplyNote} Power ${atkPower} vs ${defPower} → ${winner}.`,
  }
}

/** Field a produced Mark into the player army (consumes pool count). */
export function fieldMark(state: GameState, designId: string): ActionResult {
  const design = state.markDesigns.find((d) => d.id === designId)
  if (!design) return { ok: false, error: 'Unknown Mark design' }
  const pool = state.producedMarks[designId] ?? 0
  if (pool < 1) return { ok: false, error: 'No produced Marks of that design' }

  const army = playerArmy(state)
  if (!army) return { ok: false, error: 'No player army' }
  if (army.units.length >= ARMY_SLOT_CAP) {
    return { ok: false, error: `Army slot cap ${ARMY_SLOT_CAP}` }
  }

  const next = cloneGameState(state)
  const a = playerArmy(next)!
  const unit: ArmyUnit = {
    id: `u-${designId}-${Date.now().toString(36)}`,
    label: design.name,
    role: design.role,
    attack: design.stats.attack,
    defense: design.stats.defense,
    fuelUse: Math.max(0, design.stats.fuelUse),
    markDesignId: designId,
  }
  a.units = [...a.units, unit]
  recomputeHpMax(a)
  // Top off HP when fielding into healthy army
  a.hp = a.hpMax
  next.producedMarks[designId] = pool - 1
  if (next.producedMarks[designId] === 0) delete next.producedMarks[designId]
  next.lastTickLog = [
    `Fielded Mark "${design.name}" into ${a.name}`,
    ...next.lastTickLog,
  ]
  return { ok: true, state: next }
}

/** March player army to contact hex beside the enemy (costs 1 Order). */
export function marchToContact(state: GameState): ActionResult {
  const next = cloneGameState(state)
  const player = playerArmy(next)
  const enemy = enemyArmy(next)
  if (!player || !enemy) return { ok: false, error: 'Armies missing' }
  if (player.hp <= 0) return { ok: false, error: 'Army broken' }
  if (player.orders < 1) return { ok: false, error: 'Not enough Orders' }

  // Adjacent to enemy toward hub side
  player.at = { q: enemy.at.q - 1, r: enemy.at.r }
  player.orders -= 1
  next.lastTickLog = [
    `${player.name} marched to contact at (${player.at.q},${player.at.r})`,
    ...next.lastTickLog,
  ]
  return { ok: true, state: next }
}

/** Pull player army back to hub (free reposition for sandbox demo). */
export function returnToHub(state: GameState): ActionResult {
  const next = cloneGameState(state)
  const player = playerArmy(next)
  const h = hub(next)
  if (!player || !h) return { ok: false, error: 'Missing army/hub' }
  player.at = { ...h.at }
  next.lastTickLog = [`${player.name} returned to Hub`, ...next.lastTickLog]
  return { ok: true, state: next }
}

/**
 * Spend Orders to attack. Deterministic; preview ≈ truth.
 * Out-of-supply armies deal less damage.
 */
export function attackWithOrders(state: GameState): ActionResult {
  const preview = previewFight(state)
  if (!preview) return { ok: false, error: 'No fight to resolve' }

  const next = cloneGameState(state)
  const player = playerArmy(next)!
  const enemy = enemyArmy(next)!

  if (player.hp <= 0) return { ok: false, error: 'Player army broken' }
  if (enemy.hp <= 0) return { ok: false, error: 'Enemy already broken' }
  if (axialDist(player.at, enemy.at) > 1) {
    return { ok: false, error: 'Not in contact — march first' }
  }
  if (player.orders < ATTACK_ORDER_COST) {
    return {
      ok: false,
      error: `Need ${ATTACK_ORDER_COST} Orders (have ${player.orders})`,
    }
  }

  player.orders -= ATTACK_ORDER_COST

  // Damage proportional to power difference + base chip
  const pDmg = Math.max(1, Math.round(preview.playerPower * 0.35))
  const eDmg = Math.max(1, Math.round(preview.enemyPower * 0.25))

  enemy.hp = Math.max(0, enemy.hp - pDmg)
  player.hp = Math.max(0, player.hp - eDmg)

  // Fuel upkeep pulse on attack if machines present
  const fuelNeed = player.units.reduce((s, u) => s + u.fuelUse, 0)
  const h = hub(next)
  if (h && fuelNeed > 0 && isInSupply(next, player)) {
    const take = Math.min(stockOf(h, 'coke'), fuelNeed)
    if (take > 0) {
      h.stock.coke = stockOf(h, 'coke') - take
      if (h.stock.coke === 0) delete h.stock.coke
    }
  }

  const result: FightResult = {
    ...previewFight(next)!,
    playerHpAfter: player.hp,
    enemyHpAfter: enemy.hp,
    ordersSpent: ATTACK_ORDER_COST,
  }
  // Use pre-damage preview for power line
  result.playerPower = preview.playerPower
  result.enemyPower = preview.enemyPower
  result.winner = preview.winner
  result.summary = `Attack resolved: dealt ${pDmg}, took ${eDmg}. ${preview.summary}`

  next.lastFight = result
  next.lastTickLog = [result.summary, ...next.lastTickLog]
  return { ok: true, state: next }
}

/** Refresh Orders on end turn + light enemy idle. */
export function phaseArmiesEndTurn(state: GameState, log: string[]): void {
  for (const army of state.armies) {
    if (army.hp > 0) {
      army.orders = army.ordersMax
    }
  }
  const player = playerArmy(state)
  if (player && player.hp > 0) {
    const sup = isInSupply(state, player)
    log.push(
      `${player.name} Orders refreshed (${player.orders}). Supply: ${sup ? 'OK' : 'CUT'}`,
    )
  }
}

export function createSandboxArmies(): Army[] {
  const line = (id: string, label: string, atk: number, def: number): ArmyUnit => ({
    id,
    label,
    role: 'line',
    attack: atk,
    defense: def,
    fuelUse: 0,
  })

  const player: Army = {
    id: 'army-player',
    owner: 'player',
    name: 'Home Column',
    at: { q: 0, r: 0 },
    units: [
      line('p-line-1', 'Militia Line', 2, 2),
      line('p-line-2', 'Militia Line', 2, 2),
    ],
    orders: ORDERS_MAX,
    ordersMax: ORDERS_MAX,
    hp: 0,
    hpMax: 0,
  }
  recomputeHpMax(player)
  player.hp = player.hpMax

  const enemy: Army = {
    id: 'army-enemy',
    owner: 'enemy',
    name: 'Ash Raiders',
    at: { q: 3, r: -1 },
    units: [
      line('e-line-1', 'Raider Line', 3, 2),
      line('e-line-2', 'Raider Line', 3, 2),
      {
        id: 'e-siege-1',
        label: 'Scrap Mortar',
        role: 'siege',
        attack: 3,
        defense: 1,
        fuelUse: 0,
      },
    ],
    orders: ORDERS_MAX,
    ordersMax: ORDERS_MAX,
    hp: 0,
    hpMax: 0,
  }
  recomputeHpMax(enemy)
  enemy.hp = enemy.hpMax

  return [player, enemy]
}
