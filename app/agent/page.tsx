'use client'

import { useTonAddress } from '@tonconnect/ui-react'
import AppShell from '@/components/layout/AppShell'
import AgentPanel from '@/components/agent/AgentPanel'
import DnsTxtPanel from '@/components/domains/DnsTxtPanel'
import GlassCard from '@/components/ui/GlassCard'
import GlowText from '@/components/ui/GlowText'
import { useDomainsStore } from '@/store/domainsStore'
import { useWarriorStore } from '@/store/warriorStore'
import { useDemoStore } from '@/store/demoStore'

const FEATURE_LIST = [
  { icon: '🤖', label: 'Managed Bot',      desc: 'Telegram бот с делегированием прав' },
  { icon: '⚡', label: 'x402 Payments',    desc: 'HTTP 402 микроплатежи для AI агентов' },
  { icon: '🔗', label: 'Payment Channel',  desc: 'Офлайн-каналы без газа (channel-402)' },
  { icon: '📝', label: 'DNS TXT Records',  desc: 'On-chain текстовые записи .ton доменов' },
  { icon: '🔌', label: 'Plugin SDK',       desc: 'Архитектура плагинов teleton-style' },
  { icon: '🔄', label: 'Agent Loop',       desc: 'Tool-calling цикл агента с LLM' },
]

export default function AgentPage() {
  const address = useTonAddress()
  const isDemo  = useDemoStore(s => s.isDemo)
  const { data: domains } = useDomainsStore()
  const { warrior }       = useWarriorStore()

  const allDomains = domains?.domains ?? []

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

        {/* Header */}
        <div className="mb-10">
          <div className="font-mono text-[10px] tracking-widest text-[var(--color-text-muted)] uppercase mb-2">
            teleton-agent · x402-ton · TON-DNS-TXT · payment-channel-402
          </div>
          <GlowText as="h1" className="font-display text-4xl font-bold tracking-tight mb-3">
            Агент & Боты
          </GlowText>
          <p className="font-body text-[var(--color-text-secondary)] text-sm max-w-xl leading-relaxed">
            Автономный TON + Telegram агент с плагинами, микроплатежами HTTP 402,
            офлайн-каналами и on-chain DNS TXT записями.
          </p>
        </div>

        {/* Feature overview */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
          {FEATURE_LIST.map(f => (
            <div
              key={f.label}
              className="p-4 border border-[var(--glass-border)] rounded-lg bg-[var(--glass-bg)]"
            >
              <div className="text-xl mb-2">{f.icon}</div>
              <div className="font-display text-sm font-bold text-[var(--color-text-primary)] mb-1">
                {f.label}
              </div>
              <p className="font-mono text-[10px] text-[var(--color-text-muted)] leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Payment Channel info */}
        <GlassCard className="p-6 mb-6">
          <div className="font-mono text-[10px] tracking-widest text-[var(--color-text-muted)] uppercase mb-1">
            payment-channel-402
          </div>
          <h2 className="font-display text-lg font-bold text-[var(--color-text-primary)] mb-4">
            Платёжные каналы
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { step: '1', label: 'Открытие',      desc: 'Стороны блокируют TON on-chain — одна транзакция' },
              { step: '2', label: 'Off-chain',      desc: 'Обмен подписанными state-апдейтами — нулевой газ' },
              { step: '3', label: 'Закрытие',       desc: 'Кооперативное или принудительное — одна транзакция' },
            ].map(s => (
              <div key={s.step} className="flex gap-3">
                <div className="font-mono text-2xl font-bold text-[var(--color-emerald)] opacity-40 shrink-0 leading-tight">
                  {s.step}
                </div>
                <div>
                  <div className="font-display text-sm font-bold text-[var(--color-text-primary)]">{s.label}</div>
                  <p className="font-mono text-[10px] text-[var(--color-text-muted)] mt-1 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {['buildOpenChannelBody', 'hashState', 'nextStateAlicePays', 'buildCoopCloseBody', 'computeBalance'].map(fn => (
              <span key={fn} className="px-2 py-0.5 font-mono text-[10px] border border-[var(--glass-border)] rounded text-[var(--color-text-muted)]">
                {fn}()
              </span>
            ))}
          </div>
        </GlassCard>

        {/* Main panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-0">
            <AgentPanel />
          </div>

          <div className="space-y-6">
            {/* DNS TXT */}
            {(address || isDemo) && allDomains.length > 0 ? (
              <DnsTxtPanel domains={allDomains} />
            ) : (
              <GlassCard className="p-6 text-center">
                <div className="font-mono text-3xl opacity-20 mb-3">📝</div>
                <h3 className="font-display text-base font-bold text-[var(--color-text-primary)] mb-2">
                  DNS TXT Записи
                </h3>
                <p className="font-mono text-xs text-[var(--color-text-muted)] leading-relaxed">
                  Подключи кошелёк и открой дашборд воина,<br/>
                  чтобы управлять DNS TXT записями своих доменов.
                </p>
              </GlassCard>
            )}

            {/* x402 info card */}
            <GlassCard className="p-6">
              <div className="font-mono text-[10px] tracking-widest text-[var(--color-text-muted)] uppercase mb-1">
                x402-ton · Flow
              </div>
              <h3 className="font-display text-base font-bold text-[var(--color-text-primary)] mb-3">
                Как работает HTTP 402
              </h3>
              <div className="space-y-3">
                {[
                  { n: '1', t: 'GET /api/x402',         d: 'Сервер возвращает 402 + WWW-Authenticate: x402 ...' },
                  { n: '2', t: 'Подпись TonConnect',    d: 'Клиент подписывает транзакцию через TonConnect' },
                  { n: '3', t: 'POST + X-Payment',      d: 'Повторный запрос с подписанным payload в заголовке' },
                  { n: '4', t: 'Верификация',           d: 'Фасилитатор верифицирует и рассылает транзакцию' },
                ].map(s => (
                  <div key={s.n} className="flex gap-3">
                    <span className="font-mono text-[var(--color-emerald)] text-xs shrink-0 w-3">{s.n}.</span>
                    <div>
                      <div className="font-mono text-xs text-[var(--color-text-primary)]">{s.t}</div>
                      <div className="font-mono text-[10px] text-[var(--color-text-muted)]">{s.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>

      </div>
    </AppShell>
  )
}
