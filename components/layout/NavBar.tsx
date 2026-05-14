'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import WalletBadge from '@/components/wallet/WalletBadge'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Воин',  icon: '⚔' },
  { href: '/map',       label: 'Карта', icon: '◎' },
  { href: '/arena',     label: 'Арена', icon: '🔒' },
  { href: '/agent',     label: 'Агент', icon: '🤖' },
]

export default function NavBar() {
  const pathname = usePathname()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3
      border-b border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)]">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 group">
        <span className="font-mono text-[var(--color-emerald)] text-lg font-bold tracking-widest
          group-hover:text-shadow-[0_0_10px_rgba(0,200,112,0.8)] transition-all duration-300">
          4N
        </span>
        <span className="font-display text-[var(--color-text-secondary)] text-sm tracking-wide hidden sm:block">
          КОД ВЕЧНОСТИ
        </span>
      </Link>

      {/* Nav links */}
      <div className="flex items-center gap-1">
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2 rounded font-display text-sm tracking-widest uppercase transition-all duration-200
                ${active
                  ? 'text-[var(--color-emerald)] bg-[var(--color-emerald-glow-sm)] border border-[var(--glass-border)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
                }`}
            >
              <span className="mr-1">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </div>

      {/* Wallet badge */}
      <WalletBadge />
    </nav>
  )
}
