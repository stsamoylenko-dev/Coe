import type { ArmorLayer as ArmorLayerData } from '@/lib/warrior/armorResolver'

interface ArmorLayerProps {
  layer: ArmorLayerData
  index: number
}

const TIER_COLORS = {
  HEAVY:     '#c0a040',
  MEDIUM:    '#64a082',
  LIGHT:     '#3a6652',
  ACCESSORY: '#2a4a3a',
}

const TIER_ICONS = {
  HEAVY:     '▰▰▰',
  MEDIUM:    '▰▰▱',
  LIGHT:     '▰▱▱',
  ACCESSORY: '◇',
}

export default function ArmorLayer({ layer, index }: ArmorLayerProps) {
  const color = TIER_COLORS[layer.tier]
  const icon  = TIER_ICONS[layer.tier]

  return (
    <div
      className="flex items-center justify-between px-3 py-1.5 rounded
        border border-[rgba(255,255,255,0.05)] bg-[rgba(0,0,0,0.2)]
        transition-all duration-300 hover:border-[rgba(0,200,112,0.15)]"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono" style={{ color, letterSpacing: '-2px' }}>
          {icon}
        </span>
        <span className="font-mono text-xs text-[var(--color-text-primary)]">
          {layer.domain.raw}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] text-[var(--color-text-muted)]">
          {layer.label}
        </span>
        <div
          className="w-1 h-4 rounded-full"
          style={{
            backgroundColor: color,
            opacity:         layer.opacity,
            boxShadow:       `0 0 4px ${color}66`,
          }}
        />
      </div>
    </div>
  )
}
