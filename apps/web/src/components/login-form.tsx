'use client'

import { useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/logo'
import type { AuthStatus } from '@/lib/drive-api'

export function LoginForm({ initial }: { initial: AuthStatus }) {
  const [status, setStatus] = useState(initial)
  const [value, setValue] = useState('')
  const [lastName, setLastName] = useState('')
  const [pending, setPending] = useState(false)
  const [resetting, setResetting] = useState(false)

  useEffect(() => {
    if (!status.ready) return
    window.location.assign('/drive')
  }, [status.ready])

  // Warm the TDLib sign-in session in the background without blocking initial page load.
  useEffect(() => {
    if (status.ready) return
    const controller = new AbortController()
    void fetch('/session?start=1', { signal: controller.signal, cache: 'no-store' })
      .then((response) => (response.ok ? (response.json() as Promise<AuthStatus>) : null))
      .then((next) => {
        if (!next) return
        if (next.ready) {
          window.location.assign('/drive')
          return
        }
        setStatus((current) => (current.step === 'starting' ? next : current))
      })
      .catch(() => {
        // Ignore aborts on quick navigation.
      })
    return () => controller.abort()
  }, [status.ready])

  // Only poll while TDLib is still initializing ('starting'), never in an overlapping loop.
  useEffect(() => {
    if (status.ready || status.step !== 'starting') return
    let cancelled = false
    let timer = 0
    const controller = new AbortController()

    const poll = async () => {
      try {
        const response = await fetch('/session?start=1', {
          signal: controller.signal,
          cache: 'no-store',
        })
        if (!response.ok || cancelled) return
        const next = (await response.json()) as AuthStatus
        if (cancelled) return
        if (next.ready) {
          window.location.assign('/drive')
          return
        }
        setStatus(next)
        if (next.step === 'starting') {
          timer = window.setTimeout(() => {
            void poll()
          }, 1200)
        }
      } catch {
        // Ignore aborted or transient poll errors.
      }
    }

    timer = window.setTimeout(() => {
      void poll()
    }, 900)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [status.ready, status.step])

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (pending || resetting) return
    setPending(true)
    try {
      const response = await fetch('/session', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(status.step === 'name' ? { firstName: value, lastName } : { value }),
      })
      const next = (await response.json()) as AuthStatus
      setStatus(next)
      setValue('')
      setLastName('')
      if (next.ready) window.location.assign('/drive')
    } catch {
      setStatus((current) => ({
        ...current,
        ok: false,
        message: 'Could not reach the server. Try again.',
      }))
    } finally {
      setPending(false)
    }
  }

  async function resetToPhoneStep() {
    if (pending || resetting) return
    setResetting(true)
    try {
      const response = await fetch('/session', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ reset: true }),
      })
      const next = (await response.json()) as AuthStatus
      setStatus(next)
      setValue('')
      setLastName('')
      void fetch('/session?start=1', { cache: 'no-store' }).catch(() => undefined)
    } catch {
      setStatus({
        ok: true,
        ready: false,
        step: 'phone',
        hint: null,
        delivery: null,
        retry: false,
      })
    } finally {
      setResetting(false)
    }
  }

  if (status.ready) return null

  const copy = promptFor(status)
  const canResetStep =
    status.step === 'code' ||
    status.step === 'password' ||
    status.step === 'email' ||
    status.step === 'emailCode' ||
    status.step === 'name'

  return (
    <section className="mx-auto flex w-full max-w-md flex-col gap-4 sm:gap-5">
      <div className="flex items-center justify-between gap-2">
        <Link
          href="/"
          className="clay-pill bg-[var(--clay)] px-3.5 py-2 font-[family-name:var(--font-mono)] text-xs font-medium text-[var(--ink)]"
        >
          ← Back to Home
        </Link>
        {canResetStep ? (
          <button
            type="button"
            disabled={pending || resetting}
            onClick={() => void resetToPhoneStep()}
            className="clay-pill bg-[var(--accent)] px-3.5 py-2 font-[family-name:var(--font-mono)] text-xs font-medium text-[var(--ink)] disabled:opacity-60"
          >
            {resetting ? 'Resetting…' : 'Change number'}
          </button>
        ) : null}
      </div>

      <header className="clay flex items-center gap-3 px-4 py-4 sm:px-6 sm:py-5">
        <Logo className="h-12 w-12 shrink-0 sm:h-14 sm:w-14" />
        <div className="min-w-0">
          <p className="truncate font-[family-name:var(--font-mono)] text-xs text-[var(--muted)]">Your Files. Your Space</p>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-medium sm:text-3xl">Sign in</h1>
        </div>
      </header>

      <form onSubmit={submit} className="clay flex flex-col gap-4 px-4 py-4 sm:px-6 sm:py-5">
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
            <div className="flex flex-col gap-2.5 sm:flex-row">
              {canResetStep ? (
                <button
                  type="button"
                  disabled={pending || resetting}
                  onClick={() => void resetToPhoneStep()}
                  className="clay-press rounded-2xl bg-[var(--field)] px-4 py-3 text-sm text-[var(--muted)] hover:text-[var(--ink)] disabled:opacity-60 sm:w-auto"
                >
                  ← Use another number
                </button>
              ) : null}
              <button
                type="submit"
                disabled={pending || resetting}
                className="clay-press flex-1 rounded-2xl bg-[var(--clay)] px-4 py-3 text-sm font-medium disabled:opacity-60"
              >
                {pending ? 'Checking…' : 'Continue'}
              </button>
            </div>
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
