import { statSync } from 'node:fs'
import path from 'node:path'
import { MAX_UPLOAD_BYTES, type UploadedTelegramFile } from '@telegram-drive/types'
import { AppError } from './errors'

export function exceedsUploadLimit(size: number): boolean {
  return size > MAX_UPLOAD_BYTES
}

export function assertLocalUploadPath(localPath: string): string {
  if (localPath.split(/[\\/]/).includes('..')) {
    throw new AppError('INVALID_PATH', 'That file path was not accepted.')
  }

  const absolutePath = path.resolve(localPath)
  let size = 0
  try {
    const stats = statSync(absolutePath)
    if (!stats.isFile()) throw new AppError('FILE_NOT_FOUND', 'The file was not found.')
    size = stats.size
  } catch (error) {
    if (error instanceof AppError) throw error
    throw new AppError('FILE_NOT_FOUND', 'The file was not found.')
  }

  if (exceedsUploadLimit(size)) {
    throw new AppError('FILE_TOO_LARGE', 'This file is larger than 2 GB.')
  }
  return absolutePath
}

export function readPendingMessageId(message: unknown): string {
  const id = readId(message)
  if (id == null) throw new AppError('UPLOAD_FAILED', 'The file was not saved to Telegram.')
  return id
}

export function readDocumentFileId(message: unknown): string {
  return readUploadedDocument('saved', message).fileId
}

export function readUploadedDocument(chatId: string, message: unknown): UploadedTelegramFile {
  if (!message || typeof message !== 'object') {
    throw new AppError('UPLOAD_FAILED', 'The file was not saved to Telegram.')
  }

  const record = message as Record<string, unknown>
  if (record.sending_state != null) {
    throw new AppError('UPLOAD_FAILED', 'The file was not saved to Telegram.')
  }

  const messageId = readId(record)
  const content = record.content
  if (messageId == null || !content || typeof content !== 'object') {
    throw new AppError('UPLOAD_FAILED', 'The file was not saved to Telegram.')
  }

  const contentRecord = content as Record<string, unknown>
  const document = contentRecord.document
  if (contentRecord._ !== 'messageDocument' || !document || typeof document !== 'object') {
    throw new AppError('UPLOAD_FAILED', 'The file was not saved to Telegram.')
  }

  const documentRecord = document as Record<string, unknown>
  const file = documentRecord.document
  if (!file || typeof file !== 'object') {
    throw new AppError('UPLOAD_FAILED', 'The file was not saved to Telegram.')
  }

  const fileRecord = file as Record<string, unknown>
  const fileId = readId(fileRecord)
  if (fileId == null) throw new AppError('UPLOAD_FAILED', 'The file was not saved to Telegram.')

  const remote = fileRecord.remote
  let remoteId: string | null = null
  let uniqueId: string | null = null
  if (remote && typeof remote === 'object') {
    const id = (remote as Record<string, unknown>).id
    const uniq = (remote as Record<string, unknown>).unique_id
    if (typeof id === 'string' && id.length > 0) remoteId = id
    if (typeof uniq === 'string' && uniq.length > 0) uniqueId = uniq
  }

  return {
    chatId,
    messageId,
    fileId,
    remoteId,
    ...(uniqueId ? { uniqueId } : {}),
    name: typeof documentRecord.file_name === 'string' ? documentRecord.file_name : '',
    size: typeof fileRecord.size === 'number' ? fileRecord.size : 0,
  }
}

function readId(value: unknown): string | null {
  if (!value || typeof value !== 'object') return null
  const id = (value as Record<string, unknown>).id
  if (typeof id === 'number' || typeof id === 'string') return String(id)
  return null
}
