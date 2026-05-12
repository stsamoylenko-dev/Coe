import StatBar from '@/components/ui/StatBar'
import type { WarriorStats as Stats } from '@/lib/warrior/statsCalculator'
import { WARRIOR_CLASSES, type WarriorClass } from '@/lib/constants'

interface WarriorStatsProps {
  stats:        Stats
  warriorClass: WarriorClass
}

export default function WarriorStats({ stats, warriorClass }: WarriorStatsProps) {
  const classColor = WARRIOR_CLASSES[warriorClass].color

  return (
    <div className="space-y-3">
      <StatBar label="Сила"       value={stats.strength}    color={classColor}    delay={100} />
      <StatBar label="Выносливость" value={stats.endurance}  color="#00aaff"       delay={250} />
      <StatBar label="Стиль боя"  value={stats.battleStyle} color="#aa44ff"       delay={400} />
    </div>
  )
}
