import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { AppError, toSafeError } from './errors'

describe('toSafeError', () => {
  it('maps a known Telegram code to a fixed message', () => {
    const error = toSafeError(new Error('PHONE_CODE_INVALID'))
    assert.equal(error.code, 'PHONE_CODE_INVALID')
    assert.equal(error.message.includes('PHONE_CODE_INVALID'), false)
  })

  it('collapses flood waits without echoing the raw code', () => {
    const error = toSafeError(new Error('FLOOD_WAIT_42'))
    assert.equal(error.code, 'FLOOD_WAIT')
    assert.equal(error.message.includes('42'), false)
  })

  it('does not pass through an arbitrary error message', () => {
    const error = toSafeError(new Error('api hash 0123456789abcdef and otp 55555'))
    assert.equal(error.code, 'TELEGRAM_AUTH_FAILED')
    assert.equal(error.message.includes('0123456789abcdef'), false)
    assert.equal(error.message.includes('55555'), false)
  })

  it('keeps an AppError unchanged', () => {
    const original = new AppError('NOT_AUTHORIZED', 'Telegram authorization is not complete.')
    assert.equal(toSafeError(original), original)
  })
})
