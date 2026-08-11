import { useEffect, useRef } from 'react'
import { Application, Container, Graphics, Text } from 'pixi.js'
import {
  axialToPixel,
  hexDisk,
  type GameState,
  type ResourceId,
} from '../../sim'

const HEX_SIZE = 36

const RESOURCE_COLOR: Record<ResourceId, number> = {
  coal: 0x2a2a2a,
  ore: 0x8b4513,
  timber: 0x2d5a27,
  food: 0xc4a35a,
}

function drawHex(g: Graphics, x: number, y: number, size: number, fill: number, stroke: number) {
  const points: number[] = []
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i)
    points.push(x + size * Math.cos(angle), y + size * Math.sin(angle))
  }
  g.poly(points)
  g.fill({ color: fill })
  g.stroke({ width: 1.5, color: stroke })
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
        background: '#241c16',
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

function paint(world: Container, state: GameState) {
  world.removeChildren()

  const ground = new Graphics()
  for (const cell of hexDisk(state.mapRadius)) {
    const { x, y } = axialToPixel(cell, HEX_SIZE)
    drawHex(ground, x, y, HEX_SIZE - 1, 0x3a3028, 0x5c4a3a)
  }
  world.addChild(ground)

  for (const node of state.nodes) {
    const { x, y } = axialToPixel(node.at, HEX_SIZE)
    const marker = new Graphics()
    marker.circle(x, y, HEX_SIZE * 0.35)
    marker.fill({ color: RESOURCE_COLOR[node.resource] })
    marker.stroke({ width: 2, color: 0xf0e6d8 })
    world.addChild(marker)

    const label = new Text({
      text: node.resource.slice(0, 1).toUpperCase(),
      style: {
        fill: 0xf5efe6,
        fontSize: 12,
        fontFamily: 'IBM Plex Sans, Segoe UI, sans-serif',
        fontWeight: '700',
      },
    })
    label.anchor.set(0.5)
    label.position.set(x, y)
    world.addChild(label)
  }
}

function centerWorld(app: Application, world: Container) {
  world.position.set(app.screen.width / 2, app.screen.height / 2)
}
