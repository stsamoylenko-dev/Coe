/**
 * x402 Payment Endpoint — HTTP 402 для TON агентов.
 * GET  /api/x402  – вернуть 402 с параметрами платежа
 * POST /api/x402  – верифицировать X-Payment и отдать ответ
 *
 * Переменные окружения:
 *   TON_PAYMENT_ADDRESS  – адрес получателя
 *   X402_PRICE_NANOTON   – цена в нанотонах (default: 50000000 = 0.05 TON)
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  buildX402Header,
  verifyX402Header,
  createPaymentRequest,
} from '@/lib/ton/x402'

const TO_ADDRESS   = process.env.TON_PAYMENT_ADDRESS ?? 'EQD__placeholder__'
const PRICE_NANO   = process.env.X402_PRICE_NANOTON  ?? '50000000'

export async function GET() {
  const req = createPaymentRequest(TO_ADDRESS, PRICE_NANO, {
    memo: 'access-eternity-4n',
  })

  return new NextResponse('Payment Required\n\nДля доступа необходим платёж в TON.', {
    status: 402,
    headers: {
      'WWW-Authenticate': buildX402Header(req),
      'Content-Type':     'text/plain; charset=utf-8',
      'X-Accept-Payment': 'ton',
    },
  })
}

export async function POST(req: NextRequest) {
  const xPayment = req.headers.get('X-Payment')
  if (!xPayment) {
    const payReq = createPaymentRequest(TO_ADDRESS, PRICE_NANO, { memo: 'access-eternity-4n' })
    return new NextResponse('Missing X-Payment header', {
      status: 402,
      headers: { 'WWW-Authenticate': buildX402Header(payReq) },
    })
  }

  const result = verifyX402Header(xPayment, TO_ADDRESS, PRICE_NANO)
  if (!result.valid) {
    return NextResponse.json(
      { error: `Недействительный платёж: ${result.reason}` },
      { status: 402 },
    )
  }

  return NextResponse.json({
    ok:        true,
    message:   'Платёж принят',
    service:   'Код Вечности: 4N',
    timestamp: Date.now(),
  })
}
