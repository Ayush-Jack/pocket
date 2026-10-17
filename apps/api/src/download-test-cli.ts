import { readFileSync } from 'node:fs'
import path from 'node:path'
import { AppError, bytesMatch, createTelegramStorageService } from '@telegram-drive/telegram'
import { loadEnvFile, readRuntimeConfig, repoRoot } from './runtime-config'

async function main(): Promise<void> {
  loadEnvFile()
  const service = createTelegramStorageService(readRuntimeConfig())
  let closing = false

  const shutdown = async (exitCode: number) => {
    if (closing) return
    closing = true
    await service.close()
    process.exit(exitCode)
  }
  process.once('SIGINT', () => {
    void shutdown(130)
  })

  try {
    await service.start()
    if (service.getAuthorizationState() !== 'authorizationStateReady') {
      throw new AppError(
        'NOT_AUTHORIZED',
        'Telegram authorization is not complete. Run npm run auth.',
      )
    }

    const found = await service.findLatestTestUpload()
    const downloaded = await service.downloadFile(found.fileId)
    const sourcePath = path.join(repoRoot(), '.tdlib-data', 'tmp', 'upload-test.txt')
    const source = new Uint8Array(readFileSync(sourcePath))
    const match = bytesMatch(downloaded.bytes, source)
    const result = {
      ok: match,
      match,
      chatId: found.chatId,
      messageId: found.messageId,
      fileId: downloaded.fileId,
      size: downloaded.size,
    }
    process.stdout.write(`${match ? 'Download matches the source file' : 'Download does not match the source file'}\n`)
    process.stdout.write(`Chat ID: ${found.chatId}\n`)
    process.stdout.write(`Message ID: ${found.messageId}\n`)
    process.stdout.write(`File ID: ${downloaded.fileId}\n`)
    process.stdout.write(`Size: ${downloaded.size}\n`)
    process.stdout.write(`${JSON.stringify(result)}\n`)
    if (!match) process.exitCode = 1
  } catch (error) {
    const safe = error instanceof AppError
      ? error
      : new AppError('DOWNLOAD_FAILED', 'The file could not be downloaded.')
    process.stdout.write(`${JSON.stringify({ ok: false, code: safe.code, message: safe.message })}\n`)
    process.exitCode = 1
  } finally {
    if (!closing) await service.close()
  }
}

main().catch((error: unknown) => {
  const safe = error instanceof AppError
    ? error
    : new AppError('DOWNLOAD_FAILED', 'The file could not be downloaded.')
  process.stdout.write(`${JSON.stringify({ ok: false, code: safe.code, message: safe.message })}\n`)
  process.exitCode = 1
})
