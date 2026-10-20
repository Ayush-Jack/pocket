import { LogoutButton } from '@/components/logout-button'
import { Logo } from '@/components/logo'
import { PageRise } from '@/components/page-rise'
import { getAccount } from '@/lib/drive-api'
import Link from 'next/link'

export default async function SettingsPage() {
  const account = await getAccount()
  if (!account.ok || !account.data) {
    return (
      <p className="clay px-6 py-5 font-[family-name:var(--font-body)] text-lg" role="alert">
        {account.message ?? 'The account could not be loaded.'}
      </p>
    )
  }

  return (
    <PageRise>
    <section data-rise="" className="flex max-w-2xl flex-col gap-4">
      <div data-rise="" className="flex items-center gap-3">
        <Logo className="h-11 w-11" />
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-medium">Settings</h1>
      </div>
      <p data-rise="" className="text-[var(--muted)]">This browser is connected to the account already signed in on this computer.</p>
      <article data-rise="" className="clay px-6 py-5">
        <p className="text-sm text-[var(--muted)]">Telegram user</p>
        <p className="mt-1 font-[family-name:var(--font-mono)] text-xl">{account.data.telegramUserId}</p>
      </article>
      <article data-rise="" className="clay px-6 py-5">
        <p className="text-sm text-[var(--muted)]">Folder</p>
        <p className="mt-1 font-[family-name:var(--font-display)] text-xl">{account.data.folderName}</p>
      </article>
      <LogoutButton />
      <Link data-rise="" href="/drive" className="clay-pill w-fit bg-[var(--accent)] px-4 py-3 text-sm">
        Back to Pocket
      </Link>
    </section>
    </PageRise>
  )
}
