'use client'

import { useTonAddress, useTonConnectUI } from '@tonconnect/ui-react'
import AppShell from '@/components/layout/AppShell'
import WarriorCard from '@/components/warrior/WarriorCard'
import FigurineView from '@/components/warrior/FigurineView'
import StickerPackPanel from '@/components/warrior/StickerPackPanel'
import ClusterPortfolioPanel from '@/components/warrior/ClusterPortfolioPanel'
import LoadingRune from '@/components/ui/LoadingRune'
import GlassCard from '@/components/ui/GlassCard'
import { useDomainsStore } from '@/store/domainsStore'
import { useWarriorStore } from '@/store/warriorStore'
import { useDemoStore } from '@/store/demoStore'
import { DEMO_DOMAINS } from '@/store/demoStore'

function NoWalletPrompt() {
  const [tonUI]    = useTonConnectUI()
  const loadDemo   = useDemoStore(s => s.loadDemo)

  function handleDemo() {
    const warrior = loadDemo()
    useWarriorStore.setState({ warrior })
    useDomainsStore.setState({ data: DEMO_DOMAINS, loading: false, error: null })
  }

  return (
    <GlassCard className="p-10 text-center max-w-md mx-auto">
      <div className="font-mono text-5xl mb-4 opacity-30">⚔</div>
      <h2 className="font-display text-xl font-bold text-[var(--color-text-primary)] mb-3">
        Кошелёк не подключён
      </h2>
      <p className="font-body text-sm text-[var(--color-text-secondary)] leading-relaxed mb-6">
        Подключи TON-кошелёк чтобы пробудить своего воина,
        или запусти демо с тестовым персонажем.
      </p>
      <div className="flex flex-col gap-3">
        <button
          onClick={() => tonUI.openModal()}
          className="metal-btn w-full py-3 font-display font-semibold tracking-widest uppercase text-sm
            text-[var(--color-emerald)] border border-[var(--color-emerald-dim)]
            hover:border-[var(--color-emerald)] hover:shadow-[var(--glow-emerald-sm)]
            transition-all duration-200"
        >
          ⚔ Подключить кошелёк
        </button>
        <button
          onClick={handleDemo}
          className="w-full py-3 font-mono text-sm tracking-widest uppercase
            text-[var(--color-text-muted)] border border-[var(--color-metal-mid)] rounded
            hover:text-[var(--color-emerald)] hover:border-[var(--color-emerald-dim)]
            transition-all duration-200"
        >
          ◈ Демо-режим (1221.ton)
        </button>
      </div>
    </GlassCard>
  )
}

export default function DashboardPage() {
  const address  = useTonAddress()
  const isDemo   = useDemoStore(s => s.isDemo)
  const { loading, error, data: domains } = useDomainsStore()
  const { warrior }                       = useWarriorStore()

  const hasAccess = !!address || isDemo

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Page title */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="font-mono text-[10px] tracking-widest text-[var(--color-text-muted)] uppercase mb-1">
              Шаг 2: Пробуждение · Bind
            </div>
            <h1 className="font-display text-3xl font-bold text-[var(--color-text-primary)]">
              Дашборд Воина
            </h1>
          </div>
          {isDemo && !address && (
            <span className="px-3 py-1 font-mono text-xs tracking-widest uppercase
              border border-[var(--color-emerald-dim)] text-[var(--color-emerald)] rounded
              bg-[var(--color-emerald-glow-sm)]">
              ◈ Демо-режим
            </span>
          )}
        </div>

        {/* No access */}
        {!hasAccess && !loading && <NoWalletPrompt />}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <LoadingRune size={64} label="Считываем ДНК из блокчейна..." />
          </div>
        )}

        {/* Error */}
        {hasAccess && !loading && error && (
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
        {hasAccess && !loading && !error && domains && !warrior && (
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

        {/* Warrior card + figurine + sticker pack */}
        {warrior && (
          <div className="space-y-8">
            {/* Main row: card + figurine */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <WarriorCard warrior={warrior} />

              {/* Figurine section */}
              <GlassCard className="p-6 flex flex-col items-center gap-4">
                <div>
                  <div className="font-mono text-[10px] tracking-widest text-[var(--color-text-muted)] uppercase mb-1 text-center">
                    Облик воина · Figurine
                  </div>
                  <h2 className="font-display text-lg font-bold text-[var(--color-text-primary)] text-center">
                    {warrior.primaryDomain}
                  </h2>
                </div>
                <FigurineView
                  warrior={warrior}
                  allDomains={domains?.domains ?? []}
                  className="w-full max-w-[320px] rounded-xl border border-[var(--color-emerald-dim)]"
                />
              </GlassCard>
            </div>

            {/* Sticker pack section */}
            <StickerPackPanel
              warrior={warrior}
              allDomains={domains?.domains ?? []}
            />

            {/* Cluster portfolio section */}
            <ClusterPortfolioPanel
              domains4N={[
                ...(domains?.primary4N ? [domains.primary4N] : []),
                ...(domains?.secondary4Ns ?? []),
              ]}
            />
          </div>
        )}
      </div>
    </AppShell>
  )
}
