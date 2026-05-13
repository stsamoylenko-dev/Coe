'use client'

import { useEffect, useRef, useState } from 'react'
import { renderFigurine, getFloatingDomain } from '@/lib/canvas/figurineRenderer'
import { exportStickerPack } from '@/lib/canvas/stickerExporter'
import { getStickerTemplate, STICKER_BACKGROUNDS } from '@/lib/sticker/templates'
import GlassCard from '@/components/ui/GlassCard'
import type { WarriorData } from '@/store/warriorStore'
import type { ParsedDomain } from '@/lib/ton/types'

// ── Small preview for a single sticker slot ────────────────────────────────

function StickerPreview({
  warrior,
  floatingDomain,
  stickerIndex,
}: {
  warrior:        WarriorData
  floatingDomain: string | null
  stickerIndex:   number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const domainNumber = parseInt(warrior.primaryDomain.replace('.ton', '')) || 0
    const template     = getStickerTemplate(domainNumber, stickerIndex)

    renderFigurine(ctx, {
      warrior,
      floatingDomain,
      background:  template.background.bg,
      accentColor: template.background.accent,
    }, 0)
  }, [warrior, floatingDomain, stickerIndex])

  const domainNumber = parseInt(warrior.primaryDomain.replace('.ton', '')) || 0
  const { background: bg } = getStickerTemplate(domainNumber, stickerIndex)

  return (
    <div className="relative group cursor-pointer overflow-hidden rounded-lg border border-white/10 hover:border-white/30 transition-all">
      <canvas
        ref={canvasRef}
        width={512}
        height={512}
        className="w-full h-auto block"
      />
      {/* Hover label */}
      <div
        className="absolute inset-0 flex items-end justify-center pb-2 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: `linear-gradient(transparent 60%, rgba(0,0,0,0.7))` }}
      >
        <span className="font-mono text-[9px] tracking-widest uppercase"
          style={{ color: bg.accent }}>
          S{stickerIndex + 1}
        </span>
      </div>
    </div>
  )
}

// ── Main panel ─────────────────────────────────────────────────────────────

interface Props {
  warrior:     WarriorData
  allDomains?: ParsedDomain[]
}

export default function StickerPackPanel({ warrior, allDomains = [] }: Props) {
  const [generating, setGenerating] = useState(false)
  const [progress,   setProgress  ] = useState(0)

  const domainLabels = allDomains.map(d => ({
    label: d.label,
    is4N:  d.is4N,
    length: d.length,
  }))
  const floatingDomain = getFloatingDomain(domainLabels)
  const warriorNumber  = parseInt(warrior.primaryDomain.replace('.ton', '')) || 0
  const paddedNum      = String(warriorNumber).padStart(4, '0')

  const domainNumber = parseInt(warrior.primaryDomain.replace('.ton', '')) || 0
  const templateSet  = domainNumber % 69

  async function handleDownload() {
    setGenerating(true)
    setProgress(0)
    try {
      await exportStickerPack(
        warrior,
        domainLabels,
        warriorNumber,
        (done) => setProgress(done),
      )
    } finally {
      setGenerating(false)
      setProgress(0)
    }
  }

  return (
    <GlassCard className="p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="font-mono text-[10px] tracking-widest text-[var(--color-text-muted)] uppercase mb-1">
            Персональный коллекционный пак
          </div>
          <h2 className="font-display text-xl font-bold text-[var(--color-text-primary)]">
            Стикер-пак Воина #{paddedNum}
          </h2>
          <p className="font-mono text-xs text-[var(--color-text-muted)] mt-1">
            Шаблон №{templateSet} · 5 стикеров · NFT-метаданные включены
          </p>
        </div>
        <div className="text-right">
          <div className="font-mono text-[10px] tracking-widest text-[var(--color-text-muted)] uppercase">
            Цикл 69
          </div>
          <div className="font-display text-lg font-bold text-[var(--color-emerald)]">
            {templateSet}/68
          </div>
        </div>
      </div>

      {/* 5 preview tiles */}
      <div className="grid grid-cols-5 gap-2 mb-5">
        {[0, 1, 2, 3, 4].map(i => (
          <StickerPreview
            key={i}
            warrior={warrior}
            floatingDomain={floatingDomain}
            stickerIndex={i}
          />
        ))}
      </div>

      {/* Floating domain info */}
      {floatingDomain && (
        <div className="flex items-center gap-2 mb-5 px-3 py-2 rounded border border-[var(--color-emerald-dim)] bg-[rgba(0,200,112,0.05)]">
          <span className="text-[var(--color-emerald)] text-sm">✦</span>
          <span className="font-mono text-xs text-[var(--color-text-secondary)]">
            Артефакт: <span className="text-[var(--color-emerald)] font-bold">{floatingDomain}.ton</span>
            {' '}— парит над левой рукой воина
          </span>
        </div>
      )}

      {/* Progress bar */}
      {generating && (
        <div className="mb-4">
          <div className="flex justify-between font-mono text-[10px] text-[var(--color-text-muted)] mb-1">
            <span>Рендеринг стикеров...</span>
            <span>{progress}/5</span>
          </div>
          <div className="h-1 bg-[var(--color-bg-deep)] rounded overflow-hidden">
            <div
              className="h-full bg-[var(--color-emerald)] transition-all duration-300"
              style={{ width: `${(progress / 5) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Download button */}
      <button
        onClick={handleDownload}
        disabled={generating}
        className="w-full py-3 font-display font-semibold tracking-widest uppercase text-sm
          metal-btn border border-[var(--color-emerald-dim)] text-[var(--color-emerald)]
          hover:border-[var(--color-emerald)] hover:shadow-[var(--glow-emerald-sm)]
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200"
      >
        {generating
          ? `⌛ Генерация ${progress}/5...`
          : '⬇ Скачать ZIP-пак стикеров'
        }
      </button>

      {/* Footer note */}
      <p className="font-mono text-[9px] text-[var(--color-text-muted)] text-center mt-3 leading-relaxed">
        Пак включает 5 PNG-стикеров + 5 JSON-метаданных для минтинга NFT на TON.
        Каждые 69 воинов шаблоны повторяются — твоя позиция в цикле определяет редкость.
      </p>
    </GlassCard>
  )
}
