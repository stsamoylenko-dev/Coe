import JSZip from 'jszip'
import type { WarriorData } from '@/store/warriorStore'
import { renderFigurine, getFloatingDomain } from './figurineRenderer'
import {
  STICKER_TEXTS,
  getStickerTemplate,
  renderStickerText,
  buildNFTMetadata,
} from '@/lib/sticker/templates'
import type { WarriorClass } from '@/lib/constants'
import { WARRIOR_CLASSES } from '@/lib/constants'

const S = 512

function hexComponents(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b}`
}

function renderStickerToBlob(
  warrior: WarriorData,
  floatingDomain: string | null,
  stickerIndex: number,
  warriorNumber: number,
): Promise<Blob> {
  const domainNumber = parseInt(warrior.primaryDomain.replace('.ton', '')) || 0
  const template = getStickerTemplate(domainNumber, stickerIndex)
  const { background: bgTheme, textIndex } = template

  const canvas = document.createElement('canvas')
  canvas.width = S
  canvas.height = S
  const ctx = canvas.getContext('2d')!

  // Render figurine with sticker's colour scheme
  renderFigurine(
    ctx,
    {
      warrior,
      floatingDomain,
      background:  bgTheme.bg,
      accentColor: bgTheme.accent,
    },
    0,
  )

  // ── Text overlay ────────────────────────────────────────────────────────────
  const panelH = 100
  const panelY = S - panelH

  // Dark frosted panel
  ctx.fillStyle = 'rgba(0,0,0,0.65)'
  ctx.fillRect(0, panelY, S, panelH)

  // Top accent line
  ctx.strokeStyle = bgTheme.accent
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(0, panelY)
  ctx.lineTo(S, panelY)
  ctx.stroke()

  // Text content
  const domainLabel = warrior.primaryDomain.replace('.ton', '')
  const legacyScore = Math.round(warrior.stats.legacyScore)
  const textLines   = STICKER_TEXTS[warrior.warriorClass as WarriorClass][textIndex]
  const [line1, line2, line3] = renderStickerText(
    textLines, domainLabel, legacyScore, warriorNumber,
  )

  ctx.textAlign    = 'center'
  ctx.textBaseline = 'middle'

  // Line 1 — main (glow)
  ctx.font      = 'bold 17px "Share Tech Mono", monospace'
  ctx.fillStyle = bgTheme.accent
  ctx.shadowColor = bgTheme.accent
  ctx.shadowBlur  = 10
  ctx.fillText(line1, S / 2, panelY + 22)
  ctx.shadowBlur  = 0

  // Line 2 — secondary
  ctx.font      = 'bold 12px "Share Tech Mono", monospace'
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.fillText(line2, S / 2, panelY + 50)

  // Line 3 — tertiary (accent, lower opacity)
  ctx.font      = '10px "Share Tech Mono", monospace'
  ctx.fillStyle = `rgba(${hexComponents(bgTheme.accent)},0.65)`
  ctx.fillText(line3, S / 2, panelY + 76)

  // ── Warrior number (top-right) ──────────────────────────────────────────────
  const paddedNum = String(warriorNumber).padStart(4, '0')
  ctx.font         = 'bold 11px "Share Tech Mono", monospace'
  ctx.fillStyle    = `rgba(${hexComponents(bgTheme.accent)},0.9)`
  ctx.textAlign    = 'right'
  ctx.textBaseline = 'top'
  ctx.fillText(`#${paddedNum}`, S - 14, 14)

  // ── Class label (top-left) ───────────────────────────────────────────────
  ctx.font         = '10px "Share Tech Mono", monospace'
  ctx.fillStyle    = `rgba(${hexComponents(bgTheme.accent)},0.6)`
  ctx.textAlign    = 'left'
  ctx.fillText(WARRIOR_CLASSES[warrior.warriorClass as WarriorClass].labelRu, 14, 14)

  return new Promise(resolve =>
    canvas.toBlob(blob => resolve(blob!), 'image/png'),
  )
}

export async function exportStickerPack(
  warrior:         WarriorData,
  allDomainLabels: { label: string; is4N: boolean; length: number }[],
  warriorNumber:   number,
  onProgress?:     (done: number, total: number) => void,
): Promise<void> {
  const floatingDomain = getFloatingDomain(allDomainLabels)
  const domainNumber   = parseInt(warrior.primaryDomain.replace('.ton', '')) || 0
  const paddedNum      = String(warriorNumber).padStart(4, '0')

  const zip    = new JSZip()
  const folder = zip.folder(`warrior_${paddedNum}_stickers`)!

  for (let i = 0; i < 5; i++) {
    const blob     = await renderStickerToBlob(warrior, floatingDomain, i, warriorNumber)
    const template = getStickerTemplate(domainNumber, i)

    folder.file(`warrior_${paddedNum}_s${i + 1}.png`, blob)

    const meta = buildNFTMetadata({
      warriorNumber,
      stickerIndex:  i,
      domain:        warrior.primaryDomain.replace('.ton', ''),
      warriorClass:  warrior.warriorClass,
      legacyScore:   Math.round(warrior.stats.legacyScore),
      armorCount:    warrior.armorCount,
      mana:          warrior.mana,
      templateSet:   template.templateSet,
      hasPremium:    floatingDomain !== null,
    })
    folder.file(
      `warrior_${paddedNum}_s${i + 1}_metadata.json`,
      JSON.stringify(meta, null, 2),
    )

    onProgress?.(i + 1, 5)
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' })
  const url     = URL.createObjectURL(zipBlob)
  const a       = document.createElement('a')
  a.href        = url
  a.download    = `warrior_${paddedNum}_stickers.zip`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
