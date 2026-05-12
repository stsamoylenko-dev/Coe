import { create } from 'zustand'
import { detectPattern } from '@/lib/warrior/patternDetector'
import { calculateStats, type WarriorStats } from '@/lib/warrior/statsCalculator'
import { resolveArmorLayers, type ArmorLayer } from '@/lib/warrior/armorResolver'
import { MANA_PER_4N_DOMAIN, type WarriorClass } from '@/lib/constants'
import type { WalletDomainsResult } from '@/lib/ton/types'

export interface WarriorData {
  primaryDomain: string
  warriorClass:  WarriorClass
  stats:         WarriorStats
  armorLayers:   ArmorLayer[]
  mana:          number
  armorCount:    number
}

interface WarriorState {
  warrior: WarriorData | null
  compute: (domains: WalletDomainsResult) => void
  reset:   () => void
}

export const useWarriorStore = create<WarriorState>(set => ({
  warrior: null,

  compute: (domains) => {
    const primary = domains.primary4N
    if (!primary) {
      set({ warrior: null })
      return
    }

    const warriorClass  = detectPattern(primary.label)
    const armorLayers   = resolveArmorLayers(domains.armors)
    const extra4NCount  = domains.secondary4Ns.length
    const stats         = calculateStats(
      primary.label,
      warriorClass,
      armorLayers.length,
      extra4NCount,
    )
    const mana = (1 + extra4NCount) * MANA_PER_4N_DOMAIN

    set({
      warrior: {
        primaryDomain: primary.raw,
        warriorClass,
        stats,
        armorLayers,
        mana,
        armorCount: armorLayers.length,
      },
    })
  },

  reset: () => set({ warrior: null }),
}))
