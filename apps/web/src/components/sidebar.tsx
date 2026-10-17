'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { KeyboardShortcuts } from '@/components/keyboard-shortcuts'
import { Logo } from '@/components/logo'

const links = [
  { href: '/', label: 'All files', tint: 'var(--accent)' },
  { href: '/?view=photos', label: 'Photos', tint: 'var(--lilac)' },
  { href: '/?view=videos', label: 'Videos', tint: 'var(--mint)' },
  { href: '/?view=documents', label: 'Documents', tint: 'var(--peach)' },
]

const bottomLinks = [
  { href: '/developer', label: 'Developer', tint: 'var(--lilac)' },
  { href: '/settings', label: 'Settings', tint: 'var(--accent)' },
]

export function Sidebar() {
  const pathname = usePathname()
  const search = useSearchParams().toString()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
  }, [pathname, search])

  return (
    <aside data-rise-once="" className="clay flex flex-col gap-3 overflow-hidden p-3 sm:p-4 lg:sticky lg:top-8 lg:h-[calc(100svh-4rem)] lg:p-5">
      <div className="flex items-center gap-3">
        <Logo className="h-12 w-12 sm:h-14 sm:w-14" />
        <div className="min-w-0 flex-1">
          <p className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--muted)] sm:text-xs">Your Files. Your Space</p>
          <p className="font-[family-name:var(--font-display)] text-2xl font-medium leading-none sm:text-3xl">Pocket</p>
        </div>
        <button
          type="button"
          className="clay-press flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--clay)] lg:hidden"
          aria-expanded={open}
          aria-controls="drive-sections"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((current) => !current)}
        >
          <span className="flex w-5 flex-col gap-1.5" aria-hidden="true">
            <span className="h-0.5 w-full rounded-full bg-[var(--ink)]" />
            <span className="h-0.5 w-full rounded-full bg-[var(--ink)]" />
            <span className="h-0.5 w-full rounded-full bg-[var(--ink)]" />
          </span>
        </button>
      </div>
      <nav
        id="drive-sections"
        className={`${open ? 'flex' : 'hidden'} min-h-0 flex-col gap-2 lg:flex lg:flex-1`}
        aria-label="Drive sections"
      >
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="clay-pill w-full px-4 py-3 text-sm"
            style={{ background: link.tint }}
            onClick={() => setOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        <div className="flex flex-col gap-2 pt-2 lg:mt-auto lg:pt-4">
          <KeyboardShortcuts />
          {bottomLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="clay-pill w-full px-4 py-3 text-sm"
              style={{ background: link.tint }}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </aside>
  )
}
