'use server'

import { revalidatePath } from 'next/cache'
import { deleteDriveFile } from '@/lib/drive-api'

export async function deleteAction(formData: FormData): Promise<{ ok: boolean; message: string }> {
  const id = formData.get('id')
  if (typeof id !== 'string' || id.length === 0) {
    return { ok: false, message: 'That file could not be found.' }
  }
  const result = await deleteDriveFile(id)
  if (!result.ok) return { ok: false, message: result.message ?? 'The file was not deleted.' }
  revalidatePath('/')
  return { ok: true, message: 'Deleted.' }
}
