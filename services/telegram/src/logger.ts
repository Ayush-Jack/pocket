const REDACTED_KEYS = new Set([
  'password',
  'code',
  'phone',
  'phonenumber',
  'phone_number',
  'email',
  'email_address',
  'apihash',
  'api_hash',
  'encryptionkey',
  'databaseencryptionkey',
  'database_encryption_key',
  'token',
  'link',
])

export interface LogFields {
  [key: string]: unknown
}

export function sanitizeLogFields(fields: LogFields): LogFields {
  const sanitized: LogFields = {}
  for (const [key, value] of Object.entries(fields)) {
    if (REDACTED_KEYS.has(key.toLowerCase())) {
      sanitized[key] = '[redacted]'
      continue
    }
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeLogFields(value as LogFields)
      continue
    }
    sanitized[key] = value
  }
  return sanitized
}

export function log(level: 'info' | 'error', operation: string, fields: LogFields = {}): void {
  const line = JSON.stringify({
    time: new Date().toISOString(),
    level,
    operation,
    ...sanitizeLogFields(fields),
  })
  process.stderr.write(`${line}\n`)
}
