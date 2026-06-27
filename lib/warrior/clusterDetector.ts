import { detectPattern } from './patternDetector'
import type { ParsedDomain } from '@/lib/ton/types'
import type { WarriorClass } from '@/lib/constants'
import { WARRIOR_CLASSES } from '@/lib/constants'

export type ClusterType = 'CENTURY' | 'PATTERN' | 'ZERO_LEGION' | 'LOW_RANK'

export interface DomainCluster {
  id:          string
  type:        ClusterType
  label:       string
  description: string
  domains:     ParsedDomain[]
  score:       number
  color:       string
  icon:        string
  bonus:       string
}

function centuryKey(label: string): string {
  // "1221" → "12XX" (covers 1200–1299)
  return label.slice(0, 2) + 'XX'
}

export function detectClusters(domains4N: ParsedDomain[]): DomainCluster[] {
  if (domains4N.length < 2) return []

  const clusters: DomainCluster[] = []
  const usedInCluster = new Set<string>()

  // 1. Low-rank cluster (0001–0099) — rarest, check first
  const lowRank = domains4N.filter(d => {
    const n = parseInt(d.label, 10)
    return n >= 1 && n <= 99
  })
  if (lowRank.length >= 1) {
    lowRank.forEach(d => usedInCluster.add(d.address))
    clusters.push({
      id:          'low-rank',
      type:        'LOW_RANK',
      label:       'Первая Сотня',
      description: `${lowRank.length} домен${lowRank.length > 1 ? 'а' : ''} из диапазона 0001–0099`,
      domains:     [...lowRank].sort((a, b) => parseInt(a.label) - parseInt(b.label)),
      score:       lowRank.length * 3000,
      color:       '#ff9900',
      icon:        '♛',
      bonus:       'Легендарный статус · Tier-0',
    })
  }

  // 2. Zero Legion (0XXX) — excludes already counted low-rank
  const zeroLegion = domains4N.filter(d => d.label.startsWith('0') && !usedInCluster.has(d.address))
  if (zeroLegion.length >= 2) {
    zeroLegion.forEach(d => usedInCluster.add(d.address))
    clusters.push({
      id:          'zero-legion',
      type:        'ZERO_LEGION',
      label:       'Авангард Нуля',
      description: `${zeroLegion.length} доменов с префиксом 0 (Tier-1)`,
      domains:     [...zeroLegion].sort((a, b) => parseInt(a.label) - parseInt(b.label)),
      score:       zeroLegion.length * 1000,
      color:       '#c0a040',
      icon:        '◈',
      bonus:       `Элита · +${zeroLegion.length * 15}% Prestige`,
    })
  }

  // 3. Pattern clusters (same warrior class, ≥2, exclude WANDERER)
  const patternGroups = new Map<WarriorClass, ParsedDomain[]>()
  for (const d of domains4N) {
    const cls = detectPattern(d.label)
    if (cls === 'WANDERER') continue
    if (!patternGroups.has(cls)) patternGroups.set(cls, [])
    patternGroups.get(cls)!.push(d)
  }
  for (const [cls, group] of patternGroups.entries()) {
    if (group.length < 2) continue
    const config = WARRIOR_CLASSES[cls]
    const base   = group.length * 400
    const bonus  = config.strBonus / 10 + 1
    clusters.push({
      id:          `pattern-${cls}`,
      type:        'PATTERN',
      label:       `Орден ${config.labelRu}`,
      description: `${group.length} домена класса ${config.labelRu} (${config.label})`,
      domains:     group,
      score:       Math.round(base * bonus),
      color:       config.color,
      icon:        '⚡',
      bonus:       `Урон × ${(1 + group.length * 0.3).toFixed(1)}`,
    })
  }

  // 4. Century clusters (XX00–XX99), ≥2 domains in same block
  const centuryGroups = new Map<string, ParsedDomain[]>()
  for (const d of domains4N) {
    const key = centuryKey(d.label)
    if (!centuryGroups.has(key)) centuryGroups.set(key, [])
    centuryGroups.get(key)!.push(d)
  }
  for (const [key, group] of centuryGroups.entries()) {
    if (group.length < 2) continue
    const prefix  = key.replace('XX', '')
    const rangeFrom = `${prefix}00`
    const rangeTo   = `${prefix}99`
    const density   = group.length
    clusters.push({
      id:          `century-${key}`,
      type:        'CENTURY',
      label:       `Легион ${key}`,
      description: `${density} доменов в диапазоне ${rangeFrom}–${rangeTo}`,
      domains:     [...group].sort((a, b) => parseInt(a.label) - parseInt(b.label)),
      score:       density * 500 + (density >= 5 ? 2000 : 0),
      color:       '#00c870',
      icon:        '⚔',
      bonus:       `+${density * 10}% к Legacy Score`,
    })
  }

  return clusters.sort((a, b) => b.score - a.score)
}

export function totalClusterScore(clusters: DomainCluster[]): number {
  return clusters.reduce((sum, c) => sum + c.score, 0)
}
