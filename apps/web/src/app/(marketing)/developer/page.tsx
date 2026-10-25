import { DeveloperShowcase } from '@/components/developer-showcase'
import { getAuthStatus } from '@/lib/drive-api'

export default async function DeveloperPage() {
  const auth = await getAuthStatus()
  return <DeveloperShowcase signedIn={auth.ready} />
}
