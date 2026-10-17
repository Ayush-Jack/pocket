const USER_MESSAGES: Record<string, string> = {
  PHONE_NUMBER_INVALID: 'That phone number was not accepted. Use international format, for example +15551234567.',
  PHONE_CODE_INVALID: 'The code is incorrect. Try again.',
  PHONE_CODE_EMPTY: 'The code is incorrect. Try again.',
  PHONE_CODE_EXPIRED: 'The code expired. Start again and request a new code.',
  EMAIL_ADDRESS_INVALID: 'That email address was not accepted.',
  EMAIL_CODE_INVALID: 'The email code was not accepted.',
  PASSWORD_HASH_INVALID: 'The password was not accepted.',
  API_ID_INVALID: 'Telegram rejected the API credentials.',
  API_ID_PUBLISHED_FLOOD: 'Telegram temporarily refused these API credentials.',
  AUTH_PREMIUM_REQUIRED:
    'Telegram requires a Premium purchase before this account can sign in. Complete that in the official Telegram app, then try again.',
  UNSUPPORTED_AUTH_STATE: 'Telegram returned an authorization state this version does not handle yet.',
  TDLIB_BINARY_MISSING: 'The TDLib shared library was not found.',
  TDLIB_START_TIMEOUT: 'TDLib did not finish initialization in time.',
  NOT_AUTHORIZED: 'Telegram authorization is not complete.',
  AUTH_CLOSED: 'Telegram closed the session before authorization finished.',
  GET_ME_FAILED: 'Telegram did not return the current user.',
  CLIENT_NOT_STARTED: 'TDLib is not running.',
  NOT_IMPLEMENTED: 'This operation is not part of the current milestone.',
  CONFIG_MISSING:
    'Set TELEGRAM_API_ID and TELEGRAM_API_HASH in the project .env file. Create them at https://my.telegram.org.',
  SAVED_MESSAGES_MISMATCH: 'The chat is not this account\'s Saved Messages.',
  UPLOAD_FAILED: 'The file was not saved to Telegram.',
  UPLOAD_TIMEOUT: 'The file was not saved to Telegram.',
  FILE_TOO_LARGE: 'This file is larger than 2 GB.',
  FILE_NOT_FOUND: 'The file was not found.',
  INVALID_PATH: 'That file path was not accepted.',
  DOWNLOAD_FAILED: 'The file could not be downloaded.',
  TEST_UPLOAD_NOT_FOUND: 'The test upload was not found in Saved Messages.',
  DELETE_FAILED: 'The message could not be deleted.',
  DELETE_NOT_ALLOWED: 'The message could not be deleted.',
}

export class AppError extends Error {
  readonly code: string

  constructor(code: string, message: string) {
    super(message)
    this.name = 'AppError'
    this.code = code
  }
}

export function tdlibErrorMessage(error: unknown): string {
  if (error instanceof Error && typeof error.message === 'string') return error.message
  return ''
}

export function toSafeError(error: unknown): AppError {
  if (error instanceof AppError) return error

  const raw = tdlibErrorMessage(error)
  if (/^FLOOD_WAIT_\d+$/.test(raw)) {
    return new AppError('FLOOD_WAIT', 'Too many attempts. Wait before trying again.')
  }

  if (Object.prototype.hasOwnProperty.call(USER_MESSAGES, raw)) {
    return new AppError(raw, USER_MESSAGES[raw] ?? 'Telegram authorization failed.')
  }

  return new AppError('TELEGRAM_AUTH_FAILED', 'Telegram authorization failed.')
}
