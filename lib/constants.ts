export type WarriorClass = 'BERSERKER' | 'KNIGHT' | 'MAGE' | 'ASSASSIN' | 'SCOUT' | 'WANDERER'

export interface ClassConfig {
  label: string
  labelRu: string
  description: string
  color: string
  strBonus: number
  shape: string
}

export const WARRIOR_CLASSES: Record<WarriorClass, ClassConfig> = {
  BERSERKER: {
    label:       'BERSERKER',
    labelRu:     'БЕРСЕРК',
    description: 'Воплощение чистой силы. Четыре одинаковые цифры — редчайшая сущность.',
    color:       '#ff4444',
    strBonus:    40,
    shape:       'heavy',
  },
  KNIGHT:    {
    label:       'KNIGHT',
    labelRu:     'РЫЦАРЬ',
    description: 'Несокрушимая броня. Пары цифр создают симметрию власти.',
    color:       '#c0a040',
    strBonus:    25,
    shape:       'armored',
  },
  MAGE:      {
    label:       'MAGE',
    labelRu:     'МАГ',
    description: 'Мастер чередования. Альтернирующий паттерн открывает магические пути.',
    color:       '#8844ff',
    strBonus:    15,
    shape:       'robed',
  },
  ASSASSIN:  {
    label:       'ASSASSIN',
    labelRu:     'АССАСИН',
    description: 'Зеркальный воин. Палиндром — знак двойственной природы.',
    color:       '#44aaff',
    strBonus:    20,
    shape:       'swift',
  },
  SCOUT:     {
    label:       'SCOUT',
    labelRu:     'РАЗВЕДЧИК',
    description: 'Страж последовательности. Прогрессия цифр — путь первооткрывателя.',
    color:       '#44ff88',
    strBonus:    10,
    shape:       'light',
  },
  WANDERER:  {
    label:       'WANDERER',
    labelRu:     'СТРАННИК',
    description: 'Хаотичная судьба. Уникальный паттерн вне классификации.',
    color:       '#888888',
    strBonus:    0,
    shape:       'tattered',
  },
}

export type ArmorTier = 'HEAVY' | 'MEDIUM' | 'LIGHT' | 'ACCESSORY'

export interface ArmorConfig {
  maxLength: number
  weight:    number
  opacity:   number
  label:     string
}

export const ARMOR_TIERS: Record<ArmorTier, ArmorConfig> = {
  HEAVY:     { maxLength: 3,  weight: 1.0, opacity: 0.9, label: 'Тяжёлая сталь' },
  MEDIUM:    { maxLength: 6,  weight: 0.6, opacity: 0.7, label: 'Кольчуга' },
  LIGHT:     { maxLength: 10, weight: 0.3, opacity: 0.5, label: 'Кожаная броня' },
  ACCESSORY: { maxLength: 999, weight: 0.1, opacity: 0.35, label: 'Амулет' },
}

export const MANA_PER_4N_DOMAIN = 1000

export const MAP_CONFIG = {
  innerRingRadius:  130,
  middleRingRadius: 230,
  outerRingRadius:  320,
  ringThickness:    35,
  totalInnerSlots:  10000,
} as const

export const TONAPI_BASE = 'https://tonapi.io/v2'

export const TON_DNS_COLLECTION = '0:b774d95eb20543f186c06b371ab88ad704f7e256130caf96189368a7d0cb6ccf'
