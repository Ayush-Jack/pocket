import path from 'node:path'
import { AppError, createTelegramStorageService } from '@telegram-drive/telegram'
import { createMetadataClient, saveSignedInAccount } from '@telegram-drive/metadata'
import { loadEnvFile, readRuntimeConfig, repoRoot } from './runtime-config'

async function main(): Promise<void> {
  loadEnvFile()
  if (!process.env.DATABASE_URL?.trim()) {
    throw new AppError(
      'CONFIG_MISSING',
      'Set DATABASE_URL in the project .env file before saving metadata.',
    )
  }

  const service = createTelegramStorageService(readRuntimeConfig())
  const prisma = createMetadataClient()
  let closing = false

  const shutdown = async (exitCode: number) => {
    if (closing) return
    closing = true
    await service.close()
    await prisma.$disconnect()
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

    const user = await service.getCurrentUser()
    const stored = await saveSignedInAccount(
      prisma,
      user,
      path.join(repoRoot(), '.tdlib-data', 'sessions', 'local'),
    )
    process.stdout.write('Metadata saved\n')
    process.stdout.write(`User ID: ${stored.userId}\n`)
    process.stdout.write(`Telegram user ID: ${stored.telegramUserId}\n`)
    process.stdout.write(`Folder ID: ${stored.folderId}\n`)
    process.stdout.write(`Folder: ${stored.folderName}\n`)
    process.stdout.write(`${JSON.stringify({ ok: true, account: stored })}\n`)
  } catch (error) {
    const safe = error instanceof AppError
      ? error
      : new AppError('METADATA_FAILED', 'Metadata could not be saved.')
    process.stdout.write(`${JSON.stringify({ ok: false, code: safe.code, message: safe.message })}\n`)
    process.exitCode = 1
  } finally {
    if (!closing) {
      await service.close()
      await prisma.$disconnect()
    }
  }
}

main().catch((error: unknown) => {
  const safe = error instanceof AppError
    ? error
    : new AppError('METADATA_FAILED', 'Metadata could not be saved.')
  process.stdout.write(`${JSON.stringify({ ok: false, code: safe.code, message: safe.message })}\n`)
  process.exitCode = 1
})
