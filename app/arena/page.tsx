'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTonAddress } from '@tonconnect/ui-react'
import AppShell from '@/components/layout/AppShell'
import LockedGates from '@/components/arena/LockedGates'
import GlowText from '@/components/ui/GlowText'
import { useWarriorStore } from '@/store/warriorStore'

export default function ArenaPage() {
  const address = useTonAddress()
  const router  = useRouter()
  const warrior = useWarriorStore(s => s.warrior)

  useEffect(() => {
    if (!address) router.push('/')
  }, [address, router])

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="font-mono text-[10px] tracking-widest text-[var(--color-text-muted)] uppercase mb-3">
            Секция · Arena
          </div>
          <GlowText
            as="h1"
            color="#c0a040"
            className="font-display text-4xl sm:text-5xl font-bold"
          >
            ⚔ АРЕНА ВЕЧНОСТИ
          </GlowText>
          <p className="mt-4 font-body text-sm text-[var(--color-text-secondary)] max-w-md mx-auto leading-relaxed">
            Здесь решаются судьбы Цифровой Вальхаллы.
            Когда врата откроются — только сильнейшие ДНК выживут.
          </p>
        </div>

        <LockedGates
          mana={warrior?.mana ?? 0}
          hasMana={!!warrior && warrior.mana > 0}
        />
      </div>
    </AppShell>
  )
}
