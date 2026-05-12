import { WARRIOR_CLASSES, type WarriorClass } from '@/lib/constants'
import { toFourDigits, digitVariance, digitSum, type FourDigits } from './patternDetector'

export interface WarriorStats {
  strength:    number  // 0–100
  endurance:   number  // 0–100
  battleStyle: number  // 0=chaotic, 100=ordered
  legacyScore: number  // composite prestige
}

export function calculateStats(
  primaryLabel:   string,
  warriorClass:   WarriorClass,
  armorCount:     number,
  extra4NCount:   number,
): WarriorStats {
  const digits = toFourDigits(primaryLabel) ?? [0, 0, 0, 0] as FourDigits
  const variance = digitVariance(digits)
  const sum      = digitSum(digits)

  const patternBonus = WARRIOR_CLASSES[warriorClass].strBonus

  const strength = Math.min(100, Math.round(
    (sum / 36) * 60 + patternBonus
  ))

  const endurance = Math.min(100, Math.max(0, Math.round(
    100 - variance * 10 + armorCount * 3
  )))

  const battleStyle = Math.min(100, Math.max(0, Math.round(
    100 - (variance / 4.5) * 100
  )))

  // Extra 4N domains multiply legacy by 1.2x each
  const manaMultiplier = Math.pow(1.2, extra4NCount)
  const legacyScore = Math.min(9999, Math.round(
    (strength * 0.4 + endurance * 0.3 + battleStyle * 0.2 + Math.min(armorCount * 10, 100) * 0.1) * manaMultiplier
  ))

  return { strength, endurance, battleStyle, legacyScore }
}
