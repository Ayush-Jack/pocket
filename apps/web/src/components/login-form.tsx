'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { Logo } from '@/components/logo'
import type { AuthStatus } from '@/lib/drive-api'

export function LoginForm({ initial }: { initial: AuthStatus }) {
  const [status, setStatus] = useState(initial)
  const [value, setValue] = useState('')
  const [lastName, setLastName] = useState('')
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (!status.ready) return
    window.location.assign('/drive')
  }, [status.ready])

  useEffect(() => {
    if (status.ready) return
    const timer = window.setInterval(() => {
      void fetch('/session')
        .then((response) => response.json() as Promise<AuthStatus>)
        .then((next) => {
          if (next.ready) {
            window.location.assign('/drive')
            return
          }
          setStatus((current) => {
            if (next.step !== current.step) {
              setValue('')
              setLastName('')
            }
            return next
          })
        })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [status.ready])

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (pending) return
    setPending(true)
    const response = await fetch('/session', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(status.step === 'name' ? { firstName: value, lastName } : { value }),
    })
    const next = (await response.json()) as AuthStatus
    setStatus(next)
    setValue('')
    setLastName('')
    setPending(false)
    if (next.ready) window.location.assign('/drive')
  }

  if (status.ready) return null

  const copy = promptFor(status)

  return (
    <section className="mx-auto flex w-full max-w-md flex-col gap-5">
      <header className="clay flex items-center gap-3 px-6 py-5">
        <Logo className="h-14 w-14" />
        <div>
          <p className="font-[family-name:var(--font-mono)] text-xs text-[var(--muted)]">Your Files. Your Space</p>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-medium">Sign in</h1>
        </div>
      </header>
      <form onSubmit={submit} className="clay flex flex-col gap-4 px-6 py-5">
        <p className="text-[var(--muted)]">{copy.label}</p>
        {status.step === 'offline' || status.step === 'starting' ? null : (
          <>
            <label className="text-sm">
              <span className="sr-only">{copy.field}</span>
              <input
                value={value}
                onChange={(event) => setValue(event.target.value)}
                type={status.step === 'password' ? 'password' : 'text'}
                autoComplete={status.step === 'password' ? 'current-password' : 'one-time-code'}
                required
                className="clay-pill w-full bg-[var(--accent)] px-4 py-3"
                placeholder={copy.field}
              />
            </label>
            {status.step === 'name' ? (
              <input
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                className="clay-pill w-full bg-[var(--accent)] px-4 py-3"
                placeholder="Last name"
              />
            ) : null}
            <button type="submit" disabled={pending} className="clay-press rounded-2xl bg-[var(--clay)] px-4 py-3 text-sm disabled:opacity-60">
              {pending ? 'Checking…' : 'Continue'}
            </button>
          </>
        )}
        {status.retry ? <p className="text-sm" role="alert">That was not accepted. Try again.</p> : null}
        {status.message ? <p className="text-sm text-[var(--muted)]" role="alert">{status.message}</p> : null}
      </form>
    </section>
  )
}

function promptFor(status: AuthStatus): { label: string; field: string } {
  if (status.step === 'phone') return { label: 'Enter your phone number, including the country code.', field: '+91...' }
  if (status.step === 'code') return { label: `Enter the code from ${status.delivery ?? 'Telegram'}.`, field: 'Code' }
  if (status.step === 'password') return { label: status.hint ? `Enter your password. Hint: ${status.hint}` : 'Enter your password.', field: 'Password' }
  if (status.step === 'email') return { label: 'Enter the email Telegram asked for.', field: 'Email' }
  if (status.step === 'emailCode') return { label: 'Enter the code sent to your email.', field: 'Email code' }
  if (status.step === 'name') return { label: 'This number is new to Telegram. Add your name.', field: 'First name' }
  if (status.step === 'offline') return { label: status.message ?? 'The drive API is not running.', field: '' }
  return { label: 'Connecting to Telegram…', field: '' }
}
