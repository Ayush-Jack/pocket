import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { AppError } from './errors'
import { readSavedMessagesChat } from './saved-messages'

const userId = '1385581313'

describe('readSavedMessagesChat', () => {
  it('accepts the private chat with the authenticated user', () => {
    assert.deepEqual(
      readSavedMessagesChat(userId, {
        _: 'chat',
        id: 1385581313,
        title: 'Saved Messages',
        type: { _: 'chatTypePrivate', user_id: 1385581313 },
      }),
      { chatId: '1385581313', userId, title: 'Saved Messages' },
    )
  })

  it('rejects a private chat with someone else', () => {
    assert.throws(
      () =>
        readSavedMessagesChat(userId, {
          id: 42,
          title: 'Other',
          type: { _: 'chatTypePrivate', user_id: 42 },
        }),
      (error: unknown) => error instanceof AppError && error.code === 'SAVED_MESSAGES_MISMATCH',
    )
  })

  it('rejects a group chat', () => {
    assert.throws(
      () =>
        readSavedMessagesChat(userId, {
          id: -100,
          title: 'Group',
          type: { _: 'chatTypeBasicGroup', basic_group_id: 5 },
        }),
      (error: unknown) => error instanceof AppError && error.code === 'SAVED_MESSAGES_MISMATCH',
    )
  })
})
