'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTonAddress } from '@tonconnect/ui-react'
import AppShell from '@/components/layout/AppShell'
import WorldMap from '@/components/map/WorldMap'
import GlassCard from '@/components/ui/GlassCard'
import LoadingRune from '@/components/ui/LoadingRune'
import { useDomainsStore } from '@/store/domainsStore'
import { useWarriorStore } from '@/store/warriorStore'
import { MAP_CONFIG } from '@/lib/constants'

export default function MapPage() {
  const address = useTonAddress()
  const router  = useRouter()
  const { loading, data: domains } = useDomainsStore()
  const { warrior } = useWarriorStore()

  useEffect(() => {
    if (!address) router.push('/')
  }, [address, router])

  const ownedDomains = domains?.domains.map(d => ({
    label:  d.label,
    is4N:   d.is4N,
    length: d.length,
  })) ?? []

  const primaryLabel  = domains?.primary4N?.label
  const innerPosition = primaryLabel
    ? Math.round((parseInt(primaryLabel) / MAP_CONFIG.totalInnerSlots) * 100)
    : null

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-6">
          <div className="font-mono text-[10px] tracking-widest text-[var(--color-text-muted)] uppercase mb-1">
            Шаг 4: Исследование · Explore
          </div>
          <h1 className="font-display text-3xl font-bold text-[var(--color-text-primary)]">
            Карта Мира
          </h1>
          <p className="mt-2 font-body text-sm text-[var(--color-text-secondary)]">
            10 000 участков Золотого Круга. Ваше место на карте — вечно.
          </p>
        </div>

        {loading && (
          <div className="flex justify-center py-32">
            <LoadingRune size={64} label="Загрузка карты..." />
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
            {/* Map canvas */}
            <GlassCard glow className="p-4">
              <WorldMap ownedDomains={ownedDomains} />
            </GlassCard>

            {/* Legend & stats */}
            <div className="flex flex-col gap-4">
              {/* Player position */}
              {warrior && innerPosition !== null && (
                <GlassCard className="p-5">
                  <div className="font-mono text-[10px] tracking-widest text-[var(--color-text-muted)] uppercase mb-3">
                    Ваша позиция
                  </div>
                  <div className="font-display text-2xl font-bold text-[var(--color-emerald)]">
                    #{parseInt(primaryLabel!).toLocaleString()}
                  </div>
                  <div className="font-mono text-xs text-[var(--color-text-secondary)] mt-1">
                    {warrior.primaryDomain} · Золотой Круг
                  </div>
                  <div className="mt-3 h-1 bg-[var(--color-bg-raised)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--color-emerald)] rounded-full"
                      style={{ width: `${innerPosition}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 font-mono text-[10px] text-[var(--color-text-muted)]">
                    <span>0000</span>
                    <span>9999</span>
                  </div>
                </GlassCard>
              )}

              {/* Legend */}
              <GlassCard className="p-5">
                <div className="font-mono text-[10px] tracking-widest text-[var(--color-text-muted)] uppercase mb-4">
                  Легенда
                </div>
                <div className="space-y-3">
                  {[
                    { color: '#00c870', label: 'Ваш домен', desc: 'Принадлежит вам' },
                    { color: 'rgba(0,200,112,0.5)', label: 'Золотой Круг', desc: '4N домены (0000–9999)' },
                    { color: 'rgba(100,160,130,0.5)', label: 'Средний пояс', desc: 'Премиум домены' },
                    { color: 'rgba(61,107,85,0.5)', label: 'Периферия', desc: 'Длинные домены' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.color, boxShadow: `0 0 4px ${item.color}` }}
                      />
                      <div>
                        <div className="font-mono text-xs text-[var(--color-text-primary)]">{item.label}</div>
                        <div className="font-mono text-[10px] text-[var(--color-text-muted)]">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Territory stats */}
              <GlassCard className="p-5">
                <div className="font-mono text-[10px] tracking-widest text-[var(--color-text-muted)] uppercase mb-3">
                  Территории
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="font-display text-xl font-bold text-[var(--color-emerald)]">
                      {domains?.primary4N ? 1 + (domains.secondary4Ns.length) : 0}
                    </div>
                    <div className="font-mono text-[10px] text-[var(--color-text-muted)]">4N участков</div>
                  </div>
                  <div>
                    <div className="font-display text-xl font-bold text-[var(--color-metal-light)]">
                      {domains?.armors.length ?? 0}
                    </div>
                    <div className="font-mono text-[10px] text-[var(--color-text-muted)]">Доспехов</div>
                  </div>
                  <div>
                    <div className="font-display text-xl font-bold text-purple-400">
                      {warrior?.mana.toLocaleString() ?? 0}
                    </div>
                    <div className="font-mono text-[10px] text-[var(--color-text-muted)]">Единиц маны</div>
                  </div>
                  <div>
                    <div className="font-display text-xl font-bold text-[var(--color-text-primary)]">
                      {ownedDomains.length}
                    </div>
                    <div className="font-mono text-[10px] text-[var(--color-text-muted)]">Всего доменов</div>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
