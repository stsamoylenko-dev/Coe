'use client'

import type { AgentPlugin } from '@/lib/agent'

interface Props {
  plugin:   AgentPlugin
  onRemove: (id: string) => void
}

const CATEGORY_COLORS: Record<string, string> = {
  ton:      'text-[#0088cc] border-[#0088cc33]',
  telegram: 'text-[#2ca5e0] border-[#2ca5e033]',
  dns:      'text-[var(--color-emerald)] border-[var(--color-emerald-dim)]',
  dex:      'text-[#f7931a] border-[#f7931a33]',
  utility:  'text-[var(--color-text-muted)] border-[var(--glass-border)]',
  storage:  'text-purple-400 border-purple-400/20',
  data:     'text-sky-400 border-sky-400/20',
}

export default function PluginCard({ plugin, onRemove }: Props) {
  const { manifest } = plugin
  const categories = [...new Set(manifest.tools.map(t => t.category))]

  return (
    <div className="p-4 border border-[var(--glass-border)] rounded-lg bg-[var(--glass-bg)] space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="font-display text-sm font-bold text-[var(--color-text-primary)] truncate">
            {manifest.name}
          </div>
          <div className="font-mono text-[10px] text-[var(--color-text-muted)] mt-0.5">
            v{manifest.version} · {manifest.id}
          </div>
        </div>
        <button
          onClick={() => onRemove(manifest.id)}
          className="font-mono text-xs text-[var(--color-text-muted)] hover:text-red-400
            transition-colors shrink-0 px-2 py-1 border border-transparent
            hover:border-red-400/30 rounded"
        >
          Удалить
        </button>
      </div>

      {/* Description */}
      <p className="font-mono text-xs text-[var(--color-text-secondary)] leading-relaxed">
        {manifest.description}
      </p>

      {/* Categories */}
      <div className="flex flex-wrap gap-1.5">
        {categories.map(cat => (
          <span
            key={cat}
            className={`px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest
              border rounded-sm ${CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.utility}`}
          >
            {cat}
          </span>
        ))}
      </div>

      {/* Tools */}
      <div className="space-y-1">
        <div className="font-mono text-[10px] text-[var(--color-text-muted)] uppercase tracking-widest">
          {manifest.tools.length} инструмент{manifest.tools.length === 1 ? '' : 'ов'}
        </div>
        <div className="flex flex-wrap gap-1">
          {manifest.tools.map(t => (
            <span
              key={t.name}
              title={t.description}
              className="px-2 py-0.5 font-mono text-[10px] border border-[var(--glass-border)]
                rounded bg-[var(--color-bg-deep)] text-[var(--color-text-muted)] truncate max-w-[180px]"
            >
              {t.name}
            </span>
          ))}
        </div>
      </div>

      {/* Hooks */}
      {manifest.hooks && manifest.hooks.length > 0 && (
        <div className="flex gap-1">
          {manifest.hooks.map(h => (
            <span key={h} className="px-2 py-0.5 font-mono text-[10px] text-purple-400 border border-purple-400/20 rounded-sm">
              {h}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
