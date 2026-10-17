import type { SavedMessagesChat } from '@telegram-drive/types'
import { AppError } from './errors'

export function readSavedMessagesChat(userId: string, chat: unknown): SavedMessagesChat {
  if (!chat || typeof chat !== 'object') {
    throw new AppError('SAVED_MESSAGES_MISMATCH', "The chat is not this account's Saved Messages.")
  }

  const record = chat as Record<string, unknown>
  const id = record.id
  const type = record.type
  if ((typeof id !== 'number' && typeof id !== 'string') || !type || typeof type !== 'object') {
    throw new AppError('SAVED_MESSAGES_MISMATCH', "The chat is not this account's Saved Messages.")
  }

  const typeRecord = type as Record<string, unknown>
  const typeUserId = typeRecord.user_id
  const sameUser =
    (typeof typeUserId === 'number' || typeof typeUserId === 'string') && String(typeUserId) === userId
  if (typeRecord._ !== 'chatTypePrivate' || !sameUser) {
    throw new AppError('SAVED_MESSAGES_MISMATCH', "The chat is not this account's Saved Messages.")
  }

  return {
    chatId: String(id),
    userId,
    title: typeof record.title === 'string' ? record.title : '',
  }
}
