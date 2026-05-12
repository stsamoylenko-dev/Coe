'use client'

import { useState } from 'react'
import { exportWarriorCard } from '@/lib/canvas/cardExporter'
import type { WarriorData } from '@/store/warriorStore'
import LoadingRune from '@/components/ui/LoadingRune'

interface ShareButtonProps {
  warrior: WarriorData
}

export default function ShareButton({ warrior }: ShareButtonProps) {
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)

  async function handleShare() {
    setLoading(true)
    try {
      const blob = await exportWarriorCard(warrior)
      const file = new File([blob], `warrior-${warrior.primaryDomain}.png`, { type: 'image/png' })

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: `${warrior.primaryDomain} — Код Вечности` })
      } else {
        const url = URL.createObjectURL(blob)
        const a   = document.createElement('a')
        a.href     = url
        a.download = file.name
        a.click()
        setTimeout(() => URL.revokeObjectURL(url), 60_000)
      }
      setDone(true)
      setTimeout(() => setDone(false), 2000)
    } catch (err) {
      console.error('Share failed:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleShare}
      disabled={loading}
      className="metal-btn w-full py-3 font-display font-semibold tracking-widest uppercase text-sm
        text-[var(--color-emerald)] border border-[var(--color-emerald-dim)]
        hover:border-[var(--color-emerald)] hover:shadow-[var(--glow-emerald-sm)]
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-200 flex items-center justify-center gap-2"
    >
      {loading ? (
        <LoadingRune size={20} label="" />
      ) : done ? (
        '✓ Экспортировано!'
      ) : (
        '⬡ Поделиться карточкой'
      )}
    </button>
  )
}
