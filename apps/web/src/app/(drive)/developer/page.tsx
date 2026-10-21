import { Logo } from '@/components/logo'
import { PageRise } from '@/components/page-rise'
import Link from 'next/link'

const profiles = [
  {
    href: 'https://github.com/Ayush-Jack',
    label: 'GitHub',
    tint: '#E7E4F8',
    icon: <GitHubIcon />,
  },
  {
    href: 'https://www.linkedin.com/in/ayush-srivastava0110/',
    label: 'LinkedIn',
    tint: '#DDEFE8',
    icon: <LinkedInIcon />,
  },
  {
    href: 'https://www.ayushsrivastava.me/',
    label: 'Portfolio',
    tint: '#F8E6DC',
    icon: <PortfolioIcon />,
  },
] as const

export default function DeveloperPage() {
  return (
    <PageRise>
      <section className="flex max-w-3xl flex-col gap-5">
        <article
          data-rise=""
          className="overflow-hidden rounded-[32px] bg-[#243040] text-[#F6F8FC] shadow-[12px_16px_32px_rgba(36,48,64,0.28)]"
        >
          <div className="grid md:grid-cols-[280px_1fr]">
            <img
              src="/developer.jpg"
              alt="Ayush Srivastava"
              className="h-64 w-full object-cover object-[center_18%] sm:h-80 md:h-full"
            />
            <div className="flex flex-col justify-between gap-6 p-5 sm:gap-8 sm:p-6 md:p-8">
              <div>
                <div className="flex items-center gap-3">
                  <Logo className="h-10 w-10" />
                  <p className="font-[family-name:var(--font-mono)] text-xs tracking-[0.18em] text-[#D9E0FF]">DEVELOPER</p>
                </div>
                <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-medium leading-none sm:text-4xl">Ayush Srivastava</h1>
                <p className="mt-4 max-w-sm text-[#C9D3E0]">
                  I built Pocket so files stay in your own Telegram account. The app keeps the details. The bytes stay in Saved Messages.
                </p>
              </div>
              <ul className="flex flex-wrap gap-3">
                {profiles.map((profile) => (
                  <li key={profile.href}>
                    <a
                      href={profile.href}
                      target="_blank"
                      rel="noreferrer"
                      className="live flex items-center gap-2 rounded-full py-2 pl-2 pr-4 text-sm font-medium text-[#243040]"
                      style={{ background: profile.tint }}
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#243040] text-[#F6F8FC]">
                        {profile.icon}
                      </span>
                      {profile.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </article>
        <Link data-rise="" href="/drive" className="clay-pill w-fit bg-[var(--clay)] px-4 py-3 text-sm">
          Back to Pocket
        </Link>
      </section>
    </PageRise>
  )
}

function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
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
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.8 3.8 5.8 3.8 9s-1.3 6.2-3.8 9c-2.5-2.8-3.8-5.8-3.8-9s1.3-6.2 3.8-9Z" />
    </svg>
  )
}
