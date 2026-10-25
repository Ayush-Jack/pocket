import { existsSync, rmSync } from 'node:fs'
import path from 'node:path'
import { AppError, createTelegramStorageService } from '@telegram-drive/telegram'
import { isDeviceSessionId, sessionRuntimeConfig } from './runtime-config'

const IDLE_UNREADY_MS = 10 * 60 * 1000

type StorageService = ReturnType<typeof createTelegramStorageService>

interface LiveSession {
  service: StorageService
  ready: Promise<void>
  lastUsed: number
  directory: string
}

/**
 * Each browser cookie maps to its own TDLib database.
 * Logging out one browser does not close the others.
 */
export class DeviceSessions {
  private readonly sessions = new Map<string, LiveSession>()
  private readonly opening = new Map<string, Promise<StorageService>>()
  private readonly closing = new Map<string, Promise<void>>()

  exists(sessionId: string): boolean {
    if (!isDeviceSessionId(sessionId)) return false
    if (this.sessions.has(sessionId) || this.opening.has(sessionId)) return true
    const config = sessionRuntimeConfig(sessionId)
    return existsSync(config.databaseDirectory)
  }

  async get(sessionId: string): Promise<StorageService> {
    if (!isDeviceSessionId(sessionId)) {
      throw new AppError('UNAUTHORIZED', 'That sign-in session was not accepted.')
    }
    this.evictIdle(sessionId)
    const closingTask = this.closing.get(sessionId)
    if (closingTask) {
      await closingTask.catch(() => undefined)
    }
    const live = this.sessions.get(sessionId)
    if (live) {
      live.lastUsed = Date.now()
      await live.ready
      return live.service
    }
    const pending = this.opening.get(sessionId)
    if (pending) return pending
    const promise = this.start(sessionId)
    this.opening.set(sessionId, promise)
    void promise.finally(() => {
      this.opening.delete(sessionId)
    })
    return promise
  }

  async destroy(sessionId: string): Promise<void> {
    if (!isDeviceSessionId(sessionId)) return
    const live = this.sessions.get(sessionId)
    this.sessions.delete(sessionId)
    const directory = path.dirname(sessionRuntimeConfig(sessionId).databaseDirectory)
    const task = (async () => {
      if (live) {
        await live.ready.catch(() => undefined)
        await live.service.logOut().catch(() => undefined)
      }
      try {
        rmSync(directory, { recursive: true, force: true })
      } catch {
        // The Telegram login is already closed. A locked file can be removed later.
      }
    })()
    this.closing.set(sessionId, task)
    try {
      await task
    } finally {
      this.closing.delete(sessionId)
    }
  }

  async closeAll(): Promise<void> {
    const all = [...this.sessions.values()]
    this.sessions.clear()
    await Promise.all(all.map((live) => live.service.close().catch(() => undefined)))
  }

  private async start(sessionId: string): Promise<StorageService> {
    const config = sessionRuntimeConfig(sessionId)
    const service = createTelegramStorageService(config)
    const ready = service.start()
    void ready.catch(() => undefined)
    const live: LiveSession = {
      service,
      ready,
      lastUsed: Date.now(),
      directory: path.dirname(config.databaseDirectory),
    }
    this.sessions.set(sessionId, live)
    try {
      await ready
    } catch (error) {
      this.sessions.delete(sessionId)
      await service.close().catch(() => undefined)
      throw error
    }
    return service
  }

  private evictIdle(activeSessionId?: string): void {
    const now = Date.now()
    for (const [id, live] of this.sessions) {
      if (id === activeSessionId) continue
      if (now - live.lastUsed < IDLE_UNREADY_MS) continue
      if (live.service.getAuthorizationState() === 'authorizationStateReady') continue
      this.sessions.delete(id)
      const task = live.service
        .close()
        .catch(() => undefined)
        .finally(() => {
          try {
            rmSync(live.directory, { recursive: true, force: true })
          } catch {
            // Ignore locked files during cleanup.
          }
          this.closing.delete(id)
        })
      this.closing.set(id, task)
    }
  }
}
