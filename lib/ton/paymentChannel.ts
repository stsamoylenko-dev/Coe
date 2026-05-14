/**
 * Payment Channel 402 — офлайн-микроплатежи TON + HTTP 402.
 * Стороны блокируют средства on-chain, обмениваются подписанными state-апдейтами
 * off-chain (нулевые газ-расходы), закрывают одной транзакцией.
 *
 * 6 этапов: Discovery → Open → Off-chain → Commit → CoopClose → Dispute
 * Ref: https://github.com/TONresistor/payment-channel-402
 */

import { beginCell, Cell } from '@ton/ton'

// ─── Ops ─────────────────────────────────────────────────────────────────────

const OP_INIT             = 0x555
const OP_COOPERATIVE_CLOSE = 0xcff
const OP_COMMIT           = 0xafc
const OP_FORCE_CLOSE      = 0x8888

// ─── Типы ────────────────────────────────────────────────────────────────────

export interface ChannelConfig {
  channelId:        bigint
  alice:            string   // инициатор (адрес)
  bob:              string   // сервер (адрес)
  aliceDeposit:     bigint   // нанотонов
  bobDeposit:       bigint
  quarantineSeconds: number  // период оспаривания (default 86400 = 1 день)
}

export interface ChannelState {
  seqno:     bigint
  sentAlice: bigint   // суммарно отправлено alice → bob
  sentBob:   bigint   // суммарно отправлено bob → alice
}

export interface SignedState {
  state:     ChannelState
  signature: string   // hex-подпись hash state-cell
  signer:    string   // адрес подписавшего
}

export interface ChannelBalance {
  alice: bigint
  bob:   bigint
}

// ─── Message builders ─────────────────────────────────────────────────────────

/** Тело сообщения для открытия (инициализации) канала on-chain. */
export function buildOpenChannelBody(cfg: ChannelConfig): Cell {
  return beginCell()
    .storeUint(OP_INIT, 32)
    .storeUint(BigInt(0), 64)                   // query_id
    .storeUint(cfg.channelId, 64)
    .storeCoins(cfg.aliceDeposit)
    .storeCoins(cfg.bobDeposit)
    .storeUint(cfg.quarantineSeconds, 32)
    .endCell()
}

/** Канонический cell состояния канала — используется для подписи. */
export function buildStateCell(state: ChannelState): Cell {
  return beginCell()
    .storeUint(state.seqno, 64)
    .storeCoins(state.sentAlice)
    .storeCoins(state.sentBob)
    .endCell()
}

/** Тело сообщения для кооперативного закрытия (обе подписи). */
export function buildCoopCloseBody(
  state:          ChannelState,
  sigAlice:       string,   // hex
  sigBob:         string,   // hex
): Cell {
  return beginCell()
    .storeUint(OP_COOPERATIVE_CLOSE, 32)
    .storeUint(BigInt(0), 64)
    .storeUint(state.seqno, 64)
    .storeCoins(state.sentAlice)
    .storeCoins(state.sentBob)
    .storeBuffer(Buffer.from(sigAlice, 'hex'))
    .storeBuffer(Buffer.from(sigBob, 'hex'))
    .endCell()
}

/** Тело сообщения для принудительного закрытия (одна подпись + quarantine). */
export function buildForceCloseBody(state: ChannelState, sig: string): Cell {
  return beginCell()
    .storeUint(OP_FORCE_CLOSE, 32)
    .storeUint(BigInt(0), 64)
    .storeUint(state.seqno, 64)
    .storeCoins(state.sentAlice)
    .storeCoins(state.sentBob)
    .storeBuffer(Buffer.from(sig, 'hex'))
    .endCell()
}

/** Тело сообщения commit (вывод накопленного баланса в середине жизни канала). */
export function buildCommitBody(
  state:          ChannelState,
  sigAlice:       string,
  sigBob:         string,
): Cell {
  return beginCell()
    .storeUint(OP_COMMIT, 32)
    .storeUint(BigInt(0), 64)
    .storeUint(state.seqno, 64)
    .storeCoins(state.sentAlice)
    .storeCoins(state.sentBob)
    .storeBuffer(Buffer.from(sigAlice, 'hex'))
    .storeBuffer(Buffer.from(sigBob, 'hex'))
    .endCell()
}

// ─── Расчёт балансов ──────────────────────────────────────────────────────────

export function computeBalance(cfg: ChannelConfig, state: ChannelState): ChannelBalance {
  return {
    alice: cfg.aliceDeposit - state.sentAlice + state.sentBob,
    bob:   cfg.bobDeposit   - state.sentBob   + state.sentAlice,
  }
}

// ─── Хеш состояния для подписи ────────────────────────────────────────────────

export async function hashState(state: ChannelState): Promise<string> {
  const boc = buildStateCell(state).toBoc()
  const buf = await crypto.subtle.digest('SHA-256', boc)
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

// ─── Следующий state-апдейт ──────────────────────────────────────────────────

/** Создаёт новое состояние при платеже от alice к bob. */
export function nextStateAlicePays(state: ChannelState, amountNano: bigint): ChannelState {
  return { ...state, seqno: state.seqno + BigInt(1), sentAlice: state.sentAlice + amountNano }
}

/** Создаёт новое состояние при платеже от bob к alice. */
export function nextStateBobPays(state: ChannelState, amountNano: bigint): ChannelState {
  return { ...state, seqno: state.seqno + BigInt(1), sentBob: state.sentBob + amountNano }
}

// ─── Util ─────────────────────────────────────────────────────────────────────

export function cellToBoc64(cell: Cell): string {
  return cell.toBoc().toString('base64')
}
