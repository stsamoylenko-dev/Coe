'use client'

import { useEffect, useRef } from 'react'

interface StatBarProps {
  label:  string
  value:  number  // 0–100
  color?: string
  delay?: number  // animation delay ms
}

export default function StatBar({ label, value, color = '#00c870', delay = 0 }: StatBarProps) {
  const fillRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = fillRef.current
    if (!el) return
    const timer = setTimeout(() => {
      el.style.width = `${value}%`
    }, delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="font-mono text-xs tracking-widest text-[var(--color-text-secondary)] uppercase">
          {label}
        </span>
        <span className="font-display font-bold text-sm" style={{ color }}>
          {value}
        </span>
      </div>
      <div className="h-1.5 bg-[var(--color-bg-raised)] rounded-full overflow-hidden">
        <div
          ref={fillRef}
          className="h-full rounded-full transition-[width] duration-1000 ease-out"
          style={{
            width: '0%',
            backgroundColor: color,
            boxShadow: `0 0 6px ${color}88`,
          }}
        />
      </div>
    </div>
  )
}
