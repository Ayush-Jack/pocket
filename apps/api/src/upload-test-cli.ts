import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { AppError, createTelegramStorageService } from '@telegram-drive/telegram'
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

    const filePath = path.join(repoRoot(), '.tdlib-data', 'tmp', 'upload-test.txt')
    mkdirSync(path.dirname(filePath), { recursive: true })
    writeFileSync(filePath, `telegram-drive upload test ${new Date().toISOString()}\n`, 'utf8')

    const uploaded = await service.uploadFile(filePath)
    process.stdout.write('Upload confirmed by Telegram\n')
    process.stdout.write(`Chat ID: ${uploaded.chatId}\n`)
    process.stdout.write(`Message ID: ${uploaded.messageId}\n`)
    process.stdout.write(`File ID: ${uploaded.fileId}\n`)
    process.stdout.write(`Remote ID: ${uploaded.remoteId ?? ''}\n`)
    process.stdout.write(`${JSON.stringify({ ok: true, uploaded })}\n`)
  } catch (error) {
    const safe = error instanceof AppError
      ? error
      : new AppError('UPLOAD_FAILED', 'The file was not saved to Telegram.')
    process.stdout.write(`${JSON.stringify({ ok: false, code: safe.code, message: safe.message })}\n`)
    process.exitCode = 1
  } finally {
    if (!closing) await service.close()
  }
}

main().catch((error: unknown) => {
  const safe = error instanceof AppError
    ? error
    : new AppError('UPLOAD_FAILED', 'The file was not saved to Telegram.')
  process.stdout.write(`${JSON.stringify({ ok: false, code: safe.code, message: safe.message })}\n`)
  process.exitCode = 1
})
