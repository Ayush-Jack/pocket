import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  FeaturesInteractiveSection,
  HeroFileObject,
  InteractiveStepsList,
  LandingChoreography,
  WorksInteractiveSection,
} from '@/components/LandingShowcase'
import { PointerHighlight } from '@/components/ui/pointer-highlight'
import { Logo } from '@/components/logo'
import { getAuthStatus } from '@/lib/drive-api'

export default async function LandingPage() {
  const auth = await getAuthStatus()
  if (auth.ready) redirect('/drive')

  return (
    <div className="ambient-field min-h-screen">
      <LandingChoreography />

      <header className="sticky top-2 z-30 mx-auto w-full max-w-7xl px-3 pt-1.5 sm:top-3 sm:px-6 sm:pt-2 lg:px-8">
        <div className="clay flex flex-col gap-2 bg-[var(--clay)]/90 px-3.5 py-2.5 backdrop-blur-md sm:px-5 sm:py-3">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
              <Logo className="h-9 w-9 shrink-0 sm:h-10 sm:w-10" />
              <div className="min-w-0">
                <p className="truncate font-[family-name:var(--font-display)] text-base font-medium leading-none sm:text-lg">
                  Pocket
                </p>
                <p className="mt-0.5 truncate font-[family-name:var(--font-mono)] text-[9px] text-[var(--muted)] sm:text-[10px]">
                  Saved Messages Drive
                </p>
              </div>
            </div>

            <nav className="hidden items-center gap-1 lg:flex" aria-label="Page sections">
              <a
                href="#how-it-works"
                className="rounded-full px-3.5 py-1.5 font-[family-name:var(--font-mono)] text-xs text-[var(--muted)] transition-colors hover:bg-[var(--field)] hover:text-[var(--ink)]"
              >
                How it works
              </a>
              <a
                href="#features"
                className="rounded-full px-3.5 py-1.5 font-[family-name:var(--font-mono)] text-xs text-[var(--muted)] transition-colors hover:bg-[var(--field)] hover:text-[var(--ink)]"
              >
                What you can do
              </a>
              <a
                href="#steps"
                className="rounded-full px-3.5 py-1.5 font-[family-name:var(--font-mono)] text-xs text-[var(--muted)] transition-colors hover:bg-[var(--field)] hover:text-[var(--ink)]"
              >
                How to use
              </a>
            </nav>

            <Link
              href="/login"
              data-magnetic=""
              className="clay-pill shrink-0 bg-[var(--accent)] px-3.5 py-2 text-xs font-medium whitespace-nowrap sm:px-5 sm:text-sm"
            >
              Register / Login
            </Link>
          </div>

          {/* Mobile & Tablet quick section jump bar */}
          <nav
            className="no-scrollbar flex items-center justify-around gap-1 border-t border-[rgba(62,74,92,0.08)] pt-1.5 sm:justify-center sm:gap-2 lg:hidden"
            aria-label="Mobile page sections"
          >
            <a
              href="#how-it-works"
              className="shrink-0 rounded-full px-2.5 py-1 font-[family-name:var(--font-mono)] text-[10px] text-[var(--muted)] transition-colors hover:bg-[var(--field)] hover:text-[var(--ink)] sm:px-3 sm:text-[11px]"
            >
              How it works
            </a>
            <a
              href="#features"
              className="shrink-0 rounded-full px-2.5 py-1 font-[family-name:var(--font-mono)] text-[10px] text-[var(--muted)] transition-colors hover:bg-[var(--field)] hover:text-[var(--ink)] sm:px-3 sm:text-[11px]"
            >
              What you can do
            </a>
            <a
              href="#steps"
              className="shrink-0 rounded-full px-2.5 py-1 font-[family-name:var(--font-mono)] text-[10px] text-[var(--muted)] transition-colors hover:bg-[var(--field)] hover:text-[var(--ink)] sm:px-3 sm:text-[11px]"
            >
              How to use
            </a>
          </nav>
        </div>
      </header>

      <main className="overflow-x-clip">
        {/* Hero Stage */}
        <section className="mx-auto grid min-h-[calc(100svh-5.5rem)] w-full max-w-7xl content-center items-center gap-8 px-4 py-8 sm:px-6 sm:py-12 md:grid-cols-[1.05fr_0.95fr] md:gap-8 lg:gap-12 lg:px-8">
          <div className="min-w-0 text-center md:text-left">
            <p
              data-hero-reveal=""
              className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.18em] text-[var(--muted)]"
            >
              Your files · Your space
            </p>

            <h1
              data-hero-reveal=""
              className="mt-4 pb-2 font-[family-name:var(--font-display)] text-[2.45rem] font-medium leading-[1.03] tracking-[-0.025em] sm:mt-5 sm:text-5xl md:text-[3rem] lg:text-[3.85rem] xl:text-[4.35rem]"
            >
              Your files have a home. It&apos;s{' '}
              <PointerHighlight
                rectangleClassName="rounded-md border-[#c5cef8] bg-[var(--accent)]"
                pointerClassName="h-4 w-4 text-[#5569dc]"
                containerClassName="inline-block"
              >
                <span className="relative z-10 italic">Telegram</span>
              </PointerHighlight>
              .
            </h1>

            <p
              data-hero-reveal=""
              className="mx-auto mt-4 max-w-md text-base leading-relaxed text-[var(--muted)] sm:mt-5 sm:text-lg md:mx-0"
            >
              Turn scattered messages into an organized file library—ready to find, preview, and download whenever you need.
            </p>

            <div data-hero-reveal="" className="mt-6 sm:mt-8">
              <Link
                href="/login"
                data-magnetic=""
                className="clay-press inline-flex items-center gap-2.5 rounded-full bg-[var(--accent)] px-6 py-3 font-[family-name:var(--font-display)] text-base font-medium sm:px-7 sm:py-3.5 sm:text-lg"
              >
                <span>Register / Login</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          <div className="min-w-0 w-full">
            <HeroFileObject />
          </div>
        </section>

        {/* How Pocket Works */}
        <div id="how-it-works">
          <WorksInteractiveSection />
        </div>

        {/* Features: What you can do */}
        <div id="features">
          <FeaturesInteractiveSection />
        </div>

        {/* How to Use Pocket — Pinned Horizontal Wave Scroll (Bharat Gig style) */}
        <InteractiveStepsList />

        {/* Finale CTA Stage */}
        <section
          data-section-reveal=""
          className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-8 sm:py-24"
        >
          <div
            data-reveal-item=""
            data-tilt="3"
            className="clay clay-card-alive flex flex-col items-center px-6 py-16 text-center sm:px-12 sm:py-20"
          >
            <Logo className="h-16 w-16" />
            <h2 className="mt-5 font-[family-name:var(--font-display)] text-3xl font-medium leading-none tracking-[-0.02em] sm:text-5xl">
              Open your <span className="italic">Pocket</span>.
            </h2>
            <Link
              href="/login"
              data-magnetic=""
              className="clay-press mt-8 rounded-full bg-[var(--accent)] px-8 py-4 font-[family-name:var(--font-display)] text-xl font-medium"
            >
              Register / Login
            </Link>
          </div>
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
        <Link href="/login" className="clay-pill w-fit bg-[var(--clay)] px-4 py-2 text-sm">
          Register / Login
        </Link>
      </footer>
    </div>
  )
}
