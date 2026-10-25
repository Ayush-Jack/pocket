import { redirect } from 'next/navigation'
import { LoginForm } from '@/components/login-form'
import { getAuthStatus } from '@/lib/drive-api'

export default async function LoginPage() {
  const auth = await getAuthStatus(true)
  if (auth.ready) redirect('/drive')

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center p-3 sm:p-8">
      <LoginForm initial={auth} />
    </div>
  )
}
