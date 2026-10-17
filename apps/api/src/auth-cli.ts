import { AppError, createTelegramStorageService } from '@telegram-drive/telegram'
import { createConsoleAuthHandlers } from './prompt'
import { loadEnvFile, readRuntimeConfig } from './runtime-config'

const smoke = process.argv.includes('--smoke') || process.env.TDLIB_AUTH_SMOKE === '1'

async function main(): Promise<void> {
  loadEnvFile()
  const config = readRuntimeConfig()
  const service = createTelegramStorageService(config)
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
    const state = service.getAuthorizationState()

    if (smoke) {
      if (state === 'authorizationStateReady') {
        const user = await service.getCurrentUser()
        process.stdout.write(`${JSON.stringify({ ok: true, authorizationState: state, ready: true, user })}\n`)
      } else {
        process.stdout.write(
          `${JSON.stringify({
            ok: true,
            authorizationState: state,
            ready: false,
            detail:
              'TDLib accepted parameters and is waiting for authorization input. Run npm run auth to finish.',
          })}\n`,
        )
      }
      return
    }

    process.stdout.write('Connecting to your Telegram account.\n')
    const user = await service.authenticate(createConsoleAuthHandlers())
    process.stdout.write(
      `${JSON.stringify({ ok: true, authorizationState: 'authorizationStateReady', user })}\n`,
    )
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
