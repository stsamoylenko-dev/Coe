/**
 * Telegram Webhook — точка входа для Managed Bot.
 * POST /api/telegram  – принимает обновления от Telegram
 * GET  /api/telegram  – статус хука
 *
 * Переменные окружения:
 *   TELEGRAM_BOT_TOKEN         – токен бота
 *   TELEGRAM_WEBHOOK_SECRET    – секрет для X-Telegram-Bot-Api-Secret-Token
 */

import { NextRequest, NextResponse } from 'next/server'
import type { TelegramUpdate, TelegramMessage } from '@/lib/telegram'
import { TelegramBot, parseCommand, inlineKeyboard, callbackButton } from '@/lib/telegram'

const SECRET = process.env.TELEGRAM_WEBHOOK_SECRET
const TOKEN  = process.env.TELEGRAM_BOT_TOKEN

function bot(): TelegramBot | null {
  return TOKEN ? new TelegramBot(TOKEN) : null
}

// ─── Обработка команд ────────────────────────────────────────────────────────

async function handleMessage(msg: TelegramMessage): Promise<void> {
  const tg  = bot()
  if (!tg) return

  const cmd = parseCommand(msg)
  const chatId = msg.chat.id

  if (!cmd) return

  switch (cmd.command) {
    case 'start':
      await tg.sendMessage({
        chat_id:    chatId,
        text:       '⚔ *Код Вечности: 4N*\n\nДобро пожаловать, воин!\n\nКоманды:\n/warrior — твой воин\n/domains — твои домены\n/arena — арена\n/channel — платёжный канал\n/dns — управление DNS TXT',
        parse_mode: 'Markdown',
        reply_markup: inlineKeyboard([[
          callbackButton('🔗 Открыть приложение', 'open_app'),
          callbackButton('⚔ Мой воин', 'warrior'),
        ]]),
      })
      break

    case 'warrior':
      await tg.sendMessage({
        chat_id: chatId,
        text:    '⚔ Открой приложение и подключи TON-кошелёк, чтобы пробудить своего воина.\n\nhttps://eternity-code-4n.vercel.app/dashboard',
      })
      break

    case 'domains':
      await tg.sendMessage({
        chat_id: chatId,
        text:    '◎ Управление доменами:\n\nПодключи кошелёк на сайте, чтобы увидеть свои .ton домены.\n\nhttps://eternity-code-4n.vercel.app/dashboard',
      })
      break

    case 'channel':
      await tg.sendMessage({
        chat_id: chatId,
        text:    '⚡ *Payment Channel 402*\n\nОткрой платёжный канал для микроплатежей без газа.\nИспользуй /channel open <address> <amount_ton>',
        parse_mode: 'Markdown',
      })
      break

    case 'dns':
      await tg.sendMessage({
        chat_id: chatId,
        text:    '📝 *DNS TXT Records*\n\nУправляй text-записями своего .ton домена.\nОткрой приложение для полного интерфейса:\nhttps://eternity-code-4n.vercel.app/agent',
        parse_mode: 'Markdown',
      })
      break

    case 'arena':
      await tg.sendMessage({
        chat_id: chatId,
        text:    '🔒 Арена — скоро! Следи за обновлениями.',
      })
      break

    default:
      await tg.sendMessage({
        chat_id: chatId,
        text:    `Неизвестная команда: /${cmd.command}\nВведи /start для списка команд.`,
      })
  }
}

// ─── Route handlers ───────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (SECRET) {
    const token = req.headers.get('X-Telegram-Bot-Api-Secret-Token')
    if (token !== SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  let update: TelegramUpdate
  try {
    update = await req.json() as TelegramUpdate
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  try {
    if (update.message) {
      await handleMessage(update.message)
    }

    if (update.callback_query) {
      const tg = bot()
      if (tg) {
        await tg.answerCallbackQuery(update.callback_query.id)
        if (update.callback_query.data === 'open_app' && update.callback_query.message) {
          await tg.sendMessage({
            chat_id: update.callback_query.message.chat.id,
            text:    'https://eternity-code-4n.vercel.app',
          })
        }
      }
    }

    if (update.inline_query) {
      const tg = bot()
      if (tg) {
        await tg.answerInlineQuery(update.inline_query.id, [
          {
            type:                  'article',
            id:                    '1',
            title:                 'Код Вечности: 4N',
            input_message_content: { message_text: '⚔ Код Вечности: 4N — https://eternity-code-4n.vercel.app' },
          },
        ])
      }
    }
  } catch (err) {
    console.error('[telegram/webhook]', err)
  }

  return NextResponse.json({ ok: true })
}

export async function GET() {
  return NextResponse.json({
    status:  'active',
    service: 'Telegram Managed Bot — Код Вечности: 4N',
    hasToken: !!TOKEN,
  })
}
