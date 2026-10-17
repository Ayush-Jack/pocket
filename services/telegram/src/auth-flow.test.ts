import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import type { TelegramAuthHandlers } from '@telegram-drive/types'
import { respondToAuthorizationState } from './auth-flow'
import { AppError } from './errors'

function handlers(overrides: Partial<TelegramAuthHandlers> = {}): TelegramAuthHandlers {
  return {
    getPhoneNumber: async () => '+15551234567',
    getAuthCode: async () => '12345',
    getPassword: async () => 'correct-password',
    getEmailAddress: async () => 'ada@example.com',
    getEmailCode: async () => '998877',
    getRegistrationName: async () => ({ firstName: 'Ada', lastName: 'Lovelace' }),
    confirmOnAnotherDevice: () => undefined,
    ...overrides,
  }
}

describe('respondToAuthorizationState', () => {
  it('does not send a request for the parameters state', async () => {
    let called = false
    const step = await respondToAuthorizationState(
      { _: 'authorizationStateWaitTdlibParameters' },
      handlers(),
      async () => {
        called = true
      },
    )
    assert.equal(step, 'pending')
    assert.equal(called, false)
  })

  it('sends the phone number with default authentication settings', async () => {
    const calls: Record<string, unknown>[] = []
    const step = await respondToAuthorizationState(
      { _: 'authorizationStateWaitPhoneNumber' },
      handlers({
        getPhoneNumber: async (retry) => (retry ? '+15551234567' : '123'),
      }),
      async (request) => {
        calls.push(request)
      },
    )
    assert.equal(step, 'pending')
    assert.deepEqual(calls, [
      {
        _: 'setAuthenticationPhoneNumber',
        phone_number: '+15551234567',
        settings: null,
      },
    ])
  })

  it('retries an invalid code and then checks it', async () => {
    const calls: Record<string, unknown>[] = []
    let attempt = 0
    const step = await respondToAuthorizationState(
      {
        _: 'authorizationStateWaitCode',
        codeType: 'authenticationCodeTypeSms',
      },
      handlers({
        getAuthCode: async () => {
          attempt += 1
          return attempt === 1 ? '00000' : '12345'
        },
      }),
      async (request) => {
        calls.push(request)
        if (request.code === '00000') throw new Error('PHONE_CODE_INVALID')
      },
    )
    assert.equal(step, 'pending')
    assert.equal(calls.length, 2)
    assert.equal(calls[1]?.code, '12345')
  })

  it('checks the 2FA password without returning it', async () => {
    const calls: Record<string, unknown>[] = []
    let attempt = 0
    await respondToAuthorizationState(
      { _: 'authorizationStateWaitPassword', password_hint: 'hint' },
      handlers({
        getPassword: async () => {
          attempt += 1
          return attempt === 1 ? 'wrong' : 'right'
        },
      }),
      async (request) => {
        calls.push({ _: request._ })
        if (attempt === 1) throw new Error('PASSWORD_HASH_INVALID')
      },
    )
    assert.deepEqual(calls, [
      { _: 'checkAuthenticationPassword' },
      { _: 'checkAuthenticationPassword' },
    ])
  })

  it('sends an email code using the official email authentication object', async () => {
    const calls: Record<string, unknown>[] = []
    await respondToAuthorizationState(
      { _: 'authorizationStateWaitEmailCode' },
      handlers(),
      async (request) => {
        calls.push(request)
      },
    )
    assert.deepEqual(calls, [
      {
        _: 'checkAuthenticationEmailCode',
        code: { _: 'emailAddressAuthenticationCode', code: '998877' },
      },
    ])
  })

  it('registers an unregistered account with notifications left enabled', async () => {
    const calls: Record<string, unknown>[] = []
    await respondToAuthorizationState(
      { _: 'authorizationStateWaitRegistration' },
      handlers(),
      async (request) => {
        calls.push(request)
      },
    )
    assert.deepEqual(calls, [
      {
        _: 'registerUser',
        first_name: 'Ada',
        last_name: 'Lovelace',
        disable_notification: false,
      },
    ])
  })

  it('stops when Telegram requires a Premium purchase', async () => {
    await assert.rejects(
      () => respondToAuthorizationState({ _: 'authorizationStateWaitPremiumPurchase' }, handlers(), async () => undefined),
      (error: unknown) => error instanceof AppError && error.code === 'AUTH_PREMIUM_REQUIRED',
    )
  })

  it('hides unexpected Telegram errors from the caller', async () => {
    await assert.rejects(
      () =>
        respondToAuthorizationState(
          { _: 'authorizationStateWaitPassword', password_hint: '' },
          handlers({ getPassword: async () => 'super-secret-password' }),
          async () => {
            throw new Error('super-secret-password')
          },
        ),
      (error: unknown) => {
        assert.ok(error instanceof AppError)
        assert.equal(error.code, 'TELEGRAM_AUTH_FAILED')
        assert.equal(error.message.includes('super-secret-password'), false)
        return true
      },
    )
  })

  it('returns ready without calling Telegram again', async () => {
    let called = false
    const step = await respondToAuthorizationState({ _: 'authorizationStateReady' }, handlers(), async () => {
      called = true
    })
    assert.equal(step, 'ready')
    assert.equal(called, false)
  })
})
