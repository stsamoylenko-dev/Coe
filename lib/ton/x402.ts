/**
 * x402-ton: HTTP 402 Payment Required — стандарт микроплатежей для TON-агентов.
 * Клиент подписывает транзакцию через TonConnect; фасилитатор верифицирует и рассылает.
 *
 * Ref: https://github.com/TONresistor/x402-ton
 * Flow: GET → 402 WWW-Authenticate: x402 → подпись → повтор с X-Payment header
 */

// ─── Типы ────────────────────────────────────────────────────────────────────

export type X402Network = 'tvm:-239' | 'tvm:-3'   // mainnet | testnet
export type X402Scheme  = 'exact' | 'upto'

export interface X402PaymentRequest {
  scheme:   X402Scheme
  network:  X402Network
  to:       string    // адрес получателя (TON-адрес)
  amount:   string    // сумма в нанотонах (или единицах жетона)
  token?:   string    // адрес master-контракта жетона; отсутствует = нативный TON
  memo?:    string    // комментарий / invoice ID
  expires?: number    // Unix-timestamp истечения запроса
}

export interface X402PaymentPayload {
  request:   X402PaymentRequest
  signature: string   // base64-кодированный подписанный BOC
  payer:     string   // TON-адрес плательщика
  timestamp: number   // Unix-timestamp момента оплаты
}

export interface X402VerifyResult {
  valid:   boolean
  reason?: string
  txHash?: string
}

// ─── Header helpers ───────────────────────────────────────────────────────────

/** Сериализует запрос платежа в строку WWW-Authenticate. */
export function buildX402Header(req: X402PaymentRequest): string {
  const parts: string[] = [
    `scheme=${req.scheme}`,
    `network=${encodeURIComponent(req.network)}`,
    `to=${encodeURIComponent(req.to)}`,
    `amount=${req.amount}`,
  ]
  if (req.token)   parts.push(`token=${encodeURIComponent(req.token)}`)
  if (req.memo)    parts.push(`memo=${encodeURIComponent(req.memo)}`)
  if (req.expires) parts.push(`expires=${req.expires}`)
  return `x402 ${parts.join(' ')}`
}

/** Парсит строку WWW-Authenticate в объект X402PaymentRequest. */
export function parseX402Header(header: string): X402PaymentRequest | null {
  try {
    const body  = header.replace(/^x402\s*/i, '')
    const parts = body.trim().split(/\s+/)
    const p: Record<string, string> = {}
    for (const part of parts) {
      const eq = part.indexOf('=')
      if (eq < 0) continue
      p[part.slice(0, eq)] = decodeURIComponent(part.slice(eq + 1))
    }
    if (!p.to || !p.amount || !p.network) return null
    return {
      scheme:  (p.scheme as X402Scheme) ?? 'exact',
      network: p.network as X402Network,
      to:      p.to,
      amount:  p.amount,
      token:   p.token,
      memo:    p.memo,
      expires: p.expires ? parseInt(p.expires) : undefined,
    }
  } catch {
    return null
  }
}

// ─── Клиент ───────────────────────────────────────────────────────────────────

/**
 * Делает fetch-запрос с поддержкой HTTP 402.
 * При получении 402 вызывает `sign` для подписи платежа и повторяет запрос.
 */
export async function fetchWithX402(
  url: string,
  payerAddress: string,
  sign: (req: X402PaymentRequest) => Promise<string>,
  options?: RequestInit,
): Promise<Response> {
  const initial = await fetch(url, options)
  if (initial.status !== 402) return initial

  const wwwAuth = initial.headers.get('WWW-Authenticate') ?? ''
  const req = parseX402Header(wwwAuth)
  if (!req) throw new Error('Неверный заголовок 402 Payment Request')

  if (req.expires && Date.now() / 1000 > req.expires) {
    throw new Error('Запрос платежа истёк')
  }

  const signedBoc = await sign(req)
  const payload: X402PaymentPayload = {
    request:   req,
    signature: signedBoc,
    payer:     payerAddress,
    timestamp: Math.floor(Date.now() / 1000),
  }

  return fetch(url, {
    ...options,
    headers: {
      ...(options?.headers as Record<string, string> ?? {}),
      'X-Payment': Buffer.from(JSON.stringify(payload)).toString('base64'),
    },
  })
}

// ─── Верификация (сторона вендора / фасилитатора) ─────────────────────────────

/** Проверяет X-Payment header на корректность адреса и суммы. */
export function verifyX402Header(
  xPaymentHeader: string,
  expectedTo:     string,
  expectedAmount: string,
): X402VerifyResult {
  try {
    const raw = Buffer.from(xPaymentHeader, 'base64').toString()
    const payload = JSON.parse(raw) as X402PaymentPayload
    if (payload.request.to !== expectedTo) {
      return { valid: false, reason: 'Неверный адрес получателя' }
    }
    if (payload.request.amount !== expectedAmount) {
      return { valid: false, reason: 'Неверная сумма' }
    }
    if (!payload.signature) {
      return { valid: false, reason: 'Отсутствует подпись' }
    }
    if (payload.request.expires && Date.now() / 1000 > payload.request.expires) {
      return { valid: false, reason: 'Платёж истёк' }
    }
    return { valid: true }
  } catch {
    return { valid: false, reason: 'Невалидный payload' }
  }
}

/** Создаёт стандартный запрос платежа для эндпоинта API. */
export function createPaymentRequest(
  to:       string,
  amount:   string,
  options?: Partial<Pick<X402PaymentRequest, 'memo' | 'token' | 'network' | 'scheme'>>,
): X402PaymentRequest {
  return {
    scheme:  options?.scheme  ?? 'exact',
    network: options?.network ?? 'tvm:-239',
    to,
    amount,
    token:   options?.token,
    memo:    options?.memo,
    expires: Math.floor(Date.now() / 1000) + 3600,
  }
}
