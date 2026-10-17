import { getAuthStatus, submitAuth, logoutAuth } from '@/lib/drive-api'

export async function GET(): Promise<Response> {
  return Response.json(await getAuthStatus())
}

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json()) as { value?: string; firstName?: string; lastName?: string }
  return Response.json(await submitAuth(body))
}

export async function DELETE(): Promise<Response> {
  return Response.json(await logoutAuth())
}
