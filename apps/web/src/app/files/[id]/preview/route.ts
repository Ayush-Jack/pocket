import { downloadDriveFile } from '@/lib/drive-api'

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await context.params
  const upstream = await downloadDriveFile(id, request.headers.get('range'))
  if (!upstream.ok) {
    return new Response('The photo could not be loaded.', { status: upstream.status })
  }

  const type = upstream.headers.get('content-type') ?? ''
  if (!type.startsWith('image/') && !type.startsWith('video/')) {
    return new Response('The file could not be loaded.', { status: 415 })
  }

  const headers = new Headers({
    'content-type': type,
    'content-disposition': 'inline',
    'cache-control': 'private, max-age=300',
  })
  for (const name of ['content-length', 'content-range', 'accept-ranges']) {
    const value = upstream.headers.get(name)
    if (value) headers.set(name, value)
  }
  return new Response(upstream.body, { status: upstream.status, headers })
}
