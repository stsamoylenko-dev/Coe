import { WARRIOR_CLASSES, type WarriorClass } from '@/lib/constants'
import type { WarriorData } from '@/store/warriorStore'

const W = 512
const H = 512

interface FigurineOptions {
  warrior:       WarriorData
  floatingDomain: string | null   // premium domain that floats above hand
  background?:   string
  accentColor?:  string
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function hex2rgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return [r, g, b]
}

function rgba(hex: string, a: number) {
  const [r, g, b] = hex2rgb(hex)
  return `rgba(${r},${g},${b},${a})`
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

// ─── Background ──────────────────────────────────────────────────────────────

function drawBackground(ctx: CanvasRenderingContext2D, bg: string, accent: string) {
  // Radial gradient bg
  const grad = ctx.createRadialGradient(W / 2, H * 0.55, 30, W / 2, H * 0.55, 280)
  grad.addColorStop(0, rgba(accent, 0.18))
  grad.addColorStop(1, bg)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  // Subtle grid
  ctx.strokeStyle = rgba(accent, 0.06)
  ctx.lineWidth = 0.5
  for (let x = 0; x < W; x += 32) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }
  for (let y = 0; y < H; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }

  // Corner brackets
  const br = 20
  ctx.strokeStyle = rgba(accent, 0.4)
  ctx.lineWidth = 1.5
  ;[[10, 10], [W - 10 - br, 10], [10, H - 10 - br], [W - 10 - br, H - 10 - br]].forEach(([bx, by]) => {
    ctx.beginPath()
    ctx.moveTo(bx + br, by); ctx.lineTo(bx, by); ctx.lineTo(bx, by + br)
    ctx.stroke()
  })
}

// ─── Stone Base ───────────────────────────────────────────────────────────────

function drawBase(ctx: CanvasRenderingContext2D, cx: number, baseY: number) {
  // Main stone block
  ctx.save()
  const bw = 110, bh = 28
  const bx = cx - bw / 2, by = baseY

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.4)'
  roundRect(ctx, bx + 4, by + 6, bw, bh, 6)
  ctx.fill()

  // Stone gradient
  const sg = ctx.createLinearGradient(bx, by, bx, by + bh)
  sg.addColorStop(0, '#7a6a5a')
  sg.addColorStop(0.4, '#5a4e42')
  sg.addColorStop(1, '#3a3228')
  ctx.fillStyle = sg
  roundRect(ctx, bx, by, bw, bh, 6)
  ctx.fill()

  // Stone edge highlight
  ctx.strokeStyle = 'rgba(180,160,130,0.4)'
  ctx.lineWidth = 1
  roundRect(ctx, bx, by, bw, bh, 6)
  ctx.stroke()

  // Crack detail
  ctx.strokeStyle = 'rgba(0,0,0,0.3)'
  ctx.lineWidth = 0.8
  ctx.beginPath()
  ctx.moveTo(cx - 15, by + 8); ctx.lineTo(cx - 5, by + 20)
  ctx.moveTo(cx + 10, by + 5); ctx.lineTo(cx + 20, by + 18)
  ctx.stroke()

  ctx.restore()
}

// ─── Cape ────────────────────────────────────────────────────────────────────

function drawCape(ctx: CanvasRenderingContext2D, cx: number, shoulderY: number, color: string) {
  ctx.save()

  // Cape shadow
  ctx.fillStyle = 'rgba(0,0,0,0.35)'
  ctx.beginPath()
  ctx.moveTo(cx + 14, shoulderY + 4)
  ctx.quadraticCurveTo(cx + 80, shoulderY + 60, cx + 65, shoulderY + 155)
  ctx.quadraticCurveTo(cx + 55, shoulderY + 180, cx + 30, shoulderY + 175)
  ctx.quadraticCurveTo(cx + 15, shoulderY + 172, cx + 10, shoulderY + 160)
  ctx.lineTo(cx + 16, shoulderY + 4)
  ctx.fill()

  // Cape main
  const capeGrad = ctx.createLinearGradient(cx + 15, shoulderY, cx + 65, shoulderY + 170)
  capeGrad.addColorStop(0, color)
  capeGrad.addColorStop(0.5, rgba(color, 0.85))
  capeGrad.addColorStop(1, rgba(color, 0.6))
  ctx.fillStyle = capeGrad
  ctx.beginPath()
  ctx.moveTo(cx + 15, shoulderY)
  ctx.quadraticCurveTo(cx + 75, shoulderY + 55, cx + 60, shoulderY + 150)
  ctx.quadraticCurveTo(cx + 50, shoulderY + 178, cx + 28, shoulderY + 172)
  ctx.quadraticCurveTo(cx + 12, shoulderY + 168, cx + 8, shoulderY + 155)
  ctx.lineTo(cx + 15, shoulderY)
  ctx.fill()

  // Cape edge shimmer
  ctx.strokeStyle = rgba(color, 0.5)
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(cx + 60, shoulderY + 150)
  ctx.quadraticCurveTo(cx + 50, shoulderY + 178, cx + 28, shoulderY + 172)
  ctx.stroke()

  // Decorative edge pattern
  ctx.strokeStyle = rgba('#ffffff', 0.15)
  ctx.lineWidth = 0.8
  ctx.setLineDash([3, 4])
  ctx.beginPath()
  ctx.moveTo(cx + 58, shoulderY + 145)
  ctx.quadraticCurveTo(cx + 48, shoulderY + 173, cx + 28, shoulderY + 168)
  ctx.stroke()
  ctx.setLineDash([])

  ctx.restore()
}

// ─── Body / Armor ─────────────────────────────────────────────────────────────

function drawBody(
  ctx: CanvasRenderingContext2D,
  cx: number, torsoY: number,
  classColor: string, armorCount: number, warriorClass: WarriorClass
) {
  ctx.save()

  const armorDark  = '#1a1a1a'
  const armorMid   = '#2a2a2a'
  const armorLight = '#3a3a3a'
  const metalEdge  = '#666666'

  // ── Torso ──
  const tw = 68, th = 80
  const tx = cx - tw / 2, ty = torsoY

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.5)'
  roundRect(ctx, tx + 3, ty + 5, tw, th, 8)
  ctx.fill()

  // Armor body gradient
  const bodyGrad = ctx.createLinearGradient(tx, ty, tx + tw, ty + th)
  bodyGrad.addColorStop(0, armorLight)
  bodyGrad.addColorStop(0.4, armorMid)
  bodyGrad.addColorStop(1, armorDark)
  ctx.fillStyle = bodyGrad
  roundRect(ctx, tx, ty, tw, th, 8)
  ctx.fill()

  // Armor plates
  const plateCount = Math.min(armorCount + 1, 4)
  for (let i = 0; i < plateCount; i++) {
    const py = ty + 12 + i * 16
    const pw = tw - 12 - i * 4
    const px = cx - pw / 2
    ctx.fillStyle = i % 2 === 0 ? armorMid : armorLight
    roundRect(ctx, px, py, pw, 10, 3)
    ctx.fill()
    ctx.strokeStyle = metalEdge
    ctx.lineWidth = 0.5
    roundRect(ctx, px, py, pw, 10, 3)
    ctx.stroke()
  }

  // Torso edge
  ctx.strokeStyle = metalEdge
  ctx.lineWidth = 1
  roundRect(ctx, tx, ty, tw, th, 8)
  ctx.stroke()

  // ── Chest medallion ──
  const medR = 14
  const medX = cx, medY = ty + 22

  // Medallion shadow
  ctx.fillStyle = 'rgba(0,0,0,0.5)'
  ctx.beginPath(); ctx.arc(medX + 2, medY + 2, medR, 0, Math.PI * 2); ctx.fill()

  // Gold ring
  const goldGrad = ctx.createRadialGradient(medX - 4, medY - 4, 2, medX, medY, medR)
  goldGrad.addColorStop(0, '#ffe066')
  goldGrad.addColorStop(0.5, '#c0a040')
  goldGrad.addColorStop(1, '#7a6020')
  ctx.fillStyle = goldGrad
  ctx.beginPath(); ctx.arc(medX, medY, medR, 0, Math.PI * 2); ctx.fill()

  // Class color inner
  ctx.fillStyle = classColor
  ctx.beginPath(); ctx.arc(medX, medY, medR - 4, 0, Math.PI * 2); ctx.fill()

  // TON triangle symbol
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ctx.font = 'bold 12px monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('▲', medX, medY)

  // ── Shoulders ──
  const shoulderW = 22, shoulderH = 18
  ;[cx - tw / 2 - 4, cx + tw / 2 - shoulderW + 4].forEach((sx, i) => {
    const shoulderGrad = ctx.createLinearGradient(sx, ty, sx + shoulderW, ty + shoulderH)
    shoulderGrad.addColorStop(0, armorLight)
    shoulderGrad.addColorStop(1, armorDark)
    ctx.fillStyle = shoulderGrad
    roundRect(ctx, sx, ty - 2, shoulderW, shoulderH, 5)
    ctx.fill()
    ctx.strokeStyle = metalEdge
    ctx.lineWidth = 0.8
    roundRect(ctx, sx, ty - 2, shoulderW, shoulderH, 5)
    ctx.stroke()

    // Shoulder spike (for BERSERKER/KNIGHT)
    if (warriorClass === 'BERSERKER' || warriorClass === 'KNIGHT') {
      ctx.fillStyle = classColor
      ctx.beginPath()
      const spx = i === 0 ? sx + 5 : sx + shoulderW - 5
      ctx.moveTo(spx, ty - 2)
      ctx.lineTo(spx - 4, ty - 14)
      ctx.lineTo(spx + 4, ty - 14)
      ctx.closePath()
      ctx.fill()
    }
  })

  // ── Belt ──
  const beltY = ty + th - 12
  const beltGrad = ctx.createLinearGradient(tx, beltY, tx + tw, beltY + 12)
  beltGrad.addColorStop(0, '#3a3a3a')
  beltGrad.addColorStop(1, '#1a1a1a')
  ctx.fillStyle = beltGrad
  roundRect(ctx, tx, beltY, tw, 12, 2)
  ctx.fill()

  // Belt buckle
  ctx.fillStyle = '#c0a040'
  roundRect(ctx, cx - 8, beltY + 2, 16, 8, 2)
  ctx.fill()
  ctx.strokeStyle = '#7a6020'
  ctx.lineWidth = 0.5
  roundRect(ctx, cx - 8, beltY + 2, 16, 8, 2)
  ctx.stroke()

  ctx.restore()
}

// ─── Legs ────────────────────────────────────────────────────────────────────

function drawLegs(ctx: CanvasRenderingContext2D, cx: number, legsY: number, classColor: string) {
  ctx.save()

  const armorDark  = '#1a1a1a'
  const armorMid   = '#2a2a2a'
  const metalEdge  = '#555555'

  ;[-1, 1].forEach(side => {
    const lx = cx + side * 14 - 16

    // Upper leg
    const ug = ctx.createLinearGradient(lx, legsY, lx + 28, legsY + 40)
    ug.addColorStop(0, armorMid)
    ug.addColorStop(1, armorDark)
    ctx.fillStyle = ug
    roundRect(ctx, lx, legsY, 28, 40, 4)
    ctx.fill()
    ctx.strokeStyle = metalEdge
    ctx.lineWidth = 0.7
    roundRect(ctx, lx, legsY, 28, 40, 4)
    ctx.stroke()

    // Knee pad
    ctx.fillStyle = classColor
    ctx.globalAlpha = 0.7
    ctx.beginPath()
    ctx.arc(lx + 14, legsY + 42, 8, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1

    // Boot
    const bootY = legsY + 46
    const bg2 = ctx.createLinearGradient(lx - 2, bootY, lx + 28, bootY + 40)
    bg2.addColorStop(0, '#2a2a2a')
    bg2.addColorStop(1, '#0a0a0a')
    ctx.fillStyle = bg2
    roundRect(ctx, lx - 2, bootY, 32, 38, 6)
    ctx.fill()
    ctx.strokeStyle = '#444'
    ctx.lineWidth = 0.7
    roundRect(ctx, lx - 2, bootY, 32, 38, 6)
    ctx.stroke()

    // Boot highlight
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'
    ctx.lineWidth = 0.5
    ctx.beginPath()
    ctx.moveTo(lx + 4, bootY + 6); ctx.lineTo(lx + 24, bootY + 6)
    ctx.stroke()
  })

  ctx.restore()
}

// ─── Arms ────────────────────────────────────────────────────────────────────

function drawArms(ctx: CanvasRenderingContext2D, cx: number, armsY: number, classColor: string) {
  ctx.save()

  const armorDark = '#1a1a1a'
  const armorMid  = '#2a2a2a'
  const metalEdge = '#555555'

  // ── Right arm (lowered) ──
  const rax = cx + 34
  const rag = ctx.createLinearGradient(rax, armsY, rax + 22, armsY + 60)
  rag.addColorStop(0, armorMid)
  rag.addColorStop(1, armorDark)
  ctx.fillStyle = rag
  ctx.beginPath()
  ctx.moveTo(rax, armsY)
  ctx.lineTo(rax + 22, armsY + 10)
  ctx.lineTo(rax + 22, armsY + 60)
  ctx.lineTo(rax, armsY + 55)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = metalEdge; ctx.lineWidth = 0.7
  ctx.beginPath()
  ctx.moveTo(rax, armsY); ctx.lineTo(rax + 22, armsY + 10)
  ctx.lineTo(rax + 22, armsY + 60); ctx.lineTo(rax, armsY + 55); ctx.closePath()
  ctx.stroke()

  // Right gauntlet
  const rg2 = ctx.createLinearGradient(rax, armsY + 55, rax + 24, armsY + 80)
  rg2.addColorStop(0, '#2a2a2a'); rg2.addColorStop(1, '#0a0a0a')
  ctx.fillStyle = rg2
  roundRect(ctx, rax, armsY + 55, 24, 24, 6)
  ctx.fill()
  ctx.strokeStyle = metalEdge
  roundRect(ctx, rax, armsY + 55, 24, 24, 6)
  ctx.stroke()

  // ── Left arm (raised — holding artifact) ──
  const lax = cx - 56
  const lag = ctx.createLinearGradient(lax, armsY - 50, lax + 22, armsY + 20)
  lag.addColorStop(0, armorMid)
  lag.addColorStop(1, armorDark)
  ctx.fillStyle = lag
  ctx.beginPath()
  ctx.moveTo(lax + 22, armsY)
  ctx.lineTo(lax, armsY - 8)
  ctx.lineTo(lax, armsY - 65)
  ctx.lineTo(lax + 22, armsY - 58)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = metalEdge; ctx.lineWidth = 0.7
  ctx.beginPath()
  ctx.moveTo(lax + 22, armsY); ctx.lineTo(lax, armsY - 8)
  ctx.lineTo(lax, armsY - 65); ctx.lineTo(lax + 22, armsY - 58); ctx.closePath()
  ctx.stroke()

  // Left gauntlet (at top of raised arm)
  const lg2 = ctx.createLinearGradient(lax, armsY - 85, lax + 26, armsY - 58)
  lg2.addColorStop(0, classColor)
  lg2.addColorStop(0.4, '#2a2a2a'); lg2.addColorStop(1, '#0a0a0a')
  ctx.fillStyle = lg2
  roundRect(ctx, lax - 2, armsY - 88, 26, 24, 6)
  ctx.fill()
  ctx.strokeStyle = rgba(classColor, 0.6); ctx.lineWidth = 1
  roundRect(ctx, lax - 2, armsY - 88, 26, 24, 6)
  ctx.stroke()

  ctx.restore()
}

// ─── Head ────────────────────────────────────────────────────────────────────

function drawHead(ctx: CanvasRenderingContext2D, cx: number, headY: number, classColor: string, wClass: WarriorClass) {
  ctx.save()

  const headR = 46

  // Neck
  ctx.fillStyle = '#d4a882'
  ctx.fillRect(cx - 10, headY + headR - 5, 20, 20)

  // Head shadow
  ctx.fillStyle = 'rgba(0,0,0,0.4)'
  ctx.beginPath(); ctx.ellipse(cx + 3, headY + 5, headR + 2, headR + 2, 0, 0, Math.PI * 2); ctx.fill()

  // Skin
  const skinGrad = ctx.createRadialGradient(cx - 10, headY - 10, 5, cx, headY, headR)
  skinGrad.addColorStop(0, '#f5c8a0')
  skinGrad.addColorStop(0.6, '#e8b080')
  skinGrad.addColorStop(1, '#c8905a')
  ctx.fillStyle = skinGrad
  ctx.beginPath(); ctx.ellipse(cx, headY, headR, headR, 0, 0, Math.PI * 2); ctx.fill()

  // Chin/jaw shadow
  ctx.fillStyle = 'rgba(0,0,0,0.12)'
  ctx.beginPath(); ctx.ellipse(cx, headY + headR * 0.6, headR * 0.7, headR * 0.25, 0, 0, Math.PI); ctx.fill()

  // ── Eyes ──
  const eyeY = headY - 4
  ;[-16, 16].forEach(ex => {
    // White
    ctx.fillStyle = 'rgba(255,255,255,0.95)'
    ctx.beginPath(); ctx.ellipse(cx + ex, eyeY, 9, 10, 0, 0, Math.PI * 2); ctx.fill()
    // Iris
    ctx.fillStyle = '#111'
    ctx.beginPath(); ctx.arc(cx + ex, eyeY + 2, 7, 0, Math.PI * 2); ctx.fill()
    // Shine
    ctx.fillStyle = 'white'
    ctx.beginPath(); ctx.arc(cx + ex - 3, eyeY - 2, 2.5, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(cx + ex + 2, eyeY + 3, 1.2, 0, Math.PI * 2); ctx.fill()
    // Eyebrow
    ctx.fillStyle = '#4a3010'
    ctx.beginPath()
    ctx.moveTo(cx + ex - 9, eyeY - 12)
    ctx.quadraticCurveTo(cx + ex, eyeY - 16, cx + ex + 9, eyeY - 12)
    ctx.quadraticCurveTo(cx + ex + 9, eyeY - 10, cx + ex, eyeY - 13)
    ctx.quadraticCurveTo(cx + ex - 9, eyeY - 10, cx + ex - 9, eyeY - 12)
    ctx.fill()
  })

  // ── Nose ──
  ctx.fillStyle = 'rgba(0,0,0,0.15)'
  ctx.beginPath(); ctx.ellipse(cx, headY + 10, 4, 5, 0, 0, Math.PI * 2); ctx.fill()

  // ── Mouth (slight smirk) ──
  ctx.strokeStyle = '#8a5030'
  ctx.lineWidth = 1.8
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(cx - 8, headY + 22)
  ctx.quadraticCurveTo(cx, headY + 26, cx + 10, headY + 22)
  ctx.stroke()

  // ── Beard (for non-scout/wanderer classes) ──
  if (wClass !== 'SCOUT' && wClass !== 'WANDERER') {
    ctx.fillStyle = '#3a2810'
    ctx.globalAlpha = 0.6
    ctx.beginPath()
    ctx.moveTo(cx - 10, headY + 24)
    ctx.quadraticCurveTo(cx, headY + 38, cx + 12, headY + 24)
    ctx.quadraticCurveTo(cx + 6, headY + 30, cx, headY + 32)
    ctx.quadraticCurveTo(cx - 6, headY + 30, cx - 10, headY + 24)
    ctx.fill()
    ctx.globalAlpha = 1
  }

  // ── Collar (armor collar around neck) ──
  ctx.fillStyle = '#2a2a2a'
  ctx.beginPath()
  ctx.moveTo(cx - 28, headY + headR - 6)
  ctx.lineTo(cx - 22, headY + headR + 10)
  ctx.lineTo(cx + 22, headY + headR + 10)
  ctx.lineTo(cx + 28, headY + headR - 6)
  ctx.quadraticCurveTo(cx + 20, headY + headR + 2, cx, headY + headR + 4)
  ctx.quadraticCurveTo(cx - 20, headY + headR + 2, cx - 28, headY + headR - 6)
  ctx.fill()

  ctx.fillStyle = rgba(classColor, 0.5)
  ctx.beginPath()
  ctx.moveTo(cx - 28, headY + headR - 6)
  ctx.lineTo(cx - 22, headY + headR + 10)
  ctx.lineTo(cx + 22, headY + headR + 10)
  ctx.lineTo(cx + 28, headY + headR - 6)
  ctx.quadraticCurveTo(cx, headY + headR + 2, cx - 28, headY + headR - 6)
  ctx.fill()

  ctx.restore()
}

// ─── Hair ────────────────────────────────────────────────────────────────────

function drawHair(ctx: CanvasRenderingContext2D, cx: number, headY: number, headR: number, wClass: WarriorClass) {
  ctx.save()

  const hairColors: Record<WarriorClass, string[]> = {
    BERSERKER: ['#5a2010', '#8a3018'],
    KNIGHT:    ['#2a1a08', '#4a3018'],
    MAGE:      ['#1a0a3a', '#3a1a6a'],
    ASSASSIN:  ['#0a0a1a', '#1a1a3a'],
    SCOUT:     ['#3a2808', '#6a4818'],
    WANDERER:  ['#2a2a2a', '#4a4a4a'],
  }
  const [hairDark, hairLight] = hairColors[wClass]

  const hairGrad = ctx.createLinearGradient(cx - headR, headY - headR, cx + headR, headY)
  hairGrad.addColorStop(0, hairLight)
  hairGrad.addColorStop(1, hairDark)
  ctx.fillStyle = hairGrad

  if (wClass === 'BERSERKER') {
    // Wild spiky hair
    ctx.beginPath()
    ctx.moveTo(cx - headR + 5, headY)
    ctx.lineTo(cx - headR - 8, headY - 30)
    ctx.lineTo(cx - headR + 8, headY - 20)
    ctx.lineTo(cx - 25, headY - headR - 15)
    ctx.lineTo(cx - 10, headY - headR - 5)
    ctx.lineTo(cx, headY - headR - 20)
    ctx.lineTo(cx + 10, headY - headR - 8)
    ctx.lineTo(cx + 25, headY - headR - 18)
    ctx.lineTo(cx + headR - 5, headY - 25)
    ctx.lineTo(cx + headR + 5, headY - 15)
    ctx.lineTo(cx + headR, headY - 5)
    ctx.arc(cx, headY, headR, -0.1, Math.PI + 0.1, false)
    ctx.closePath()
    ctx.fill()
  } else if (wClass === 'MAGE') {
    // Flowing long hair
    ctx.beginPath()
    ctx.arc(cx, headY, headR, Math.PI * 1.1, 0, false)
    ctx.lineTo(cx + headR + 10, headY + 30)
    ctx.quadraticCurveTo(cx + headR + 15, headY + 60, cx + headR, headY + 80)
    ctx.lineTo(cx - headR, headY + 60)
    ctx.quadraticCurveTo(cx - headR - 10, headY + 30, cx - headR - 8, headY + 10)
    ctx.closePath()
    ctx.fill()
  } else if (wClass === 'ASSASSIN') {
    // Slicked back dark
    ctx.beginPath()
    ctx.arc(cx, headY, headR, Math.PI * 1.15, Math.PI * 0.05, false)
    ctx.lineTo(cx + headR - 5, headY - 15)
    ctx.quadraticCurveTo(cx + 10, headY - headR - 10, cx, headY - headR - 5)
    ctx.quadraticCurveTo(cx - 20, headY - headR + 5, cx - headR + 5, headY - headR + 15)
    ctx.closePath()
    ctx.fill()
  } else {
    // Standard medium hair
    ctx.beginPath()
    ctx.arc(cx, headY, headR, Math.PI * 1.1, 0, false)
    ctx.lineTo(cx + headR + 5, headY + 10)
    ctx.quadraticCurveTo(cx + headR, headY + 30, cx + headR - 10, headY + 20)
    ctx.lineTo(cx + 5, headY + headR + 5)
    ctx.lineTo(cx - 5, headY + headR + 5)
    ctx.lineTo(cx - headR + 10, headY + 20)
    ctx.quadraticCurveTo(cx - headR, headY + 30, cx - headR - 5, headY + 10)
    ctx.closePath()
    ctx.fill()
  }

  ctx.restore()
}

// ─── Floating Artifact ────────────────────────────────────────────────────────

function drawFloatingArtifact(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  domainLabel: string,
  classColor: string,
  t: number
) {
  ctx.save()

  const floatOffset = Math.sin(t / 800) * 5
  const fy = y + floatOffset
  const fw = 72, fh = 56

  // Glow
  const glowGrad = ctx.createRadialGradient(x, fy, 5, x, fy, 45)
  glowGrad.addColorStop(0, rgba(classColor, 0.5))
  glowGrad.addColorStop(1, 'transparent')
  ctx.fillStyle = glowGrad
  ctx.beginPath(); ctx.arc(x, fy, 45, 0, Math.PI * 2); ctx.fill()

  // Artifact card shadow
  ctx.fillStyle = 'rgba(0,0,0,0.5)'
  roundRect(ctx, x - fw / 2 + 3, fy - fh / 2 + 3, fw, fh, 8)
  ctx.fill()

  // Artifact card
  const cardGrad = ctx.createLinearGradient(x - fw / 2, fy - fh / 2, x + fw / 2, fy + fh / 2)
  cardGrad.addColorStop(0, '#3a3010')
  cardGrad.addColorStop(0.3, '#6a5020')
  cardGrad.addColorStop(0.7, '#5a4018')
  cardGrad.addColorStop(1, '#2a2008')
  ctx.fillStyle = cardGrad
  roundRect(ctx, x - fw / 2, fy - fh / 2, fw, fh, 8)
  ctx.fill()

  // Gold border
  ctx.strokeStyle = classColor
  ctx.lineWidth = 2
  roundRect(ctx, x - fw / 2, fy - fh / 2, fw, fh, 8)
  ctx.stroke()

  // Inner glow border
  ctx.strokeStyle = rgba(classColor, 0.4)
  ctx.lineWidth = 1
  roundRect(ctx, x - fw / 2 + 3, fy - fh / 2 + 3, fw - 6, fh - 6, 6)
  ctx.stroke()

  // Domain text
  ctx.font = 'bold 11px "Share Tech Mono", monospace'
  ctx.fillStyle = classColor
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.shadowColor = classColor
  ctx.shadowBlur = 8
  ctx.fillText(domainLabel.toUpperCase(), x, fy - 8)
  ctx.shadowBlur = 0

  // ".ton" label
  ctx.font = '9px "Share Tech Mono", monospace'
  ctx.fillStyle = rgba(classColor, 0.7)
  ctx.fillText('.ton', x, fy + 6)

  // Stars/sparkles around the artifact
  ctx.fillStyle = classColor
  ;[[x - 32, fy - 28], [x + 30, fy - 22], [x + 28, fy + 20], [x - 30, fy + 18]].forEach(([sx, sy]) => {
    const sparkAlpha = 0.5 + 0.5 * Math.sin(t / 400 + sx!)
    ctx.globalAlpha = sparkAlpha
    ctx.beginPath(); ctx.arc(sx!, sy!, 2, 0, Math.PI * 2); ctx.fill()
    // Small cross sparkle
    ctx.lineWidth = 0.5
    ctx.strokeStyle = classColor
    ctx.beginPath(); ctx.moveTo(sx! - 4, sy!); ctx.lineTo(sx! + 4, sy!); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(sx!, sy! - 4); ctx.lineTo(sx!, sy! + 4); ctx.stroke()
  })
  ctx.globalAlpha = 1

  // Connection line from hand to artifact
  ctx.strokeStyle = rgba(classColor, 0.3)
  ctx.lineWidth = 1
  ctx.setLineDash([3, 4])
  ctx.beginPath()
  ctx.moveTo(x, fy + fh / 2)
  ctx.lineTo(x, fy + fh / 2 + 18)
  ctx.stroke()
  ctx.setLineDash([])

  ctx.restore()
}

// ─── Domain number watermark ───────────────────────────────────────────────

function drawDomainWatermark(ctx: CanvasRenderingContext2D, domain: string, classColor: string) {
  ctx.save()
  ctx.font = 'bold 72px "Share Tech Mono", monospace'
  ctx.fillStyle = rgba(classColor, 0.04)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(domain.replace('.ton', ''), W / 2, H / 2)
  ctx.restore()
}

// ─── Main render ─────────────────────────────────────────────────────────────

export function renderFigurine(
  ctx:     CanvasRenderingContext2D,
  options: FigurineOptions,
  t:       number = 0
) {
  const { warrior, floatingDomain } = options
  const config     = WARRIOR_CLASSES[warrior.warriorClass]
  const classColor = options.accentColor ?? config.color
  const bgColor    = options.background ?? '#0a0a0a'

  ctx.clearRect(0, 0, W, H)

  // Background
  drawBackground(ctx, bgColor, classColor)

  // Domain watermark
  drawDomainWatermark(ctx, warrior.primaryDomain, classColor)

  // Layout anchors
  const cx      = W / 2 + 10
  const baseY   = H - 68
  const legsY   = baseY - 90
  const torsoY  = legsY - 85
  const armsY   = torsoY + 10
  const headY   = torsoY - 52
  const headR   = 46

  // Draw layers back-to-front
  drawBase(ctx, cx, baseY)
  drawCape(ctx, cx, torsoY, classColor)
  drawLegs(ctx, cx, legsY, classColor)
  drawBody(ctx, cx, torsoY, classColor, warrior.armorCount, warrior.warriorClass)
  drawArms(ctx, cx, armsY, classColor)
  drawHair(ctx, cx, headY, headR, warrior.warriorClass)
  drawHead(ctx, cx, headY, classColor, warrior.warriorClass)

  // Floating artifact above raised left hand
  const artifactX = cx - 46
  const artifactY = armsY - 120

  if (floatingDomain) {
    drawFloatingArtifact(ctx, artifactX, artifactY, floatingDomain, classColor, t)
  } else {
    // Default: glowing 4N orb
    ctx.save()
    const floatOffset = Math.sin(t / 900) * 4
    const orbY = artifactY + floatOffset
    const orbGrad = ctx.createRadialGradient(artifactX - 4, orbY - 4, 2, artifactX, orbY, 20)
    orbGrad.addColorStop(0, '#ffffff')
    orbGrad.addColorStop(0.3, classColor)
    orbGrad.addColorStop(1, rgba(classColor, 0.2))
    ctx.fillStyle = orbGrad
    ctx.shadowColor = classColor
    ctx.shadowBlur = 20
    ctx.beginPath(); ctx.arc(artifactX, orbY, 18, 0, Math.PI * 2); ctx.fill()
    ctx.shadowBlur = 0
    ctx.font = 'bold 9px "Share Tech Mono", monospace'
    ctx.fillStyle = '#000'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(warrior.primaryDomain.replace('.ton', ''), artifactX, orbY)
    ctx.restore()
  }
}

// ─── Determine floating domain ─────────────────────────────────────────────

export function getFloatingDomain(
  allDomains: { label: string; is4N: boolean; length: number }[]
): string | null {
  // Priority 1: year domains (1991-2009 era = "big year first website" pattern)
  const yearDomains = allDomains.filter(d => {
    const n = parseInt(d.label)
    return d.length === 4 && !isNaN(n) && n >= 1900 && n <= 2030
  })
  if (yearDomains.length > 0) return yearDomains[0].label

  // Priority 2: shortest non-4N domain (most premium)
  const nonFourN = allDomains.filter(d => !d.is4N).sort((a, b) => a.length - b.length)
  if (nonFourN.length > 0 && nonFourN[0].length <= 5) return nonFourN[0].label

  return null
}
