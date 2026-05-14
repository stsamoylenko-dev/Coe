/**
 * TON DNS TXT Records
 * Read/write dns_text records on .ton domain NFTs.
 * Write path: build change_dns_record message → send via TonConnect.
 * Read path: TONAPI v2 NFT metadata + optional dnsresolve call.
 *
 * Ref: https://github.com/TONresistor/TON-DNS-TXT
 * op:  0x4eb1f0f9  (change_dns_record)
 * TLB: dns_text#1eda value:Text = DNSRecord
 */

import { beginCell, Cell } from '@ton/ton'
import { TONAPI_BASE } from '@/lib/constants'

const CHANGE_DNS_RECORD_OP = 0x4eb1f0f9
const DNS_TEXT_TYPE        = 0x1eda
// 1023 bits per cell = 127 bytes; 2-byte type prefix → 125 bytes of text per cell
const MAX_TEXT_BYTES = 125

export interface DnsTxtRecord {
  key:   string
  value: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function sha256BigInt(text: string): Promise<bigint> {
  const raw = new TextEncoder().encode(text)
  const buf = await crypto.subtle.digest('SHA-256', raw)
  const hex = Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  return BigInt('0x' + hex) as bigint
}

function buildTextValueCell(value: string): Cell {
  const bytes = new TextEncoder().encode(value)
  // First cell: 2-byte type prefix + up to 125 bytes of text.
  // For values longer than 125 bytes we chain additional ref cells.
  let builder = beginCell().storeUint(DNS_TEXT_TYPE, 16)

  let offset = 0
  let current = builder

  while (offset < bytes.length) {
    const chunk = bytes.slice(offset, offset + MAX_TEXT_BYTES)
    current = current.storeBuffer(Buffer.from(chunk))
    offset += MAX_TEXT_BYTES

    if (offset < bytes.length) {
      // Chain a continuation cell via ref
      const nextBuilder = beginCell()
      current.storeRef(nextBuilder.endCell()) // placeholder; overwritten below
      current = nextBuilder
    }
  }

  return builder.endCell()
}

// ─── Message builders ─────────────────────────────────────────────────────────

/** Returns the message body Cell for setting a dns_text record. */
export async function buildSetTxtRecord(
  key: string,
  value: string,
  queryId: bigint = BigInt(0),
): Promise<Cell> {
  const keyHash = await sha256BigInt(key)
  return beginCell()
    .storeUint(CHANGE_DNS_RECORD_OP, 32)
    .storeUint(queryId, 64)
    .storeUint(keyHash, 256)
    .storeRef(buildTextValueCell(value))
    .endCell()
}

/** Returns the message body Cell for deleting a dns_text record. */
export async function buildDeleteTxtRecord(key: string, queryId: bigint = BigInt(0)): Promise<Cell> {
  const keyHash = await sha256BigInt(key)
  return beginCell()
    .storeUint(CHANGE_DNS_RECORD_OP, 32)
    .storeUint(queryId, 64)
    .storeUint(keyHash, 256)
    .endCell()
}

/** Serialize a Cell to base64 BOC for TonConnect payload. */
export function cellToBoc64(cell: Cell): string {
  return cell.toBoc().toString('base64')
}

// ─── Read ─────────────────────────────────────────────────────────────────────

interface TonapiNft {
  dns?: string
  metadata?: Record<string, unknown>
  approved_by?: string[]
}

/**
 * Fetch dns_text-style records visible via TONAPI NFT metadata.
 * Full on-chain dnsresolve requires a contract call; this surfaces
 * what TONAPI exposes in the NFT metadata object.
 */
export async function fetchDnsRecords(nftAddress: string): Promise<DnsTxtRecord[]> {
  try {
    const res = await fetch(
      `${TONAPI_BASE}/nfts/${encodeURIComponent(nftAddress)}`,
    )
    if (!res.ok) return []
    const json = await res.json() as TonapiNft
    const meta = json.metadata ?? {}
    const skip = new Set(['name', 'image', 'description', 'buttons', 'uri'])
    return Object.entries(meta)
      .filter(([k]) => !skip.has(k))
      .map(([key, value]) => ({ key, value: String(value) }))
  } catch {
    return []
  }
}
