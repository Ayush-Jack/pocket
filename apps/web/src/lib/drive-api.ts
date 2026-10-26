import 'server-only'
import { createHmac } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { request as httpRequest } from 'node:http'
import { request as httpsRequest } from 'node:https'
import path from 'node:path'
import { Readable } from 'node:stream'
import { cookies, headers } from 'next/headers'
import { UPLOAD_DEADLINE_MS } from '@telegram-drive/types'
import { isSessionId } from '@/lib/pocket-session'

export interface Account {
  userId: string
  telegramUserId: string
  folderId: string
  folderName: string
}

export interface DriveFile {
  id: string
  name: string
  mimeType: string
  size: number
  status: string
  folderId: string | null
}

export interface DriveResult<T> {
  ok: boolean
  data?: T
  message?: string
}

function loadRootEnv(): void {
  const envPath = path.resolve(process.cwd(), '../..', '.env')
  if (!existsSync(envPath)) return
  const text = readFileSync(envPath, 'utf8')
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const separator = line.indexOf('=')
    if (separator === -1) continue
    const key = line.slice(0, separator).trim()
    let value = line.slice(separator + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (process.env[key] === undefined) process.env[key] = value
  }
}

function apiBase(): string {
  loadRootEnv()
  const secret = process.env.SESSION_SECRET?.trim() ?? ''
  if (secret.length < 16) {
    throw new Error('SESSION_SECRET is missing')
  }
  const configured = process.env.API_URL?.trim() || 'http://127.0.0.1:4000'
  const url = new URL(configured)
  if (url.hostname === 'localhost') url.hostname = '127.0.0.1'
  return url.origin
}

async function api(pathname: string, init: RequestInit = {}): Promise<Response> {
  loadRootEnv()
  const secret = process.env.SESSION_SECRET?.trim() ?? ''
  const headers = new Headers(init.headers)
  headers.set('authorization', `Bearer ${secret}`)
  const sessionId = await browserSessionId()
  if (sessionId) headers.set('x-pocket-session', sessionId)
  return fetch(new URL(pathname, apiBase()), { ...init, headers, cache: 'no-store' })
}

async function browserSessionId(): Promise<string | null> {
  const fromCookie = (await cookies()).get('pocket_session')?.value
  if (isSessionId(fromCookie)) return fromCookie
  const fromRequest = (await headers()).get('x-pocket-session') ?? undefined
  return isSessionId(fromRequest) ? fromRequest : null
}

const signedOut: AuthStatus = {
  ok: true,
  ready: false,
  step: 'phone',
  hint: null,
  delivery: null,
  retry: false,
}

async function readJson<T>(pathname: string, init?: RequestInit): Promise<DriveResult<T>> {
  try {
    const response = await api(pathname, init)
    return { ok: true, data: (await response.json()) as T }
  } catch (error) {
    if (error instanceof Error && error.message === 'SESSION_SECRET is missing') {
      return { ok: false, message: 'Set SESSION_SECRET before opening the drive.' }
    }
    return { ok: false, message: 'The drive API is not running. Start it with npm run dev.' }
  }
}

export interface AuthStatus {
  ok: boolean
  ready: boolean
  step: string
  hint: string | null
  delivery: string | null
  retry: boolean
  message?: string
}

export async function getAuthStatus(startSignIn = false): Promise<AuthStatus> {
  if (!(await browserSessionId())) return signedOut
  const result = await readJson<{
    ok?: boolean
    ready?: boolean
    step?: string
    hint?: string | null
    delivery?: string | null
    retry?: boolean
    message?: string
  }>(startSignIn ? '/api/auth?start=1' : '/api/auth')
  if (!result.ok || !result.data?.ok) {
    return {
      ok: false,
      ready: false,
      step: 'offline',
      hint: null,
      delivery: null,
      retry: false,
      message: result.data?.message ?? result.message ?? 'The drive API is not running. Start it with npm run dev.',
    }
  }
  return {
    ok: true,
    ready: result.data.ready === true,
    step: result.data.step ?? 'starting',
    hint: result.data.hint ?? null,
    delivery: result.data.delivery ?? null,
    retry: result.data.retry === true,
    message: result.data.message,
  }
}

export async function submitAuth(body: {
  value?: string
  firstName?: string
  lastName?: string
  reset?: boolean
}): Promise<AuthStatus> {
  if (!(await browserSessionId())) return { ...signedOut, ok: false, message: 'Sign in on this device first.' }
  const result = await readJson<AuthStatus & { ok?: boolean; message?: string }>('/api/auth', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!result.ok || !result.data) {
    return { ok: false, ready: false, step: 'offline', hint: null, delivery: null, retry: false, message: result.message }
  }
  return {
    ok: result.data.ok !== false,
    ready: result.data.ready === true,
    step: result.data.step ?? 'starting',
    hint: result.data.hint ?? null,
    delivery: result.data.delivery ?? null,
    retry: result.data.retry === true,
    message: result.data.message,
  }
}

export async function logoutAuth(): Promise<AuthStatus> {
  const result = await readJson<AuthStatus & { ok?: boolean }>('/api/auth', { method: 'DELETE' })
  if (!result.ok || !result.data) {
    return { ok: false, ready: true, step: 'ready', hint: null, delivery: null, retry: false, message: result.message }
  }
  return {
    ok: true,
    ready: result.data.ready === true,
    step: result.data.step ?? 'phone',
    hint: result.data.hint ?? null,
    delivery: result.data.delivery ?? null,
    retry: false,
  }
}

export async function getAccount(): Promise<DriveResult<Account>> {
  const result = await readJson<{ ok?: boolean; account?: Account; message?: string }>('/api/me')
  if (!result.ok || !result.data?.ok || !result.data.account) {
    return { ok: false, message: result.data?.message ?? result.message ?? 'The account could not be loaded.' }
  }
  return { ok: true, data: result.data.account }
}

export async function listDriveFiles(): Promise<DriveResult<DriveFile[]>> {
  const result = await readJson<{ ok?: boolean; files?: DriveFile[]; message?: string }>('/api/files')
  if (!result.ok || !result.data?.ok || !result.data.files) {
    return { ok: false, message: result.data?.message ?? result.message ?? 'The file list could not be loaded.' }
  }
  return { ok: true, data: result.data.files }
}

export async function uploadDriveFile(
  fileName: string,
  body: ReadableStream<Uint8Array>,
  contentLength?: number,
): Promise<DriveResult<DriveFile>> {
  try {
    const data = await postUpload(fileName, body, contentLength)
    if (!data.ok || !data.file) {
      return { ok: false, message: data.message ?? 'The file was not saved.' }
    }
    return { ok: true, data: data.file }
  } catch (error) {
    if (error instanceof Error && error.message === 'SESSION_SECRET is missing') {
      return { ok: false, message: 'Set SESSION_SECRET before opening the drive.' }
    }
    if (error instanceof Error && error.message === 'Sign in on this device first.') {
      return { ok: false, message: error.message }
    }
    return { ok: false, message: 'The drive API is not running. Start it with npm run dev.' }
  }
}

async function postUpload(
  fileName: string,
  body: ReadableStream<Uint8Array>,
  contentLength?: number,
): Promise<{ ok?: boolean; file?: DriveFile; message?: string }> {
  loadRootEnv()
  const secret = process.env.SESSION_SECRET?.trim() ?? ''
  if (secret.length < 16) return Promise.reject(new Error('SESSION_SECRET is missing'))
  const sessionId = await browserSessionId()
  if (!sessionId) return Promise.reject(new Error('Sign in on this device first.'))
  const url = new URL('/api/files', apiBase())
  const headers: Record<string, string> = {
    authorization: `Bearer ${secret}`,
    'x-pocket-session': sessionId,
    'x-file-name': encodeURIComponent(fileName),
  }
  if (contentLength !== undefined) headers['content-length'] = String(contentLength)

  const secure = url.protocol === 'https:'
  return new Promise((resolve, reject) => {
    const req = (secure ? httpsRequest : httpRequest)(
      {
        hostname: url.hostname,
        ...(url.port ? { port: Number(url.port) } : {}),
        path: `${url.pathname}${url.search}`,
        method: 'POST',
        headers,
        timeout: UPLOAD_DEADLINE_MS,
      },
      (response) => {
        const chunks: Buffer[] = []
        response.on('data', (chunk: Buffer) => chunks.push(chunk))
        response.on('end', () => {
          try {
            resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')) as { ok?: boolean; file?: DriveFile; message?: string })
          } catch {
            reject(new Error('The drive API is not running. Start it with npm run dev.'))
          }
        })
      },
    )
    req.on('timeout', () => req.destroy(new Error('The file was not saved.')))
    req.on('error', () => reject(new Error('The drive API is not running. Start it with npm run dev.')))
    Readable.fromWeb(body as import('node:stream/web').ReadableStream).pipe(req)
  })
}

export async function deleteDriveFile(id: string): Promise<DriveResult<DriveFile>> {
  const result = await readJson<{ ok?: boolean; file?: DriveFile; message?: string }>(
    `/api/files/${encodeURIComponent(id)}`,
    { method: 'DELETE' },
  )
  if (!result.ok || !result.data?.ok || !result.data.file || result.data.file.status !== 'DELETED') {
    return { ok: false, message: result.data?.message ?? result.message ?? 'The file was not deleted.' }
  }
  return { ok: true, data: result.data.file }
}

export async function downloadDriveFile(id: string, range?: string | null): Promise<Response> {
  const headers = new Headers()
  if (range) headers.set('range', range)
  return api(`/api/files/${encodeURIComponent(id)}/download`, { headers })
}

export async function createDirectUploadTarget(): Promise<{
  ok: boolean
  uploadUrl?: string
  ticket?: string
}> {
  loadRootEnv()
  const secret = process.env.SESSION_SECRET?.trim() ?? ''
  const sessionId = await browserSessionId()
  if (secret.length < 16 || !sessionId) return { ok: false }
  const expiresAt = Date.now() + 30 * 60 * 1000
  const sig = createHmac('sha256', secret).update(`${sessionId}.${expiresAt}`).digest('hex')
  const ticket = `${sessionId}.${expiresAt}.${sig}`
  const uploadUrl = new URL('/api/files', apiBase()).toString()
  return { ok: true, uploadUrl, ticket }
}
