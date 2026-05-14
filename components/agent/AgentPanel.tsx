'use client'

/**
 * Панель управления агентом: бот-токен, вебхук, плагины, платёжный канал.
 */

import { useState } from 'react'
import GlassCard from '@/components/ui/GlassCard'
import PluginCard from '@/components/agent/PluginCard'
import { useAgentStore } from '@/store/agentStore'
import { TON_CORE_PLUGIN, TELEGRAM_CORE_PLUGIN } from '@/lib/agent'

export default function AgentPanel() {
  const {
    botToken, webhookActive, botUsername,
    plugins, chatHistory, isRunning,
    x402Active, x402Price,
    setBotToken, setWebhookActive, setBotUsername,
    addPlugin, removePlugin,
    setX402,
  } = useAgentStore()

  const [tokenInput,  setTokenInput]  = useState(botToken ?? '')
  const [chatInput,   setChatInput]   = useState('')
  const [priceInput,  setPriceInput]  = useState(x402Price)
  const [statusMsg,   setStatusMsg]   = useState<string | null>(null)

  // ─── Bot ─────────────────────────────────────────────────────────────────

  async function handleSaveToken() {
    const t = tokenInput.trim()
    if (!t) return
    setBotToken(t)
    setStatusMsg('Токен сохранён')
    try {
      const res = await fetch(`https://api.telegram.org/bot${t}/getMe`)
      const json = await res.json() as { ok: boolean; result?: { username?: string } }
      if (json.ok && json.result?.username) {
        setBotUsername(json.result.username)
        setStatusMsg(`✓ Бот @${json.result.username} подключён`)
      }
    } catch {
      setStatusMsg('Ошибка проверки токена')
    }
  }

  async function handleSetWebhook() {
    if (!botToken) return
    const origin = window.location.origin
    const url    = `${origin}/api/telegram`
    const res    = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, allowed_updates: ['message', 'callback_query', 'inline_query'] }),
    })
    const json = await res.json() as { ok: boolean; description?: string }
    if (json.ok) {
      setWebhookActive(true)
      setStatusMsg(`✓ Webhook → ${url}`)
    } else {
      setStatusMsg(`Ошибка: ${json.description}`)
    }
  }

  // ─── Plugins ──────────────────────────────────────────────────────────────

  function handleAddBuiltin(id: 'ton' | 'telegram') {
    addPlugin(id === 'ton' ? TON_CORE_PLUGIN : TELEGRAM_CORE_PLUGIN)
    setStatusMsg(`✓ Плагин ${id === 'ton' ? 'TON Core' : 'Telegram Core'} добавлен`)
  }

  // ─── x402 ────────────────────────────────────────────────────────────────

  function handleX402Toggle() {
    setX402(!x402Active, priceInput)
    setStatusMsg(x402Active ? 'x402 отключён' : `✓ x402 активен · ${priceInput} нанотонов`)
  }

  // ─── Chat history ─────────────────────────────────────────────────────────

  const ROLE_STYLE: Record<string, string> = {
    user:      'text-[var(--color-emerald)]',
    assistant: 'text-[var(--color-text-primary)]',
    tool:      'text-[var(--color-text-muted)]',
  }

  return (
    <div className="space-y-6">

      {/* ── Bot configuration ──────────────────────────────────────────── */}
      <GlassCard className="p-6 space-y-4">
        <div>
          <div className="font-mono text-[10px] tracking-widest text-[var(--color-text-muted)] uppercase mb-1">
            Telegram · Managed Bot
          </div>
          <h2 className="font-display text-lg font-bold text-[var(--color-text-primary)]">
            Конфигурация бота
          </h2>
        </div>

        <div className="flex gap-2">
          <input
            type="password"
            placeholder="Bot Token (1234567890:ABC...)"
            value={tokenInput}
            onChange={e => setTokenInput(e.target.value)}
            className="flex-1 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded
              text-[var(--color-text-primary)] font-mono text-sm px-3 py-2
              focus:outline-none focus:border-[var(--color-emerald-dim)]
              placeholder:text-[var(--color-text-muted)]"
          />
          <button
            onClick={() => void handleSaveToken()}
            className="px-4 py-2 font-display text-sm tracking-widest uppercase
              text-[var(--color-emerald)] border border-[var(--color-emerald-dim)] rounded
              hover:border-[var(--color-emerald)] transition-all duration-200"
          >
            Сохранить
          </button>
        </div>

        {botUsername && (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--color-emerald)] animate-pulse" />
            <span className="font-mono text-xs text-[var(--color-emerald)]">@{botUsername}</span>
          </div>
        )}

        <button
          onClick={() => void handleSetWebhook()}
          disabled={!botToken}
          className={`w-full py-2.5 font-display text-sm tracking-widest uppercase
            border rounded transition-all duration-200
            ${webhookActive
              ? 'text-[var(--color-emerald)] border-[var(--color-emerald)] bg-[var(--color-emerald-glow-sm)]'
              : 'text-[var(--color-text-muted)] border-[var(--glass-border)] hover:border-[var(--color-emerald-dim)]'
            }
            disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {webhookActive ? '✓ Webhook активен' : '⚡ Установить Webhook'}
        </button>
      </GlassCard>

      {/* ── Plugin registry ─────────────────────────────────────────────── */}
      <GlassCard className="p-6 space-y-4">
        <div>
          <div className="font-mono text-[10px] tracking-widest text-[var(--color-text-muted)] uppercase mb-1">
            Plugin SDK · teleton-plugins
          </div>
          <h2 className="font-display text-lg font-bold text-[var(--color-text-primary)]">
            Реестр плагинов
          </h2>
        </div>

        {/* Builtin plugin buttons */}
        <div className="flex gap-2 flex-wrap">
          {[
            { id: 'ton' as const,      label: 'TON Core',      desc: '3 инструмента' },
            { id: 'telegram' as const, label: 'Telegram Core', desc: '1 инструмент' },
          ].map(p => (
            <button
              key={p.id}
              onClick={() => handleAddBuiltin(p.id)}
              disabled={plugins.some(pl => pl.manifest.id === `${p.id}.core`)}
              className="px-4 py-2 font-mono text-xs tracking-widest uppercase
                border border-[var(--glass-border)] rounded
                text-[var(--color-text-muted)] hover:text-[var(--color-emerald)]
                hover:border-[var(--color-emerald-dim)]
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-all duration-200"
            >
              + {p.label}
              <span className="ml-1 opacity-60">{p.desc}</span>
            </button>
          ))}
        </div>

        {plugins.length === 0 ? (
          <p className="font-mono text-xs text-[var(--color-text-muted)] text-center py-4">
            Плагины не установлены
          </p>
        ) : (
          <div className="space-y-3">
            {plugins.map(p => (
              <PluginCard key={p.manifest.id} plugin={p} onRemove={removePlugin} />
            ))}
          </div>
        )}

        <div className="font-mono text-xs text-[var(--color-text-muted)] text-center">
          Всего инструментов: {plugins.reduce((acc, p) => acc + p.manifest.tools.length, 0)}
        </div>
      </GlassCard>

      {/* ── x402 Payment ───────────────────────────────────────────────── */}
      <GlassCard className="p-6 space-y-4">
        <div>
          <div className="font-mono text-[10px] tracking-widest text-[var(--color-text-muted)] uppercase mb-1">
            x402-ton · HTTP 402 Payments
          </div>
          <h2 className="font-display text-lg font-bold text-[var(--color-text-primary)]">
            Монетизация API
          </h2>
        </div>

        <div className="flex gap-2">
          <input
            placeholder="Цена (нанотонов)"
            value={priceInput}
            onChange={e => setPriceInput(e.target.value)}
            className="flex-1 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded
              text-[var(--color-text-primary)] font-mono text-sm px-3 py-2
              focus:outline-none focus:border-[var(--color-emerald-dim)]"
          />
          <button
            onClick={handleX402Toggle}
            className={`px-4 py-2 font-display text-sm tracking-widest uppercase
              border rounded transition-all duration-200
              ${x402Active
                ? 'text-[var(--color-emerald)] border-[var(--color-emerald)]'
                : 'text-[var(--color-text-muted)] border-[var(--glass-border)] hover:border-[var(--color-emerald-dim)]'
              }`}
          >
            {x402Active ? '✓ Активен' : 'Включить'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Эндпоинт',  value: '/api/x402' },
            { label: 'Стандарт',  value: 'x402 / HTTP 402' },
            { label: 'Сеть',      value: 'tvm:-239 (mainnet)' },
            { label: 'Схема',     value: 'exact' },
          ].map(({ label, value }) => (
            <div key={label} className="p-2 border border-[var(--glass-border)] rounded bg-[var(--glass-bg)]">
              <div className="font-mono text-[10px] text-[var(--color-text-muted)] uppercase tracking-widest">{label}</div>
              <div className="font-mono text-xs text-[var(--color-text-primary)] mt-0.5">{value}</div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* ── Agent chat log ─────────────────────────────────────────────── */}
      {chatHistory.length > 0 && (
        <GlassCard className="p-6 space-y-3">
          <div className="font-mono text-[10px] tracking-widest text-[var(--color-text-muted)] uppercase">
            Agent Loop · История
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {chatHistory.map((msg, i) => (
              <div key={i} className="font-mono text-xs">
                <span className={`${ROLE_STYLE[msg.role] ?? ''} uppercase mr-2`}>[{msg.role}]</span>
                <span className="text-[var(--color-text-secondary)]">{msg.content}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Status */}
      {statusMsg && (
        <p className={`font-mono text-xs text-center ${
          statusMsg.startsWith('✓') ? 'text-[var(--color-emerald)]' : 'text-red-400'
        }`}>
          {statusMsg}
        </p>
      )}
    </div>
  )
}
