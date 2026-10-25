import { mkdirSync, readFileSync, statSync } from 'node:fs'
import * as tdl from 'tdl'
import {
  UPLOAD_DEADLINE_MS,
  type DeletedTelegramMessage,
  type DownloadedTelegramFile,
  type LatestTestUpload,
  type LocalTelegramFile,
  type SavedMessagesChat,
  type TelegramAuthHandlers,
  type TelegramStorageService,
  type TelegramUserIdentity,
  type UploadedTelegramFile,
} from '@telegram-drive/types'
import {
  isBenignAuthWait,
  respondToAuthorizationState,
  toAuthorizationUpdate,
  type AuthorizationStateUpdate,
} from './auth-flow'
import { AppError, toSafeError } from './errors'
import { chooseDeleteRevoke, isMessageMissing } from './deleted-message'
import { readCompletedLocalFile, readLatestTestUpload } from './downloaded-file'
import { toTelegramUserIdentity } from './identity'
import { log } from './logger'
import { readSavedMessagesChat } from './saved-messages'
import { loadTdlib } from './tdlib-runtime'
import { assertLocalUploadPath, readDocumentFileId, readPendingMessageId, readUploadedDocument } from './uploaded-file'

export interface TelegramClientOptions {
  apiId: number
  apiHash: string
  databaseDirectory: string
  filesDirectory: string
  databaseEncryptionKey: string
  useTestDc?: boolean
}

type TdlibClient = ReturnType<typeof tdl.createClient>

const START_TIMEOUT_MS = 45_000

export class TdlibTelegramStorage implements TelegramStorageService {
  private client: TdlibClient | null = null
  private lastAuthState: AuthorizationStateUpdate | null = null
  private startupError: AppError | null = null
  private started = false
  private closing: Promise<void> | null = null
  private authTask: Promise<void> | null = null
  private authNotice: string | null = null
  private pending: {
    kind: string
    retry: boolean
    delivery: string | null
    hint: string | null
    resolve: (value: string) => void
    reject: (error: Error) => void
  } | null = null
  private namePending: {
    resolve: (value: { firstName: string; lastName: string }) => void
    reject: (error: Error) => void
  } | null = null

  constructor(private readonly options: TelegramClientOptions) {}

  async start(): Promise<void> {
    if (this.client) return

    const runtime = loadTdlib()
    log('info', 'tdlib.load', {
      bytes: runtime.bytes,
      verbosityLevel: runtime.verbosityLevel,
    })

    mkdirSync(this.options.databaseDirectory, { recursive: true })
    mkdirSync(this.options.filesDirectory, { recursive: true })

    const client = tdl.createClient({
      apiId: this.options.apiId,
      apiHash: this.options.apiHash,
      databaseDirectory: this.options.databaseDirectory,
      filesDirectory: this.options.filesDirectory,
      databaseEncryptionKey: this.options.databaseEncryptionKey,
      useTestDc: this.options.useTestDc ?? false,
      tdlibParameters: {
        use_file_database: true,
        use_chat_info_database: true,
        use_message_database: true,
        use_secret_chats: false,
        system_language_code: 'en',
        device_model: 'Pocket',
        system_version: 'Windows',
        application_version: '0.1.0',
      },
    })

    this.client = client
    client.on('error', (error: unknown) => {
      const safe = toSafeError(error)
      log('error', 'tdlib.client', { code: safe.code })
      if (!this.started) this.startupError = safe
    })
    client.on('update', (update) => {
      if (update._ !== 'updateAuthorizationState') return
      this.lastAuthState = toAuthorizationUpdate(update.authorization_state)
      log('info', 'tdlib.authorization', { state: update.authorization_state._ })
    })

    try {
      await this.waitForAuthProgress()
      this.started = true
      log('info', 'tdlib.start', { state: this.getAuthorizationState() })
    } catch (error) {
      await this.close()
      throw error
    }
  }

  async authenticate(handlers: TelegramAuthHandlers): Promise<TelegramUserIdentity> {
    const client = this.requireClient()
    if (this.lastAuthState?._ === 'authorizationStateReady') {
      return this.getCurrentUser()
    }

    await new Promise<void>((resolve, reject) => {
      let activeState: string | null = null
      const queue: AuthorizationStateUpdate[] = []
      let working = false
      let settled = false

      const finish = (error?: unknown) => {
        if (settled) return
        settled = true
        client.off('update', onUpdate)
        if (error) reject(error instanceof AppError ? error : toSafeError(error))
        else resolve()
      }

      const pump = () => {
        if (working || settled) return
        const state = queue.shift()
        if (!state) return
        working = true
        activeState = state._
        void respondToAuthorizationState(state, handlers, (request) => client.invoke(request as never))
          .then((step) => {
            working = false
            activeState = null
            if (step === 'ready') {
              finish()
              return
            }
            if (step === 'closed') {
              finish(new AppError('AUTH_CLOSED', 'Telegram closed the session before authorization finished.'))
              return
            }
            pump()
          })
          .catch((error: unknown) => {
            working = false
            finish(error)
          })
      }

      const enqueue = (state: AuthorizationStateUpdate) => {
        if (settled || state._ === activeState) return
        queue.push(state)
        pump()
      }

      const onUpdate = (update: { _: string }) => {
        if (update._ !== 'updateAuthorizationState') return
        const authorizationState = (update as { authorization_state?: { _: string } }).authorization_state
        if (!authorizationState) return
        enqueue(toAuthorizationUpdate(authorizationState))
      }

      client.on('update', onUpdate)
      if (this.lastAuthState) enqueue(this.lastAuthState)
    })

    return this.getCurrentUser()
  }

  async getCurrentUser(): Promise<TelegramUserIdentity> {
    if (this.lastAuthState?._ !== 'authorizationStateReady') {
      throw new AppError('NOT_AUTHORIZED', 'Telegram authorization is not complete.')
    }
    const me = await this.requireClient().invoke({ _: 'getMe' })
    const identity = toTelegramUserIdentity(me)
    log('info', 'telegram.getMe', {
      telegramUserId: identity.telegramUserId,
      hasUsername: identity.username != null,
    })
    return identity
  }

  async getSavedMessagesChat(): Promise<SavedMessagesChat> {
    const identity = await this.getCurrentUser()
    const userId = Number(identity.telegramUserId)
    if (!Number.isSafeInteger(userId)) {
      throw new AppError('SAVED_MESSAGES_MISMATCH', "The chat is not this account's Saved Messages.")
    }

    const chat = await this.requireClient().invoke({
      _: 'createPrivateChat',
      user_id: userId,
      force: false,
    })
    const saved = readSavedMessagesChat(identity.telegramUserId, chat)
    log('info', 'telegram.savedMessages', {
      chatId: saved.chatId,
      userId: saved.userId,
      title: saved.title,
    })
    return saved
  }

  async findLatestTestUpload(): Promise<LatestTestUpload> {
    const saved = await this.getSavedMessagesChat()
    const chatId = requireSafeInteger(saved.chatId, 'TEST_UPLOAD_NOT_FOUND', 'The test upload was not found in Saved Messages.')
    const history = await this.requireClient().invoke({
      _: 'getChatHistory',
      chat_id: chatId,
      from_message_id: 0,
      offset: 0,
      limit: 20,
      only_local: false,
    })
    const found = readLatestTestUpload(saved.chatId, history)
    log('info', 'telegram.testUpload', {
      chatId: found.chatId,
      messageId: found.messageId,
      fileId: found.fileId,
      name: found.name,
    })
    return found
  }

  getAuthorizationState(): string {
    return this.lastAuthState?._ ?? 'unknown'
  }

  beginSignIn(): void {
    if (this.getAuthorizationState() === 'authorizationStateReady' || this.authTask) return
    this.authNotice = null
    this.authTask = this.authenticate(this.interactiveHandlers())
      .then(() => undefined)
      .catch((error: unknown) => {
        const safe = error instanceof AppError ? error : toSafeError(error)
        this.authNotice = safe.message
        log('error', 'telegram.signIn', { code: safe.code })
      })
      .finally(() => {
        this.authTask = null
      })
  }

  authStatus(): {
    ready: boolean
    step: string
    hint: string | null
    delivery: string | null
    retry: boolean
    message: string | null
  } {
    this.beginSignIn()
    const ready = this.getAuthorizationState() === 'authorizationStateReady'
    return {
      ready,
      step: ready ? 'ready' : this.signInStep(),
      hint: this.pending?.hint ?? null,
      delivery: this.pending?.delivery ?? null,
      retry: this.pending?.retry ?? false,
      message: this.authNotice,
    }
  }

  private signInStep(): string {
    if (this.pending?.kind) return this.pending.kind
    switch (this.getAuthorizationState()) {
      case 'authorizationStateWaitPhoneNumber':
        return 'phone'
      case 'authorizationStateWaitCode':
        return 'code'
      case 'authorizationStateWaitPassword':
        return 'password'
      case 'authorizationStateWaitEmailAddress':
        return 'email'
      case 'authorizationStateWaitEmailCode':
        return 'emailCode'
      case 'authorizationStateWaitRegistration':
        return 'name'
      default:
        return 'starting'
    }
  }

  async submitSignIn(value: string): Promise<void> {
    await this.resolvePending(value)
  }

  async submitRegistration(firstName: string, lastName: string): Promise<void> {
    if (!this.namePending) throw new AppError('AUTH_NOT_WAITING', 'Telegram is not asking for a name.')
    const pending = this.namePending
    this.namePending = null
    const before = this.getAuthorizationState()
    pending.resolve({ firstName, lastName })
    await this.waitForAuthMove(before)
  }

  async logOut(): Promise<void> {
    const client = this.client
    const ready = this.getAuthorizationState() === 'authorizationStateReady'
    this.rejectWaiters()
    if (client && ready) {
      try {
        await client.invoke({ _: 'logOut' })
        await this.waitForClosed(client)
      } catch (error) {
        log('error', 'telegram.logOut', { code: toSafeError(error).code })
      }
    }
    await this.close()
    this.closing = null
    this.lastAuthState = null
    this.started = false
    this.authTask = null
    log('info', 'telegram.logOut', { state: 'closed' })
  }

  private rejectWaiters(): void {
    const closed = new AppError('AUTH_CLOSED', 'Signed out on this device.')
    this.pending?.reject(closed)
    this.pending = null
    this.namePending?.reject(closed)
    this.namePending = null
  }

  private interactiveHandlers(): TelegramAuthHandlers {
    return {
      getPhoneNumber: (retry) => this.waitForInput('phone', retry),
      getAuthCode: (prompt) => this.waitForInput('code', prompt.retry, prompt.delivery),
      getPassword: (hint, retry) => this.waitForInput('password', retry, undefined, hint),
      getEmailAddress: (retry) => this.waitForInput('email', retry),
      getEmailCode: (retry) => this.waitForInput('emailCode', retry),
      getRegistrationName: () => this.waitForName(),
      confirmOnAnotherDevice: () => undefined,
    }
  }

  private waitForInput(kind: string, retry: boolean, delivery?: string, hint?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.pending = { kind, retry, delivery: delivery ?? null, hint: hint ?? null, resolve, reject }
    })
  }

  private waitForName(): Promise<{ firstName: string; lastName: string }> {
    return new Promise((resolve, reject) => {
      this.pending = { kind: 'name', retry: false, delivery: null, hint: null, resolve: () => undefined, reject }
      this.namePending = { resolve, reject }
    })
  }

  private async resolvePending(value: string): Promise<void> {
    const deadline = Date.now() + 8_000
    while ((!this.pending || this.pending.kind === 'name') && Date.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
    if (!this.pending || this.pending.kind === 'name') {
      throw new AppError('AUTH_NOT_WAITING', 'Telegram is not waiting for that yet.')
    }
    const pending = this.pending
    this.pending = null
    const before = this.getAuthorizationState()
    pending.resolve(value)
    await this.waitForAuthMove(before)
  }

  private waitForAuthMove(before: string): Promise<void> {
    if (this.getAuthorizationState() !== before || this.pending || this.namePending || this.authNotice) return Promise.resolve()
    const client = this.client
    if (!client) return Promise.resolve()
    return new Promise((resolve) => {
      const finish = () => {
        clearTimeout(timer)
        client.off('update', onUpdate)
        resolve()
      }
      const timer = setTimeout(finish, 20_000)
      const onUpdate = () => {
        if (this.getAuthorizationState() !== before || this.pending || this.namePending || this.authNotice) finish()
      }
      client.on('update', onUpdate)
    })
  }

  private waitForClosed(client: TdlibClient): Promise<void> {
    if (this.lastAuthState?._ === 'authorizationStateClosed') return Promise.resolve()
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        client.off('update', onUpdate)
        reject(new AppError('AUTH_CLOSED', 'Telegram did not finish logging out.'))
      }, 20_000)
      const onUpdate = () => {
        if (this.lastAuthState?._ !== 'authorizationStateClosed') return
        clearTimeout(timer)
        client.off('update', onUpdate)
        resolve()
      }
      client.on('update', onUpdate)
    })
  }

  async close(): Promise<void> {
    if (this.closing) return this.closing
    const client = this.client
    if (!client) return

    this.closing = client.close().then(() => undefined).catch((error: unknown) => {
      log('error', 'tdlib.close', { code: toSafeError(error).code })
    }).finally(() => {
      this.client = null
      this.started = false
    })
    return this.closing
  }

  listFiles(): Promise<never> {
    return notImplemented()
  }

  uploadFile(localPath: string): Promise<UploadedTelegramFile> {
    return this.sendDocumentWithRetry(localPath)
  }

  downloadFile(fileId: string): Promise<DownloadedTelegramFile> {
    return this.downloadDocument(fileId)
  }

  async downloadSavedDocument(messageId: string): Promise<LocalTelegramFile> {
    if (this.lastAuthState?._ !== 'authorizationStateReady') {
      throw new AppError('NOT_AUTHORIZED', 'Telegram authorization is not complete.')
    }
    const saved = await this.getSavedMessagesChat()
    const chatId = requireSafeInteger(saved.chatId, 'DOWNLOAD_FAILED', 'The file could not be downloaded.')
    const messageIdNumber = requireSafeInteger(messageId, 'DOWNLOAD_FAILED', 'The file could not be downloaded.')
    const message = await this.requireClient().invoke({
      _: 'getMessage',
      chat_id: chatId,
      message_id: messageIdNumber,
    })
    return this.ensureLocalFile(readDocumentFileId(message))
  }

  deleteFile(messageId: string): Promise<DeletedTelegramMessage> {
    return this.deleteSavedMessage(messageId)
  }

  getFileMetadata(): Promise<never> {
    return notImplemented()
  }

  searchFiles(): Promise<never> {
    return notImplemented()
  }

  private requireClient(): TdlibClient {
    if (!this.client) throw new AppError('CLIENT_NOT_STARTED', 'TDLib is not running.')
    return this.client
  }

  private async downloadDocument(fileId: string): Promise<DownloadedTelegramFile> {
    const local = await this.ensureLocalFile(fileId)
    const bytes = new Uint8Array(readFileSync(local.path))
    return { fileId, size: bytes.byteLength, bytes }
  }

  private async ensureLocalFile(fileId: string): Promise<LocalTelegramFile> {
    if (this.lastAuthState?._ !== 'authorizationStateReady') {
      throw new AppError('NOT_AUTHORIZED', 'Telegram authorization is not complete.')
    }
    const fileIdNumber = requireSafeInteger(fileId, 'DOWNLOAD_FAILED', 'The file could not be downloaded.')
    const client = this.requireClient()

    try {
      const downloaded = await client.invoke({
        _: 'downloadFile',
        file_id: fileIdNumber,
        priority: 32,
        offset: 0,
        limit: 0,
        synchronous: true,
      })
      const local = readCompletedLocalFile(downloaded)
      const size = statSync(local.path).size
      log('info', 'telegram.download', { fileId, size })
      return { fileId, size, path: local.path }
    } catch (error) {
      if (error instanceof AppError) throw error
      const safe = toSafeError(error)
      log('error', 'telegram.download', { code: safe.code })
      throw new AppError('DOWNLOAD_FAILED', 'The file could not be downloaded.')
    }
  }

  private async deleteSavedMessage(messageId: string): Promise<DeletedTelegramMessage> {
    if (this.lastAuthState?._ !== 'authorizationStateReady') {
      throw new AppError('NOT_AUTHORIZED', 'Telegram authorization is not complete.')
    }

    const saved = await this.getSavedMessagesChat()
    const chatId = requireSafeInteger(saved.chatId, 'DELETE_FAILED', 'The message could not be deleted.')
    const messageIdNumber = requireSafeInteger(messageId, 'DELETE_FAILED', 'The message could not be deleted.')
    const client = this.requireClient()

    try {
      const properties = await client.invoke({
        _: 'getMessageProperties',
        chat_id: chatId,
        message_id: messageIdNumber,
      })
      const revoke = chooseDeleteRevoke(properties)
      await client.invoke({
        _: 'deleteMessages',
        chat_id: chatId,
        message_ids: [messageIdNumber],
        revoke,
      })
    } catch (error) {
      if (error instanceof AppError) throw error
      const safe = toSafeError(error)
      log('error', 'telegram.delete', { code: safe.code })
      throw new AppError('DELETE_FAILED', 'The message could not be deleted.')
    }

    let stillPresent = false
    try {
      await client.invoke({
        _: 'getMessage',
        chat_id: chatId,
        message_id: messageIdNumber,
      })
      stillPresent = true
    } catch (error) {
      if (!isMessageMissing(error)) {
        const safe = error instanceof AppError ? error : toSafeError(error)
        log('error', 'telegram.delete', { code: safe.code })
        throw new AppError('DELETE_FAILED', 'The message could not be deleted.')
      }
    }

    if (stillPresent) throw new AppError('DELETE_FAILED', 'The message could not be deleted.')

    const deleted: DeletedTelegramMessage = { chatId: saved.chatId, messageId, deleted: true }
    log('info', 'telegram.delete', { chatId: deleted.chatId, messageId: deleted.messageId, deleted: true })
    return deleted
  }

  private async sendDocumentWithRetry(localPath: string): Promise<UploadedTelegramFile> {
    let lastError: unknown = null
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        return await this.sendDocument(localPath)
      } catch (error) {
        lastError = error
        if (error instanceof AppError && (error.code === 'FILE_TOO_LARGE' || error.code === 'FILE_NOT_FOUND' || error.code === 'INVALID_PATH' || error.code === 'NOT_AUTHORIZED')) {
          throw error
        }
        if (attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, 1200 * (attempt + 1)))
        }
      }
    }
    throw lastError instanceof AppError ? lastError : new AppError('UPLOAD_FAILED', 'The file was not saved to Telegram.')
  }

  private async sendDocument(localPath: string): Promise<UploadedTelegramFile> {
    const absolutePath = assertLocalUploadPath(localPath)
    const size = statSync(absolutePath).size
    const saved = await this.getSavedMessagesChat()
    const chatId = Number(saved.chatId)
    if (!Number.isSafeInteger(chatId)) {
      throw new AppError('UPLOAD_FAILED', 'The file was not saved to Telegram.')
    }

    const client = this.requireClient()
    const queued: SendUpdate[] = []
    const collect = (update: { _: string }) => {
      if (update._ !== 'updateMessageSendSucceeded' && update._ !== 'updateMessageSendFailed') return
      queued.push(update as SendUpdate)
    }
    client.on('update', collect)

    try {
      const sent = await client.invoke({
        _: 'sendMessage',
        chat_id: chatId,
        topic_id: null,
        reply_to: null,
        options: null,
        reply_markup: null,
        input_message_content: {
          _: 'inputMessageDocument',
          caption: null,
          document: {
            _: 'inputDocument',
            thumbnail: null,
            disable_content_type_detection: true,
            document: {
              _: 'inputFileLocal',
              path: absolutePath,
            },
          },
        },
      } as never)
      const temporaryId = readPendingMessageId(sent)
      const update = await waitForSendUpdate(client, queued, temporaryId, uploadTimeoutMs(size))
      if (update._ === 'updateMessageSendFailed') {
        const raw = update.error?.message ?? ''
        const floodMatch = /^FLOOD_WAIT_(\d+)$/.exec(raw)
        if (floodMatch) {
          const waitSec = Math.min(30, Math.max(1, Number(floodMatch[1]) || 3))
          log('info', 'telegram.upload.flood_wait', { waitSec })
          await new Promise((resolve) => setTimeout(resolve, waitSec * 1000))
          throw new AppError('FLOOD_WAIT', 'Telegram rate limit reached. Retrying shortly.')
        }
        log('error', 'telegram.upload', { code: /^[A-Z0-9_]+$/.test(raw) ? raw : 'UPLOAD_FAILED' })
        throw new AppError('UPLOAD_FAILED', 'The file was not saved to Telegram.')
      }

      const uploaded = readUploadedDocument(saved.chatId, update.message)
      log('info', 'telegram.upload', {
        chatId: uploaded.chatId,
        messageId: uploaded.messageId,
        fileId: uploaded.fileId,
        remoteId: uploaded.remoteId,
        name: uploaded.name,
        size: uploaded.size,
      })
      return uploaded
    } catch (error) {
      if (error instanceof AppError) throw error
      const safe = toSafeError(error)
      log('error', 'telegram.upload', { code: safe.code })
      throw new AppError('UPLOAD_FAILED', 'The file was not saved to Telegram.')
    } finally {
      client.off('update', collect)
    }
  }

  private waitForAuthProgress(): Promise<void> {
    const client = this.requireClient()
    if (this.startupError) return Promise.reject(this.startupError)
    if (!isBenignAuthWait(this.lastAuthState?._) && this.lastAuthState) return Promise.resolve()

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        cleanup()
        reject(new AppError('TDLIB_START_TIMEOUT', 'TDLib did not finish initialization in time.'))
      }, START_TIMEOUT_MS)

      const succeedOrFail = () => {
        if (this.startupError) {
          cleanup()
          reject(this.startupError)
          return
        }
        if (!isBenignAuthWait(this.lastAuthState?._) && this.lastAuthState) {
          cleanup()
          resolve()
        }
      }

      const onUpdate = () => succeedOrFail()
      const onError = () => succeedOrFail()
      const cleanup = () => {
        clearTimeout(timer)
        client.off('update', onUpdate)
        client.off('error', onError)
      }

      client.on('update', onUpdate)
      client.on('error', onError)
      succeedOrFail()
    })
  }
}

function notImplemented(): Promise<never> {
  return Promise.reject(new AppError('NOT_IMPLEMENTED', 'This operation is not part of the current milestone.'))
}

function uploadTimeoutMs(size: number): number {
  const secondsAtSlowLink = Math.ceil(size / (128 * 1024))
  return Math.min(UPLOAD_DEADLINE_MS, Math.max(60_000, secondsAtSlowLink * 1000))
}

interface SendUpdate {
  _: string
  old_message_id?: number | string
  message?: unknown
  error?: { message?: string }
}

function waitForSendUpdate(
  client: TdlibClient,
  queued: SendUpdate[],
  temporaryId: string,
  timeoutMs: number,
): Promise<SendUpdate> {
  const existing = takeSendUpdate(queued, temporaryId)
  if (existing) return Promise.resolve(existing)

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup()
      reject(new AppError('UPLOAD_TIMEOUT', 'The file was not saved to Telegram.'))
    }, timeoutMs)

    const onUpdate = (update: { _: string }) => {
      if (update._ !== 'updateMessageSendSucceeded' && update._ !== 'updateMessageSendFailed') return
      const sendUpdate = update as SendUpdate
      if (String(sendUpdate.old_message_id) !== temporaryId) return
      cleanup()
      resolve(sendUpdate)
    }

    const cleanup = () => {
      clearTimeout(timer)
      client.off('update', onUpdate)
    }

    client.on('update', onUpdate)
    const late = takeSendUpdate(queued, temporaryId)
    if (late) {
      cleanup()
      resolve(late)
    }
  })
}

function takeSendUpdate(queued: SendUpdate[], temporaryId: string): SendUpdate | undefined {
  const index = queued.findIndex((update) => String(update.old_message_id) === temporaryId)
  if (index === -1) return undefined
  return queued.splice(index, 1)[0]
}

function requireSafeInteger(value: string, code: string, message: string): number {
  const parsed = Number(value)
  if (!Number.isSafeInteger(parsed)) throw new AppError(code, message)
  return parsed
}

export function createTelegramStorageService(options: TelegramClientOptions): TelegramStorageService {
  return new TdlibTelegramStorage(options)
}
