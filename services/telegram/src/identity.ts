import type { TelegramUserIdentity } from '@telegram-drive/types'
import { AppError } from './errors'

export function toTelegramUserIdentity(me: unknown): TelegramUserIdentity {
  if (!me || typeof me !== 'object') {
    throw new AppError('GET_ME_FAILED', 'Telegram did not return the current user.')
  }

  const user = me as Record<string, unknown>
  const id = user.id
  if (typeof id !== 'number' && typeof id !== 'string') {
    throw new AppError('GET_ME_FAILED', 'Telegram did not return the current user.')
  }

  const firstName = typeof user.first_name === 'string' ? user.first_name : ''
  const lastName = typeof user.last_name === 'string' && user.last_name.length > 0 ? user.last_name : null

  return {
    telegramUserId: String(id),
    username: readUsername(user),
    firstName,
    lastName,
  }
}

function readUsername(user: Record<string, unknown>): string | null {
  const usernames = user.usernames
  if (usernames && typeof usernames === 'object') {
    const record = usernames as Record<string, unknown>
    if (typeof record.editable_username === 'string' && record.editable_username.length > 0) {
      return record.editable_username
    }
    const active = record.active_usernames
    if (Array.isArray(active) && typeof active[0] === 'string' && active[0].length > 0) {
      return active[0]
    }
  }

  if (typeof user.username === 'string' && user.username.length > 0) return user.username
  return null
}
