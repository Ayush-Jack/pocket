import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { AppError } from './errors'
import { bytesMatch, readCompletedLocalFile } from './downloaded-file'

describe('bytesMatch', () => {
  it('accepts equal bytes', () => {
    assert.equal(bytesMatch(Uint8Array.from([1, 2, 3]), Uint8Array.from([1, 2, 3])), true)
  })

  it('rejects different bytes', () => {
    assert.equal(bytesMatch(Uint8Array.from([1, 2, 3]), Uint8Array.from([1, 2, 4])), false)
  })
})

describe('readCompletedLocalFile', () => {
  it('rejects an incomplete local file', () => {
    assert.throws(
      () =>
        readCompletedLocalFile({
          _: 'file',
          id: 9,
          local: {
            _: 'localFile',
            path: '',
            is_downloading_completed: false,
            can_be_deleted: false,
          },
        }),
      (error: unknown) => error instanceof AppError && error.code === 'DOWNLOAD_FAILED',
    )
  })
})
