import type { RawNFT, ParsedDomain, WalletDomainsResult } from './types'

const FOUR_N_REGEX = /^\d{4}$/

function isDomain(nft: RawNFT): boolean {
  return typeof nft.dns === 'string' && nft.dns.endsWith('.ton')
}

function parseDomain(nft: RawNFT): ParsedDomain {
  const raw   = nft.dns!
  const label = raw.replace(/\.ton$/, '')
  const len   = label.length

  return {
    raw,
    label,
    length:    len,
    is4N:      FOUR_N_REGEX.test(label),
    address:   nft.address,
    isPremium: len <= 6,
    forSale:   !!nft.sale,
  }
}

export function extractDomains(nfts: RawNFT[]): WalletDomainsResult {
  const domains = nfts.filter(isDomain).map(parseDomain)

  // Sort 4N domains numerically so the lowest number is primary
  const all4N = domains.filter(d => d.is4N).sort((a, b) => parseInt(a.label) - parseInt(b.label))
  const primary4N    = all4N[0] ?? null
  const secondary4Ns = all4N.slice(1)

  // Non-4N domains sorted by length asc (shorter = heavier armor)
  const armors = domains
    .filter(d => !d.is4N)
    .sort((a, b) => a.length - b.length)

  return { domains, primary4N, secondary4Ns, armors, raw: nfts }
}
