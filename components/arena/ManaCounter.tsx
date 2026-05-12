'use client'

import { useEffect, useRef } from 'react'

interface ManaCounterProps {
  mana:    number
  visible: boolean
}

export default function ManaCounter({ mana, visible }: ManaCounterProps) {
  const displayRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!visible || !displayRef.current) return
    const el      = displayRef.current
    const target  = mana
    const duration = 2000
    const start    = performance.now()

    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased    = 1 - Math.pow(1 - progress, 3)
      el.textContent = Math.round(eased * target).toLocaleString()
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [mana, visible])

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="font-mono text-[10px] tracking-widest text-[var(--color-text-muted)] uppercase">
        Концентрированная Мана
      </div>
      <div
        className="font-display text-5xl font-bold"
        style={{
          color:      '#aa44ff',
          textShadow: '0 0 20px rgba(170,68,255,0.6), 0 0 40px rgba(170,68,255,0.3)',
          animation:  'manaPulse 3s ease-in-out infinite',
        }}
      >
        <span ref={displayRef}>0</span>
      </div>
      <div className="font-mono text-xs text-[var(--color-text-muted)]">
        единиц · готово к пробуждению
      </div>
    </div>
  )
}
