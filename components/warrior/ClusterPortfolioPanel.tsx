'use client'

import GlassCard from '@/components/ui/GlassCard'
import { detectClusters, totalClusterScore } from '@/lib/warrior/clusterDetector'
import type { DomainCluster } from '@/lib/warrior/clusterDetector'
import type { ParsedDomain } from '@/lib/ton/types'

interface ClusterCardProps {
  cluster: DomainCluster
  rank:    number
}

function ClusterCard({ cluster, rank }: ClusterCardProps) {
  return (
    <GlassCard className="p-5 flex flex-col gap-3 relative overflow-hidden">
      {/* Rank badge */}
      <span
        className="absolute top-3 right-3 font-mono text-[10px] tracking-widest opacity-40"
        style={{ color: cluster.color }}
      >
        #{rank}
      </span>

      {/* Accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-60"
        style={{ background: `linear-gradient(90deg, ${cluster.color}, transparent)` }}
      />

      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="text-2xl leading-none">{cluster.icon}</span>
        <div>
          <div
            className="font-display text-sm font-bold leading-tight"
            style={{ color: cluster.color }}
          >
            {cluster.label}
          </div>
          <div className="font-mono text-[10px] tracking-widest text-[var(--color-text-muted)] uppercase">
            {cluster.type === 'CENTURY'     && 'Легион'}
            {cluster.type === 'PATTERN'     && 'Орден'}
            {cluster.type === 'ZERO_LEGION' && 'Авангард'}
            {cluster.type === 'LOW_RANK'    && 'Легенда'}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="font-mono text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
        {cluster.description}
      </p>

      {/* Domain pills */}
      <div className="flex flex-wrap gap-1.5">
        {cluster.domains.map(d => (
          <span
            key={d.address}
            className="px-2 py-0.5 font-mono text-[11px] rounded border"
            style={{
              color:       cluster.color,
              borderColor: `${cluster.color}44`,
              background:  `${cluster.color}10`,
            }}
          >
            {d.raw}
          </span>
        ))}
      </div>

      {/* Footer: score + bonus */}
      <div className="flex items-center justify-between pt-2 border-t border-[var(--glass-border)]">
        <div>
          <div className="font-mono text-[9px] tracking-widest text-[var(--color-text-muted)] uppercase">
            Cluster Score
          </div>
          <div
            className="font-display text-xl font-bold"
            style={{ color: cluster.color }}
          >
            {cluster.score.toLocaleString()}
          </div>
        </div>
        <div
          className="px-2 py-1 rounded font-mono text-[10px] tracking-wide"
          style={{
            color:      cluster.color,
            background: `${cluster.color}15`,
            border:     `1px solid ${cluster.color}30`,
          }}
        >
          {cluster.bonus}
        </div>
      </div>
    </GlassCard>
  )
}

interface ClusterPortfolioPanelProps {
  domains4N: ParsedDomain[]
}

export default function ClusterPortfolioPanel({ domains4N }: ClusterPortfolioPanelProps) {
  const clusters = detectClusters(domains4N)

  if (clusters.length === 0) {
    return (
      <GlassCard className="p-8 text-center">
        <div className="font-mono text-3xl mb-3 opacity-20">◌</div>
        <h3 className="font-display text-base font-bold text-[var(--color-text-primary)] mb-2">
          Нет активных кластеров
        </h3>
        <p className="font-mono text-xs text-[var(--color-text-muted)] leading-relaxed">
          Добавь ещё 4N-домены в кошелёк, чтобы
          <br />
          сформировать кластеры и получить бонусы.
        </p>
      </GlassCard>
    )
  }

  const total = totalClusterScore(clusters)

  return (
    <div className="space-y-5">
      {/* Section header */}
      <div className="flex items-end justify-between">
        <div>
          <div className="font-mono text-[10px] tracking-widest text-[var(--color-text-muted)] uppercase mb-1">
            Кластер-Портфель · Cluster Portfolio
          </div>
          <h2 className="font-display text-2xl font-bold text-[var(--color-text-primary)]">
            Доменные Кластеры
          </h2>
        </div>
        <div className="text-right">
          <div className="font-mono text-[10px] tracking-widest text-[var(--color-text-muted)] uppercase">
            Суммарный Score
          </div>
          <div className="font-display text-2xl font-bold text-[var(--color-emerald)] [text-shadow:0_0_12px_rgba(0,200,112,0.4)]">
            {total.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Cluster grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {clusters.map((cluster, i) => (
          <ClusterCard key={cluster.id} cluster={cluster} rank={i + 1} />
        ))}
      </div>

      {/* Summary bar */}
      <GlassCard className="p-4 flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] tracking-widest text-[var(--color-text-muted)] uppercase">
            Активных кластеров:
          </span>
          <span className="font-display text-lg font-bold text-[var(--color-text-primary)]">
            {clusters.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] tracking-widest text-[var(--color-text-muted)] uppercase">
            Уникальных доменов:
          </span>
          <span className="font-display text-lg font-bold text-[var(--color-text-primary)]">
            {domains4N.length}
          </span>
        </div>
        <div className="ml-auto font-mono text-[10px] text-[var(--color-text-muted)] leading-relaxed">
          Кластеры дают бонус к Legacy Score
          <br />
          и разблокируют особые способности.
        </div>
      </GlassCard>
    </div>
  )
}
