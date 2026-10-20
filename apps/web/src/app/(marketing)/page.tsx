import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  FeaturesInteractiveSection,
  HeroFlightDeck,
  InteractiveStepsList,
  LandingChoreography,
  WorksInteractiveSection,
} from '@/components/LandingShowcase'
import { Logo } from '@/components/logo'
import { getAuthStatus } from '@/lib/drive-api'

export default async function LandingPage() {
  const auth = await getAuthStatus()
  if (auth.ready) redirect('/drive')

  return (
    <div className="ambient-field min-h-screen">
      <LandingChoreography />

      <header className="sticky top-3 z-30 mx-auto w-full max-w-6xl px-4 pt-2 sm:px-8">
        <div className="clay flex items-center justify-between gap-4 bg-[var(--clay)]/90 px-4 py-3 backdrop-blur-md sm:px-5">
          <div className="flex items-center gap-3">
            <Logo className="h-10 w-10" />
            <div>
              <p className="font-[family-name:var(--font-display)] text-lg font-medium leading-none">Pocket</p>
              <p className="mt-0.5 font-[family-name:var(--font-mono)] text-[10px] text-[var(--muted)]">
                Saved Messages Drive
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-1.5 md:flex" aria-label="Page sections">
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
            className="clay-pill bg-[var(--accent)] px-4 py-2 text-sm font-medium sm:px-5"
          >
            Register / Login
          </Link>
        </div>
      </header>

      <main>
        {/* Hero Stage */}
        <section className="mx-auto grid w-full max-w-6xl items-center gap-8 px-4 pb-12 pt-8 sm:px-8 lg:min-h-[calc(100svh-6.5rem)] lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:pb-16">
          <div>
            <div data-hero-reveal="" className="inline-flex flex-wrap items-center gap-2">
              <span className="clay-pill gap-2 bg-[var(--clay)] px-4 py-2 font-[family-name:var(--font-mono)] text-xs text-[var(--ink)]">
                <span className="h-2 w-2 rounded-full bg-[#3b9874]" />
                Your files. Your space.
              </span>
              <span className="clay-pill bg-[var(--lilac)] px-3.5 py-2 font-[family-name:var(--font-mono)] text-xs text-[var(--muted)]">
                Powered by your own Telegram
              </span>
            </div>

            <h1
              data-hero-reveal=""
              className="mt-6 max-w-xl font-[family-name:var(--font-display)] text-5xl font-medium leading-[0.96] tracking-[-0.03em] sm:text-6xl lg:text-[4.1rem]"
            >
              Your files stay in your Telegram.
            </h1>

            <p data-hero-reveal="" className="mt-5 max-w-md text-lg leading-relaxed text-[var(--muted)]">
              Pocket helps you upload, organize, and download files through your own Telegram account. The drive is here. The files stay in Saved Messages.
            </p>

            <div data-hero-reveal="" className="mt-8 flex flex-wrap items-center gap-3.5">
              <Link
                href="/login"
                data-magnetic=""
                className="clay-press inline-flex items-center gap-2.5 rounded-full bg-[var(--accent)] px-7 py-3.5 font-[family-name:var(--font-display)] text-lg font-medium"
              >
                <span>Register / Login</span>
                <span aria-hidden="true">→</span>
              </Link>
              <a
                href="#how-it-works"
                data-magnetic=""
                className="clay-pill bg-[var(--clay)] px-5 py-3.5 font-[family-name:var(--font-mono)] text-xs text-[var(--ink)]"
              >
                See how it works ↓
              </a>
            </div>

            {/* Tactile Architecture Strip */}
            <dl
              data-hero-reveal=""
              className="mt-10 grid max-w-lg grid-cols-3 gap-2.5 pt-2"
            >
              <div className="clay px-3.5 py-3">
                <dt className="font-[family-name:var(--font-mono)] text-[10px] text-[var(--muted)]">STORAGE</dt>
                <dd className="mt-1 font-[family-name:var(--font-display)] text-sm font-medium">Saved Messages</dd>
              </div>
              <div className="clay px-3.5 py-3">
                <dt className="font-[family-name:var(--font-mono)] text-[10px] text-[var(--muted)]">PER FILE STOP</dt>
                <dd className="mt-1 font-[family-name:var(--font-display)] text-sm font-medium">Up to 2 GB</dd>
              </div>
              <div className="clay px-3.5 py-3">
                <dt className="font-[family-name:var(--font-mono)] text-[10px] text-[var(--muted)]">SESSION</dt>
                <dd className="mt-1 font-[family-name:var(--font-display)] text-sm font-medium">Server-sealed</dd>
              </div>
            </dl>
          </div>

          <HeroFlightDeck />
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
            <p className="mt-5 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
              ONE ACCOUNT · YOUR TELEGRAM
            </p>
            <h2 className="mt-2.5 font-[family-name:var(--font-display)] text-3xl font-medium leading-none sm:text-5xl">
              Open your Pocket.
            </h2>
            <p className="mt-4 max-w-md text-lg text-[var(--muted)]">
              Register and login use the same Telegram sign-in. The first time creates your account.
            </p>
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
