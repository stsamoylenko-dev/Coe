import { create } from 'zustand'

interface WalletState {
  address:     string | null
  isConnected: boolean
  setAddress:  (address: string | null) => void
}

export const useWalletStore = create<WalletState>(set => ({
  address:     null,
  isConnected: false,
  setAddress:  (address) => set({ address, isConnected: address !== null }),
}))
