import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { randomBytes } from 'node:crypto'
import { AppError, log } from '@telegram-drive/telegram'

export function repoRootFrom(moduleDir: string): string {
  return path.resolve(moduleDir, '../../..')
}

export function repoRoot(): string {
  return repoRootFrom(import.meta.dirname)
}

export function loadEnvFile(): void {
  const envPath = path.join(repoRoot(), '.env')
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

export interface RuntimeConfig {
  apiId: number
  apiHash: string
  useTestDc: boolean
  databaseDirectory: string
  filesDirectory: string
  databaseEncryptionKey: string
}

const DEVICE_SESSION_ID = /^[a-f0-9]{32}$/

export function isDeviceSessionId(sessionId: string): boolean {
  return DEVICE_SESSION_ID.test(sessionId)
}

export function readRuntimeConfig(): RuntimeConfig {
  const apiId = Number(process.env.TELEGRAM_API_ID)
  const apiHash = process.env.TELEGRAM_API_HASH?.trim() ?? ''
  if (!Number.isInteger(apiId) || apiId <= 0 || apiHash.length === 0) {
    throw new AppError(
      'CONFIG_MISSING',
      'Set TELEGRAM_API_ID and TELEGRAM_API_HASH in the project .env file. Create them at https://my.telegram.org.',
    )
  }

  const dataDir = dataDirectory()
  const sessionDir = path.join(dataDir, 'sessions', 'local')
  return {
    apiId,
    apiHash,
    useTestDc: process.env.USE_TEST_DC === 'true',
    databaseDirectory: path.join(sessionDir, 'database'),
    filesDirectory: path.join(sessionDir, 'files'),
    databaseEncryptionKey: readEncryptionKey(dataDir),
  }
}

/** One Telegram login per browser. The id is the cookie value, never a path. */
export function sessionRuntimeConfig(sessionId: string): RuntimeConfig {
  if (!isDeviceSessionId(sessionId)) {
    throw new AppError('UNAUTHORIZED', 'That sign-in session was not accepted.')
  }
  const base = readRuntimeConfig()
  const sessionDir = path.join(dataDirectory(), 'sessions', sessionId)
  return {
    ...base,
    databaseDirectory: path.join(sessionDir, 'database'),
    filesDirectory: path.join(sessionDir, 'files'),
  }
}

function dataDirectory(): string {
  return path.resolve(repoRoot(), process.env.TDLIB_DATA_DIR?.trim() || '.tdlib-data')
}

function readEncryptionKey(dataDir: string): string {
  const fromEnv = process.env.TDLIB_ENCRYPTION_KEY?.trim()
  if (fromEnv) return fromEnv

  mkdirSync(dataDir, { recursive: true })
  const keyPath = path.join(dataDir, 'encryption-key')
  if (existsSync(keyPath)) return readFileSync(keyPath, 'utf8').trim()

  const key = randomBytes(32).toString('base64')
  writeFileSync(keyPath, `${key}\n`, { encoding: 'utf8', mode: 0o600 })
  log('info', 'tdlib.encryption-key', { created: true })
  return key
}
