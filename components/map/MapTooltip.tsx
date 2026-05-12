interface MapTooltipProps {
  label:   string
  ring:    string
  x:       number
  y:       number
  owned:   boolean
}

const RING_NAMES: Record<string, string> = {
  inner:  'Золотой Круг (4N)',
  middle: 'Средний пояс',
  outer:  'Периферия',
}

export default function MapTooltip({ label, ring, x, y, owned }: MapTooltipProps) {
  return (
    <div
      className="absolute pointer-events-none z-50 glass-card px-3 py-2 text-xs font-mono
        border border-[var(--color-emerald-dim)] shadow-[var(--glow-emerald-sm)]"
      style={{
        left:      x + 12,
        top:       y - 24,
        transform: 'translateY(-50%)',
        minWidth:  120,
      }}
    >
      <div className="text-[var(--color-emerald)] font-bold">{label}.ton</div>
      <div className="text-[var(--color-text-muted)] text-[10px] mt-0.5">{RING_NAMES[ring] ?? ring}</div>
      {owned && (
        <div className="text-[var(--color-emerald)] text-[10px] mt-0.5">● Ваш</div>
      )}
    </div>
  )
}
