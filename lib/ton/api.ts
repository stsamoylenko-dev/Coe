import { TONAPI_BASE } from '@/lib/constants'
import type { RawNFT } from './types'

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url)
      if (res.status === 429) {
        const wait = Math.pow(2, attempt) * 1000
        await new Promise(r => setTimeout(r, wait))
        continue
      }
      return res
    } catch (err) {
      if (attempt === retries) throw err
      await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000))
    }
  }
  throw new Error('Max retries exceeded')
}

export async function fetchWalletNFTs(address: string): Promise<RawNFT[]> {
  const url = `${TONAPI_BASE}/accounts/${encodeURIComponent(address)}/nfts?limit=1000&indirect_ownership=false`
  const res = await fetchWithRetry(url)
  if (!res.ok) {
    throw new Error(`tonapi error ${res.status}: ${res.statusText}`)
  }
  const data = await res.json() as { nft_items?: RawNFT[] }
  return data.nft_items ?? []
}
