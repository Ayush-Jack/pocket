import { AppError, createTelegramStorageService } from '@telegram-drive/telegram'
import { loadEnvFile, readRuntimeConfig } from './runtime-config'

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

    const savedMessages = await service.getSavedMessagesChat()
    process.stdout.write('Saved Messages found\n')
    process.stdout.write(`Chat ID: ${savedMessages.chatId}\n`)
    process.stdout.write(`User ID: ${savedMessages.userId}\n`)
    process.stdout.write(`Title: ${savedMessages.title}\n`)
    process.stdout.write(`${JSON.stringify({ ok: true, savedMessages })}\n`)
  } catch (error) {
    const safe = error instanceof AppError
      ? error
      : new AppError('TELEGRAM_AUTH_FAILED', 'Telegram authorization failed.')
    process.stdout.write(`${JSON.stringify({ ok: false, code: safe.code, message: safe.message })}\n`)
    process.exitCode = 1
  } finally {
    if (!closing) await service.close()
  }
}

main().catch((error: unknown) => {
  const safe = error instanceof AppError
    ? error
    : new AppError('TELEGRAM_AUTH_FAILED', 'Telegram authorization failed.')
  process.stdout.write(`${JSON.stringify({ ok: false, code: safe.code, message: safe.message })}\n`)
  process.exitCode = 1
})
