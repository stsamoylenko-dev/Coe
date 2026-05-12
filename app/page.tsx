'use client'

import { useTonAddress } from '@tonconnect/ui-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import ConnectButton from '@/components/wallet/ConnectButton'
import GlowText from '@/components/ui/GlowText'
import { useDemoStore } from '@/store/demoStore'
import { useWarriorStore } from '@/store/warriorStore'
import { useDomainsStore } from '@/store/domainsStore'
import { DEMO_DOMAINS } from '@/store/demoStore'

export default function LandingPage() {
  const address  = useTonAddress()
  const router   = useRouter()
  const loadDemo = useDemoStore(s => s.loadDemo)
  const setWarrior = useWarriorStore.getState

  useEffect(() => {
    if (address) router.push('/dashboard')
  }, [address, router])

  function handleDemo() {
    const warrior = loadDemo()
    useWarriorStore.setState({ warrior })
    useDomainsStore.setState({ data: DEMO_DOMAINS, loading: false, error: null })
    router.push('/dashboard')
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center metal-grid overflow-hidden">
      {/* Radial ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,200,112,0.08)_0%,transparent_70%)] pointer-events-none" />

      {/* Outer ring decoration */}
      <div className="absolute w-[600px] h-[600px] rounded-full border border-[rgba(0,200,112,0.06)] animate-pulse-slow" />
      <div className="absolute w-[400px] h-[400px] rounded-full border border-[rgba(0,200,112,0.1)] animate-pulse" />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-10 px-6 text-center">
        {/* Header */}
        <div className="space-y-2">
          <div className="font-mono text-sm tracking-[0.4em] text-[var(--color-text-muted)] uppercase mb-4">
            Web3 · TON Blockchain · Metaverse
          </div>
          <GlowText as="h1" className="font-display text-6xl sm:text-8xl font-bold tracking-tight">
            КОД ВЕЧНОСТИ
          </GlowText>
          <div className="font-display text-3xl sm:text-5xl font-light tracking-[0.3em] text-[var(--color-metal-light)]">
            : 4N
          </div>
        </div>

        {/* Tagline */}
        <p className="max-w-md font-body text-[var(--color-text-secondary)] text-base leading-relaxed">
          Твои домены — это цифровая ДНК воина.
          <br />
          Подключи кошелёк и пробуди своё наследие.
        </p>

        {/* Features row */}
        <div className="flex flex-wrap justify-center gap-4 text-xs font-mono tracking-widest text-[var(--color-text-muted)] uppercase">
          {['ДНК Воина', 'Карта Мира', 'Арена Славы', 'Legacy Score'].map(f => (
            <span key={f} className="px-3 py-1.5 border border-[var(--glass-border)] rounded-sm bg-[var(--glass-bg)]">
              {f}
            </span>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col items-center gap-4">
          <ConnectButton />
          <button
            onClick={handleDemo}
            className="px-8 py-3 font-mono text-sm tracking-widest uppercase
              text-[var(--color-text-muted)] border border-[var(--color-metal-mid)] rounded
              hover:text-[var(--color-emerald)] hover:border-[var(--color-emerald-dim)]
              transition-all duration-200"
          >
            ◈ Посмотреть демо
          </button>
        </div>

        {/* Lore */}
        <p className="max-w-xs font-mono text-xs text-[var(--color-text-muted)] leading-relaxed">
          Только 10 000 доменов 0000–9999.ton
          <br />
          образуют Золотой Круг Вечности
        </p>
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-[linear-gradient(transparent,var(--color-bg-deep))] pointer-events-none" />
    </div>
  )
}
