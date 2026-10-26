import { cookies } from 'next/headers'
import { getAuthStatus, submitAuth, logoutAuth } from '@/lib/drive-api'
import { SESSION_COOKIE, sessionCookieOptions } from '@/lib/pocket-session'

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const start = url.searchParams.get('start') === '1'
  return Response.json(await getAuthStatus(start))
}

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json()) as {
    value?: string
    firstName?: string
    lastName?: string
    reset?: boolean
  }
  return Response.json(await submitAuth(body))
}

export async function DELETE(): Promise<Response> {
  const result = await logoutAuth()
  const jar = await cookies()
  jar.set(SESSION_COOKIE, '', { ...sessionCookieOptions(), maxAge: 0 })
  return Response.json(result)
}
