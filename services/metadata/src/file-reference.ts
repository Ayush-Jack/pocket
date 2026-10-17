export interface FileReferenceInput {
  name: string
  mimeType: string
  size: number
  telegramChatId: string
  telegramMessageId: string
  telegramFileId: string
  telegramRemoteId: string | null
  status: 'PENDING' | 'UPLOADING' | 'UPLOADED' | 'FAILED' | 'DELETING' | 'DELETED'
}

const CONTENT_KEY = /bytes|content|binary|payload|buffer/i

export function buildFileReference(input: Record<string, unknown>): FileReferenceInput {
  for (const key of Object.keys(input)) {
    if (CONTENT_KEY.test(key)) {
      throw new Error('FILE_CONTENT_REJECTED')
    }
  }

  return {
    name: requiredString(input.name, 'name'),
    mimeType: requiredString(input.mimeType, 'mimeType'),
    size: requiredSize(input.size),
    telegramChatId: requiredString(input.telegramChatId, 'telegramChatId'),
    telegramMessageId: requiredString(input.telegramMessageId, 'telegramMessageId'),
    telegramFileId: requiredString(input.telegramFileId, 'telegramFileId'),
    telegramRemoteId: optionalString(input.telegramRemoteId),
    status: requiredStatus(input.status),
  }
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`INVALID_FILE_REFERENCE:${field}`)
  }
  return value
}

function optionalString(value: unknown): string | null {
  if (value == null) return null
  if (typeof value !== 'string') throw new Error('INVALID_FILE_REFERENCE:telegramRemoteId')
  return value.length > 0 ? value : null
}

function requiredSize(value: unknown): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) {
    throw new Error('INVALID_FILE_REFERENCE:size')
  }
  return value
}

function requiredStatus(value: unknown): FileReferenceInput['status'] {
  const allowed = ['PENDING', 'UPLOADING', 'UPLOADED', 'FAILED', 'DELETING', 'DELETED'] as const
  if (typeof value !== 'string' || !allowed.includes(value as FileReferenceInput['status'])) {
    throw new Error('INVALID_FILE_REFERENCE:status')
  }
  return value as FileReferenceInput['status']
}
