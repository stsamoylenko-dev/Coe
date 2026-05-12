import type { WarriorClass } from '@/lib/constants'

type FourDigits = [number, number, number, number]

function toFourDigits(label: string): FourDigits | null {
  if (!/^\d{4}$/.test(label)) return null
  const [a, b, c, d] = label.split('').map(Number)
  return [a, b, c, d]
}

function isSequential(digits: FourDigits): boolean {
  return (
    digits[1] === digits[0] + 1 &&
    digits[2] === digits[1] + 1 &&
    digits[3] === digits[2] + 1
  )
}

export function detectPattern(domainLabel: string): WarriorClass {
  const digits = toFourDigits(domainLabel)
  if (!digits) return 'WANDERER'

  const [a, b, c, d] = digits

  // Most restrictive first
  if (a === b && b === c && c === d)            return 'BERSERKER' // AAAA: 1111
  if (a === b && c === d && a !== c)            return 'KNIGHT'    // AABB: 1122
  if (a === c && b === d && a !== b)            return 'MAGE'      // ABAB: 1212
  if (a === d && b === c && a !== b)            return 'ASSASSIN'  // ABBA: 1221
  if (isSequential(digits))                    return 'SCOUT'     // ABCD: 0123
  return 'WANDERER'
}

export function digitVariance(digits: FourDigits): number {
  const mean = (digits[0] + digits[1] + digits[2] + digits[3]) / 4
  const variance = digits.reduce((acc, d) => acc + Math.pow(d - mean, 2), 0) / 4
  return Math.sqrt(variance)
}

export function digitSum(digits: FourDigits): number {
  return digits[0] + digits[1] + digits[2] + digits[3]
}

export { toFourDigits }
export type { FourDigits }
