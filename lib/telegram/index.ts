/**
 * Telegram интеграция: Bot API клиент + Managed Bots.
 * Managed Bot = бот, управляемый другим агентом/ботом (делегирование прав).
 *
 * Ref: https://core.telegram.org/bots/features#managed-bots
 *      https://telegram.org/blog/ai-bot-revolution-11-new-features
 */

// ─── Telegram API типы ────────────────────────────────────────────────────────

export interface TelegramUser {
  id:         number
  is_bot:     boolean
  first_name: string
  last_name?: string
  username?:  string
  language_code?: string
}

export interface TelegramChat {
  id:       number
  type:     'private' | 'group' | 'supergroup' | 'channel'
  title?:   string
  username?: string
}

export interface TelegramMessage {
  message_id: number
  from?:      TelegramUser
  chat:       TelegramChat
  date:       number
  text?:      string
  caption?:   string
  entities?:  TelegramMessageEntity[]
  reply_to_message?: TelegramMessage
}

export interface TelegramMessageEntity {
  type:   string   // 'bot_command' | 'mention' | 'url' | ...
  offset: number
  length: number
  url?:   string
  user?:  TelegramUser
}

export interface TelegramCallbackQuery {
  id:      string
  from:    TelegramUser
  message?: TelegramMessage
  data?:   string
  game_short_name?: string
}

export interface TelegramInlineQuery {
  id:     string
  from:   TelegramUser
  query:  string
  offset: string
}

export interface TelegramInlineQueryResult {
  type:  string
  id:    string
  title?: string
  [key: string]: unknown
}

export interface TelegramUpdate {
  update_id:       number
  message?:        TelegramMessage
  edited_message?: TelegramMessage
  callback_query?: TelegramCallbackQuery
  inline_query?:   TelegramInlineQuery
}

// ─── Параметры отправки ───────────────────────────────────────────────────────

export interface SendMessageParams {
  chat_id:              number | string
  text:                 string
  parse_mode?:          'HTML' | 'Markdown' | 'MarkdownV2'
  reply_markup?:        unknown
  reply_to_message_id?: number
  disable_notification?: boolean
}

export interface InlineKeyboardButton {
  text:              string
  callback_data?:    string
  url?:              string
  switch_inline_query?: string
}

export interface InlineKeyboardMarkup {
  inline_keyboard: InlineKeyboardButton[][]
}

// ─── Telegram Bot клиент ──────────────────────────────────────────────────────

export class TelegramBot {
  private readonly base: string

  constructor(readonly token: string) {
    this.base = `https://api.telegram.org/bot${token}`
  }

  async call<T = unknown>(method: string, params: Record<string, unknown> = {}): Promise<T> {
    const res = await fetch(`${this.base}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
    const json = await res.json() as { ok: boolean; result: T; description?: string }
    if (!json.ok) throw new Error(`Telegram API [${method}]: ${json.description ?? 'ошибка'}`)
    return json.result
  }

  getMe() {
    return this.call<TelegramUser>('getMe')
  }

  sendMessage(params: SendMessageParams) {
    return this.call<TelegramMessage>('sendMessage', params as unknown as Record<string, unknown>)
  }

  setWebhook(url: string, secretToken?: string) {
    return this.call('setWebhook', {
      url,
      allowed_updates: ['message', 'edited_message', 'callback_query', 'inline_query'],
      ...(secretToken ? { secret_token: secretToken } : {}),
    })
  }

  deleteWebhook(dropPending = false) {
    return this.call('deleteWebhook', { drop_pending_updates: dropPending })
  }

  getWebhookInfo() {
    return this.call('getWebhookInfo')
  }

  answerCallbackQuery(callbackQueryId: string, text?: string, showAlert = false) {
    return this.call('answerCallbackQuery', {
      callback_query_id: callbackQueryId,
      text,
      show_alert: showAlert,
    })
  }

  answerInlineQuery(inlineQueryId: string, results: TelegramInlineQueryResult[]) {
    return this.call('answerInlineQuery', { inline_query_id: inlineQueryId, results })
  }

  sendChatAction(chatId: number | string, action: string) {
    return this.call('sendChatAction', { chat_id: chatId, action })
  }
}

// ─── Managed Bot ──────────────────────────────────────────────────────────────

export interface ManagedBotPermissions {
  canReadMessages:  boolean
  canSendMessages:  boolean
  canManageChat:    boolean
  canInviteUsers:   boolean
  allowedCommands:  string[]   // список разрешённых команд, [] = все
}

export interface ManagedBotMeta {
  name:        string
  description: string
  version:     string
  tonAddress?: string    // привязанный TON-кошелёк бота
}

export interface ManagedBotContext {
  bot:         TelegramBot
  managerId?:  number             // Telegram ID управляющего агента/бота
  permissions: ManagedBotPermissions
  meta:        ManagedBotMeta
}

export function createManagedBot(
  token:       string,
  meta:        Partial<ManagedBotMeta> = {},
  permissions: Partial<ManagedBotPermissions> = {},
): ManagedBotContext {
  return {
    bot: new TelegramBot(token),
    permissions: {
      canReadMessages:  true,
      canSendMessages:  true,
      canManageChat:    false,
      canInviteUsers:   false,
      allowedCommands:  [],
      ...permissions,
    },
    meta: {
      name:        meta.name        ?? 'Код Вечности Bot',
      description: meta.description ?? 'TON Warrior Domain Assistant',
      version:     meta.version     ?? '1.0.0',
      tonAddress:  meta.tonAddress,
    },
  }
}

// ─── Command parser ───────────────────────────────────────────────────────────

export interface ParsedCommand {
  command: string
  args:    string[]
  mention?: string   // @botname если присутствует
}

export function parseCommand(msg: TelegramMessage): ParsedCommand | null {
  if (!msg.text) return null
  const entity = msg.entities?.find(e => e.type === 'bot_command' && e.offset === 0)
  if (!entity) return null

  const raw     = msg.text.slice(entity.offset + 1, entity.offset + entity.length)
  const [cmd, mention] = raw.split('@')
  const rest    = msg.text.slice(entity.offset + entity.length).trim()
  const args    = rest ? rest.split(/\s+/) : []

  return { command: cmd ?? '', args, mention }
}

// ─── Inline keyboard builder ──────────────────────────────────────────────────

export function inlineKeyboard(rows: InlineKeyboardButton[][]): InlineKeyboardMarkup {
  return { inline_keyboard: rows }
}

export function callbackButton(text: string, data: string): InlineKeyboardButton {
  return { text, callback_data: data }
}

export function urlButton(text: string, url: string): InlineKeyboardButton {
  return { text, url }
}
