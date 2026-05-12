import { MAP_CONFIG } from '@/lib/constants'
import type { MapSlot, RingType } from './mapLayout'

export interface MapRenderState {
  slots:         MapSlot[]
  playerLabels:  Set<string>
  timestamp:     number
}

const RING_COLORS = {
  inner:  { base: 'rgba(0,200,112,0.12)',  border: 'rgba(0,200,112,0.25)' },
  middle: { base: 'rgba(100,160,130,0.08)', border: 'rgba(100,160,130,0.2)' },
  outer:  { base: 'rgba(61,107,85,0.06)',  border: 'rgba(61,107,85,0.15)' },
}

function drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.7)
  grad.addColorStop(0, 'rgba(13,46,34,0.6)')
  grad.addColorStop(1, 'rgba(4,13,9,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  // Star field
  const stars = 60
  for (let i = 0; i < stars; i++) {
    // Seeded "random" via index
    const x = ((i * 997 + 13) % w)
    const y = ((i * 557 + 71) % h)
    const r = i % 3 === 0 ? 1.2 : 0.6
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(0,200,112,${0.1 + (i % 5) * 0.05})`
    ctx.fill()
  }
}

function drawRings(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  const rings: { type: RingType; r: number }[] = [
    { type: 'inner',  r: MAP_CONFIG.innerRingRadius  },
    { type: 'middle', r: MAP_CONFIG.middleRingRadius },
    { type: 'outer',  r: MAP_CONFIG.outerRingRadius  },
  ]

  rings.forEach(({ type, r }) => {
    const colors = RING_COLORS[type]
    const thick  = MAP_CONFIG.ringThickness

    // Ring fill
    ctx.beginPath()
    ctx.arc(cx, cy, r + thick / 2, 0, Math.PI * 2)
    ctx.arc(cx, cy, r - thick / 2, 0, Math.PI * 2, true)
    ctx.fillStyle = colors.base
    ctx.fill()

    // Ring border (outer)
    ctx.beginPath()
    ctx.arc(cx, cy, r + thick / 2, 0, Math.PI * 2)
    ctx.strokeStyle = colors.border
    ctx.lineWidth   = 0.8
    ctx.stroke()

    // Ring border (inner)
    ctx.beginPath()
    ctx.arc(cx, cy, r - thick / 2, 0, Math.PI * 2)
    ctx.strokeStyle = colors.border
    ctx.lineWidth   = 0.5
    ctx.stroke()
  })

  // Center dot
  ctx.beginPath()
  ctx.arc(cx, cy, 6, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(0,200,112,0.5)'
  ctx.fill()
  ctx.beginPath()
  ctx.arc(cx, cy, 3, 0, Math.PI * 2)
  ctx.fillStyle = '#00c870'
  ctx.fill()

  // Center label
  ctx.font = '10px "Share Tech Mono"'
  ctx.fillStyle = 'rgba(0,200,112,0.5)'
  ctx.textAlign = 'center'
  ctx.fillText('ЗОЛОТОЙ КРУГ', cx, cy + MAP_CONFIG.innerRingRadius - 8)
  ctx.textAlign = 'left'
}

function drawSlot(
  ctx: CanvasRenderingContext2D,
  slot: MapSlot,
  isPlayer: boolean,
  t: number,
) {
  const pulse = 0.6 + 0.4 * Math.sin(t / 800 + slot.angle * 3)

  if (isPlayer) {
    // Outer glow ring
    ctx.beginPath()
    ctx.arc(slot.x, slot.y, 7, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(0,200,112,${0.15 * pulse})`
    ctx.fill()

    // Bright dot
    ctx.beginPath()
    ctx.arc(slot.x, slot.y, 4, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(0,200,112,${0.9 * pulse})`
    ctx.shadowColor = '#00c870'
    ctx.shadowBlur  = 10
    ctx.fill()
    ctx.shadowBlur  = 0
  } else {
    // Regular owned
    ctx.beginPath()
    ctx.arc(slot.x, slot.y, 2.5, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(0,200,112,0.5)'
    ctx.fill()
  }
}

function drawUnownedSlot(ctx: CanvasRenderingContext2D, slot: MapSlot) {
  ctx.beginPath()
  ctx.arc(slot.x, slot.y, 1.2, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(0,200,112,0.12)'
  ctx.fill()
}

export function renderMapFrame(
  ctx: CanvasRenderingContext2D,
  w:   number,
  h:   number,
  state: MapRenderState,
) {
  ctx.clearRect(0, 0, w, h)

  const cx = w / 2
  const cy = h / 2

  drawBackground(ctx, w, h)
  drawRings(ctx, cx, cy)

  const { slots, playerLabels, timestamp: t } = state

  // Draw unowned first (bottom layer)
  for (const slot of slots) {
    if (!slot.owned) drawUnownedSlot(ctx, slot)
  }

  // Draw owned non-player
  for (const slot of slots) {
    if (slot.owned && !playerLabels.has(slot.label)) {
      drawSlot(ctx, slot, false, t)
    }
  }

  // Draw player slots on top
  for (const slot of slots) {
    if (playerLabels.has(slot.label)) {
      drawSlot(ctx, slot, true, t)
    }
  }
}
