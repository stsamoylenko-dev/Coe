'use client'

import { useEffect, useRef } from 'react'
import { renderFigurine, getFloatingDomain } from '@/lib/canvas/figurineRenderer'
import type { WarriorData } from '@/store/warriorStore'
import type { ParsedDomain } from '@/lib/ton/types'

interface Props {
  warrior:        WarriorData
  allDomains?:    ParsedDomain[]
  className?:     string
}

const CANVAS_SIZE = 512

export default function FigurineView({ warrior, allDomains = [], className = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef    = useRef<number>(0)
  const startRef  = useRef<number>(0)

  const domainLabels = allDomains.map(d => ({
    label: d.label,
    is4N:  d.is4N,
    length: d.length,
  }))
  const floatingDomain = getFloatingDomain(domainLabels)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    function loop(now: number) {
      if (!startRef.current) startRef.current = now
      const t = now - startRef.current

      renderFigurine(ctx!, { warrior, floatingDomain }, t)
      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [warrior, floatingDomain])

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_SIZE}
      height={CANVAS_SIZE}
      className={className}
      style={{ imageRendering: 'crisp-edges' }}
    />
  )
}
