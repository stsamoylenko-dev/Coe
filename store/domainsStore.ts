import { create } from 'zustand'
import { fetchWalletNFTs } from '@/lib/ton/api'
import { extractDomains } from '@/lib/ton/domains'
import type { WalletDomainsResult } from '@/lib/ton/types'

interface DomainsState {
  data:        WalletDomainsResult | null
  loading:     boolean
  error:       string | null
  fetchDomains: (address: string) => Promise<void>
  reset:       () => void
}

export const useDomainsStore = create<DomainsState>(set => ({
  data:    null,
  loading: false,
  error:   null,

  fetchDomains: async (address: string) => {
    set({ loading: true, error: null })
    try {
      const nfts   = await fetchWalletNFTs(address)
      const result = extractDomains(nfts)
      set({ data: result, loading: false })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Ошибка загрузки доменов'
      set({ error: msg, loading: false })
    }
  },

  reset: () => set({ data: null, loading: false, error: null }),
}))
