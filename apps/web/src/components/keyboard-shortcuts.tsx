'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { riseIn } from '@/components/smooth-scroll'

const sections = [
  { key: '1', href: '/drive', label: 'All files' },
  { key: '2', href: '/drive?view=photos', label: 'Photos' },
  { key: '3', href: '/drive?view=videos', label: 'Videos' },
  { key: '4', href: '/drive?view=documents', label: 'Documents' },
  { key: '5', href: '/settings', label: 'Settings' },
  { key: '6', href: '/developer', label: 'Developer' },
] as const

const extra = [
  { key: 'U', label: 'Choose files to upload' },
  { key: '← →', label: 'Previous or next open photo' },
  { key: 'Esc', label: 'Close the open photo or this list' },
  { key: '?', label: 'Show or hide shortcuts' },
] as const

export function KeyboardShortcuts() {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    riseIn(document.querySelector('[data-shortcuts]'))
  }, [open])

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (isTyping(event.target)) return
      if (event.key === '?' || (event.shiftKey && event.key === '/')) {
        event.preventDefault()
        setOpen((current) => !current)
        return
      }
      if (event.key === 'Escape' && open) {
        event.stopPropagation()
        setOpen(false)
        return
      }
      if (open) return
      const section = sections.find((item) => item.key === event.key)
      if (section) {
        event.preventDefault()
        router.push(section.href)
        return
      }
      if (event.key === 'u' || event.key === 'U') {
        event.preventDefault()
        document.querySelector<HTMLInputElement>('[data-upload-input]')?.click()
      }
    }

    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [open, router])

  return (
    <>
      <button type="button" className="clay-pill shrink-0 px-4 py-2.5 text-left text-sm lg:w-full lg:py-3" onClick={() => setOpen(true)}>
        Shortcuts <kbd className="font-[family-name:var(--font-mono)]">?</kbd>
      </button>
      {open ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(62,74,92,0.28)] p-4" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts">
          <div data-shortcuts="" className="clay w-full max-w-md p-6">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-medium">Shortcuts</h2>
            <ul className="mt-4 flex flex-col gap-2">
              {sections.map((item) => (
                <ShortcutRow key={item.key} shortcut={item.key} label={item.label} />
              ))}
              {extra.map((item) => (
                <ShortcutRow key={item.key} shortcut={item.key} label={item.label} />
              ))}
            </ul>
            <button type="button" className="clay-pill mt-5 bg-[var(--clay)] px-4 py-2 text-sm" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
        </div>
      ) : null}
    </>
  )
}

function ShortcutRow({ shortcut, label }: { shortcut: string; label: string }) {
  return (
    <li className="flex items-center justify-between gap-3 text-sm">
      <span>{label}</span>
      <kbd className="clay-pill bg-[var(--accent)] px-3 py-1 font-[family-name:var(--font-mono)] text-xs">{shortcut}</kbd>
    </li>
  )
}

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable
}
