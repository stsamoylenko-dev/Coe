/**
 * Teleton-agent вдохновлённая система плагинов для TON + Telegram агентов.
 * Реализует Plugin SDK (sdk.ton, sdk.telegram, sdk.storage, sdk.secrets),
 * реестр плагинов (PluginRegistry) и цикл агента (AgentLoop) с tool-calling.
 *
 * Ref: https://github.com/TONresistor/teleton-agent
 *      https://github.com/TONresistor/teleton-plugins
 */

import type { TelegramBot, TelegramUpdate, ManagedBotContext } from '@/lib/telegram'
import { TONAPI_BASE } from '@/lib/constants'

// ─── Manifest & Tool types ────────────────────────────────────────────────────

export interface ToolParameter {
  type:        'string' | 'number' | 'boolean' | 'object'
  description: string
  required?:   boolean
  enum?:       string[]
  default?:    unknown
}

export interface ToolDefinition {
  name:        string    // формат "pluginId.toolName"
  description: string
  parameters:  Record<string, ToolParameter>
  returns?:    string    // описание возвращаемого значения
  category:    'ton' | 'telegram' | 'utility' | 'storage' | 'data' | 'dex' | 'dns'
}

export interface PluginManifest {
  id:          string
  name:        string
  version:     string
  description: string
  author?:     string
  tools:       ToolDefinition[]
  hooks?:      Array<'onStart' | 'onMessage' | 'onSchedule' | 'onShutdown'>
  permissions?: string[]
}

// ─── Plugin SDK ───────────────────────────────────────────────────────────────

export interface TonSDK {
  getBalance(address: string): Promise<string>
  resolve(domain: string): Promise<string | null>
  lookupDomain(address: string): Promise<string | null>
  getNft(address: string): Promise<Record<string, unknown> | null>
}

export interface TelegramSDK {
  sendMessage(chatId: number, text: string, parseMode?: 'HTML' | 'Markdown'): Promise<void>
  getBot(): TelegramBot | null
}

export interface StorageSDK {
  get(key: string): string | null
  set(key: string, value: string, ttlSeconds?: number): void
  delete(key: string): void
  keys(): string[]
}

export interface SecretsSDK {
  get(name: string): string | null
  set(name: string, value: string): void
  has(name: string): boolean
}

export interface AgentPluginSDK {
  ton:      TonSDK
  telegram: TelegramSDK
  storage:  StorageSDK
  secrets:  SecretsSDK
  on(event: string, handler: (...args: unknown[]) => unknown): void
  emit(event: string, ...args: unknown[]): void
}

// ─── Plugin interface ─────────────────────────────────────────────────────────

export type ToolHandler = (
  params: Record<string, unknown>,
  sdk: AgentPluginSDK,
) => Promise<unknown>

export interface AgentPlugin {
  manifest: PluginManifest
  tools:    Record<string, ToolHandler>
  onStart?:    (sdk: AgentPluginSDK) => Promise<void>
  onMessage?:  (update: TelegramUpdate, sdk: AgentPluginSDK) => Promise<void>
  onShutdown?: (sdk: AgentPluginSDK) => Promise<void>
}

// ─── Plugin Registry ──────────────────────────────────────────────────────────

export class PluginRegistry {
  private readonly plugins = new Map<string, AgentPlugin>()
  private readonly handlers = new Map<string, { plugin: AgentPlugin; fn: ToolHandler }>()

  register(plugin: AgentPlugin): void {
    this.plugins.set(plugin.manifest.id, plugin)
    for (const [name, fn] of Object.entries(plugin.tools)) {
      this.handlers.set(`${plugin.manifest.id}.${name}`, { plugin, fn })
    }
  }

  unregister(id: string): void {
    const plugin = this.plugins.get(id)
    if (!plugin) return
    for (const name of Object.keys(plugin.tools)) {
      this.handlers.delete(`${id}.${name}`)
    }
    this.plugins.delete(id)
  }

  get(id: string): AgentPlugin | undefined {
    return this.plugins.get(id)
  }

  list(): AgentPlugin[] {
    return Array.from(this.plugins.values())
  }

  allTools(): ToolDefinition[] {
    return this.list().flatMap(p => p.manifest.tools)
  }

  async call(
    toolName: string,
    params:   Record<string, unknown>,
    sdk:      AgentPluginSDK,
  ): Promise<unknown> {
    const entry = this.handlers.get(toolName)
    if (!entry) throw new Error(`Инструмент не найден: ${toolName}`)
    return entry.fn(params, sdk)
  }
}

// ─── SDK Factory ─────────────────────────────────────────────────────────────

export function createPluginSDK(
  storage:    Map<string, string>,
  secrets:    Map<string, string>,
  botCtx?:   ManagedBotContext,
  apiBase = TONAPI_BASE,
): AgentPluginSDK {
  const eventBus = new Map<string, Array<(...args: unknown[]) => unknown>>()

  return {
    ton: {
      async getBalance(address) {
        const res = await fetch(`${apiBase}/accounts/${encodeURIComponent(address)}`)
        if (!res.ok) return '0'
        const json = await res.json() as { balance?: string }
        return json.balance ?? '0'
      },
      async resolve(domain) {
        const res = await fetch(`${apiBase}/dns/${encodeURIComponent(domain)}`)
        if (!res.ok) return null
        const json = await res.json() as { wallet?: { address?: string } }
        return json.wallet?.address ?? null
      },
      async lookupDomain(address) {
        const res = await fetch(`${apiBase}/accounts/${encodeURIComponent(address)}`)
        if (!res.ok) return null
        const json = await res.json() as { name?: string }
        return json.name ?? null
      },
      async getNft(address) {
        const res = await fetch(`${apiBase}/nfts/${encodeURIComponent(address)}`)
        if (!res.ok) return null
        return res.json() as Promise<Record<string, unknown>>
      },
    },
    telegram: {
      async sendMessage(chatId, text, parseMode?) {
        await botCtx?.bot.sendMessage({ chat_id: chatId, text, parse_mode: parseMode })
      },
      getBot: () => botCtx?.bot ?? null,
    },
    storage: {
      get:    (k) => storage.get(k) ?? null,
      set:    (k, v) => { storage.set(k, v) },
      delete: (k) => { storage.delete(k) },
      keys:   () => Array.from(storage.keys()),
    },
    secrets: {
      get:  (n) => secrets.get(n) ?? null,
      set:  (n, v) => { secrets.set(n, v) },
      has:  (n) => secrets.has(n),
    },
    on(event, handler) {
      eventBus.set(event, [...(eventBus.get(event) ?? []), handler])
    },
    emit(event, ...args) {
      for (const h of eventBus.get(event) ?? []) h(...args)
    },
  }
}

// ─── Встроенные плагины ───────────────────────────────────────────────────────

export const TON_CORE_PLUGIN: AgentPlugin = {
  manifest: {
    id:          'ton.core',
    name:        'TON Core',
    version:     '1.0.0',
    description: 'Базовые операции TON: балансы, DNS, NFT',
    tools: [
      {
        name: 'ton.core.getBalance',
        description: 'Получить баланс TON-адреса в нанотонах',
        parameters: { address: { type: 'string', description: 'TON-адрес', required: true } },
        category: 'ton',
      },
      {
        name: 'ton.core.resolveDomain',
        description: 'Разрешить .ton-домен в TON-адрес',
        parameters: { domain: { type: 'string', description: '.ton домен', required: true } },
        category: 'dns',
      },
      {
        name: 'ton.core.lookupDomain',
        description: 'Найти .ton-домен для TON-адреса',
        parameters: { address: { type: 'string', description: 'TON-адрес', required: true } },
        category: 'dns',
      },
    ],
  },
  tools: {
    getBalance:    ({ address }, sdk) => sdk.ton.getBalance(address as string),
    resolveDomain: ({ domain },  sdk) => sdk.ton.resolve(domain as string),
    lookupDomain:  ({ address }, sdk) => sdk.ton.lookupDomain(address as string),
  },
}

export const TELEGRAM_CORE_PLUGIN: AgentPlugin = {
  manifest: {
    id:          'telegram.core',
    name:        'Telegram Core',
    version:     '1.0.0',
    description: 'Базовые операции Telegram: отправка сообщений',
    tools: [
      {
        name: 'telegram.core.sendMessage',
        description: 'Отправить сообщение в Telegram-чат',
        parameters: {
          chatId: { type: 'number', description: 'Telegram chat ID', required: true },
          text:   { type: 'string', description: 'Текст сообщения',  required: true },
        },
        category: 'telegram',
      },
    ],
  },
  tools: {
    sendMessage: ({ chatId, text }, sdk) =>
      sdk.telegram.sendMessage(chatId as number, text as string),
  },
}

// ─── Agent Loop ───────────────────────────────────────────────────────────────

export interface AgentMessage {
  role:     'user' | 'assistant' | 'tool'
  content:  string
  toolCall?: {
    name:    string
    params:  Record<string, unknown>
    result?: unknown
  }
}

export interface AgentConfig {
  systemPrompt?:   string
  maxIterations?:  number
}

export type LLMCaller = (
  messages:  AgentMessage[],
  tools:     ToolDefinition[],
  system?:   string,
) => Promise<{
  text?:     string
  toolCall?: { name: string; params: Record<string, unknown> }
}>

export class AgentLoop {
  constructor(
    private readonly registry: PluginRegistry,
    private readonly sdk:      AgentPluginSDK,
    private readonly llm:      LLMCaller,
    private readonly config:   AgentConfig = {},
  ) {}

  async run(userMessage: string): Promise<string> {
    const messages: AgentMessage[] = [{ role: 'user', content: userMessage }]
    const tools   = this.registry.allTools()
    const maxIter = this.config.maxIterations ?? 10

    for (let i = 0; i < maxIter; i++) {
      const response = await this.llm(messages, tools, this.config.systemPrompt)

      if (response.toolCall) {
        const { name, params } = response.toolCall
        let result: unknown
        try {
          result = await this.registry.call(name, params, this.sdk)
        } catch (err) {
          result = { error: String(err) }
        }
        messages.push({
          role: 'assistant',
          content: `[tool] ${name}`,
          toolCall: { name, params, result },
        })
        messages.push({ role: 'tool', content: JSON.stringify(result) })
        continue
      }

      if (response.text) return response.text
      break
    }

    return messages
      .filter(m => m.role === 'assistant' && !m.toolCall)
      .map(m => m.content)
      .join('\n')
  }

  /** Запускает все onStart-хуки зарегистрированных плагинов. */
  async startPlugins(): Promise<void> {
    await Promise.all(
      this.registry.list().map(p => p.onStart?.(this.sdk)),
    )
  }

  /** Раздаёт обновление всем плагинам с хуком onMessage. */
  async dispatchUpdate(update: TelegramUpdate): Promise<void> {
    await Promise.all(
      this.registry.list().map(p => p.onMessage?.(update, this.sdk)),
    )
  }
}
