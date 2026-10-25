export function decodeFileNameHeader(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ''
  try {
    return decodeURIComponent(trimmed)
  } catch {
    return trimmed
  }
}

export function sanitizeFileName(input: string): string {
  const decoded = decodeFileNameHeader(input)
  const base = decoded.replace(/\\/g, '/').split('/').pop()?.trim() ?? ''
  if (!base || base === '.' || base === '..') {
    throw new Error('INVALID_FILE_NAME')
  }

  const dotIndex = base.lastIndexOf('.')
  const rawStem = dotIndex > 0 ? base.slice(0, dotIndex) : base
  const rawExt = dotIndex > 0 ? base.slice(dotIndex + 1) : ''

  const stem = rawStem
    .replace(/[^A-Za-z0-9._-]+/g, '_')
    .replace(/^[_.-]+|[_.-]+$/g, '')
  const ext = rawExt.replace(/[^A-Za-z0-9]+/g, '').slice(0, 12)

  const safeStem = (stem || 'file').slice(0, 100)
  const combined = ext ? `${safeStem}.${ext}` : safeStem
  if (!combined || combined.includes('..')) {
    throw new Error('INVALID_FILE_NAME')
  }
  return combined.slice(0, 120)
}

export function mimeTypeFor(fileName: string): string {
  const lower = fileName.toLowerCase()
  if (lower.endsWith('.txt') || lower.endsWith('.md') || lower.endsWith('.csv')) return 'text/plain'
  if (lower.endsWith('.json')) return 'application/json'
  if (lower.endsWith('.pdf')) return 'application/pdf'
  if (lower.endsWith('.png')) return 'image/png'
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg'
  if (lower.endsWith('.webp')) return 'image/webp'
  if (lower.endsWith('.gif')) return 'image/gif'
  if (lower.endsWith('.heic') || lower.endsWith('.heif')) return 'image/heic'
  if (lower.endsWith('.avif')) return 'image/avif'
  if (lower.endsWith('.svg')) return 'image/svg+xml'
  if (lower.endsWith('.mp4') || lower.endsWith('.m4v')) return 'video/mp4'
  if (lower.endsWith('.webm')) return 'video/webm'
  if (lower.endsWith('.mov')) return 'video/quicktime'
  if (lower.endsWith('.mkv')) return 'video/x-matroska'
  if (lower.endsWith('.mp3')) return 'audio/mpeg'
  if (lower.endsWith('.wav')) return 'audio/wav'
  if (lower.endsWith('.m4a')) return 'audio/mp4'
  if (lower.endsWith('.zip')) return 'application/zip'
  return 'application/octet-stream'
}
