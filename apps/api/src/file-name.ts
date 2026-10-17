export function sanitizeFileName(input: string): string {
  const base = input.replace(/\\/g, '/').split('/').pop() ?? ''
  const cleaned = base.replace(/[^A-Za-z0-9._-]/g, '_').replace(/^\.+/, '')
  if (!cleaned || cleaned.includes('..')) {
    throw new Error('INVALID_FILE_NAME')
  }
  return cleaned.slice(0, 120)
}

export function mimeTypeFor(fileName: string): string {
  const lower = fileName.toLowerCase()
  if (lower.endsWith('.txt')) return 'text/plain'
  if (lower.endsWith('.json')) return 'application/json'
  if (lower.endsWith('.pdf')) return 'application/pdf'
  if (lower.endsWith('.png')) return 'image/png'
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg'
  if (lower.endsWith('.webp')) return 'image/webp'
  if (lower.endsWith('.gif')) return 'image/gif'
  if (lower.endsWith('.mp4')) return 'video/mp4'
  if (lower.endsWith('.webm')) return 'video/webm'
  if (lower.endsWith('.mov')) return 'video/quicktime'
  if (lower.endsWith('.mkv')) return 'video/x-matroska'
  return 'application/octet-stream'
}
