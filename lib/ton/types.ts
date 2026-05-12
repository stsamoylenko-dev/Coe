export interface RawNFT {
  address: string
  dns?: string
  index?: number
  collection?: {
    address: string
    name?: string
  }
  metadata?: {
    name?: string
    image?: string
    description?: string
  }
  sale?: {
    price?: { value: string }
  }
  verified?: boolean
}

export interface ParsedDomain {
  raw:       string   // "1221.ton"
  label:     string   // "1221"
  length:    number   // 4
  is4N:      boolean  // true if exactly 4 digits
  address:   string   // NFT contract address
  isPremium: boolean  // short and desirable
  forSale:   boolean
}

export interface WalletDomainsResult {
  domains:      ParsedDomain[]
  primary4N:    ParsedDomain | null
  secondary4Ns: ParsedDomain[]
  armors:       ParsedDomain[]
  raw:          RawNFT[]
}
