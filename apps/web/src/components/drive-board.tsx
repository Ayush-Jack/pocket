'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useFormStatus } from 'react-dom'
import { deleteAction } from '@/app/actions'
import { Logo } from '@/components/logo'
import { reducedMotion } from '@/components/smooth-scroll'
import type { Account, DriveFile } from '@/lib/drive-api'
import { MAX_UPLOAD_BYTES } from '@telegram-drive/types'
import gsap from 'gsap'

const views = [
  { id: 'all', label: 'All files' },
  { id: 'photos', label: 'Photos' },
  { id: 'videos', label: 'Videos' },
  { id: 'documents', label: 'Documents' },
] as const

export function DriveBoard({
  account,
  files,
  view,
}: {
  account: Account
  files: DriveFile[]
  view: string
}) {
  const router = useRouter()
  const active = views.some((item) => item.id === view) ? view : 'all'
  const visible = files.filter((file) => file.status !== 'DELETED' && matchesView(file.mimeType, active))
  const media = active === 'documents' ? [] : visible.filter((file) => isMedia(file.mimeType))
  const documents = visible.filter((file) => !isMedia(file.mimeType))
  const title = views.find((item) => item.id === active)?.label ?? 'All files'
  const [opened, setOpened] = useState<DriveFile | null>(null)
  const shown = `${active}:${visible.map((file) => file.id).join(',')}`

  useEffect(() => {
    const refreshOnFocus = () => {
      if (document.visibilityState === 'visible') {
        router.refresh()
      }
    }
    window.addEventListener('focus', refreshOnFocus)
    document.addEventListener('visibilitychange', refreshOnFocus)
    return () => {
      window.removeEventListener('focus', refreshOnFocus)
      document.removeEventListener('visibilitychange', refreshOnFocus)
    }
  }, [router])

  useEffect(() => {
    if (reducedMotion()) return
    const nodes = document.querySelectorAll<HTMLElement>('[data-drive-rise]')
    if (nodes.length === 0) return
    const tween = gsap.fromTo(
      nodes,
      { autoAlpha: 0, y: 16 },
      { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.035, overwrite: 'auto', clearProps: 'transform,opacity,visibility' },
    )
    return () => {
      tween.kill()
    }
  }, [shown])

  useEffect(() => {
    if (!opened || reducedMotion()) return
    const panel = document.querySelector('[data-viewer]')
    if (!panel) return
    const tween = gsap.fromTo(
      panel,
      { autoAlpha: 0, y: 14, scale: 0.98 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.45, ease: 'power3.out', clearProps: 'transform,opacity,visibility' },
    )
    return () => {
      tween.kill()
    }
  }, [opened])

  useEffect(() => {
    if (!opened) return
    const current = opened
    function onKey(event: KeyboardEvent) {
      if (isTypingTarget(event.target)) return
      if (event.key === 'Escape') {
        setOpened(null)
        return
      }
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
      const index = media.findIndex((file) => file.id === current.id)
      if (index < 0) return
      const next = media[event.key === 'ArrowRight' ? index + 1 : index - 1]
      if (!next) return
      event.preventDefault()
      setOpened(next)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [media, opened])

  return (
    <section className="flex flex-col gap-5">
      <header data-drive-rise="" className="clay flex flex-col gap-4 p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Logo className="h-11 w-11 shrink-0" />
            <div>
              <p className="font-[family-name:var(--font-mono)] text-xs text-[var(--muted)]">Your Files. Your Space</p>
              <h1 className="font-[family-name:var(--font-display)] text-2xl font-medium sm:text-3xl">{title}</h1>
            </div>
          </div>
          <span className="clay-pill bg-[var(--field)] px-3 py-1.5 font-[family-name:var(--font-mono)] text-xs text-[var(--muted)]">
            {visible.length === 1 ? '1 item' : `${visible.length} items`}
          </span>
        </div>
        <UploadForm />
      </header>

      {visible.length === 0 ? (
        <p data-drive-rise="" className="clay px-6 py-8 text-[var(--muted)]">Nothing is in this view yet. Upload a file to keep it in your account.</p>
      ) : (
        <>
          {media.length > 0 ? (
            <ul className="columns-1 gap-3 min-[420px]:columns-2 md:columns-3 xl:columns-4">
              {media.map((file) => (
                <MediaTile key={file.id} file={file} onOpen={() => setOpened(file)} />
              ))}
            </ul>
          ) : null}
          {documents.length > 0 ? (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {documents.map((file) => (
                <FileCard key={file.id} file={file} view={active} />
              ))}
            </ul>
          ) : null}
        </>
      )}
      {opened ? <MediaViewer file={opened} onClose={() => setOpened(null)} /> : null}
    </section>
  )
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable
}

function isMedia(mimeType: string): boolean {
  return mimeType.startsWith('image/') || mimeType.startsWith('video/')
}

function matchesView(mimeType: string, view: string): boolean {
  if (view === 'photos') return mimeType.startsWith('image/')
  if (view === 'videos') return mimeType.startsWith('video/')
  if (view === 'documents') return !mimeType.startsWith('image/') && !mimeType.startsWith('video/')
  return true
}

function cardTint(mimeType: string, view: string): string {
  if (view === 'photos' || mimeType.startsWith('image/')) return 'var(--lilac)'
  if (view === 'videos' || mimeType.startsWith('video/')) return 'var(--mint)'
  if (view === 'documents') return 'var(--peach)'
  return 'var(--clay)'
}

function fileKey(file: File): string {
  return `${file.name}:${file.size}:${file.lastModified}`
}

type QueuedStatus = 'ready' | 'saving' | 'saved' | 'failed'

function UploadForm() {
  const router = useRouter()
  const [message, setMessage] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [chosen, setChosen] = useState<File[]>([])
  const [fileState, setFileState] = useState<Record<string, QueuedStatus>>({})

  function openPicker() {
    if (saving) return
    document.querySelector<HTMLInputElement>('[data-upload-input]')?.click()
  }

  function addChosen(list: File[], input?: HTMLInputElement) {
    const tooBig = list.filter((file) => file.size > MAX_UPLOAD_BYTES)
    const allowed = list.filter((file) => file.size > 0 && file.size <= MAX_UPLOAD_BYTES)
    if (tooBig.length > 0) {
      const names = tooBig.map((file) => `${file.name} (${formatSize(file.size)})`).join('\n')
      const text = `These files are larger than 2 GB, so they were not added:\n${names}`
      window.alert(text)
      setMessage(text)
    } else {
      setMessage(null)
    }
    setChosen((current) => {
      const seen = new Set(current.map(fileKey))
      const next = [...current]
      for (const file of allowed) {
        const key = fileKey(file)
        if (seen.has(key)) continue
        seen.add(key)
        next.push(file)
      }
      return next
    })
    setFileState((current) => {
      const next = { ...current }
      for (const file of allowed) {
        const key = fileKey(file)
        if (!next[key]) next[key] = 'ready'
      }
      return next
    })
    if (input) input.value = ''
  }

  const totalBytes = chosen.reduce((sum, file) => sum + file.size, 0)
  const doneCount = chosen.filter((file) => fileState[fileKey(file)] === 'saved').length

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (saving) return
        if (chosen.length === 0) {
          openPicker()
          return
        }
        const files = chosen
        setSaving(true)
        void uploadFiles(files, setMessage, (key, status) => {
          setFileState((current) => ({ ...current, [key]: status }))
        }).then(({ saved, failedKeys }) => {
          if (saved > 0) {
            router.refresh()
          }
          if (failedKeys.length === 0) {
            setChosen([])
            setFileState({})
          } else {
            const failedSet = new Set(failedKeys)
            setChosen((current) => current.filter((file) => failedSet.has(fileKey(file))))
          }
          setSaving(false)
        })
      }}
      onDragOver={(event) => {
        event.preventDefault()
        if (!saving) setDragging(true)
      }}
      onDragLeave={(event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) return
        setDragging(false)
      }}
      onDrop={(event) => {
        event.preventDefault()
        setDragging(false)
        if (saving) return
        const dropped = Array.from(event.dataTransfer.files ?? [])
        if (dropped.length > 0) addChosen(dropped)
      }}
      className="flex w-full min-w-0 flex-col gap-3"
    >
      <input
        name="file"
        type="file"
        multiple
        data-upload-input=""
        className="sr-only"
        onChange={(event) => {
          addChosen(Array.from(event.target.files ?? []), event.target)
        }}
      />

      {chosen.length === 0 ? (
        <div
          role="button"
          tabIndex={0}
          onClick={openPicker}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              openPicker()
            }
          }}
          className={`clay-well-sm flex flex-col gap-3 p-3.5 transition-all sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4 ${
            dragging ? 'ring-2 ring-[#7c92ea] brightness-[1.02]' : 'hover:brightness-[1.01]'
          }`}
        >
          <div className="flex min-w-0 items-center gap-3.5">
            <span
              className="clay-pill flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent)] text-[var(--ink)]"
              aria-hidden="true"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 16V4" />
                <path d="m7 9 5-5 5 5" />
                <path d="M20 16.5v1.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1.5" />
              </svg>
            </span>
            <div className="min-w-0">
              <p className="font-[family-name:var(--font-display)] text-base font-medium leading-snug text-[var(--ink)] sm:text-lg">
                {dragging ? 'Drop files to add them to Pocket' : 'Drop files here, or choose from your device'}
              </p>
              <p className="mt-0.5 font-[family-name:var(--font-mono)] text-[11px] text-[var(--muted)] sm:text-xs">
                Photos, videos, and documents · Up to 2 GB per file · Press U
              </p>
            </div>
          </div>

          <span className="clay-pill clay-press shrink-0 justify-center bg-[var(--clay)] px-4 py-2.5 font-[family-name:var(--font-display)] text-sm font-medium text-[var(--ink)] sm:px-5">
            Choose files
          </span>
        </div>
      ) : (
        <div
          className={`clay-well-sm flex flex-col gap-3.5 p-3.5 sm:p-4 ${
            dragging ? 'ring-2 ring-[#7c92ea]' : ''
          }`}
        >
          <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="clay-pill bg-[var(--accent)] px-2.5 py-1 font-[family-name:var(--font-mono)] text-xs font-medium text-[var(--ink)]">
                {saving
                  ? `${doneCount}/${chosen.length} saved`
                  : chosen.length === 1
                    ? '1 file ready'
                    : `${chosen.length} files ready`}
              </span>
              <span className=" truncate font-[family-name:var(--font-mono)] text-xs text-[var(--muted)]">
                {formatSize(totalBytes)} total
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={openPicker}
                className="clay-pill bg-[var(--clay)] px-3.5 py-2 font-[family-name:var(--font-mono)] text-xs font-medium text-[var(--ink)] disabled:opacity-50"
              >
                + Add more
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  setChosen([])
                  setFileState({})
                  setMessage(null)
                }}
                className="clay-pill bg-[var(--clay)] px-3.5 py-2 font-[family-name:var(--font-mono)] text-xs text-[var(--muted)] hover:text-[var(--ink)] disabled:opacity-50"
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={saving}
                className="clay-pill clay-press flex-1 justify-center bg-[var(--accent)] px-5 py-2 font-[family-name:var(--font-display)] text-sm font-medium text-[var(--ink)] disabled:opacity-60 sm:flex-initial"
              >
                {saving
                  ? 'Uploading…'
                  : chosen.length === 1
                    ? 'Upload file'
                    : `Upload ${chosen.length} files`}
              </button>
            </div>
          </div>

          <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {chosen.map((file) => {
              const key = fileKey(file)
              const status = fileState[key] ?? 'ready'
              return (
                <QueuedFileItem
                  key={key}
                  file={file}
                  status={status}
                  saving={saving}
                  onRemove={() => {
                    setChosen((current) => current.filter((item) => fileKey(item) !== key))
                    setFileState((current) => {
                      const next = { ...current }
                      delete next[key]
                      return next
                    })
                  }}
                />
              )
            })}
          </ul>
        </div>
      )}

      {message ? (
        <p className="px-1 font-[family-name:var(--font-mono)] text-xs text-[var(--muted)]" role="alert">
          {message}
        </p>
      ) : null}
    </form>
  )
}

function QueuedFileItem({
  file,
  status,
  saving,
  onRemove,
}: {
  file: File
  status: QueuedStatus
  saving: boolean
  onRemove: () => void
}) {
  const [thumb, setThumb] = useState<string | null>(null)
  const meta = describeQueuedFile(file)

  useEffect(() => {
    if (!file.type.toLowerCase().startsWith('image/')) {
      setThumb(null)
      return
    }
    const url = URL.createObjectURL(file)
    setThumb(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  return (
    <li className="clay flex min-w-0 items-center justify-between gap-3 rounded-2xl px-3.5 py-2.5">
      <div className="flex min-w-0 items-center gap-3">
        {thumb ? (
          <img
            src={thumb}
            alt=""
            className="h-11 w-11 shrink-0 rounded-xl object-cover"
          />
        ) : (
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-[family-name:var(--font-mono)] text-[10px] font-semibold tracking-wider text-[var(--ink)]"
            style={{ background: meta.tint }}
          >
            {meta.badge}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate font-[family-name:var(--font-display)] text-sm font-medium text-[var(--ink)]">
            {file.name}
          </p>
          <p className="mt-0.5 truncate font-[family-name:var(--font-mono)] text-[11px] text-[var(--muted)]">
            {formatSize(file.size)} · {statusLabel(status, meta.kind)}
          </p>
        </div>
      </div>

      {saving ? (
        <span
          className="shrink-0 rounded-full px-2.5 py-1 font-[family-name:var(--font-mono)] text-[10px] font-medium text-[var(--ink)]"
          style={{
            background:
              status === 'saved'
                ? 'var(--mint)'
                : status === 'saving'
                  ? 'var(--accent)'
                  : status === 'failed'
                    ? 'var(--peach)'
                    : 'var(--field)',
          }}
        >
          {status === 'saved'
            ? 'Saved'
            : status === 'saving'
              ? 'Saving…'
              : status === 'failed'
                ? 'Retry'
                : 'Queued'}
        </span>
      ) : (
        <button
          type="button"
          className="clay-press flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--field)] font-[family-name:var(--font-mono)] text-sm leading-none text-[var(--muted)] hover:text-[var(--ink)]"
          aria-label={`Remove ${file.name}`}
          onClick={onRemove}
        >
          ×
        </button>
      )}
    </li>
  )
}

function describeQueuedFile(file: File): { badge: string; kind: string; tint: string } {
  const type = file.type.toLowerCase()
  const ext = file.name.includes('.') ? file.name.split('.').pop()?.toUpperCase() ?? '' : ''
  if (type.startsWith('image/')) {
    return { badge: ext.slice(0, 4) || 'IMG', kind: 'Photo', tint: 'var(--lilac)' }
  }
  if (type.startsWith('video/')) {
    return { badge: ext.slice(0, 4) || 'VID', kind: 'Video', tint: 'var(--mint)' }
  }
  if (type.startsWith('audio/')) {
    return { badge: ext.slice(0, 4) || 'AUD', kind: 'Audio', tint: 'var(--accent)' }
  }
  return { badge: ext.slice(0, 4) || 'FILE', kind: 'Document', tint: 'var(--peach)' }
}

function statusLabel(status: QueuedStatus, kind: string): string {
  if (status === 'saving') return 'Uploading to Telegram…'
  if (status === 'saved') return 'Saved in Pocket'
  if (status === 'failed') return 'Could not upload'
  return kind
}

async function uploadFiles(
  files: File[],
  setMessage: (message: string | null) => void,
  onStatus: (key: string, status: QueuedStatus) => void,
): Promise<{ saved: number; failedKeys: string[] }> {
  const failed: string[] = []
  const failedKeys: string[] = []
  let saved = 0
  const direct = await readDirectTarget()

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index]
    const key = fileKey(file)
    onStatus(key, 'saving')
    setMessage(`Saving ${file.name} (${index + 1} of ${files.length})…`)
    const ok = await uploadSingleFileWithRetry(file, direct)
    if (ok) {
      saved += 1
      onStatus(key, 'saved')
    } else {
      failed.push(file.name)
      failedKeys.push(key)
      onStatus(key, 'failed')
    }
    if (index < files.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 350))
    }
  }
  if (failed.length === 0) {
    setMessage(saved === 1 ? 'Saved in your account.' : `Saved ${saved} files in your account.`)
  } else {
    setMessage(`Saved ${saved} of ${files.length}. ${failed.join(', ')} was not saved — click Upload to retry.`)
  }
  return { saved, failedKeys }
}

async function readDirectTarget(): Promise<{ uploadUrl: string; ticket: string } | null> {
  try {
    const response = await fetch('/files/upload', { cache: 'no-store' })
    if (!response.ok) return null
    const data = (await response.json()) as { ok?: boolean; uploadUrl?: string; ticket?: string }
    if (!data.ok || !data.uploadUrl || !data.ticket) return null
    if (typeof window !== 'undefined') {
      const parsed = new URL(data.uploadUrl)
      const isLoopback = parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost'
      const pageLoopback = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'
      if (isLoopback && !pageLoopback) return null
    }
    return { uploadUrl: data.uploadUrl, ticket: data.ticket }
  } catch {
    return null
  }
}

async function uploadSingleFileWithRetry(
  file: File,
  direct: { uploadUrl: string; ticket: string } | null,
): Promise<boolean> {
  const safeHeaderName = encodeURIComponent(file.name)
  for (let attempt = 0; attempt < 2; attempt += 1) {
    if (direct) {
      try {
        const directResponse = await fetch(direct.uploadUrl, {
          method: 'POST',
          headers: {
            'x-file-name': safeHeaderName,
            'x-upload-ticket': direct.ticket,
          },
          body: file,
        })
        const directJson = (await directResponse.json()) as { ok?: boolean }
        if (directJson.ok) return true
      } catch {
        // Fall through to same-origin proxy on network/CORS errors.
      }
    }

    try {
      const proxyResponse = await fetch('/files/upload', {
        method: 'POST',
        headers: { 'x-file-name': safeHeaderName },
        body: file,
      })
      const proxyJson = (await proxyResponse.json()) as { ok?: boolean }
      if (proxyJson.ok) return true
    } catch {
      // Retry on transient disconnect.
    }

    if (attempt === 0) {
      await new Promise((resolve) => setTimeout(resolve, 900))
    }
  }
  return false
}

function MediaTile({ file, onOpen }: { file: DriveFile; onOpen: () => void }) {
  const [failed, setFailed] = useState(false)
  const video = file.mimeType.startsWith('video/')
  const src = `/files/${file.id}/preview`

  return (
    <li data-drive-rise="" className="clay mb-3 break-inside-avoid overflow-hidden p-2">
      <div
        role="button"
        tabIndex={0}
        aria-label={file.name}
        onClick={onOpen}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onOpen()
          }
        }}
        className="relative block w-full cursor-pointer overflow-hidden rounded-[22px]"
      >
        {failed ? (
          <span className="flex h-40 items-center justify-center px-3 text-sm text-[var(--muted)]">{file.name}</span>
        ) : video ? (
          <video
            src={src}
            muted
            playsInline
            preload="metadata"
            className="pointer-events-none block h-auto w-full"
            onError={() => setFailed(true)}
          />
        ) : (
          <img src={src} alt="" className="block h-auto w-full" onError={() => setFailed(true)} />
        )}
        {video && !failed ? (
          <span className="clay-pill pointer-events-none absolute bottom-3 left-3 bg-[var(--clay)] px-2 py-1 text-xs">Play</span>
        ) : null}
      </div>
    </li>
  )
}

function MediaViewer({ file, onClose }: { file: DriveFile; onClose: () => void }) {
  const [message, setMessage] = useState<string | null>(null)
  const video = file.mimeType.startsWith('video/')
  const src = `/files/${file.id}/preview`

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-[rgba(62,74,92,0.28)] p-2 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={file.name}>
      <div data-viewer="" className="clay max-h-[94vh] w-full max-w-4xl overflow-auto p-3 sm:p-4">
        {video ? (
          <video src={src} controls playsInline className="max-h-[58vh] w-full rounded-[22px] bg-black sm:max-h-[72vh]" />
        ) : (
          <img src={src} alt={file.name} className="max-h-[58vh] w-full rounded-[22px] object-contain sm:max-h-[72vh]" />
        )}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="truncate font-[family-name:var(--font-display)] text-lg font-medium">{file.name}</p>
            <p className="font-[family-name:var(--font-mono)] text-sm text-[var(--muted)]">{formatSize(file.size)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a className="clay-pill bg-[var(--accent)] px-4 py-2 text-sm" href={`/files/${file.id}/download`}>
              Download
            </a>
            <form
              action={async (formData) => {
                const result = await deleteAction(formData)
                setMessage(result.message)
                if (result.ok) onClose()
              }}
            >
              <input type="hidden" name="id" value={file.id} />
              <DeleteButton />
            </form>
            <button type="button" onClick={onClose} className="clay-pill bg-[var(--clay)] px-4 py-2 text-sm">
              Close
            </button>
          </div>
        </div>
        {message ? <p className="mt-3 text-sm text-[var(--muted)]">{message}</p> : null}
      </div>
    </div>
  )
}

function FileCard({ file, view }: { file: DriveFile; view: string }) {
  const [message, setMessage] = useState<string | null>(null)
  const ext = file.name.includes('.') ? file.name.split('.').pop()?.toUpperCase().slice(0, 4) || 'FILE' : 'FILE'

  return (
    <li data-drive-rise="" className="clay live flex min-w-0 flex-col justify-between gap-4 overflow-hidden p-5" style={{ background: cardTint(file.mimeType, view) }}>
      <div className="flex min-w-0 items-start gap-3.5">
        <span className="clay-pill flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--clay)] font-[family-name:var(--font-mono)] text-[10px] font-semibold tracking-wider text-[var(--ink)]">
          {ext}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-[family-name:var(--font-display)] text-lg font-medium leading-snug text-[var(--ink)] [overflow-wrap:anywhere]">
            {file.name}
          </p>
          <p className="mt-1 truncate font-[family-name:var(--font-mono)] text-xs text-[var(--muted)]">
            {formatSize(file.size)} · Saved in Telegram
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <a className="clay-pill bg-[var(--clay)] px-3.5 py-2 text-sm font-medium" href={`/files/${file.id}/download`}>
          Download
        </a>
        <form
          action={async (formData) => {
            const result = await deleteAction(formData)
            setMessage(result.message)
          }}
        >
          <input type="hidden" name="id" value={file.id} />
          <DeleteButton />
        </form>
      </div>
      {message ? <p className="text-sm text-[var(--muted)]">{message}</p> : null}
    </li>
  )
}

function DeleteButton() {
  const status = useFormStatus()
  return (
    <button type="submit" disabled={status.pending} className="clay-pill clay-press bg-[var(--clay)] px-3 py-2 text-sm disabled:opacity-60">
      {status.pending ? 'Deleting…' : 'Delete'}
    </button>
  )
}

function formatSize(size: number): string {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`
  return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`
}
