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
import {
  isExtractorLinked,
  listAttention,
  type MapSelection,
  selectionKey,
} from '../selection'

const HEX_SIZE = 36
const FONT_UI = 'Source Sans 3, Segoe UI, sans-serif'
const SITE_HIT_R = HEX_SIZE * 0.55
const ARMY_HIT_R = 18
const ROUTE_HIT_PX = 10
const DRAG_THRESHOLD = 5

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

function groundFill(cell: AxialCoord, mapRadius: number): number {
  const dist =
    (Math.abs(cell.q) + Math.abs(cell.r) + Math.abs(cell.q + cell.r)) / 2
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

function drawHexHeightCue(g: Graphics, x: number, y: number, size: number) {
  const points: number[] = []
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i)
    points.push(x + size * Math.cos(angle), y + size * Math.sin(angle))
  }
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
      g.poly([x, y - r, x + r * 0.75, y, x, y + r, x - r * 0.75, y])
      g.fill({ color: fill })
      g.stroke({ width: 1.75, color: stroke })
      g.moveTo(x, y - r * 0.35)
      g.lineTo(x, y + r * 0.35)
      g.stroke({ width: 1, color: 0xf0e6d8, alpha: 0.35 })
      break
    }
    case 'timber': {
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
  g.roundRect(x - 18, y - 8, 36, 22, 3)
  g.fill({ color: 0x3a3028 })
  g.stroke({ width: 1.5, color: 0x5c4a3a })
  g.roundRect(x - 14, y - 18, 28, 20, 2)
  g.fill({ color: 0x5c4030 })
  g.stroke({ width: 2, color: 0xc4a35a })
  g.rect(x - 3, y - 30, 6, 14)
  g.fill({ color: 0x2a221c })
  g.stroke({ width: 1, color: 0x8a7340 })
  g.rect(x - 5, y - 34, 10, 5)
  g.fill({ color: 0x4a3a28 })
  g.stroke({ width: 1, color: 0xe8c36a })
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
  selected: boolean,
) {
  const dx = bx - ax
  const dy = by - ay
  const len = Math.hypot(dx, dy) || 1
  const ux = dx / len
  const uy = dy / len
  const px = -uy
  const py = ux

  if (selected) {
    g.moveTo(ax, ay)
    g.lineTo(bx, by)
    g.stroke({ width: 10, color: 0xe8c36a, alpha: 0.35 })
  }

  if (tier === 'rail') {
    const gauge = 2.4
    for (const side of [-gauge, gauge]) {
      g.moveTo(ax + px * side, ay + py * side)
      g.lineTo(bx + px * side, by + py * side)
      g.stroke({ width: 1.6, color: 0x9aabbc, alpha: 0.95 })
    }
    g.moveTo(ax, ay)
    g.lineTo(bx, by)
    g.stroke({ width: 1.1, color: 0xc4a35a, alpha: 0.55 })
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
    g.moveTo(ax, ay)
    g.lineTo(bx, by)
    g.stroke({ width: 5, color: 0x3a3228, alpha: 0.85 })
    g.moveTo(ax, ay)
    g.lineTo(bx, by)
    g.stroke({ width: 2.2, color: 0x7a6a55, alpha: 0.9 })
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

  g.moveTo(x, y + oy + 12)
  g.lineTo(x, y + oy - 10)
  g.stroke({ width: 2, color: 0x2a221c })
  const dir = isPlayer ? -1 : 1
  g.poly([x, y + oy - 10, x + 14, y + oy - 4 * dir, x, y + oy + 4])
  g.fill({ color })
  g.stroke({ width: 1.5, color: brass })
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

function armyMarkerOffset(owner: 'player' | 'enemy'): number {
  return owner === 'player' ? -24 : 24
}

function distPointSeg(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number {
  const dx = bx - ax
  const dy = by - ay
  const len2 = dx * dx + dy * dy
  if (len2 === 0) return Math.hypot(px - ax, py - ay)
  let t = ((px - ax) * dx + (py - ay) * dy) / len2
  t = Math.max(0, Math.min(1, t))
  const qx = ax + t * dx
  const qy = ay + t * dy
  return Math.hypot(px - qx, py - qy)
}

function siteById(state: GameState, id: string): Site | undefined {
  return state.sites.find((s) => s.id === id)
}

type Props = {
  state: GameState
  selection: MapSelection | null
  onSelect: (sel: MapSelection | null) => void
}

export function HexMap({ state, selection, onSelect }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const appRef = useRef<Application | null>(null)
  const worldRef = useRef<Container | null>(null)
  const panRef = useRef({ x: 0, y: 0 })
  const stateRef = useRef(state)
  const selectionRef = useRef(selection)
  const onSelectRef = useRef(onSelect)
  const centeredOnce = useRef(false)

  stateRef.current = state
  selectionRef.current = selection
  onSelectRef.current = onSelect

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
        preference: 'webgl',
      })
      if (cancelled) {
        app.destroy(true)
        return
      }
      host.appendChild(app.canvas)
      app.canvas.style.touchAction = 'none'
      app.canvas.style.cursor = 'grab'

      const world = new Container()
      app.stage.addChild(world)
      appRef.current = app
      worldRef.current = world

      // Center map once; preserve user pan afterward.
      world.position.set(app.screen.width / 2, app.screen.height / 2)
      panRef.current = { x: world.position.x, y: world.position.y }
      centeredOnce.current = true

      paint(world, stateRef.current, selectionRef.current)

      let dragging = false
      let moved = false
      let lastX = 0
      let lastY = 0

      const onPointerDown = (e: PointerEvent) => {
        dragging = true
        moved = false
        lastX = e.clientX
        lastY = e.clientY
        app.canvas.style.cursor = 'grabbing'
        app.canvas.setPointerCapture(e.pointerId)
      }

      const onPointerMove = (e: PointerEvent) => {
        if (!dragging) return
        const dx = e.clientX - lastX
        const dy = e.clientY - lastY
        if (!moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return
        moved = true
        lastX = e.clientX
        lastY = e.clientY
        panRef.current.x += dx
        panRef.current.y += dy
        world.position.set(panRef.current.x, panRef.current.y)
      }

      const onPointerUp = (e: PointerEvent) => {
        if (!dragging) return
        dragging = false
        app.canvas.style.cursor = 'grab'
        try {
          app.canvas.releasePointerCapture(e.pointerId)
        } catch {
          /* ignore */
        }
        if (moved) return

        const bounds = app.canvas.getBoundingClientRect()
        const scaleX = app.screen.width / bounds.width
        const scaleY = app.screen.height / bounds.height
        const sx = (e.clientX - bounds.left) * scaleX
        const sy = (e.clientY - bounds.top) * scaleY
        const wx = sx - world.position.x
        const wy = sy - world.position.y
        const hit = hitTest(stateRef.current, wx, wy)
        onSelectRef.current(hit)
      }

      app.canvas.addEventListener('pointerdown', onPointerDown)
      app.canvas.addEventListener('pointermove', onPointerMove)
      app.canvas.addEventListener('pointerup', onPointerUp)
      app.canvas.addEventListener('pointercancel', onPointerUp)

      const onResize = () => {
        // Keep relative pan when canvas resizes: re-center delta is hard; leave pan.
      }
      window.addEventListener('resize', onResize)

      ;(app.canvas as HTMLCanvasElement & { __sootCleanup?: () => void }).__sootCleanup =
        () => {
          app.canvas.removeEventListener('pointerdown', onPointerDown)
          app.canvas.removeEventListener('pointermove', onPointerMove)
          app.canvas.removeEventListener('pointerup', onPointerUp)
          app.canvas.removeEventListener('pointercancel', onPointerUp)
          window.removeEventListener('resize', onResize)
        }
    })()

    return () => {
      cancelled = true
      const canvas = appRef.current?.canvas as
        | (HTMLCanvasElement & { __sootCleanup?: () => void })
        | undefined
      canvas?.__sootCleanup?.()
      worldRef.current = null
      if (appRef.current) {
        appRef.current.destroy(true)
        appRef.current = null
      }
      host.replaceChildren()
    }
  }, [])

  useEffect(() => {
    const world = worldRef.current
    if (!world) return
    paint(world, state, selection)
  }, [state, selection])

  return <div className="hex-map-host" ref={hostRef} />
}

function hitTest(state: GameState, wx: number, wy: number): MapSelection | null {
  // Armies first (markers offset from hex center)
  for (const army of state.armies) {
    const { x, y } = axialToPixel(army.at, HEX_SIZE)
    const oy = armyMarkerOffset(army.owner)
    const mx = x
    const my = y + oy
    if (Math.hypot(wx - mx, wy - my) <= ARMY_HIT_R) {
      return { kind: 'army', id: army.id }
    }
  }

  for (const site of state.sites) {
    const { x, y } = axialToPixel(site.at, HEX_SIZE)
    if (Math.hypot(wx - x, wy - y) <= SITE_HIT_R) {
      return { kind: 'site', id: site.id }
    }
  }

  let bestRoute: { id: string; d: number } | null = null
  for (const route of state.routes) {
    const from = siteById(state, route.fromSiteId)
    const to = siteById(state, route.toSiteId)
    if (!from || !to) continue
    const a = axialToPixel(from.at, HEX_SIZE)
    const b = axialToPixel(to.at, HEX_SIZE)
    const d = distPointSeg(wx, wy, a.x, a.y, b.x, b.y)
    if (d <= ROUTE_HIT_PX && (!bestRoute || d < bestRoute.d)) {
      bestRoute = { id: route.id, d }
    }
  }
  if (bestRoute) return { kind: 'route', id: bestRoute.id }

  return null
}

function paint(
  world: Container,
  state: GameState,
  selection: MapSelection | null,
) {
  world.removeChildren()

  const attention = listAttention(state)
  const attentionKeys = new Set(attention.map((t) => selectionKey(t)))

  const ground = new Graphics()
  const cues = new Graphics()
  for (const cell of hexDisk(state.mapRadius)) {
    const { x, y } = axialToPixel(cell, HEX_SIZE)
    drawHex(
      ground,
      x,
      y,
      HEX_SIZE - 1,
      groundFill(cell, state.mapRadius),
      groundStroke(cell),
      1.35,
    )
    drawHexHeightCue(cues, x, y, HEX_SIZE - 2.5)
  }
  world.addChild(ground)
  world.addChild(cues)

  const routesG = new Graphics()
  for (const route of state.routes) {
    const from = siteById(state, route.fromSiteId)
    const to = siteById(state, route.toSiteId)
    if (!from || !to) continue
    const a = axialToPixel(from.at, HEX_SIZE)
    const b = axialToPixel(to.at, HEX_SIZE)
    const selected =
      selection?.kind === 'route' && selection.id === route.id
    drawRoute(
      routesG,
      a.x,
      a.y,
      b.x,
      b.y,
      route.tier === 'rail' ? 'rail' : 'road',
      selected,
    )
  }
  world.addChild(routesG)

  for (const site of state.sites) {
    const { x, y } = axialToPixel(site.at, HEX_SIZE)
    const selected = selection?.kind === 'site' && selection.id === site.id
    const needsAttention = attentionKeys.has(selectionKey({ kind: 'site', id: site.id }))

    if (selected || needsAttention) {
      const ring = new Graphics()
      const color = selected ? 0xe8c36a : needsAttention ? 0xc4a35a : 0xe8c36a
      ring.circle(x, y, HEX_SIZE * 0.52)
      ring.stroke({
        width: selected ? 3 : 2,
        color,
        alpha: selected ? 0.95 : 0.75,
      })
      if (needsAttention && !selected) {
        // Badge pip
        ring.circle(x + HEX_SIZE * 0.38, y - HEX_SIZE * 0.38, 6)
        ring.fill({ color: 0xc4a35a })
        ring.stroke({ width: 1.25, color: 0x1a1510 })
      }
      world.addChild(ring)
    }

    if (site.kind === 'hub') {
      drawHub(world, x, y)
    } else if (site.kind === 'extractor') {
      const pad = new Graphics()
      pad.circle(x, y, HEX_SIZE * 0.42)
      pad.stroke({
        width: 1.25,
        color: isExtractorLinked(state, site.id) ? 0x8a7340 : 0xc4a35a,
        alpha: isExtractorLinked(state, site.id) ? 0.35 : 0.55,
      })
      world.addChild(pad)
    }
  }

  for (const node of state.nodes) {
    const { x, y } = axialToPixel(node.at, HEX_SIZE)
    drawResourceMarker(world, node.resource, x, y)
  }

  for (const army of state.armies) {
    const { x, y } = axialToPixel(army.at, HEX_SIZE)
    const oy = armyMarkerOffset(army.owner)
    const selected = selection?.kind === 'army' && selection.id === army.id
    const needsAttention = attentionKeys.has(
      selectionKey({ kind: 'army', id: army.id }),
    )
    if (selected || needsAttention) {
      const ring = new Graphics()
      ring.circle(x, y + oy, 16)
      ring.stroke({
        width: selected ? 3 : 2,
        color: selected ? 0xe8c36a : 0xc4a35a,
        alpha: 0.9,
      })
      if (needsAttention && !selected) {
        ring.circle(x + 12, y + oy - 12, 5)
        ring.fill({ color: 0xc4a35a })
      }
      world.addChild(ring)
    }
    drawArmy(world, x, y, army.owner)
  }
}
