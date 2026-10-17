import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { AppError } from './errors'
import { MAX_UPLOAD_BYTES } from '@telegram-drive/types'
import { exceedsUploadLimit, readUploadedDocument } from './uploaded-file'

const chatId = '1385581313'

describe('exceedsUploadLimit', () => {
  it('allows a file at the 2 GB limit', () => {
    assert.equal(exceedsUploadLimit(MAX_UPLOAD_BYTES), false)
  })

  it('rejects a file one byte over 2 GB', () => {
    assert.equal(exceedsUploadLimit(MAX_UPLOAD_BYTES + 1), true)
  })
})

describe('readUploadedDocument', () => {
  it('reads a finished document message', () => {
    assert.deepEqual(
      readUploadedDocument(chatId, {
        _: 'message',
        id: 55,
        content: {
          _: 'messageDocument',
          document: {
            _: 'document',
            file_name: 'upload-test.txt',
            mime_type: 'text/plain',
            document: {
              _: 'file',
              id: 9,
              size: 24,
              remote: { _: 'remoteFile', id: 'remote-1', unique_id: 'unique-1' },
            },
          },
        },
      }),
      {
        chatId,
        messageId: '55',
        fileId: '9',
        remoteId: 'remote-1',
        name: 'upload-test.txt',
        size: 24,
      },
    )
  })

  it('rejects a message that is still sending', () => {
    assert.throws(
      () =>
        readUploadedDocument(chatId, {
          id: 55,
          sending_state: { _: 'messageSendingStatePending' },
          content: { _: 'messageDocument', document: { document: { id: 9 } } },
        }),
      (error: unknown) => error instanceof AppError && error.code === 'UPLOAD_FAILED',
    )
  })

  it('rejects a text message', () => {
    assert.throws(
      () =>
        readUploadedDocument(chatId, {
          id: 55,
          content: { _: 'messageText', text: { _: 'formattedText', text: 'hello' } },
        }),
      (error: unknown) => error instanceof AppError && error.code === 'UPLOAD_FAILED',
    )
  })
})
