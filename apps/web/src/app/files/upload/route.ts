import { createDirectUploadTarget, uploadDriveFile } from '@/lib/drive-api'
import { MAX_UPLOAD_BYTES } from '@telegram-drive/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(): Promise<Response> {
  return Response.json(await createDirectUploadTarget())
}

export async function POST(request: Request): Promise<Response> {
  const declared = Number(request.headers.get('content-length') ?? '')
  if (Number.isFinite(declared) && declared > MAX_UPLOAD_BYTES) {
    return Response.json(
      { ok: false, message: 'This file is larger than 2 GB.' },
      { status: 413 },
    )
  }
  if (!request.body) {
    return Response.json({ ok: false, message: 'Choose a file to upload.' }, { status: 400 })
  }

  const rawName = request.headers.get('x-file-name') ?? ''
  let decodedName = rawName
  try {
    decodedName = decodeURIComponent(rawName)
  } catch {
    decodedName = rawName
  }

  const result = await uploadDriveFile(
    decodedName,
    request.body,
    Number.isFinite(declared) ? declared : undefined,
  )
  if (!result.ok || !result.data) {
    const tooLarge = result.message === 'This file is larger than 2 GB.'
    return Response.json(
      { ok: false, message: result.message ?? 'The file was not saved.' },
      { status: tooLarge ? 413 : 500 },
    )
  }
  return Response.json({ ok: true, message: 'Saved in your account.', file: result.data })
}
