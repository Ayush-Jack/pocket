import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { AppError } from './errors'
import { chooseDeleteRevoke } from './deleted-message'

describe('chooseDeleteRevoke', () => {
  it('revokes when the message can be deleted for all users', () => {
    assert.equal(
      chooseDeleteRevoke({
        can_be_deleted_for_all_users: true,
        can_be_deleted_only_for_self: true,
      }),
      true,
    )
  })

  it('keeps the message for others when only self-delete is allowed', () => {
    assert.equal(
      chooseDeleteRevoke({
        can_be_deleted_for_all_users: false,
        can_be_deleted_only_for_self: true,
      }),
      false,
    )
  })

  it('refuses when the message cannot be deleted', () => {
    assert.throws(
      () =>
        chooseDeleteRevoke({
          can_be_deleted_for_all_users: false,
          can_be_deleted_only_for_self: false,
        }),
      (error: unknown) => error instanceof AppError && error.code === 'DELETE_NOT_ALLOWED',
    )
  })
})
