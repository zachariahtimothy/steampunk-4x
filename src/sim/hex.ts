import type { AxialCoord } from './types'

/** Flat-top hex pixel center from axial coords. */
export function axialToPixel(coord: AxialCoord, size: number): { x: number; y: number } {
  const x = size * ((3 / 2) * coord.q)
  const y = size * ((Math.sqrt(3) / 2) * coord.q + Math.sqrt(3) * coord.r)
  return { x, y }
}

/** All axial cells in a hex-shaped map of given radius (inclusive). */
export function hexDisk(radius: number): AxialCoord[] {
  const cells: AxialCoord[] = []
  for (let q = -radius; q <= radius; q++) {
    const r1 = Math.max(-radius, -q - radius)
    const r2 = Math.min(radius, -q + radius)
    for (let r = r1; r <= r2; r++) {
      cells.push({ q, r })
    }
  }
  return cells
}

export function axialKey(c: AxialCoord): string {
  return `${c.q},${c.r}`
}
