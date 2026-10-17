'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function LogoutButton() {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  return (
    <button
      type="button"
      disabled={pending}
      className="clay-pill clay-press bg-[var(--peach)] px-4 py-3 text-sm disabled:opacity-60"
      onClick={() => {
        setPending(true)
        void fetch('/session', { method: 'DELETE' }).then(() => {
          router.push('/')
          router.refresh()
        })
      }}
    >
      {pending ? 'Signing out…' : 'Log out'}
    </button>
  )
}
