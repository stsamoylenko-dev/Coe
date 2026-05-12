'use client'

import { useTonAddress, useTonConnectUI } from '@tonconnect/ui-react'
import { useEffect } from 'react'
import { useWalletStore } from '@/store/walletStore'
import { useDomainsStore } from '@/store/domainsStore'
import { useWarriorStore } from '@/store/warriorStore'

function shortenAddress(addr: string): string {
  if (addr.length <= 12) return addr
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

export default function WalletBadge() {
  const address        = useTonAddress()
  const [tonUI]        = useTonConnectUI()
  const setAddress     = useWalletStore(s => s.setAddress)
  const { fetchDomains, data: domains } = useDomainsStore()
  const compute        = useWarriorStore(s => s.compute)
  const resetWallet    = useWalletStore(s => s.setAddress)
  const resetDomains   = useDomainsStore(s => s.reset)
  const resetWarrior   = useWarriorStore(s => s.reset)

  useEffect(() => {
    if (address) {
      setAddress(address)
      fetchDomains(address)
    } else {
      resetWallet(null)
      resetDomains()
      resetWarrior()
    }
  }, [address])

  useEffect(() => {
    if (domains) compute(domains)
  }, [domains])

  if (!address) {
    return (
      <button
        onClick={() => tonUI.openModal()}
        className="metal-btn px-4 py-2 text-sm font-display font-semibold tracking-widest uppercase
          text-[var(--color-emerald)] border-[var(--color-emerald-dim)]
          hover:border-[var(--color-emerald)] hover:shadow-[var(--glow-emerald-sm)]
          transition-all duration-200"
      >
        Подключить
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 px-3 py-1.5 glass-card">
        <span className="w-2 h-2 rounded-full bg-[var(--color-emerald)] animate-pulse" />
        <span className="font-mono text-xs text-[var(--color-text-secondary)]">
          {shortenAddress(address)}
        </span>
      </div>
      <button
        onClick={() => tonUI.disconnect()}
        className="font-mono text-xs text-[var(--color-text-muted)] hover:text-red-400 transition-colors duration-200"
        title="Отключить"
      >
        ✕
      </button>
    </div>
  )
}
