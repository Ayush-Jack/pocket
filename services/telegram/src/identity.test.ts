import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { toTelegramUserIdentity } from './identity'
import { AppError } from './errors'

describe('toTelegramUserIdentity', () => {
  it('reads the current user and drops the phone number', () => {
    const identity = toTelegramUserIdentity({
      id: 424242,
      first_name: 'Ada',
      last_name: 'Lovelace',
      phone_number: '+15551234567',
      usernames: {
        editable_username: 'ada',
        active_usernames: ['ada'],
      },
    })

    assert.deepEqual(identity, {
      telegramUserId: '424242',
      username: 'ada',
      firstName: 'Ada',
      lastName: 'Lovelace',
    })
    assert.equal(JSON.stringify(identity).includes('15551234567'), false)
  })

  it('falls back to the first active username', () => {
    const identity = toTelegramUserIdentity({
      id: '7',
      first_name: 'Grace',
      usernames: { editable_username: '', active_usernames: ['grace'] },
    })
    assert.equal(identity.username, 'grace')
    assert.equal(identity.lastName, null)
  })

  it('rejects a payload that is not a user', () => {
    assert.throws(() => toTelegramUserIdentity({ ok: true }), (error: unknown) => {
      return error instanceof AppError && error.code === 'GET_ME_FAILED'
    })
  })
})
