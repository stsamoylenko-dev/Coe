import type { WarriorData } from '@/store/warriorStore'
import { WARRIOR_CLASSES } from '@/lib/constants'

const W = 800
const H = 1100

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 200, 112]
}

function drawBackground(ctx: CanvasRenderingContext2D) {
  const bg = ctx.createRadialGradient(W / 2, H * 0.4, 50, W / 2, H * 0.4, 700)
  bg.addColorStop(0, '#0d2e22')
  bg.addColorStop(1, '#040d09')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // Metal grid
  ctx.strokeStyle = 'rgba(0,200,112,0.04)'
  ctx.lineWidth = 0.5
  for (let x = 0; x < W; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
  }
  for (let y = 0; y < H; y += 40) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
  }
}

function drawGlassPanel(ctx: CanvasRenderingContext2D) {
  ctx.save()
  ctx.globalAlpha = 0.6
  ctx.fillStyle = 'rgba(13,31,26,0.8)'
  roundRect(ctx, 30, 30, W - 60, H - 60, 16)
  ctx.fill()
  ctx.globalAlpha = 1
  ctx.strokeStyle = 'rgba(0,200,112,0.2)'
  ctx.lineWidth = 1
  roundRect(ctx, 30, 30, W - 60, H - 60, 16)
  ctx.stroke()
  ctx.restore()
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

function drawWarriorSilhouette(ctx: CanvasRenderingContext2D, warrior: WarriorData) {
  const config = WARRIOR_CLASSES[warrior.warriorClass]
  const [r, g, b] = hexToRgb(config.color)
  const cx = W / 2
  const cy = 420

  // Outer aura
  const aura = ctx.createRadialGradient(cx, cy, 20, cx, cy, 200)
  aura.addColorStop(0, `rgba(${r},${g},${b},0.15)`)
  aura.addColorStop(1, 'transparent')
  ctx.fillStyle = aura
  ctx.fillRect(cx - 200, cy - 200, 400, 400)

  // Body silhouette (geometric warrior form per class)
  ctx.save()
  ctx.strokeStyle = `rgba(${r},${g},${b},0.8)`
  ctx.fillStyle   = `rgba(${r},${g},${b},0.12)`
  ctx.lineWidth   = 1.5

  // Head
  ctx.beginPath()
  ctx.arc(cx, cy - 120, 30, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  // Torso
  ctx.beginPath()
  ctx.moveTo(cx - 40, cy - 90)
  ctx.lineTo(cx + 40, cy - 90)
  ctx.lineTo(cx + 50, cy + 20)
  ctx.lineTo(cx - 50, cy + 20)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // Arms
  if (warrior.warriorClass === 'BERSERKER') {
    // Wide, aggressive arms
    ctx.beginPath()
    ctx.moveTo(cx - 40, cy - 80)
    ctx.lineTo(cx - 100, cy - 30)
    ctx.lineTo(cx - 80, cy + 20)
    ctx.lineTo(cx - 50, cy + 20)
    ctx.closePath()
    ctx.fill(); ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(cx + 40, cy - 80)
    ctx.lineTo(cx + 100, cy - 30)
    ctx.lineTo(cx + 80, cy + 20)
    ctx.lineTo(cx + 50, cy + 20)
    ctx.closePath()
    ctx.fill(); ctx.stroke()
  } else {
    ctx.beginPath()
    ctx.moveTo(cx - 40, cy - 80); ctx.lineTo(cx - 75, cy); ctx.lineTo(cx - 50, cy + 20)
    ctx.closePath(); ctx.fill(); ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(cx + 40, cy - 80); ctx.lineTo(cx + 75, cy); ctx.lineTo(cx + 50, cy + 20)
    ctx.closePath(); ctx.fill(); ctx.stroke()
  }

  // Legs
  ctx.beginPath()
  ctx.moveTo(cx - 50, cy + 20)
  ctx.lineTo(cx - 35, cy + 100)
  ctx.lineTo(cx - 10, cy + 100)
  ctx.lineTo(cx, cy + 20)
  ctx.closePath()
  ctx.fill(); ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(cx + 50, cy + 20)
  ctx.lineTo(cx + 35, cy + 100)
  ctx.lineTo(cx + 10, cy + 100)
  ctx.lineTo(cx, cy + 20)
  ctx.closePath()
  ctx.fill(); ctx.stroke()

  // Glowing center rune on chest
  ctx.beginPath()
  ctx.arc(cx, cy - 40, 8, 0, Math.PI * 2)
  ctx.fillStyle = `rgba(${r},${g},${b},0.9)`
  ctx.fill()
  ctx.shadowColor = `rgba(${r},${g},${b},1)`
  ctx.shadowBlur = 15
  ctx.fill()
  ctx.shadowBlur = 0

  ctx.restore()
}

function drawHeader(ctx: CanvasRenderingContext2D, warrior: WarriorData) {
  const config = WARRIOR_CLASSES[warrior.warriorClass]

  // Domain name (big)
  ctx.font = 'bold 56px "Share Tech Mono", monospace'
  ctx.fillStyle = '#00c870'
  ctx.textAlign = 'center'
  ctx.shadowColor = 'rgba(0,200,112,0.6)'
  ctx.shadowBlur  = 20
  ctx.fillText(warrior.primaryDomain, W / 2, 110)
  ctx.shadowBlur  = 0

  // Class label
  ctx.font = '600 18px "Rajdhani", sans-serif'
  ctx.fillStyle = config.color
  ctx.letterSpacing = '0.3em'
  ctx.fillText(config.labelRu.toUpperCase(), W / 2, 145)
  ctx.letterSpacing = '0'
}

function drawStatBars(ctx: CanvasRenderingContext2D, warrior: WarriorData) {
  const stats = [
    { label: 'СИЛА',          value: warrior.stats.strength,    color: WARRIOR_CLASSES[warrior.warriorClass].color },
    { label: 'ВЫНОСЛИВОСТЬ',  value: warrior.stats.endurance,   color: '#00aaff' },
    { label: 'СТИЛЬ БОЯ',    value: warrior.stats.battleStyle,  color: '#aa44ff' },
  ]

  const startY = 560
  const barW   = 600
  const barX   = (W - barW) / 2

  stats.forEach(({ label, value, color }, i) => {
    const y = startY + i * 55
    const [r, g, b] = hexToRgb(color)

    ctx.font = '500 13px "Share Tech Mono", monospace'
    ctx.fillStyle = 'rgba(100,160,130,0.8)'
    ctx.textAlign = 'left'
    ctx.fillText(label, barX, y - 6)

    ctx.font = 'bold 13px "Rajdhani", sans-serif'
    ctx.fillStyle = color
    ctx.textAlign = 'right'
    ctx.fillText(String(value), barX + barW, y - 6)
    ctx.textAlign = 'left'

    // Track
    ctx.fillStyle = 'rgba(18,43,35,0.8)'
    ctx.beginPath()
    roundRect(ctx, barX, y, barW, 8, 4)
    ctx.fill()

    // Fill
    const fillW = (value / 100) * barW
    ctx.fillStyle = `rgba(${r},${g},${b},0.9)`
    ctx.shadowColor = color
    ctx.shadowBlur  = 6
    ctx.beginPath()
    roundRect(ctx, barX, y, fillW, 8, 4)
    ctx.fill()
    ctx.shadowBlur = 0
  })
}

function drawLegacyScore(ctx: CanvasRenderingContext2D, score: number) {
  const cx = W / 2

  ctx.font = '400 12px "Share Tech Mono", monospace'
  ctx.fillStyle = 'rgba(100,160,130,0.7)'
  ctx.textAlign = 'center'
  ctx.fillText('LEGACY SCORE', cx, 740)

  ctx.font = 'bold 64px "Rajdhani", sans-serif'
  ctx.fillStyle = '#00c870'
  ctx.shadowColor = 'rgba(0,200,112,0.6)'
  ctx.shadowBlur  = 25
  ctx.fillText(score.toLocaleString(), cx, 810)
  ctx.shadowBlur  = 0
}

function drawArmorList(ctx: CanvasRenderingContext2D, warrior: WarriorData) {
  const layers = warrior.armorLayers.slice(0, 5)
  const startY = 855
  const x      = 70

  ctx.font = '400 11px "Share Tech Mono", monospace'
  ctx.fillStyle = 'rgba(61,107,85,0.8)'
  ctx.textAlign = 'left'
  ctx.fillText('ЭКИПИРОВКА', x, startY)

  layers.forEach((layer, i) => {
    const y = startY + 22 + i * 22
    ctx.font = '400 13px "Share Tech Mono", monospace'
    ctx.fillStyle = 'rgba(224,245,236,0.7)'
    ctx.fillText(`• ${layer.domain.raw}`, x, y)

    ctx.font = '400 11px "Share Tech Mono", monospace'
    ctx.fillStyle = 'rgba(61,107,85,0.7)'
    ctx.textAlign = 'right'
    ctx.fillText(layer.label, W - 70, y)
    ctx.textAlign = 'left'
  })
}

function drawWatermark(ctx: CanvasRenderingContext2D) {
  ctx.font = '400 12px "Share Tech Mono", monospace'
  ctx.fillStyle = 'rgba(61,107,85,0.5)'
  ctx.textAlign = 'center'
  ctx.fillText('КОД ВЕЧНОСТИ: 4N • ton blockchain', W / 2, H - 42)
  ctx.fillStyle = 'rgba(61,107,85,0.3)'
  ctx.fillText('Verified on-chain · Immortal Legacy', W / 2, H - 24)
}

export async function exportWarriorCard(warrior: WarriorData): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width  = W
  canvas.height = H

  const ctx = canvas.getContext('2d')!

  drawBackground(ctx)
  drawGlassPanel(ctx)
  drawHeader(ctx, warrior)
  drawWarriorSilhouette(ctx, warrior)
  drawStatBars(ctx, warrior)
  drawLegacyScore(ctx, warrior.stats.legacyScore)
  drawArmorList(ctx, warrior)
  drawWatermark(ctx)

  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob)
      else reject(new Error('Canvas export failed'))
    }, 'image/png')
  })
}
