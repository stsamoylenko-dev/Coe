'use client'

import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ConnectButton() {
  const [tonUI]  = useTonConnectUI()
  const address  = useTonAddress()
  const router   = useRouter()

  useEffect(() => {
    if (address) {
      router.push('/dashboard')
    }
  }, [address, router])

  return (
    <button
      onClick={() => tonUI.openModal()}
      className="relative group px-10 py-5 metal-btn text-xl font-display font-bold tracking-widest uppercase
        text-[var(--color-emerald)] border-2 border-[var(--color-emerald-dim)]
        hover:border-[var(--color-emerald)] transition-all duration-300
        hover:shadow-[0_0_30px_rgba(0,200,112,0.4),0_0_60px_rgba(0,200,112,0.2)]"
    >
      {/* Pulsing corner accents */}
      <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[var(--color-emerald)] opacity-60 group-hover:opacity-100 transition-opacity" />
      <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[var(--color-emerald)] opacity-60 group-hover:opacity-100 transition-opacity" />
      <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[var(--color-emerald)] opacity-60 group-hover:opacity-100 transition-opacity" />
      <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[var(--color-emerald)] opacity-60 group-hover:opacity-100 transition-opacity" />

      <span className="relative z-10">⚔ Подключить кошелёк</span>
    </button>
  )
}
