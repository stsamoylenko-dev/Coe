'use client'

/**
 * Панель управления DNS TXT-записями .ton домена.
 * Читает записи через TONAPI, записывает через TonConnect (change_dns_record 0x4eb1f0f9).
 */

import { useState, useEffect } from 'react'
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react'
import { toNano } from '@ton/ton'
import GlassCard from '@/components/ui/GlassCard'
import LoadingRune from '@/components/ui/LoadingRune'
import type { ParsedDomain } from '@/lib/ton/types'
import {
  fetchDnsRecords,
  buildSetTxtRecord,
  buildDeleteTxtRecord,
  cellToBoc64,
  type DnsTxtRecord,
} from '@/lib/ton/dnsTxt'

interface Props {
  domains: ParsedDomain[]
}

export default function DnsTxtPanel({ domains }: Props) {
  const address                       = useTonAddress()
  const [tonUI]                       = useTonConnectUI()
  const [selected, setSelected]       = useState<ParsedDomain | null>(domains[0] ?? null)
  const [records, setRecords]         = useState<DnsTxtRecord[]>([])
  const [loading, setLoading]         = useState(false)
  const [newKey, setNewKey]           = useState('')
  const [newValue, setNewValue]       = useState('')
  const [saving, setSaving]           = useState(false)
  const [status, setStatus]           = useState<string | null>(null)

  useEffect(() => {
    if (selected) void loadRecords(selected.address)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected])

  async function loadRecords(nftAddress: string) {
    setLoading(true)
    setStatus(null)
    const recs = await fetchDnsRecords(nftAddress)
    setRecords(recs)
    setLoading(false)
  }

  async function handleSet() {
    if (!selected || !newKey.trim() || !newValue.trim()) return
    setSaving(true)
    setStatus(null)
    try {
      const cell    = await buildSetTxtRecord(newKey.trim(), newValue.trim())
      const payload = cellToBoc64(cell)
      await tonUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [{
          address: selected.address,
          amount:  toNano('0.05').toString(),
          payload,
        }],
      })
      setStatus('✓ Транзакция отправлена')
      setNewKey('')
      setNewValue('')
      // Обновить список через 5 с
      setTimeout(() => void loadRecords(selected.address), 5000)
    } catch (err) {
      setStatus(`Ошибка: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(key: string) {
    if (!selected) return
    setSaving(true)
    setStatus(null)
    try {
      const cell    = await buildDeleteTxtRecord(key)
      const payload = cellToBoc64(cell)
      await tonUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [{
          address: selected.address,
          amount:  toNano('0.05').toString(),
          payload,
        }],
      })
      setStatus('✓ Запись удалена (ожидайте подтверждения)')
      setTimeout(() => void loadRecords(selected.address), 5000)
    } catch (err) {
      setStatus(`Ошибка: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setSaving(false)
    }
  }

  if (!address) return null
  if (domains.length === 0) return null

  return (
    <GlassCard className="p-6 space-y-5">
      {/* Header */}
      <div>
        <div className="font-mono text-[10px] tracking-widest text-[var(--color-text-muted)] uppercase mb-1">
          DNS TXT · On-chain Records
        </div>
        <h2 className="font-display text-lg font-bold text-[var(--color-text-primary)]">
          Записи DNS TXT
        </h2>
        <p className="font-mono text-xs text-[var(--color-text-muted)] mt-1">
          Хранятся on-chain · op 0x4eb1f0f9 · dns_text#1eda
        </p>
      </div>

      {/* Domain selector */}
      <div className="space-y-1">
        <div className="font-mono text-xs text-[var(--color-text-muted)] uppercase tracking-widest">
          Домен
        </div>
        <select
          value={selected?.address ?? ''}
          onChange={e => {
            const d = domains.find(d => d.address === e.target.value)
            if (d) setSelected(d)
          }}
          className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded
            text-[var(--color-text-primary)] font-mono text-sm px-3 py-2
            focus:outline-none focus:border-[var(--color-emerald-dim)]"
        >
          {domains.map(d => (
            <option key={d.address} value={d.address}>{d.raw}</option>
          ))}
        </select>
      </div>

      {/* Records list */}
      <div className="space-y-2">
        <div className="font-mono text-xs text-[var(--color-text-muted)] uppercase tracking-widest">
          Текущие записи
        </div>
        {loading ? (
          <div className="flex justify-center py-4">
            <LoadingRune size={32} label="Читаем блокчейн..." />
          </div>
        ) : records.length === 0 ? (
          <p className="font-mono text-xs text-[var(--color-text-muted)] text-center py-3">
            Записей нет
          </p>
        ) : (
          <div className="space-y-2">
            {records.map(r => (
              <div
                key={r.key}
                className="flex items-center justify-between gap-3 p-3
                  border border-[var(--glass-border)] rounded bg-[var(--glass-bg)]"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-xs text-[var(--color-emerald)] truncate">{r.key}</div>
                  <div className="font-mono text-xs text-[var(--color-text-secondary)] truncate mt-0.5">{r.value}</div>
                </div>
                <button
                  onClick={() => void handleDelete(r.key)}
                  disabled={saving}
                  className="font-mono text-xs text-red-400 hover:text-red-300 transition-colors shrink-0"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add record */}
      <div className="space-y-3">
        <div className="font-mono text-xs text-[var(--color-text-muted)] uppercase tracking-widest">
          Добавить запись
        </div>
        <div className="flex gap-2">
          <input
            placeholder="ключ"
            value={newKey}
            onChange={e => setNewKey(e.target.value)}
            className="flex-1 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded
              text-[var(--color-text-primary)] font-mono text-sm px-3 py-2
              focus:outline-none focus:border-[var(--color-emerald-dim)]
              placeholder:text-[var(--color-text-muted)]"
          />
          <input
            placeholder="значение"
            value={newValue}
            onChange={e => setNewValue(e.target.value)}
            className="flex-[2] bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded
              text-[var(--color-text-primary)] font-mono text-sm px-3 py-2
              focus:outline-none focus:border-[var(--color-emerald-dim)]
              placeholder:text-[var(--color-text-muted)]"
          />
        </div>
        <button
          onClick={() => void handleSet()}
          disabled={saving || !newKey.trim() || !newValue.trim()}
          className="w-full py-2.5 font-display text-sm tracking-widest uppercase
            text-[var(--color-emerald)] border border-[var(--color-emerald-dim)] rounded
            hover:border-[var(--color-emerald)] hover:shadow-[var(--glow-emerald-sm)]
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-all duration-200"
        >
          {saving ? '...' : '⊕ Записать on-chain (0.05 TON)'}
        </button>
      </div>

      {/* Status */}
      {status && (
        <p className={`font-mono text-xs text-center ${
          status.startsWith('✓') ? 'text-[var(--color-emerald)]' : 'text-red-400'
        }`}>
          {status}
        </p>
      )}
    </GlassCard>
  )
}
