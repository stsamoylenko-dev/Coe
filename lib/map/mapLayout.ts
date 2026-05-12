import { MAP_CONFIG } from '@/lib/constants'

export type RingType = 'inner' | 'middle' | 'outer'

export interface MapSlot {
  label:   string
  ring:    RingType
  angle:   number   // radians
  x:       number   // canvas coords (set after layout)
  y:       number
  owned:   boolean
}

function simpleHash(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

function domainAngle(label: string, ring: RingType): number {
  if (ring === 'inner') {
    // 4N: 0000–9999, evenly spaced over 360°
    return (parseInt(label, 10) / MAP_CONFIG.totalInnerSlots) * Math.PI * 2
  }
  // non-4N: hash-distributed
  return (simpleHash(label) % 10000) / 10000 * Math.PI * 2
}

function ringRadius(ring: RingType): number {
  switch (ring) {
    case 'inner':  return MAP_CONFIG.innerRingRadius
    case 'middle': return MAP_CONFIG.middleRingRadius
    case 'outer':  return MAP_CONFIG.outerRingRadius
  }
}

export function buildMapSlots(
  ownedDomains: { label: string; is4N: boolean; length: number }[],
  cx: number,
  cy: number,
): MapSlot[] {
  const ownedSet = new Set(ownedDomains.map(d => d.label))

  // Background 4N ring: render every 100th for perf (100 evenly-spaced markers)
  const inner4NSlots: MapSlot[] = []
  for (let i = 0; i < 10000; i += 100) {
    const label = String(i).padStart(4, '0')
    const angle = domainAngle(label, 'inner')
    const r     = ringRadius('inner')
    inner4NSlots.push({
      label,
      ring:  'inner',
      angle,
      x:     cx + Math.cos(angle - Math.PI / 2) * r,
      y:     cy + Math.sin(angle - Math.PI / 2) * r,
      owned: ownedSet.has(label),
    })
  }

  // Owned domains — all appear on map
  const ownedSlots: MapSlot[] = ownedDomains.map(d => {
    const ring: RingType = d.is4N ? 'inner' : d.length <= 6 ? 'middle' : 'outer'
    const angle = domainAngle(d.label, ring)
    const r     = ringRadius(ring)
    return {
      label: d.label,
      ring,
      angle,
      x:     cx + Math.cos(angle - Math.PI / 2) * r,
      y:     cy + Math.sin(angle - Math.PI / 2) * r,
      owned: true,
    }
  })

  // Merge: put owned on top
  const seen = new Set<string>()
  const merged: MapSlot[] = []
  for (const s of [...ownedSlots, ...inner4NSlots]) {
    if (!seen.has(s.label)) {
      seen.add(s.label)
      merged.push(s)
    }
  }
  return merged
}
