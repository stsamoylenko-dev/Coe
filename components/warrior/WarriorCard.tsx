'use client'

import { WARRIOR_CLASSES } from '@/lib/constants'
import type { WarriorData } from '@/store/warriorStore'
import ClassBadge from './ClassBadge'
import WarriorStats from './WarriorStats'
import ArmorLayer from './ArmorLayer'
import ShareButton from './ShareButton'
import GlassCard from '@/components/ui/GlassCard'

interface WarriorCardProps {
  warrior: WarriorData
}

export default function WarriorCard({ warrior }: WarriorCardProps) {
  const config = WARRIOR_CLASSES[warrior.warriorClass]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 w-full max-w-5xl mx-auto">

      {/* Left: Warrior visual + stats */}
      <GlassCard glow className="p-8 flex flex-col gap-6">
        {/* Header row */}
        <div className="flex items-start justify-between">
          <div>
            <div className="font-mono text-[10px] tracking-widest text-[var(--color-text-muted)] uppercase mb-1">
              Первичный домен · ДНК Воина
            </div>
            <h2 className="font-mono text-3xl font-bold text-[var(--color-emerald)]
              [text-shadow:0_0_15px_rgba(0,200,112,0.5)]">
              {warrior.primaryDomain}
            </h2>
          </div>
          <ClassBadge warriorClass={warrior.warriorClass} large />
        </div>

        {/* Warrior silhouette area */}
        <div
          className="relative flex items-center justify-center h-64 rounded-lg overflow-hidden
            border border-[var(--glass-border)] bg-[rgba(0,0,0,0.3)]"
          style={{
            background: `radial-gradient(ellipse at center, ${config.color}10 0%, rgba(4,13,9,0.8) 70%)`,
          }}
        >
          {/* Geometric warrior SVG */}
          <svg width="200" height="220" viewBox="0 0 200 220" fill="none">
            {/* Head */}
            <circle cx="100" cy="40" r="22"
              fill={`${config.color}20`} stroke={`${config.color}cc`} strokeWidth="1.2" />
            {/* Torso */}
            <path d="M62 58 L138 58 L145 140 L55 140 Z"
              fill={`${config.color}15`} stroke={`${config.color}bb`} strokeWidth="1.2" />
            {/* Arms */}
            {warrior.warriorClass === 'BERSERKER' ? (
              <>
                <path d="M62 70 L20 110 L30 140 L55 140 Z"
                  fill={`${config.color}18`} stroke={`${config.color}bb`} strokeWidth="1.2" />
                <path d="M138 70 L180 110 L170 140 L145 140 Z"
                  fill={`${config.color}18`} stroke={`${config.color}bb`} strokeWidth="1.2" />
              </>
            ) : (
              <>
                <path d="M62 70 L35 120 L55 140 Z"
                  fill={`${config.color}15`} stroke={`${config.color}99`} strokeWidth="1.2" />
                <path d="M138 70 L165 120 L145 140 Z"
                  fill={`${config.color}15`} stroke={`${config.color}99`} strokeWidth="1.2" />
              </>
            )}
            {/* Legs */}
            <path d="M55 140 L65 200 L90 200 L100 140 Z"
              fill={`${config.color}15`} stroke={`${config.color}99`} strokeWidth="1.2" />
            <path d="M145 140 L135 200 L110 200 L100 140 Z"
              fill={`${config.color}15`} stroke={`${config.color}99`} strokeWidth="1.2" />
            {/* Chest rune */}
            <circle cx="100" cy="90" r="7"
              fill={config.color}
              style={{ filter: `drop-shadow(0 0 6px ${config.color})` }} />
            {/* Scan lines */}
            <line x1="0" y1="80"  x2="200" y2="80"  stroke={`${config.color}15`} strokeWidth="0.5" strokeDasharray="4 8" />
            <line x1="0" y1="120" x2="200" y2="120" stroke={`${config.color}15`} strokeWidth="0.5" strokeDasharray="4 8" />
            <line x1="0" y1="160" x2="200" y2="160" stroke={`${config.color}15`} strokeWidth="0.5" strokeDasharray="4 8" />
          </svg>

          {/* Corner brackets */}
          <span className="absolute top-2 left-2 w-4 h-4 border-t border-l border-[var(--color-emerald)] opacity-40" />
          <span className="absolute top-2 right-2 w-4 h-4 border-t border-r border-[var(--color-emerald)] opacity-40" />
          <span className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-[var(--color-emerald)] opacity-40" />
          <span className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-[var(--color-emerald)] opacity-40" />
        </div>

        {/* Stats */}
        <WarriorStats stats={warrior.stats} warriorClass={warrior.warriorClass} />

        {/* Legacy Score */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--glass-border)]">
          <div>
            <div className="font-mono text-[10px] tracking-widest text-[var(--color-text-muted)] uppercase">
              Legacy Score
            </div>
            <div className="font-display text-4xl font-bold text-[var(--color-emerald)]
              [text-shadow:0_0_20px_rgba(0,200,112,0.5)]">
              {warrior.stats.legacyScore.toLocaleString()}
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[10px] tracking-widest text-[var(--color-text-muted)] uppercase">
              Мана
            </div>
            <div className="font-display text-2xl font-semibold text-purple-400">
              {warrior.mana.toLocaleString()}
            </div>
          </div>
        </div>

        <ShareButton warrior={warrior} />
      </GlassCard>

      {/* Right: Armor panel */}
      <GlassCard className="p-6 flex flex-col gap-4">
        <div>
          <div className="font-mono text-[10px] tracking-widest text-[var(--color-text-muted)] uppercase mb-1">
            Броня · Доспехи Воина
          </div>
          <div className="font-display text-sm text-[var(--color-text-secondary)]">
            {warrior.armorCount} предмет{warrior.armorCount === 1 ? '' : warrior.armorCount < 5 ? 'а' : 'ов'} экипировки
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {warrior.armorLayers.length > 0 ? (
            warrior.armorLayers.map((layer, i) => (
              <ArmorLayer key={layer.domain.address} layer={layer} index={i} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
              <span className="text-3xl opacity-30">◌</span>
              <p className="font-mono text-xs text-[var(--color-text-muted)]">
                Нет доменов-доспехов.
                <br />
                Добавь .ton домены в кошелёк
                <br />
                чтобы укрепить броню.
              </p>
            </div>
          )}
        </div>

        {warrior.armorCount >= 8 && (
          <p className="font-mono text-[10px] text-[var(--color-text-muted)] text-center border-t border-[var(--glass-border)] pt-3">
            Показаны 8 из {warrior.armorCount} доспехов (по весу)
          </p>
        )}

        {/* Description */}
        <div className="mt-auto pt-4 border-t border-[var(--glass-border)]">
          <p className="font-body text-xs text-[var(--color-text-muted)] leading-relaxed italic">
            «{WARRIOR_CLASSES[warrior.warriorClass].description}»
          </p>
        </div>
      </GlassCard>
    </div>
  )
}
