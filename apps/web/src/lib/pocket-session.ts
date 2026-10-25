export const SESSION_COOKIE = 'pocket_session'

const SESSION_ID = /^[a-f0-9]{32}$/

export function isSessionId(value: string | undefined): value is string {
  return typeof value === 'string' && SESSION_ID.test(value)
}

export function newSessionId(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function sessionCookieOptions(): {
  httpOnly: true
  sameSite: 'lax'
  secure: boolean
  path: string
  maxAge: number
} {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 180,
  }
}
