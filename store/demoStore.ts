import { create } from 'zustand'
import { detectPattern } from '@/lib/warrior/patternDetector'
import { calculateStats } from '@/lib/warrior/statsCalculator'
import type { WarriorData } from './warriorStore'
import type { WalletDomainsResult } from '@/lib/ton/types'

// Demo domain set that shows off all features
const DEMO_DOMAINS: WalletDomainsResult = {
  primary4N: {
    raw: '1221.ton', label: '1221', length: 4, is4N: true,
    address: 'EQDemo1221', isPremium: true, forSale: false,
  },
  secondary4Ns: [
    { raw: '7777.ton', label: '7777', length: 4, is4N: true, address: 'EQDemo7777', isPremium: true, forSale: false },
  ],
  armors: [
    { raw: 'valhalla.ton',  label: 'valhalla',  length: 8,  is4N: false, address: 'EQDemoA', isPremium: false, forSale: false },
    { raw: 'ton.ton',       label: 'ton',        length: 3,  is4N: false, address: 'EQDemoB', isPremium: true,  forSale: false },
    { raw: 'code.ton',      label: 'code',       length: 4,  is4N: false, address: 'EQDemoC', isPremium: true,  forSale: false },
    { raw: 'eternity.ton',  label: 'eternity',   length: 8,  is4N: false, address: 'EQDemoD', isPremium: false, forSale: false },
    { raw: 'warrior.ton',   label: 'warrior',    length: 7,  is4N: false, address: 'EQDemoE', isPremium: false, forSale: false },
    { raw: 'x.ton',         label: 'x',          length: 1,  is4N: false, address: 'EQDemoF', isPremium: true,  forSale: false },
  ],
  domains: [],
  raw: [],
}
DEMO_DOMAINS.domains = [DEMO_DOMAINS.primary4N!, ...DEMO_DOMAINS.secondary4Ns, ...DEMO_DOMAINS.armors]

interface DemoState {
  isDemo:    boolean
  loadDemo:  () => WarriorData
  exitDemo:  () => void
}

export const useDemoStore = create<DemoState>(set => ({
  isDemo: false,

  loadDemo: () => {
    const primary      = DEMO_DOMAINS.primary4N!
    const warriorClass = detectPattern(primary.label)
    const stats        = calculateStats(primary.label, warriorClass, DEMO_DOMAINS.armors.length, DEMO_DOMAINS.secondary4Ns.length)

    const armorLayers = DEMO_DOMAINS.armors.map((d, i) => ({
      domain:  d,
      tier:    (d.length <= 3 ? 'HEAVY' : d.length <= 6 ? 'MEDIUM' : 'LIGHT') as 'HEAVY' | 'MEDIUM' | 'LIGHT' | 'ACCESSORY',
      weight:  d.length <= 3 ? 1.0 : d.length <= 6 ? 0.6 : 0.3,
      opacity: d.length <= 3 ? 0.9 : d.length <= 6 ? 0.7 : 0.5,
      label:   d.length <= 3 ? 'Тяжёлая сталь' : d.length <= 6 ? 'Кольчуга' : 'Кожаная броня',
    }))

    const warrior: WarriorData = {
      primaryDomain: primary.raw,
      warriorClass,
      stats,
      armorLayers,
      mana:       2 * 1000,
      armorCount: armorLayers.length,
    }

    set({ isDemo: true })
    return warrior
  },

  exitDemo: () => set({ isDemo: false }),
}))

export { DEMO_DOMAINS }
