import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { buildFileReference } from './file-reference'

const reference = {
  name: 'upload-test.txt',
  mimeType: 'text/plain',
  size: 52,
  telegramChatId: '1385581313',
  telegramMessageId: '6172966912',
  telegramFileId: '1246',
  telegramRemoteId: null,
  status: 'DELETED',
}

describe('buildFileReference', () => {
  it('keeps telegram references and drops no binary field', () => {
    assert.deepEqual(buildFileReference(reference), reference)
    assert.equal('bytes' in buildFileReference(reference), false)
  })

  it('rejects file content fields', () => {
    assert.throws(
      () => buildFileReference({ ...reference, bytes: Buffer.from('secret') }),
      (error: unknown) => error instanceof Error && error.message === 'FILE_CONTENT_REJECTED',
    )
    assert.throws(
      () => buildFileReference({ ...reference, fileContent: 'hello' }),
      (error: unknown) => error instanceof Error && error.message === 'FILE_CONTENT_REJECTED',
    )
  })
})
