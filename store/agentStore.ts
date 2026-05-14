import { create } from 'zustand'
import type { AgentPlugin, AgentMessage } from '@/lib/agent'

interface AgentState {
  // Bot config
  botToken:       string | null
  webhookActive:  boolean
  botUsername:    string | null

  // Plugins
  plugins:        AgentPlugin[]

  // Agent chat
  chatHistory:    AgentMessage[]
  isRunning:      boolean

  // Payment channel
  channelAddress: string | null
  channelBalance: { alice: bigint; bob: bigint } | null

  // x402
  x402Active:     boolean
  x402Price:      string   // нанотонов

  // Actions
  setBotToken:    (token: string | null) => void
  setWebhookActive: (v: boolean) => void
  setBotUsername: (name: string | null) => void
  addPlugin:      (plugin: AgentPlugin) => void
  removePlugin:   (id: string) => void
  addMessage:     (msg: AgentMessage) => void
  clearHistory:   () => void
  setRunning:     (v: boolean) => void
  setChannel:     (address: string | null, balance?: { alice: bigint; bob: bigint }) => void
  setX402:        (active: boolean, price?: string) => void
}

export const useAgentStore = create<AgentState>(set => ({
  botToken:       null,
  webhookActive:  false,
  botUsername:    null,
  plugins:        [],
  chatHistory:    [],
  isRunning:      false,
  channelAddress: null,
  channelBalance: null,
  x402Active:     false,
  x402Price:      '50000000',

  setBotToken:    (token) => set({ botToken: token }),
  setWebhookActive: (v) => set({ webhookActive: v }),
  setBotUsername: (name) => set({ botUsername: name }),
  addPlugin:      (plugin) => set(s => ({ plugins: [...s.plugins.filter(p => p.manifest.id !== plugin.manifest.id), plugin] })),
  removePlugin:   (id) => set(s => ({ plugins: s.plugins.filter(p => p.manifest.id !== id) })),
  addMessage:     (msg) => set(s => ({ chatHistory: [...s.chatHistory, msg] })),
  clearHistory:   () => set({ chatHistory: [] }),
  setRunning:     (v) => set({ isRunning: v }),
  setChannel:     (address, balance) => set({ channelAddress: address, channelBalance: balance ?? null }),
  setX402:        (active, price) => set(s => ({ x402Active: active, x402Price: price ?? s.x402Price })),
}))
