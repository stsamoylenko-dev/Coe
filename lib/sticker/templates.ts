import type { WarriorClass } from '@/lib/constants'

// Sticker text pool — 5 templates × class-aware texts
// Template index cycles every 69 users

export const STICKER_TEXTS: Record<WarriorClass, string[][]> = {
  BERSERKER: [
    ['БЕРСЕРК', 'ЯРОСТЬ БЕЗ ПРЕДЕЛА', '⚡ СИЛА ВЕЧНОСТИ ⚡'],
    ['ОПАСЕН', 'ДЕРЖИСЬ ПОДАЛЬШЕ', '☠ {domain} ☠'],
    ['#{num}', 'ЗОЛОТОЙ КРУГ', 'МОЯ ЗЕМЛЯ'],
    ['ЛЕГАСИ {legacy}', 'ДНК ВОИНА', 'ТОН БЛОКЧЕЙН'],
    ['ВАЛЬХАЛЛА', 'ИЛИ ПОБЕДА', 'ИЛИ СМЕРТЬ'],
  ],
  KNIGHT: [
    ['РЫЦАРЬ', 'ЧЕСТЬ И СТАЛЬ', '🛡 {domain} 🛡'],
    ['#{num}', 'ЗОЛОТОЙ КРУГ', 'НАВСЕГДА'],
    ['ЛЕГАСИ {legacy}', 'БРОНЯ НЕ ПОДВОДИТ', 'AABB'],
    ['ЗАЩИТНИК', 'ЦИФРОВОЙ ВАЛЬХАЛЛЫ', '⚔ ТОН ⚔'],
    ['НЕПОБЕДИМ', 'С ДОМЕНОМ В РУКАХ', 'ВЕЧНОСТЬ'],
  ],
  MAGE: [
    ['МАГ', 'ПОВЕЛИТЕЛЬ ПАТТЕРНОВ', '✦ {domain} ✦'],
    ['#{num}', 'ЗОЛОТОЙ КРУГ', 'МАНА ТЕЧЁТ'],
    ['ЛЕГАСИ {legacy}', 'МАГИЯ ЧИСЕЛ', 'ABAB'],
    ['ТАЙНОЕ ЗНАНИЕ', 'ОТКРЫТО ЛИШЬ МНЕ', '✦ ТОН ✦'],
    ['ЧАРЫ', 'НАЛОЖЕНЫ', 'НАВСЕГДА'],
  ],
  ASSASSIN: [
    ['АССАСИН', 'ТЫ ЕГО НЕ УВИДИШЬ', '◈ {domain} ◈'],
    ['#{num}', 'ЗЕРКАЛЬНЫЙ ВОИН', 'ABBA'],
    ['ЛЕГАСИ {legacy}', 'ДВОЙНАЯ ПРИРОДА', 'ПАЛИНДРОМ'],
    ['В ТЕНИ', 'НО В ЗОЛОТОМ КРУГЕ', '◈ ТОН ◈'],
    ['НЕВИДИМ', 'НО ВЕЧЕН', 'КОД ВЕЧНОСТИ'],
  ],
  SCOUT: [
    ['РАЗВЕДЧИК', 'ПЕРВЫМ ВИЖУ ВСЁ', '◉ {domain} ◉'],
    ['#{num}', 'ЗОЛОТОЙ КРУГ', 'ABCD'],
    ['ЛЕГАСИ {legacy}', 'ПОСЛЕДОВАТЕЛЬНОСТЬ', 'СИЛА'],
    ['ПЕРВОПРОХОДЕЦ', 'ЦИФРОВОГО МИРА', '◉ ТОН ◉'],
    ['ВПЕРЁД', 'К ВЕЧНОСТИ', 'КОД 4N'],
  ],
  WANDERER: [
    ['СТРАННИК', 'МОЙ ПУТЬ УНИКАЛЕН', '◌ {domain} ◌'],
    ['#{num}', 'ЗОЛОТОЙ КРУГ', 'МОЙ ХАОС'],
    ['ЛЕГАСИ {legacy}', 'ВНЕ КЛАССИФИКАЦИИ', 'УНИКУМ'],
    ['НИКТО НЕ ЗНАЕТ', 'КТО Я ТАКОЙ', '◌ ТОН ◌'],
    ['ХАОС', 'ЭТО МОЯ СИЛА', 'ВЕЧНОСТЬ'],
  ],
}

// 5 background themes cycling by template index
export const STICKER_BACKGROUNDS = [
  { bg: '#0a0a0a', accent: '#00c870', style: 'dark' },      // dark emerald
  { bg: '#0d0820', accent: '#8844ff', style: 'mystic' },    // deep purple
  { bg: '#1a0a00', accent: '#c0a040', style: 'gold' },      // golden
  { bg: '#000d1a', accent: '#0088ff', style: 'ocean' },     // deep blue
  { bg: '#1a0000', accent: '#ff4444', style: 'blood' },     // blood red
]

// 69 template combinations (5 texts × 5 backgrounds cycle)
export function getStickerTemplate(domainNumber: number, stickerIndex: number) {
  const templateSet = domainNumber % 69
  const bgIndex    = (templateSet + stickerIndex) % STICKER_BACKGROUNDS.length
  return {
    background: STICKER_BACKGROUNDS[bgIndex],
    textIndex:  stickerIndex % 5,
    templateSet,
  }
}

export function renderStickerText(
  template: string[],
  domain:   string,
  legacy:   number,
  num:      number,
): string[] {
  return template.map(t =>
    t
      .replace('{domain}', domain)
      .replace('{legacy}', String(legacy))
      .replace('{num}', String(num).padStart(4, '0'))
  )
}

// NFT metadata for future minting
export function buildNFTMetadata(params: {
  warriorNumber: number
  stickerIndex:  number
  domain:        string
  warriorClass:  string
  legacyScore:   number
  armorCount:    number
  mana:          number
  templateSet:   number
  hasPremium:    boolean
}) {
  const { warriorNumber, stickerIndex, domain, warriorClass, legacyScore,
          armorCount, mana, templateSet, hasPremium } = params

  const paddedNum = String(warriorNumber).padStart(4, '0')
  const name = `Воин 4N #${paddedNum} — Стикер ${stickerIndex + 1}/5`

  return {
    name,
    description: `NFT-стикер воина ${domain} из коллекции «Код Вечности: 4N». Шаблон №${templateSet}.`,
    image: `ipfs://TO_BE_SET/warrior_${paddedNum}_s${stickerIndex + 1}.png`,
    external_url: `https://stsamoylenko-dev.github.io/Coe/`,
    attributes: [
      { trait_type: 'Warrior Class',   value: warriorClass },
      { trait_type: 'Primary Domain',  value: domain },
      { trait_type: 'Legacy Score',    value: legacyScore },
      { trait_type: 'Armor Pieces',    value: armorCount },
      { trait_type: 'Mana',            value: mana },
      { trait_type: 'Template Set',    value: templateSet },
      { trait_type: 'Sticker Number',  value: stickerIndex + 1 },
      { trait_type: 'Has Premium',     value: hasPremium ? 'Yes' : 'No' },
      { trait_type: 'Edition',         value: `${paddedNum}/10000` },
    ],
    ton_collection: 'eternity-code-4n',
    warrior_number: warriorNumber,
    sticker_index:  stickerIndex + 1,
    template_set:   templateSet,
  }
}
