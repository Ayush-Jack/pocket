import { existsSync, statSync } from 'node:fs'
import * as tdl from 'tdl'
import { getTdjson } from 'prebuilt-tdlib'
import { AppError } from './errors'

let configured = false

export interface TdlibRuntimeInfo {
  tdjsonPath: string
  bytes: number
  verbosityLevel: number | null
}

export function loadTdlib(): TdlibRuntimeInfo {
  const tdjsonPath = getTdjson()
  if (!existsSync(tdjsonPath)) {
    throw new AppError('TDLIB_BINARY_MISSING', 'The TDLib shared library was not found.')
  }

  if (!configured) {
    tdl.configure({ tdjson: tdjsonPath, verbosityLevel: 0 })
    configured = true
  }

  const verbosity = tdl.execute({ _: 'getLogVerbosityLevel' })
  return {
    tdjsonPath,
    bytes: statSync(tdjsonPath).size,
    verbosityLevel: readVerbosity(verbosity),
  }
}

function readVerbosity(value: unknown): number | null {
  if (!value || typeof value !== 'object') return null
  const record = value as Record<string, unknown>
  if (record._ === 'error') return null
  return typeof record.verbosity_level === 'number' ? record.verbosity_level : null
}
