import { AppError } from './errors'

export function chooseDeleteRevoke(properties: unknown): boolean {
  if (!properties || typeof properties !== 'object') {
    throw new AppError('DELETE_NOT_ALLOWED', 'The message could not be deleted.')
  }

  const record = properties as Record<string, unknown>
  if (record.can_be_deleted_for_all_users === true) return true
  if (record.can_be_deleted_only_for_self === true) return false
  throw new AppError('DELETE_NOT_ALLOWED', 'The message could not be deleted.')
}

export function isMessageMissing(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  return (error as { code?: unknown }).code === 404
}
