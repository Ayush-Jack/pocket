import { cookies } from 'next/headers'
import { getAuthStatus, submitAuth, logoutAuth } from '@/lib/drive-api'
import { SESSION_COOKIE, sessionCookieOptions } from '@/lib/pocket-session'

export async function GET(): Promise<Response> {
  return Response.json(await getAuthStatus(true))
}

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json()) as { value?: string; firstName?: string; lastName?: string }
  return Response.json(await submitAuth(body))
}

export async function DELETE(): Promise<Response> {
  const result = await logoutAuth()
  const jar = await cookies()
  jar.set(SESSION_COOKIE, '', { ...sessionCookieOptions(), maxAge: 0 })
  return Response.json(result)
}
