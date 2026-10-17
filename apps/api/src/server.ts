import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import { createReadStream, createWriteStream, mkdirSync, rmSync } from 'node:fs'
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import path from 'node:path'
import { MAX_UPLOAD_BYTES, UPLOAD_DEADLINE_MS } from '@telegram-drive/types'
import { AppError, createTelegramStorageService } from '@telegram-drive/telegram'
import {
  createMetadataClient,
  createUploadedFile,
  getAccount,
  getFileForUser,
  listFiles,
  markFileDeleted,
  saveSignedInAccount,
} from '@telegram-drive/metadata'
import { mimeTypeFor, sanitizeFileName } from './file-name'
import { loadEnvFile, readRuntimeConfig, repoRoot } from './runtime-config'

type StorageService = ReturnType<typeof createTelegramStorageService>

type MetadataClient = ReturnType<typeof createMetadataClient>

async function main(): Promise<void> {
  loadEnvFile()
  const secret = process.env.SESSION_SECRET?.trim() ?? ''
  if (secret.length < 16) {
    throw new AppError('CONFIG_MISSING', 'Set SESSION_SECRET in the project .env file before starting the API.')
  }
  if (!process.env.DATABASE_URL?.trim()) {
    throw new AppError('CONFIG_MISSING', 'Set DATABASE_URL in the project .env file before starting the API.')
  }

  const apiUrl = new URL(process.env.API_URL?.trim() || 'http://localhost:4000')
  const port = Number(process.env.PORT) || Number(apiUrl.port) || 4000
  const service = createTelegramStorageService(readRuntimeConfig())
  const prisma = createMetadataClient()
  let telegramReady = false

  const server = createServer((request, response) => {
    void handleRequest(request, response, { secret, service, prisma, telegramReady })
  })

  const shutdown = async () => {
    server.close()
    await service.close()
    await prisma.$disconnect()
    process.exit(0)
  }
  process.once('SIGINT', () => {
    void shutdown()
  })
  process.once('SIGTERM', () => {
    void shutdown()
  })

  server.requestTimeout = UPLOAD_DEADLINE_MS
  server.headersTimeout = 60_000
  server.listen(port, '0.0.0.0', () => {
    process.stdout.write(`${JSON.stringify({ ok: true, operation: 'api.listen', port, telegramReady })}\n`)
  })

  try {
    await service.start()
    telegramReady = service.getAuthorizationState() === 'authorizationStateReady'
    if (!telegramReady) service.beginSignIn()
  } catch (error) {
    const safe = error instanceof AppError ? error : new AppError('NOT_AUTHORIZED', 'Telegram authorization is not complete. Run npm run auth.')
    process.stderr.write(`${JSON.stringify({ level: 'error', operation: 'api.start', code: safe.code })}\n`)
  }
}

interface AppContext {
  secret: string
  service: StorageService
  prisma: MetadataClient
  telegramReady: boolean
}

async function handleRequest(request: IncomingMessage, response: ServerResponse, app: AppContext): Promise<void> {
  const url = new URL(request.url ?? '/', 'http://localhost')
  const pathName = url.pathname
  try {
    if (request.method === 'GET' && pathName === '/health') {
      sendJson(response, 200, { ok: true })
      return
    }
    if (!authorized(request.headers.authorization, app.secret)) {
      sendJson(response, 401, { ok: false, code: 'UNAUTHORIZED', message: 'Authorization is required.' })
      return
    }
    if (request.method === 'GET' && pathName === '/api/auth') {
      handleAuthStatus(response, app)
      return
    }
    if (request.method === 'POST' && pathName === '/api/auth') {
      await handleAuthSubmit(request, response, app)
      return
    }
    if (request.method === 'DELETE' && pathName === '/api/auth') {
      await handleAuthLogout(response, app)
      return
    }
    if (!serviceReady(app)) {
      sendJson(response, 401, {
        ok: false,
        code: 'NOT_AUTHORIZED',
        message: 'Sign in with your Telegram account first.',
      })
      return
    }

    if (request.method === 'GET' && pathName === '/api/me') {
      await handleMe(response, app)
      return
    }
    if (request.method === 'GET' && pathName === '/api/files') {
      await handleList(response, app)
      return
    }
    if (request.method === 'POST' && pathName === '/api/files') {
      await handleUpload(request, response, app)
      return
    }

    const downloadMatch = /^\/api\/files\/([^/]+)\/download$/.exec(pathName)
    if (request.method === 'GET' && downloadMatch?.[1]) {
      await handleDownload(request, response, app, decodeURIComponent(downloadMatch[1]))
      return
    }
    const fileMatch = /^\/api\/files\/([^/]+)$/.exec(pathName)
    if (request.method === 'DELETE' && fileMatch?.[1]) {
      await handleDelete(response, app, decodeURIComponent(fileMatch[1]))
      return
    }

    sendJson(response, 404, { ok: false, code: 'NOT_FOUND', message: 'Not found.' })
  } catch (error) {
    const safe = error instanceof AppError
      ? error
      : new AppError('API_FAILED', 'The request could not be completed.')
    const status = safe.code === 'FILE_TOO_LARGE' ? 413 : safe.code === 'INVALID_FILE_NAME' || safe.code === 'AUTH_NOT_WAITING' ? 400 : 500
    if (pathName === '/api/auth') {
      sendJson(response, status, { ok: false, ...app.service.authStatus(), message: safe.message })
      return
    }
    sendJson(response, status, { ok: false, code: safe.code, message: safe.message })
  }
}

function serviceReady(app: AppContext): boolean {
  return app.service.getAuthorizationState() === 'authorizationStateReady'
}

function handleAuthStatus(response: ServerResponse, app: AppContext): void {
  const status = app.service.authStatus()
  sendJson(response, 200, { ok: true, ...status })
}

async function handleAuthSubmit(request: IncomingMessage, response: ServerResponse, app: AppContext): Promise<void> {
  const body = await readSmallJson(request)
  const record = body && typeof body === 'object' ? body as Record<string, unknown> : {}
  if (typeof record.firstName === 'string') {
    await app.service.submitRegistration(record.firstName, typeof record.lastName === 'string' ? record.lastName : '')
  } else if (typeof record.value === 'string') {
    await app.service.submitSignIn(record.value)
  } else {
    throw new AppError('AUTH_NOT_WAITING', 'Enter the value Telegram is asking for.')
  }
  sendJson(response, 200, { ok: true, ...app.service.authStatus() })
}

async function handleAuthLogout(response: ServerResponse, app: AppContext): Promise<void> {
  await app.service.logOut()
  sendJson(response, 200, { ok: true, ...app.service.authStatus() })
}

async function handleMe(response: ServerResponse, app: AppContext): Promise<void> {
  const account = await ensureAccount(app)
  sendJson(response, 200, { ok: true, account })
}

async function handleList(response: ServerResponse, app: AppContext): Promise<void> {
  const account = await ensureAccount(app)
  const files = await listFiles(app.prisma, account.userId)
  sendJson(response, 200, { ok: true, files })
}

async function handleUpload(request: IncomingMessage, response: ServerResponse, app: AppContext): Promise<void> {
  const account = await ensureAccount(app)
  let fileName: string
  try {
    fileName = sanitizeFileName(request.headers['x-file-name']?.toString() ?? '')
  } catch {
    throw new AppError('INVALID_FILE_NAME', 'That file name was not accepted.')
  }
  const declared = declaredLength(request.headers['content-length'])
  if (declared !== null && declared > MAX_UPLOAD_BYTES) {
    sendJson(response, 413, { ok: false, code: 'FILE_TOO_LARGE', message: 'This file is larger than 2 GB.' })
    request.destroy()
    return
  }

  const tempPath = path.join(repoRoot(), '.tdlib-data', 'tmp', `${randomBytes(8).toString('hex')}-${fileName}`)
  mkdirSync(path.dirname(tempPath), { recursive: true })
  let size = 0
  try {
    size = await writeUpload(request, tempPath)
    if (size === 0) throw new AppError('FILE_NOT_FOUND', 'The file was not found.')
    if (declared !== null && declared !== size) {
      throw new AppError('UPLOAD_FAILED', 'The file was not saved to Telegram.')
    }
    const uploaded = await app.service.uploadFile(tempPath)
    const file = await createUploadedFile(app.prisma, account.userId, account.folderId, {
      name: fileName,
      mimeType: mimeTypeFor(fileName),
      size,
      telegramChatId: uploaded.chatId,
      telegramMessageId: uploaded.messageId,
      telegramFileId: uploaded.fileId,
      telegramRemoteId: uploaded.remoteId,
      status: 'UPLOADED',
    })
    sendJson(response, 201, { ok: true, file })
  } finally {
    rmSync(tempPath, { force: true })
  }
}

async function handleDownload(request: IncomingMessage, response: ServerResponse, app: AppContext, fileId: string): Promise<void> {
  const account = await ensureAccount(app)
  const file = await getFileForUser(app.prisma, account.userId, fileId)
  if (!file) {
    sendJson(response, 404, { ok: false, code: 'NOT_FOUND', message: 'Not found.' })
    return
  }
  const downloaded = await app.service.downloadSavedDocument(file.telegramMessageId)
  const range = readByteRange(request.headers.range, downloaded.size)
  if (request.headers.range && !range) {
    response.writeHead(416, { 'content-range': `bytes */${downloaded.size}` })
    response.end()
    return
  }
  const start = range?.start ?? 0
  const end = range?.end ?? downloaded.size - 1
  const length = end - start + 1
  response.writeHead(range ? 206 : 200, {
    'content-type': file.mimeType,
    'content-length': String(length),
    'accept-ranges': 'bytes',
    ...(range ? { 'content-range': `bytes ${start}-${end}/${downloaded.size}` } : {}),
    'content-disposition': `attachment; filename="${file.name}"`,
  })
  createReadStream(downloaded.path, { start, end }).pipe(response)
}

function readByteRange(header: string | undefined, size: number): { start: number; end: number } | null {
  if (!header) return null
  const match = /^bytes=(\d*)-(\d*)$/.exec(header)
  if (!match || size <= 0) return null
  let start = match[1] ? Number(match[1]) : Number.NaN
  let end = match[2] ? Number(match[2]) : size - 1
  if (!match[1] && match[2]) {
    const suffix = Number(match[2])
    start = Math.max(0, size - suffix)
    end = size - 1
  }
  if (!Number.isFinite(start) || start < 0 || start >= size) return null
  end = Math.min(end, size - 1)
  if (!Number.isFinite(end) || end < start) return null
  return { start, end }
}

async function handleDelete(response: ServerResponse, app: AppContext, fileId: string): Promise<void> {
  const account = await ensureAccount(app)
  const file = await getFileForUser(app.prisma, account.userId, fileId)
  if (!file) {
    sendJson(response, 404, { ok: false, code: 'NOT_FOUND', message: 'Not found.' })
    return
  }
  await app.service.deleteFile(file.telegramMessageId)
  const deleted = await markFileDeleted(app.prisma, account.userId, file.id)
  sendJson(response, 200, { ok: true, file: deleted })
}

async function ensureAccount(app: AppContext) {
  const identity = await app.service.getCurrentUser()
  const existing = await getAccount(app.prisma, identity.telegramUserId)
  if (existing) return existing
  const sessionDir = path.dirname(readRuntimeConfig().databaseDirectory)
  return saveSignedInAccount(app.prisma, identity, sessionDir)
}

function authorized(header: string | undefined, secret: string): boolean {
  if (!header?.startsWith('Bearer ')) return false
  const token = header.slice('Bearer '.length).trim()
  const left = createHash('sha256').update(token).digest()
  const right = createHash('sha256').update(secret).digest()
  return timingSafeEqual(left, right)
}

function declaredLength(header: string | undefined): number | null {
  if (!header) return null
  const value = Number(header)
  if (!Number.isFinite(value) || value < 0) return null
  return value
}

function writeUpload(request: IncomingMessage, dest: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(dest)
    let size = 0
    let failed = false

    const fail = (error: AppError) => {
      if (failed) return
      failed = true
      request.pause()
      file.destroy()
      reject(error)
    }

    request.on('data', (chunk: Buffer) => {
      if (failed) return
      size += chunk.length
      if (size > MAX_UPLOAD_BYTES) {
        fail(new AppError('FILE_TOO_LARGE', 'This file is larger than 2 GB.'))
        return
      }
      if (!file.write(chunk)) request.pause()
    })
    file.on('drain', () => {
      if (!failed) request.resume()
    })
    request.on('end', () => {
      if (!failed) file.end()
    })
    request.on('error', () => fail(new AppError('API_FAILED', 'The request could not be completed.')))
    file.on('error', () => fail(new AppError('API_FAILED', 'The request could not be completed.')))
    file.on('finish', () => {
      if (!failed) resolve(size)
    })
  })
}

function readSmallJson(request: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    let size = 0
    request.on('data', (chunk: Buffer) => {
      size += chunk.length
      if (size > 8192) {
        reject(new AppError('API_FAILED', 'The request could not be completed.'))
        request.destroy()
        return
      }
      chunks.push(chunk)
    })
    request.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown)
      } catch {
        reject(new AppError('API_FAILED', 'The request could not be completed.'))
      }
    })
    request.on('error', () => reject(new AppError('API_FAILED', 'The request could not be completed.')))
  })
}

function sendJson(response: ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body)
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
  response.end(payload)
}

main().catch((error: unknown) => {
  const safe = error instanceof AppError
    ? error
    : new AppError('API_FAILED', 'The request could not be completed.')
  process.stderr.write(`${JSON.stringify({ ok: false, code: safe.code, message: safe.message })}\n`)
  process.exitCode = 1
})
