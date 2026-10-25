'use client'

import { useState, type MouseEvent } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/logo'
import { PointerHighlight } from '@/components/ui/pointer-highlight'

const profiles = [
  {
    href: 'https://github.com/Ayush-Jack',
    label: 'GitHub',
    handle: '@Ayush-Jack',
    tint: 'var(--lilac)',
    icon: <GitHubIcon />,
  },
  {
    href: 'https://www.linkedin.com/in/ayush-srivastava0110/',
    label: 'LinkedIn',
    handle: 'ayush-srivastava0110',
    tint: 'var(--mint)',
    icon: <LinkedInIcon />,
  },
  {
    href: 'https://www.ayushsrivastava.me/',
    label: 'Portfolio',
    handle: 'ayushsrivastava.me',
    tint: 'var(--peach)',
    icon: <PortfolioIcon />,
  },
] as const

// const philosophyCards = [
//   {
//     index: '01',
//     tag: 'CRAFT',
//     title: 'Simplicity First',
//     body: 'Technology should make everyday tasks easier, not more complicated. Every screen in Pocket is pared back to what helps you find, preview, and keep your files.',
//     tint: 'var(--accent)',
//   },
//   {
//     index: '02',
//     tag: 'RESPECT',
//     title: 'Thoughtful Handling',
//     body: 'Personal files deserve careful handling, isolated browser sessions, and clear data practices—with your files stored directly in your own Telegram Saved Messages.',
//     tint: 'var(--lilac)',
//   },
//   {
//     index: '03',
//     tag: 'ITERATION',
//     title: 'Built to Improve',
//     body: 'Every iteration is an opportunity to make Pocket more useful, reliable, and intuitive—learning from real use and refining one step at a time.',
//     tint: 'var(--mint)',
//   },
// ] as const

export function DeveloperShowcase({ signedIn = false }: { signedIn?: boolean }) {
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 })

  function onMove(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const px = (event.clientX - rect.left) / rect.width - 0.5
    const py = (event.clientY - rect.top) / rect.height - 0.5
    setTilt({
      rx: Number((-py * 8).toFixed(2)),
      ry: Number((px * 10).toFixed(2)),
    })
  }

  function onLeave() {
    setTilt({ rx: 0, ry: 0 })
  }

  return (
    <div className="ambient-field min-h-screen">
      {/* Top Bar */}
      <header className="sticky top-2 z-30 mx-auto w-full max-w-6xl px-3 pt-1.5 sm:top-3 sm:px-6 sm:pt-2 lg:px-8">
        <div className="clay flex items-center justify-between gap-3 bg-[var(--clay)]/90 px-3.5 py-2.5 backdrop-blur-md sm:px-5 sm:py-3">
          <Link href="/" className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <Logo className="h-9 w-9 shrink-0 sm:h-10 sm:w-10" />
            <div className="min-w-0">
              <p className="truncate font-[family-name:var(--font-display)] text-base font-medium leading-none sm:text-lg">
                Pocket
              </p>
              <p className="mt-0.5 truncate font-[family-name:var(--font-mono)] text-[9px] text-[var(--muted)] sm:text-[10px]">
                Developer Page
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href={signedIn ? '/drive' : '/'}
              className="clay-pill bg-[var(--clay)] px-3.5 py-2 font-[family-name:var(--font-mono)] text-xs text-[var(--ink)] sm:px-4"
            >
              {signedIn ? '← Back to Drive' : '← Home'}
            </Link>
            {!signedIn ? (
              <Link
                href="/login"
                className="clay-pill bg-[var(--accent)] px-3.5 py-2 text-xs font-medium whitespace-nowrap sm:px-5 sm:text-sm"
              >
                Register / Login
              </Link>
            ) : null}
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-8 sm:gap-16 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        {/* 1. Hero Section — Meet the Developer */}
        <section className="land-well p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:gap-9">
            {/* Left: Interactive 3D Portrait Pass */}
            <div
              onMouseMove={onMove}
              onMouseLeave={onLeave}
              style={{ perspective: '1000px' }}
              className="flex"
            >
              <div
                style={{
                  transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
                  transition:
                    tilt.rx === 0 && tilt.ry === 0
                      ? 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)'
                      : 'transform 0.12s ease-out',
                }}
                className="clay relative flex w-full flex-col justify-between overflow-hidden rounded-[30px] p-3.5 sm:p-4"
              >
                <div className="mb-3 flex items-center justify-between gap-2 px-1">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#5569dc]" />
                    <span className="font-[family-name:var(--font-mono)] text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink)]">
                      MEET THE DEVELOPER
                    </span>
                  </div>
                  <span className="clay-pill bg-[var(--accent)] px-2.5 py-0.5 font-[family-name:var(--font-mono)] text-[10px] font-medium text-[var(--ink)]">
                    BUILDER
                  </span>
                </div>

                <div className="clay-well-sm relative overflow-hidden rounded-[24px] p-2">
                  <div className="relative overflow-hidden rounded-[18px] bg-[#1e2633]">
                    <img
                      src="/developer.jpg"
                      alt="Ayush Srivastava"
                      className="h-72 w-full object-cover object-[center_16%] contrast-[1.04] transition-transform duration-500 hover:scale-[1.03] sm:h-80 lg:h-[360px]"
                    />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#171e29]/90 via-[#171e29]/35 to-transparent p-4 text-[#F6F8FC]">
                      <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.18em] text-[#D9E0FF]">
                        DEVELOPER BEHIND POCKET
                      </p>
                      <p className="mt-0.5 font-[family-name:var(--font-display)] text-2xl font-medium leading-tight">
                        Ayush Srivastava
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2 px-1 pt-0.5">
                  <div className="flex items-center gap-2">
                    <Logo className="h-6 w-6 shrink-0" />
                    <span className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--muted)]">
                      Pocket - Your files · Your space
                    </span>
                  </div>
                  <span className="font-[family-name:var(--font-mono)] text-[10px] text-[var(--muted)]">
                    IN
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Hero Copy + Socials */}
            <div className="flex min-w-0 flex-col justify-between gap-5">
              <div className="clay flex flex-col gap-4 rounded-[30px] p-5 sm:p-8">
                <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                  01 · Meet the Developer
                </p>

                <h1 className="font-[family-name:var(--font-display)] text-3xl font-medium leading-[1.06] tracking-[-0.025em] text-[var(--ink)] sm:text-5xl">
                  Built with curiosity. Designed for{' '}
                  <PointerHighlight
                    rectangleClassName="rounded-md border-[#c5cef8] bg-[var(--accent)]"
                    pointerClassName="h-4 w-4 text-[#5569dc]"
                    containerClassName="inline-block"
                  >
                    <span className="relative z-10 italic">simplicity</span>
                  </PointerHighlight>
                  .
                </h1>

                <p className="font-[family-name:var(--font-display)] text-lg font-medium text-[var(--ink)] sm:text-xl">
                  Hey, I&apos;m Ayush Srivastava, the developer behind Pocket.
                </p>

                <p className="text-sm leading-relaxed text-[var(--muted)] sm:text-base">
                  I built Pocket with a simple idea in mind: managing personal files should be effortless. By combining the familiarity of Telegram with a clean file-management experience, I&apos;m working to make storing and organizing files simpler.
                </p>
              </div>

              {/* Direct Profile Links */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {profiles.map((profile) => (
                  <a
                    key={profile.href}
                    href={profile.href}
                    target="_blank"
                    rel="noreferrer"
                    className="clay live group flex items-center justify-between gap-3 rounded-2xl p-3.5 transition-all sm:p-4"
                    style={{ background: profile.tint }}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="clay-pill flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--clay)] text-[var(--ink)]">
                        {profile.icon}
                      </span>
                      <div className="min-w-0">
                        <p className="font-[family-name:var(--font-display)] text-base font-medium leading-none text-[var(--ink)]">
                          {profile.label}
                        </p>
                        <p className="mt-1 truncate font-[family-name:var(--font-mono)] text-[11px] text-[var(--muted)]">
                          {profile.handle}
                        </p>
                      </div>
                    </div>
                    <span
                      aria-hidden="true"
                      className="font-[family-name:var(--font-mono)] text-sm text-[var(--ink)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    >
                      ↗
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 2. My Story — Why I Built Pocket */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-10">
          <div>
            {/* <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
              02 · My Story
            </p> */}
            <h2 className="mt-2.5 font-[family-name:var(--font-display)] text-3xl font-medium leading-none tracking-[-0.02em] text-[var(--ink)] sm:text-5xl">
              Why I built <span className="italic">Pocket</span>.
            </h2>
            {/* <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--muted)] sm:text-base">
              Turning a familiar daily habit—sending files to yourself on Telegram—into a calm, organized workspace.
            </p> */}
          </div>

          <article className="clay flex flex-col gap-4 rounded-[30px] p-6 sm:p-8">
            <p className="font-[family-name:var(--font-display)] text-xl font-medium leading-snug text-[var(--ink)] sm:text-2xl">
            I built Pocket to make cloud storage more accessible, without expensive plans or strict storage limits. </p>
            <p className="text-sm leading-relaxed text-[var(--muted)] sm:text-base">
              That idea led to <strong className="font-medium text-[var(--ink)]">Pocket</strong> — a personal file-management tool that uses your own Telegram account to store and organize files.
            </p>
            <p className="text-sm leading-relaxed text-[var(--muted)] sm:text-base">
              I&apos;m building Pocket to make the experience feel simple, familiar, and accessible. It&apos;s an ongoing journey of learning, experimenting, and improving the product one step at a time.
            </p>
          </article>
        </section>

        {/* 3. My Philosophy — How Pocket is Built */}
        {/* <section className="flex flex-col gap-6 sm:gap-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                03 · My Philosophy
              </p>
              <h2 className="mt-2.5 font-[family-name:var(--font-display)] text-3xl font-medium leading-none tracking-[-0.02em] text-[var(--ink)] sm:text-5xl">
                How I think about <span className="italic">building</span>.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-[var(--muted)] sm:text-base">
              Three principles that guide every decision in Pocket—from how files are organized to how sessions are handled.
            </p>
          </div> */}

          {/* <div className="grid grid-cols-1 gap-4 md:grid-cols-3 sm:gap-5">
            {philosophyCards.map((card) => (
              <article
                key={card.title}
                className="clay live flex flex-col justify-between gap-5 rounded-[28px] p-6 sm:p-7"
                style={{ background: card.tint }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="clay-pill bg-[var(--clay)] px-3 py-1 font-[family-name:var(--font-mono)] text-[10px] font-semibold tracking-[0.14em] text-[var(--ink)]">
                    {card.index} · {card.tag}
                  </span>
                </div>

                <div>
                  <h3 className="font-[family-name:var(--font-display)] text-2xl font-medium leading-tight text-[var(--ink)]">
                    {card.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-[var(--ink)]/80">
                    {card.body}
                  </p>
                </div>
              </article>
            ))}
          </div> */}
        {/* </section> */}

        {/* 4. A Note from the Developer */}
        <section className="land-well p-4 sm:p-6 lg:p-8">
          <article className="clay relative overflow-hidden rounded-[30px] p-6 sm:p-10">
            <div className="flex flex-col gap-5 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="clay-pill bg-[var(--accent)] px-3 py-1 font-[family-name:var(--font-mono)] text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink)]">
                  04 · A NOTE FROM ME
                </span>
              </div>

              <h2 className="font-[family-name:var(--font-display)] text-3xl font-medium leading-tight tracking-[-0.02em] text-[var(--ink)] sm:text-4xl">
                A Note from Me
              </h2>

              <p className="text-base leading-relaxed text-[var(--ink)]/90 sm:text-lg">
                Pocket is more than just a side project for me. It&apos;s an opportunity to turn a simple idea into something genuinely useful.
              </p>

              <p className="text-sm leading-relaxed text-[var(--muted)] sm:text-base">
                I&apos;m continuously learning, experimenting, fixing things, and finding ways to make Pocket better. There&apos;s still a lot to build, and that&apos;s what makes the journey exciting.
              </p>

              <p className="font-[family-name:var(--font-display)] text-lg font-medium text-[var(--ink)] sm:text-xl">
                Thanks for giving Pocket a try💙
              </p>

              <div className="mt-2 flex flex-wrap items-center justify-between gap-4 border-t border-[rgba(62,74,92,0.1)] pt-5">
                <div className="flex items-center gap-3">
                  <img
                    src="/developer.jpg"
                    alt="Ayush Srivastava"
                    className="h-12 w-12 rounded-2xl object-cover object-[center_18%]"
                  />
                  <div>
                    <p className="font-[family-name:var(--font-display)] text-lg font-medium leading-none text-[var(--ink)]">
                      — Ayush Srivastava
                    </p>
                    <p className="mt-1 font-[family-name:var(--font-mono)] text-xs text-[var(--muted)]">
                      Developer of Pocket
                    </p>
                  </div>
                </div>

                <Link
                  href={signedIn ? '/drive' : '/login'}
                  className="clay-press inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 font-[family-name:var(--font-display)] text-base font-medium text-[var(--ink)]"
                >
                  <span>{signedIn ? 'Open your Drive' : 'Try Pocket'}</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </article>
        </section>
      </main>

      <footer className="mx-auto flex w-full max-w-6xl flex-col gap-4 border-t border-[rgba(62,74,92,0.12)] px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex items-center gap-3">
          <Logo className="h-9 w-9" />
          <div>
            <p className="font-[family-name:var(--font-display)] font-medium">Pocket</p>
            <p className="font-[family-name:var(--font-mono)] text-xs text-[var(--muted)]">Your files. Your space.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/" className="clay-pill bg-[var(--clay)] px-4 py-2 text-sm">
            Home
          </Link>
          <Link href={signedIn ? '/drive' : '/login'} className="clay-pill bg-[var(--accent)] px-4 py-2 text-sm font-medium">
            {signedIn ? 'Open Drive' : 'Register / Login'}
          </Link>
        </div>
      </footer>
    </div>
  )
}

function GitHubIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.52 2.87 8.35 6.84 9.71.5.1.68-.22.68-.48 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.36 1.12 2.94.86.09-.67.35-1.12.63-1.38-2.22-.26-4.55-1.14-4.55-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05A9.36 9.36 0 0 1 12 6.84c.85 0 1.7.12 2.5.34 1.9-1.32 2.74-1.05 2.74-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.81 0 .27.18.59.69.48A10.04 10.04 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M4.98 3.5C4.98 4.88 3.88 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.5 8.5h4V24h-4V8.5zM8.5 8.5h3.8v2.1h.05c.53-1 1.84-2.1 3.79-2.1 4.05 0 4.8 2.67 4.8 6.14V24h-4v-7.7c0-1.84-.03-4.2-2.56-4.2-2.56 0-2.95 2-2.95 4.06V24h-4V8.5z" />
    </svg>
  )
}

function PortfolioIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.8 3.8 5.8 3.8 9s-1.3 6.2-3.8 9c-2.5-2.8-3.8-5.8-3.8-9s1.3-6.2 3.8-9Z" />
    </svg>
  )
}
