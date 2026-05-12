'use client'

import AppShell from '@/components/layout/AppShell'
import LockedGates from '@/components/arena/LockedGates'
import GlowText from '@/components/ui/GlowText'
import { useWarriorStore } from '@/store/warriorStore'

export default function ArenaPage() {
  const warrior = useWarriorStore(s => s.warrior)

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8 text-center">
          <div className="font-mono text-[10px] tracking-widest text-[var(--color-text-muted)] uppercase mb-3">
            Секция · Arena
          </div>
          <GlowText as="h1" color="#c0a040" className="font-display text-4xl sm:text-5xl font-bold">
            ⚔ АРЕНА ВЕЧНОСТИ
          </GlowText>
          <p className="mt-4 font-body text-sm text-[var(--color-text-secondary)] max-w-md mx-auto leading-relaxed">
            Здесь решаются судьбы Цифровой Вальхаллы.
            Когда врата откроются — только сильнейшие ДНК выживут.
          </p>
        </div>

        <LockedGates
          mana={warrior?.mana ?? 2000}
          hasMana={true}
        />
      </div>
    </AppShell>
  )
}
