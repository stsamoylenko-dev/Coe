'use client'

import { useEffect, useRef, useState } from 'react'
import { buildMapSlots, type MapSlot } from '@/lib/map/mapLayout'
import { renderMapFrame } from '@/lib/map/mapRenderer'
import MapTooltip from './MapTooltip'

interface WorldMapProps {
  ownedDomains: { label: string; is4N: boolean; length: number }[]
}

interface TooltipState {
  slot: MapSlot
  x:   number
  y:   number
}

export default function WorldMap({ ownedDomains }: WorldMapProps) {
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const rafRef      = useRef<number>(0)
  const slotsRef    = useRef<MapSlot[]>([])
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)
  const [size, setSize]       = useState({ w: 600, h: 600 })

  const playerLabels = new Set(ownedDomains.map(d => d.label))

  // Resize observer
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const obs = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        setSize({ w: Math.round(width), h: Math.round(height) })
      }
    })
    obs.observe(canvas.parentElement!)
    return () => obs.disconnect()
  }, [])

  // Recompute slots when size or domains change
  useEffect(() => {
    const cx = size.w / 2
    const cy = size.h / 2
    slotsRef.current = buildMapSlots(ownedDomains, cx, cy)
  }, [ownedDomains, size])

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    function loop(t: number) {
      ctx!.clearRect(0, 0, size.w, size.h)
      renderMapFrame(ctx!, size.w, size.h, {
        slots:        slotsRef.current,
        playerLabels,
        timestamp:    t,
      })
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [size, playerLabels])

  // Mouse hover for tooltip
  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx   = e.clientX - rect.left
    const my   = e.clientY - rect.top

    const THRESH = 10
    for (const slot of slotsRef.current) {
      const dx = slot.x - mx
      const dy = slot.y - my
      if (dx * dx + dy * dy < THRESH * THRESH) {
        setTooltip({ slot, x: mx, y: my })
        return
      }
    }
    setTooltip(null)
  }

  return (
    <div className="relative w-full" style={{ aspectRatio: '1 / 1' }}>
      <canvas
        ref={canvasRef}
        width={size.w}
        height={size.h}
        className="w-full h-full rounded-lg cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
      />
      {tooltip && (
        <MapTooltip
          label={tooltip.slot.label}
          ring={tooltip.slot.ring}
          x={tooltip.x}
          y={tooltip.y}
          owned={tooltip.slot.owned}
        />
      )}
    </div>
  )
}
