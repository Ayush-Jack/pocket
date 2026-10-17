import { DriveBoard } from '@/components/drive-board'
import { getAccount, listDriveFiles } from '@/lib/drive-api'

export default async function DrivePage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>
}) {
  const { view } = await searchParams
  const [account, files] = await Promise.all([getAccount(), listDriveFiles()])
  if (!account.ok || !account.data || !files.ok || !files.data) {
    return (
      <p className="font-[family-name:var(--font-body)] text-lg" role="alert">
        {account.message ?? files.message ?? 'The drive could not be loaded.'}
      </p>
    )
  }

  return <DriveBoard account={account.data} files={files.data} view={view ?? 'all'} />
}
