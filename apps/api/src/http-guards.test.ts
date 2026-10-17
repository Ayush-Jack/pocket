import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { buildFileReference } from '@telegram-drive/metadata'
import { sanitizeFileName } from './file-name'

describe('sanitizeFileName', () => {
  it('keeps a simple file name', () => {
    assert.equal(sanitizeFileName('notes.txt'), 'notes.txt')
  })

  it('drops directory traversal', () => {
    assert.equal(sanitizeFileName('..\\..\\secret.txt'), 'secret.txt')
    assert.throws(() => sanitizeFileName('..'), (error: unknown) => {
      return error instanceof Error && error.message === 'INVALID_FILE_NAME'
    })
  })
})

describe('stored file content', () => {
  it('rejects a body field that looks like file content', () => {
    assert.throws(
      () =>
        buildFileReference({
          name: 'notes.txt',
          mimeType: 'text/plain',
          size: 4,
          telegramChatId: '1',
          telegramMessageId: '2',
          telegramFileId: '3',
          telegramRemoteId: null,
          status: 'UPLOADED',
          bytes: Buffer.from('data'),
        }),
      (error: unknown) => error instanceof Error && error.message === 'FILE_CONTENT_REJECTED',
    )
  })
})
