import { useEffect, useRef } from 'react'
import { Application, Container, Graphics, Text } from 'pixi.js'
import {
  axialToPixel,
  hexDisk,
  type AxialCoord,
  type GameState,
  type ResourceId,
  type Site,
} from '../../sim'

const HEX_SIZE = 36

const FONT_UI = 'Source Sans 3, Segoe UI, sans-serif'

/** Stable 0..1 hash from axial coords — terrain variance, no RNG drift. */
function terrainHash(q: number, r: number): number {
  let n = q * 374761393 + r * 668265263
  n = (n ^ (n >>> 13)) * 1274126177
  n = n ^ (n >>> 16)
  return (n >>> 0) / 4294967295
}

function lerpChannel(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t)
}

function lerpColor(c0: number, c1: number, t: number): number {
  const r0 = (c0 >> 16) & 0xff
  const g0 = (c0 >> 8) & 0xff
  const b0 = c0 & 0xff
  const r1 = (c1 >> 16) & 0xff
  const g1 = (c1 >> 8) & 0xff
  const b1 = c1 & 0xff
  return (
    (lerpChannel(r0, r1, t) << 16) |
    (lerpChannel(g0, g1, t) << 8) |
    lerpChannel(b0, b1, t)
  )
}

/** Ash-scorched ground band — darker near map edge, slight mottling. */
function groundFill(cell: AxialCoord, mapRadius: number): number {
  const dist = (Math.abs(cell.q) + Math.abs(cell.r) + Math.abs(cell.q + cell.r)) / 2
  const edge = mapRadius <= 0 ? 0 : dist / mapRadius
  const mottled = terrainHash(cell.q, cell.r)
  const base = lerpColor(0x4a3f34, 0x2a221c, edge * 0.85 + mottled * 0.15)
  return lerpColor(base, 0x3a3228, mottled * 0.35)
}

function groundStroke(cell: AxialCoord): number {
  const h = terrainHash(cell.q + 17, cell.r - 9)
  return lerpColor(0x6b5344, 0x5c4a3a, h)
}

const RESOURCE_FILL: Record<ResourceId, number> = {
  coal: 0x1a1a1a,
  ore: 0x8b4513,
  timber: 0x2d5a27,
  food: 0xc4a35a,
}

const RESOURCE_STROKE: Record<ResourceId, number> = {
  coal: 0x6a6a6a,
  ore: 0xd4a574,
  timber: 0x8fbc6a,
  food: 0xe8c36a,
}

function drawHex(
  g: Graphics,
  x: number,
  y: number,
  size: number,
  fill: number,
  stroke: number,
  strokeWidth = 1.5,
) {
  const points: number[] = []
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i)
    points.push(x + size * Math.cos(angle), y + size * Math.sin(angle))
  }
  g.poly(points)
  g.fill({ color: fill })
  g.stroke({ width: strokeWidth, color: stroke })
}

/** Soft “raised plate” rim on the sunny-ish side of each hex. */
function drawHexHeightCue(g: Graphics, x: number, y: number, size: number) {
  const points: number[] = []
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i)
    points.push(x + size * Math.cos(angle), y + size * Math.sin(angle))
  }
  // Top-left edges only (indices 0–2 roughly NW–NE)
  g.moveTo(points[10]!, points[11]!)
  g.lineTo(points[0]!, points[1]!)
  g.lineTo(points[2]!, points[3]!)
  g.lineTo(points[4]!, points[5]!)
  g.stroke({ width: 1.25, color: 0xd4c4a8, alpha: 0.14 })
}

function drawResourceMarker(
  world: Container,
  resource: ResourceId,
  x: number,
  y: number,
) {
  const g = new Graphics()
  const fill = RESOURCE_FILL[resource]
  const stroke = RESOURCE_STROKE[resource]
  const r = HEX_SIZE * 0.32

  switch (resource) {
    case 'coal': {
      // Angular coal lump
      g.poly([
        x - r * 0.9,
        y + r * 0.2,
        x - r * 0.35,
        y - r * 0.85,
        x + r * 0.55,
        y - r * 0.55,
        x + r * 0.95,
        y + r * 0.15,
        x + r * 0.25,
        y + r * 0.9,
        x - r * 0.55,
        y + r * 0.75,
      ])
      g.fill({ color: fill })
      g.stroke({ width: 1.75, color: stroke })
      break
    }
    case 'ore': {
      // Crystal / dig diamond
      g.poly([x, y - r, x + r * 0.75, y, x, y + r, x - r * 0.75, y])
      g.fill({ color: fill })
      g.stroke({ width: 1.75, color: stroke })
      g.moveTo(x, y - r * 0.35)
      g.lineTo(x, y + r * 0.35)
      g.stroke({ width: 1, color: 0xf0e6d8, alpha: 0.35 })
      break
    }
    case 'timber': {
      // Simple pine / stack silhouette
      g.poly([
        x,
        y - r * 1.05,
        x + r * 0.85,
        y + r * 0.15,
        x + r * 0.35,
        y + r * 0.15,
        x + r * 0.55,
        y + r * 0.55,
        x - r * 0.55,
        y + r * 0.55,
        x - r * 0.35,
        y + r * 0.15,
        x - r * 0.85,
        y + r * 0.15,
      ])
      g.fill({ color: fill })
      g.stroke({ width: 1.5, color: stroke })
      g.rect(x - r * 0.12, y + r * 0.55, r * 0.24, r * 0.35)
      g.fill({ color: 0x3a2818 })
      break
    }
    case 'food': {
      // Granary sheaf — rounded lozenge + stalks
      g.ellipse(x, y + r * 0.05, r * 0.7, r * 0.85)
      g.fill({ color: fill })
      g.stroke({ width: 1.5, color: stroke })
      for (const dx of [-0.25, 0, 0.25]) {
        g.moveTo(x + r * dx, y + r * 0.55)
        g.lineTo(x + r * dx * 1.4, y - r * 0.75)
        g.stroke({ width: 1.2, color: 0x6b5344, alpha: 0.7 })
      }
      break
    }
  }

  world.addChild(g)

  const label = new Text({
    text: resource.slice(0, 1).toUpperCase(),
    style: {
      fill: 0xf5efe6,
      fontSize: 11,
      fontFamily: FONT_UI,
      fontWeight: '700',
    },
  })
  label.anchor.set(0.5)
  label.position.set(x, y + (resource === 'timber' ? -2 : 0))
  world.addChild(label)
}

function drawHub(world: Container, x: number, y: number) {
  const g = new Graphics()
  // Plinth
  g.roundRect(x - 18, y - 8, 36, 22, 3)
  g.fill({ color: 0x3a3028 })
  g.stroke({ width: 1.5, color: 0x5c4a3a })
  // Main works block
  g.roundRect(x - 14, y - 18, 28, 20, 2)
  g.fill({ color: 0x5c4030 })
  g.stroke({ width: 2, color: 0xc4a35a })
  // Stack / boiler
  g.rect(x - 3, y - 30, 6, 14)
  g.fill({ color: 0x2a221c })
  g.stroke({ width: 1, color: 0x8a7340 })
  g.rect(x - 5, y - 34, 10, 5)
  g.fill({ color: 0x4a3a28 })
  g.stroke({ width: 1, color: 0xe8c36a })
  // Brass rivet ticks on plate
  for (const dx of [-10, 0, 10]) {
    g.circle(x + dx, y - 10, 1.4)
    g.fill({ color: 0xe8c36a, alpha: 0.85 })
  }
  world.addChild(g)

  const label = new Text({
    text: 'HUB',
    style: {
      fill: 0xf5efe6,
      fontSize: 10,
      fontFamily: FONT_UI,
      fontWeight: '700',
    },
  })
  label.anchor.set(0.5)
  label.position.set(x, y + 2)
  world.addChild(label)
}

function drawRoute(
  g: Graphics,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  tier: 'road' | 'rail',
) {
  const dx = bx - ax
  const dy = by - ay
  const len = Math.hypot(dx, dy) || 1
  const ux = dx / len
  const uy = dy / len
  const px = -uy
  const py = ux

  if (tier === 'rail') {
    // Dual iron rails
    const gauge = 2.4
    for (const side of [-gauge, gauge]) {
      g.moveTo(ax + px * side, ay + py * side)
      g.lineTo(bx + px * side, by + py * side)
      g.stroke({ width: 1.6, color: 0x9aabbc, alpha: 0.95 })
    }
    // Center brass highlight
    g.moveTo(ax, ay)
    g.lineTo(bx, by)
    g.stroke({ width: 1.1, color: 0xc4a35a, alpha: 0.55 })
    // Sleepers
    const step = 10
    for (let d = step * 0.5; d < len; d += step) {
      const cx = ax + ux * d
      const cy = ay + uy * d
      const hw = 5.5
      g.moveTo(cx + px * hw, cy + py * hw)
      g.lineTo(cx - px * hw, cy - py * hw)
      g.stroke({ width: 2.2, color: 0x5c4030, alpha: 0.9 })
    }
  } else {
    // Dust / cart road
    g.moveTo(ax, ay)
    g.lineTo(bx, by)
    g.stroke({ width: 5, color: 0x3a3228, alpha: 0.85 })
    g.moveTo(ax, ay)
    g.lineTo(bx, by)
    g.stroke({ width: 2.2, color: 0x7a6a55, alpha: 0.9 })
    // Dashed edge
    const step = 8
    for (let d = 0; d < len; d += step * 2) {
      const x0 = ax + ux * d
      const y0 = ay + uy * d
      const x1 = ax + ux * Math.min(d + step * 0.7, len)
      const y1 = ay + uy * Math.min(d + step * 0.7, len)
      g.moveTo(x0 + px * 2.2, y0 + py * 2.2)
      g.lineTo(x1 + px * 2.2, y1 + py * 2.2)
      g.stroke({ width: 1, color: 0xa89880, alpha: 0.35 })
    }
  }
}

function drawArmy(
  world: Container,
  x: number,
  y: number,
  owner: 'player' | 'enemy',
) {
  const isPlayer = owner === 'player'
  const color = isPlayer ? 0x4a7c59 : 0xa33b3b
  const brass = isPlayer ? 0xc4e0c8 : 0xf0c0b0
  const oy = isPlayer ? -24 : 24
  const g = new Graphics()

  // Banner pole
  g.moveTo(x, y + oy + 12)
  g.lineTo(x, y + oy - 10)
  g.stroke({ width: 2, color: 0x2a221c })
  // Pennant
  const dir = isPlayer ? -1 : 1
  g.poly([
    x,
    y + oy - 10,
    x + 14,
    y + oy - 4 * dir,
    x,
    y + oy + 4,
  ])
  g.fill({ color })
  g.stroke({ width: 1.5, color: brass })
  // Base disc
  g.circle(x, y + oy + 12, 4)
  g.fill({ color: 0x2a221c })
  g.stroke({ width: 1.25, color: brass })

  world.addChild(g)

  const label = new Text({
    text: isPlayer ? 'P' : 'E',
    style: {
      fill: 0xf5efe6,
      fontSize: 10,
      fontFamily: FONT_UI,
      fontWeight: '700',
    },
  })
  label.anchor.set(0.5)
  label.position.set(x + 5, y + oy - 2)
  world.addChild(label)
}

type Props = {
  state: GameState
}

export function HexMap({ state }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const appRef = useRef<Application | null>(null)
  const worldRef = useRef<Container | null>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    let cancelled = false
    const app = new Application()

    ;(async () => {
      await app.init({
        background: '#14100c',
        antialias: true,
        resizeTo: host,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        autoDensity: true,
      })
      if (cancelled) {
        app.destroy(true)
        return
      }
      host.appendChild(app.canvas)
      const world = new Container()
      app.stage.addChild(world)
      appRef.current = app
      worldRef.current = world
      paint(world, state)
      centerWorld(app, world)
    })()

    return () => {
      cancelled = true
      worldRef.current = null
      if (appRef.current) {
        appRef.current.destroy(true)
        appRef.current = null
      }
      host.replaceChildren()
    }
    // Mount once; state painted in the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const world = worldRef.current
    const app = appRef.current
    if (!world || !app) return
    paint(world, state)
    centerWorld(app, world)
  }, [state])

  return <div className="hex-map-host" ref={hostRef} />
}

function siteById(state: GameState, id: string): Site | undefined {
  return state.sites.find((s) => s.id === id)
}

function paint(world: Container, state: GameState) {
  world.removeChildren()

  const ground = new Graphics()
  const cues = new Graphics()
  for (const cell of hexDisk(state.mapRadius)) {
    const { x, y } = axialToPixel(cell, HEX_SIZE)
    drawHex(ground, x, y, HEX_SIZE - 1, groundFill(cell, state.mapRadius), groundStroke(cell), 1.35)
    drawHexHeightCue(cues, x, y, HEX_SIZE - 2.5)
  }
  world.addChild(ground)
  world.addChild(cues)

  // Routes under markers
  const routesG = new Graphics()
  for (const route of state.routes) {
    const from = siteById(state, route.fromSiteId)
    const to = siteById(state, route.toSiteId)
    if (!from || !to) continue
    const a = axialToPixel(from.at, HEX_SIZE)
    const b = axialToPixel(to.at, HEX_SIZE)
    drawRoute(routesG, a.x, a.y, b.x, b.y, route.tier === 'rail' ? 'rail' : 'road')
  }
  world.addChild(routesG)

  for (const site of state.sites) {
    const { x, y } = axialToPixel(site.at, HEX_SIZE)
    if (site.kind === 'hub') {
      drawHub(world, x, y)
    } else if (site.kind === 'extractor') {
      // Subtle works pad under resource node (site sits on a node hex)
      const pad = new Graphics()
      pad.circle(x, y, HEX_SIZE * 0.42)
      pad.stroke({ width: 1.25, color: 0x8a7340, alpha: 0.35 })
      world.addChild(pad)
    }
  }

  for (const node of state.nodes) {
    const { x, y } = axialToPixel(node.at, HEX_SIZE)
    drawResourceMarker(world, node.resource, x, y)
  }

  for (const army of state.armies) {
    const { x, y } = axialToPixel(army.at, HEX_SIZE)
    drawArmy(world, x, y, army.owner)
  }
}

function centerWorld(app: Application, world: Container) {
  world.position.set(app.screen.width / 2, app.screen.height / 2)
}
