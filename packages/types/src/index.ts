/** Telegram's per-file limit for a normal account: 2000 MiB. */
export const MAX_UPLOAD_BYTES = 2000 * 1024 * 1024

/** Longest an upload may stay open, including the Telegram transfer. */
export const UPLOAD_DEADLINE_MS = 6 * 60 * 60 * 1000

export interface TelegramUserIdentity {
  telegramUserId: string
  username: string | null
  firstName: string
  lastName: string | null
}

export interface SavedMessagesChat {
  chatId: string
  userId: string
  title: string
}

export interface UploadedTelegramFile {
  chatId: string
  messageId: string
  fileId: string
  remoteId: string | null
  uniqueId?: string | null
  name: string
  size: number
}

export interface DownloadedTelegramFile {
  fileId: string
  size: number
  bytes: Uint8Array
}

export interface LocalTelegramFile {
  fileId: string
  size: number
  path: string
}

export interface LatestTestUpload {
  chatId: string
  messageId: string
  fileId: string
  name: string
}

export interface DeletedTelegramMessage {
  chatId: string
  messageId: string
  deleted: true
}

export interface AuthCodePrompt {
  retry: boolean
  delivery: string
}

export interface TelegramAuthHandlers {
  getPhoneNumber: (retry: boolean) => Promise<string>
  getAuthCode: (prompt: AuthCodePrompt) => Promise<string>
  getPassword: (passwordHint: string, retry: boolean) => Promise<string>
  getEmailAddress: (retry: boolean) => Promise<string>
  getEmailCode: (retry: boolean) => Promise<string>
  getRegistrationName: () => Promise<{ firstName: string; lastName: string }>
  confirmOnAnotherDevice: (link: string) => void
}

/**
 * The only Telegram entry point for the rest of the application.
 */
export interface TelegramStorageService {
  start(): Promise<void>
  authenticate(handlers: TelegramAuthHandlers): Promise<TelegramUserIdentity>
  getCurrentUser(): Promise<TelegramUserIdentity>
  getSavedMessagesChat(): Promise<SavedMessagesChat>
  findLatestTestUpload(): Promise<LatestTestUpload>
  getAuthorizationState(): string
  beginSignIn(): void
  authStatus(): {
    ready: boolean
    step: string
    hint: string | null
    delivery: string | null
    retry: boolean
    message: string | null
  }
  submitSignIn(value: string): Promise<void>
  submitRegistration(firstName: string, lastName: string): Promise<void>
  logOut(): Promise<void>
  close(): Promise<void>
  listFiles(): Promise<UploadedTelegramFile[]>
  uploadFile(localPath: string): Promise<UploadedTelegramFile>
  downloadFile(fileId: string): Promise<DownloadedTelegramFile>
  downloadSavedDocument(messageId: string, remoteId?: string | null): Promise<LocalTelegramFile>
  deleteFile(messageId: string): Promise<DeletedTelegramMessage>
  getFileMetadata(): Promise<never>
  searchFiles(): Promise<never>
}
