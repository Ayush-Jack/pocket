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
  const active = views.some((item) => item.id === view) ? view : 'all'
  const visible = files.filter((file) => file.status !== 'DELETED' && matchesView(file.mimeType, active))
  const media = active === 'documents' ? [] : visible.filter((file) => isMedia(file.mimeType))
  const documents = visible.filter((file) => !isMedia(file.mimeType))
  const title = views.find((item) => item.id === active)?.label ?? 'All files'
  const [opened, setOpened] = useState<DriveFile | null>(null)
  const shown = `${active}:${visible.map((file) => file.id).join(',')}`

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
      <header data-drive-rise="" className="clay flex flex-col gap-4 px-4 py-4 sm:px-6 sm:py-5 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <Logo className="h-11 w-11" />
          <div>
            <p className="font-[family-name:var(--font-mono)] text-xs text-[var(--muted)]">Your Files. Your Space</p>
            <h1 className="font-[family-name:var(--font-display)] text-2xl font-medium sm:text-3xl">{title}</h1>
          </div>
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

function UploadForm() {
  const router = useRouter()
  const [message, setMessage] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [chosen, setChosen] = useState<File[]>([])

  function addChosen(list: File[], input: HTMLInputElement) {
    const tooBig = list.filter((file) => file.size > MAX_UPLOAD_BYTES)
    const allowed = list.filter((file) => file.size > 0 && file.size <= MAX_UPLOAD_BYTES)
    if (tooBig.length > 0) {
      const names = tooBig.map((file) => `${file.name} (${formatSize(file.size)})`).join('\n')
      const text = `These files are larger than 2 GB, so they were not added:\n${names}`
      window.alert(text)
      setMessage(text)
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
    input.value = ''
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (saving) return
        if (chosen.length === 0) {
          setMessage('Choose a file to upload.')
          return
        }
        const files = chosen
        setSaving(true)
        void uploadFiles(files, setMessage).then((saved) => {
          if (saved > 0) {
            setChosen([])
            router.refresh()
          }
          setSaving(false)
        })
      }}
      className="clay flex w-full min-w-0 flex-col gap-3 px-3 py-3 sm:px-4"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <label className="min-w-0 flex-1 text-sm">
          <span className="sr-only">Choose files</span>
          <input
            name="file"
            type="file"
            multiple
            data-upload-input=""
            className="w-full max-w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-[var(--accent)] file:px-3.5 file:py-1.5 file:font-[family-name:var(--font-mono)] file:text-xs file:font-medium file:text-[var(--ink)] sm:text-base"
            onChange={(event) => {
              addChosen(Array.from(event.target.files ?? []), event.target)
            }}
          />
        </label>
        <button type="submit" disabled={saving || chosen.length === 0} className="clay-press w-full rounded-2xl bg-[var(--clay)] px-4 py-2 text-sm disabled:opacity-60 sm:w-auto">
          {saving ? 'Saving…' : chosen.length > 1 ? `Upload ${chosen.length}` : 'Upload'}
        </button>
      </div>
      {chosen.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {chosen.map((file) => (
            <li key={fileKey(file)} className="clay-pill flex max-w-full items-center gap-2 bg-[var(--accent)] px-3 py-1 text-sm">
              <span className="truncate">{file.name}</span>
              <button
                type="button"
                className="text-[var(--muted)]"
                aria-label={`Remove ${file.name}`}
                disabled={saving}
                onClick={() => setChosen((current) => current.filter((item) => fileKey(item) !== fileKey(file)))}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {message ? <p className="text-sm text-[var(--muted)]" role="alert">{message}</p> : null}
    </form>
  )
}

async function uploadFiles(files: File[], setMessage: (message: string) => void): Promise<number> {
  const failed: string[] = []
  let saved = 0
  for (let index = 0; index < files.length; index += 1) {
    const file = files[index]
    setMessage(`Saving ${file.name} (${index + 1} of ${files.length})…`)
    try {
      const response = await fetch('/files/upload', {
        method: 'POST',
        headers: { 'x-file-name': file.name },
        body: file,
      })
      const result = (await response.json()) as { ok?: boolean }
      if (result.ok) saved += 1
      else failed.push(file.name)
    } catch {
      failed.push(file.name)
    }
  }
  if (failed.length === 0) {
    setMessage(saved === 1 ? 'Saved in your account.' : `Saved ${saved} files.`)
  } else {
    setMessage(`Saved ${saved} of ${files.length}. ${failed.join(', ')} was not saved.`)
  }
  return saved
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

  return (
    <li className="clay live flex flex-col gap-3 p-5" style={{ background: cardTint(file.mimeType, view) }}>
      <div>
        <p className="break-all font-[family-name:var(--font-display)] text-lg font-medium">{file.name}</p>
        <p className="break-all font-[family-name:var(--font-mono)] text-xs text-[var(--muted)]">{file.id}</p>
      </div>
      <p className="text-sm text-[var(--muted)]">{file.mimeType}</p>
      <p className="font-[family-name:var(--font-mono)] text-sm">{formatSize(file.size)}</p>
      <p className="text-sm">{file.status}</p>
      <div className="flex gap-2">
        <a className="clay-pill bg-[var(--clay)] px-3 py-2 text-sm" href={`/files/${file.id}/download`}>
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
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}
