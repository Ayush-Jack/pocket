import { downloadDriveFile } from '@/lib/drive-api'

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await context.params
  const upstream = await downloadDriveFile(id)
  if (!upstream.ok) {
    return new Response('The file could not be downloaded.', { status: upstream.status })
  }
  const headers = new Headers()
  const type = upstream.headers.get('content-type')
  const disposition = upstream.headers.get('content-disposition')
  if (type) headers.set('content-type', type)
  if (disposition) headers.set('content-disposition', disposition)
  return new Response(upstream.body, { status: 200, headers })
}
