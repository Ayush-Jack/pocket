import type { LatestTestUpload } from '@telegram-drive/types'
import { AppError } from './errors'

const TEST_UPLOAD_NAME = 'upload-test.txt'

export function bytesMatch(left: Uint8Array, right: Uint8Array): boolean {
  if (left.byteLength !== right.byteLength) return false
  for (let index = 0; index < left.byteLength; index += 1) {
    if (left[index] !== right[index]) return false
  }
  return true
}

export function readCompletedLocalFile(file: unknown): { path: string; canBeDeleted: boolean } {
  if (!file || typeof file !== 'object') {
    throw new AppError('DOWNLOAD_FAILED', 'The file could not be downloaded.')
  }

  const local = (file as Record<string, unknown>).local
  if (!local || typeof local !== 'object') {
    throw new AppError('DOWNLOAD_FAILED', 'The file could not be downloaded.')
  }

  const localFile = local as Record<string, unknown>
  const localPath = localFile.path
  if (localFile.is_downloading_completed !== true || typeof localPath !== 'string' || localPath.length === 0) {
    throw new AppError('DOWNLOAD_FAILED', 'The file could not be downloaded.')
  }

  return {
    path: localPath,
    canBeDeleted: localFile.can_be_deleted === true,
  }
}

export function readLatestTestUpload(chatId: string, history: unknown): LatestTestUpload {
  const messages = readMessages(history)
  for (const message of messages) {
    const found = readTestDocument(chatId, message)
    if (found) return found
  }
  throw new AppError('TEST_UPLOAD_NOT_FOUND', 'The test upload was not found in Saved Messages.')
}

function readMessages(history: unknown): unknown[] {
  if (!history || typeof history !== 'object') return []
  const messages = (history as Record<string, unknown>).messages
  return Array.isArray(messages) ? messages : []
}

function readTestDocument(chatId: string, message: unknown): LatestTestUpload | null {
  if (!message || typeof message !== 'object') return null
  const record = message as Record<string, unknown>
  const content = record.content
  if (!content || typeof content !== 'object') return null
  const contentRecord = content as Record<string, unknown>
  const document = contentRecord.document
  if (contentRecord._ !== 'messageDocument' || !document || typeof document !== 'object') return null

  const documentRecord = document as Record<string, unknown>
  if (documentRecord.file_name !== TEST_UPLOAD_NAME) return null
  const file = documentRecord.document
  if (!file || typeof file !== 'object') return null
  const fileId = readId(file)
  const messageId = readId(record)
  if (fileId == null || messageId == null) return null

  return {
    chatId,
    messageId,
    fileId,
    name: TEST_UPLOAD_NAME,
  }
}

function readId(value: unknown): string | null {
  if (!value || typeof value !== 'object') return null
  const id = (value as Record<string, unknown>).id
  if (typeof id === 'number' || typeof id === 'string') return String(id)
  return null
}
