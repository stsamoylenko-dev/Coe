'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTonAddress } from '@tonconnect/ui-react'
import AppShell from '@/components/layout/AppShell'
import WarriorCard from '@/components/warrior/WarriorCard'
import LoadingRune from '@/components/ui/LoadingRune'
import GlassCard from '@/components/ui/GlassCard'
import { useDomainsStore } from '@/store/domainsStore'
import { useWarriorStore } from '@/store/warriorStore'

export default function DashboardPage() {
  const address  = useTonAddress()
  const router   = useRouter()
  const { loading, error, data: domains } = useDomainsStore()
  const { warrior }                       = useWarriorStore()

  useEffect(() => {
    if (!address) router.push('/')
  }, [address, router])

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Page title */}
        <div className="mb-8">
          <div className="font-mono text-[10px] tracking-widest text-[var(--color-text-muted)] uppercase mb-1">
            Шаг 2: Пробуждение · Bind
          </div>
          <h1 className="font-display text-3xl font-bold text-[var(--color-text-primary)]">
            Дашборд Воина
          </h1>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <LoadingRune size={64} label="Считываем ДНК из блокчейна..." />
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <GlassCard className="p-8 text-center max-w-md mx-auto">
            <div className="text-red-400 text-2xl mb-3">⚠</div>
            <p className="font-mono text-sm text-red-400 mb-2">Ошибка связи с блокчейном</p>
            <p className="font-mono text-xs text-[var(--color-text-muted)]">{error}</p>
            <button
              onClick={() => address && useDomainsStore.getState().fetchDomains(address)}
              className="mt-6 metal-btn px-6 py-2 text-sm font-display tracking-widest uppercase
                text-[var(--color-emerald)] border border-[var(--color-emerald-dim)]
                hover:border-[var(--color-emerald)]"
            >
              Повторить
            </button>
          </GlassCard>
        )}

        {/* No 4N domain */}
        {!loading && !error && domains && !warrior && (
          <GlassCard className="p-10 text-center max-w-md mx-auto">
            <div className="font-mono text-5xl mb-4 opacity-30">◌</div>
            <h2 className="font-display text-xl font-bold text-[var(--color-text-primary)] mb-3">
              ДНК не обнаружена
            </h2>
            <p className="font-body text-sm text-[var(--color-text-secondary)] leading-relaxed">
              В вашем кошельке нет 4N-домена (0000–9999.ton).
              Эти домены — первичная ДНК воина и ключ к Золотому Кругу.
            </p>
            <div className="mt-6 font-mono text-xs text-[var(--color-text-muted)]">
              Всего доменов в кошельке: {domains.domains.length}
            </div>
          </GlassCard>
        )}

        {/* Warrior card */}
        {!loading && !error && warrior && (
          <WarriorCard warrior={warrior} />
        )}
      </div>
    </AppShell>
  )
}
