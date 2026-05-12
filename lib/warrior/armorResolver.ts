import { ARMOR_TIERS, type ArmorTier } from '@/lib/constants'
import type { ParsedDomain } from '@/lib/ton/types'

export interface ArmorLayer {
  domain:  ParsedDomain
  tier:    ArmorTier
  weight:  number
  opacity: number
  label:   string
}

function tierForDomain(domain: ParsedDomain): ArmorTier {
  if (domain.length <= ARMOR_TIERS.HEAVY.maxLength)     return 'HEAVY'
  if (domain.length <= ARMOR_TIERS.MEDIUM.maxLength)    return 'MEDIUM'
  if (domain.length <= ARMOR_TIERS.LIGHT.maxLength)     return 'LIGHT'
  return 'ACCESSORY'
}

export function resolveArmorLayers(armors: ParsedDomain[]): ArmorLayer[] {
  // Take max 8 armor pieces for visual clarity, heaviest first
  return armors.slice(0, 8).map(domain => {
    const tier = tierForDomain(domain)
    const config = ARMOR_TIERS[tier]
    return {
      domain,
      tier,
      weight:  config.weight,
      opacity: config.opacity,
      label:   config.label,
    }
  })
}

export function totalArmorWeight(layers: ArmorLayer[]): number {
  return layers.reduce((sum, l) => sum + l.weight, 0)
}
