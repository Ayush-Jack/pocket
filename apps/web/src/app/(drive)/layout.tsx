import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { getAuthStatus } from '@/lib/drive-api'

export default async function DriveLayout({ children }: { children: React.ReactNode }) {
  const auth = await getAuthStatus()
  if (!auth.ready) redirect('/login')

  return (
    <div className="mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 gap-4 p-3 sm:gap-6 sm:p-5 lg:grid-cols-[260px_minmax(0,1fr)] lg:p-8">
      <Suspense fallback={null}>
        <Sidebar />
      </Suspense>
      <main className="min-w-0">{children}</main>
    </div>
  )
}
