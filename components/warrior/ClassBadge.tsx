import { WARRIOR_CLASSES, type WarriorClass } from '@/lib/constants'

interface ClassBadgeProps {
  warriorClass: WarriorClass
  large?: boolean
}

const CLASS_ICONS: Record<WarriorClass, string> = {
  BERSERKER: '⚡',
  KNIGHT:    '🛡',
  MAGE:      '✦',
  ASSASSIN:  '◈',
  SCOUT:     '◉',
  WANDERER:  '◌',
}

const PATTERN_DISPLAY: Record<WarriorClass, string> = {
  BERSERKER: 'AAAA',
  KNIGHT:    'AABB',
  MAGE:      'ABAB',
  ASSASSIN:  'ABBA',
  SCOUT:     'ABCD',
  WANDERER:  'ХАОС',
}

export default function ClassBadge({ warriorClass, large = false }: ClassBadgeProps) {
  const config = WARRIOR_CLASSES[warriorClass]
  const icon   = CLASS_ICONS[warriorClass]
  const pattern = PATTERN_DISPLAY[warriorClass]

  return (
    <div className={`flex flex-col items-center gap-${large ? '3' : '1'}`}>
      <div
        className={`${large ? 'text-5xl' : 'text-2xl'} leading-none`}
        style={{ filter: `drop-shadow(0 0 8px ${config.color})` }}
      >
        {icon}
      </div>
      <div className="flex flex-col items-center gap-0.5">
        <span
          className={`font-display font-bold tracking-widest uppercase ${large ? 'text-xl' : 'text-xs'}`}
          style={{ color: config.color, textShadow: `0 0 10px ${config.color}88` }}
        >
          {config.labelRu}
        </span>
        <span className={`font-mono text-[var(--color-text-muted)] ${large ? 'text-sm' : 'text-[10px]'} tracking-widest`}>
          [{pattern}]
        </span>
      </div>
    </div>
  )
}
