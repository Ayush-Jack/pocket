import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { sanitizeLogFields } from './logger'

describe('sanitizeLogFields', () => {
  it('redacts secrets and keeps operational fields', () => {
    const sanitized = sanitizeLogFields({
      state: 'authorizationStateWaitCode',
      password: 'secret',
      nested: { api_hash: 'hash', code: '12345' },
    })

    assert.equal(sanitized.state, 'authorizationStateWaitCode')
    assert.equal(sanitized.password, '[redacted]')
    assert.deepEqual(sanitized.nested, { api_hash: '[redacted]', code: '[redacted]' })
  })
})
