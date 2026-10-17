import { AppError, loadTdlib } from '@telegram-drive/telegram'

try {
  const runtime = loadTdlib()
  process.stdout.write(
    `${JSON.stringify({
      ok: true,
      operation: 'tdlib.check',
      libraryLoaded: true,
      bytes: runtime.bytes,
      verbosityLevel: runtime.verbosityLevel,
    })}\n`,
  )
} catch (error) {
  const safe = error instanceof AppError
    ? error
    : new AppError('TDLIB_BINARY_MISSING', 'The TDLib shared library was not found.')
  process.stdout.write(`${JSON.stringify({ ok: false, code: safe.code, message: safe.message })}\n`)
  process.exitCode = 1
}
