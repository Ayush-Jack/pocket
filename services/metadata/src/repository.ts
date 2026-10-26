import { PrismaClient } from '@prisma/client'
import { buildFileReference } from './file-reference'

const ROOT_FOLDER_NAME = 'My Drive'

export interface SignedInAccount {
  telegramUserId: string
  username: string | null
  firstName: string
  lastName: string | null
}

export interface StoredAccount {
  userId: string
  telegramUserId: string
  folderId: string
  folderName: string
}

export function createMetadataClient(): PrismaClient {
  return new PrismaClient()
}

export async function saveSignedInAccount(
  prisma: PrismaClient,
  account: SignedInAccount,
  dataDirectory: string,
): Promise<StoredAccount> {
  const user = await prisma.user.upsert({
    where: { telegramUserId: account.telegramUserId },
    update: {
      username: account.username,
      firstName: account.firstName,
      lastName: account.lastName,
    },
    create: {
      telegramUserId: account.telegramUserId,
      username: account.username,
      firstName: account.firstName,
      lastName: account.lastName,
    },
  })

  await prisma.telegramSession.upsert({
    where: { userId: user.id },
    update: {
      dataDirectory,
      authState: 'authorizationStateReady',
      lastReadyAt: new Date(),
    },
    create: {
      userId: user.id,
      dataDirectory,
      authState: 'authorizationStateReady',
      lastReadyAt: new Date(),
    },
  })

  const existingFolder = await prisma.folder.findFirst({
    where: { userId: user.id, parentId: null, name: ROOT_FOLDER_NAME },
  })
  const folder = existingFolder ?? await prisma.folder.create({
    data: { userId: user.id, name: ROOT_FOLDER_NAME },
  })

  return {
    userId: user.id,
    telegramUserId: user.telegramUserId,
    folderId: folder.id,
    folderName: folder.name,
  }
}

export interface PublicFile {
  id: string
  name: string
  mimeType: string
  size: number
  status: string
  folderId: string | null
}

export interface StoredFile extends PublicFile {
  telegramChatId: string
  telegramMessageId: string
  telegramFileId: string
  telegramRemoteId: string | null
}

export async function getAccount(
  prisma: PrismaClient,
  telegramUserId: string,
): Promise<StoredAccount | null> {
  const user = await prisma.user.findUnique({
    where: { telegramUserId },
    include: {
      folders: { where: { parentId: null, name: ROOT_FOLDER_NAME }, take: 1 },
    },
  })
  const folder = user?.folders[0]
  if (!user || !folder) return null
  return {
    userId: user.id,
    telegramUserId: user.telegramUserId,
    folderId: folder.id,
    folderName: folder.name,
  }
}

export async function listFiles(prisma: PrismaClient, userId: string): Promise<PublicFile[]> {
  const files = await prisma.file.findMany({
    where: { userId, status: { not: 'DELETED' } },
    orderBy: { createdAt: 'desc' },
  })
  return files.map(toPublicFile)
}

export async function getFileForUser(
  prisma: PrismaClient,
  userId: string,
  fileId: string,
): Promise<StoredFile | null> {
  const file = await prisma.file.findFirst({
    where: { id: fileId, userId, status: { not: 'DELETED' } },
  })
  if (!file) return null
  return {
    ...toPublicFile(file),
    telegramChatId: file.telegramChatId,
    telegramMessageId: file.telegramMessageId,
    telegramFileId: file.telegramFileId,
    telegramRemoteId: file.telegramRemoteId,
  }
}

export interface RemoteSavedFile {
  chatId: string
  messageId: string
  fileId: string
  remoteId: string | null
  uniqueId?: string | null
  name: string
  mimeType: string
  size: number
}

function normalizeSyncedName(name: string): string {
  const stripped = name.replace(/^[0-9a-f]{16}-/i, '')
  return stripped.length > 0 ? stripped : name
}

function fileSignature(name: string, size: number | bigint): string {
  return `${normalizeSyncedName(name).toLowerCase()}::${String(size)}`
}

export async function syncSavedMessagesFiles(
  prisma: PrismaClient,
  userId: string,
  folderId: string,
  remoteFiles: RemoteSavedFile[],
): Promise<void> {
  const existing = await prisma.file.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      size: true,
      status: true,
      telegramMessageId: true,
      telegramRemoteId: true,
    },
  })

  const liveDocs = remoteFiles.map((doc) => ({
    ...doc,
    name: normalizeSyncedName(doc.name),
  }))

  const liveMessageIds = new Set(liveDocs.map((doc) => doc.messageId))
  const liveRemoteIds = new Set(
    liveDocs.map((doc) => doc.remoteId).filter((id): id is string => typeof id === 'string' && id.length > 0),
  )
  const liveSignatures = new Set(liveDocs.map((doc) => fileSignature(doc.name, doc.size)))

  // 1. Mark DB records as DELETED if they were deleted directly in Telegram Saved Messages,
  //    and collapse duplicate active rows for the same file.
  const keptActiveSignature = new Set<string>()
  const keptActiveMessageId = new Set<string>()
  const idsToDelete: string[] = []

  for (const row of existing) {
    if (row.status === 'DELETED') continue
    const sig = fileSignature(row.name, row.size)
    const existsInTelegram =
      liveMessageIds.has(row.telegramMessageId) ||
      (row.telegramRemoteId != null && liveRemoteIds.has(row.telegramRemoteId)) ||
      liveSignatures.has(sig)

    if (!existsInTelegram) {
      idsToDelete.push(row.id)
      continue
    }

    if (keptActiveMessageId.has(row.telegramMessageId) || keptActiveSignature.has(sig)) {
      idsToDelete.push(row.id)
      continue
    }

    keptActiveMessageId.add(row.telegramMessageId)
    keptActiveSignature.add(sig)
  }

  if (idsToDelete.length > 0) {
    await prisma.file.updateMany({
      where: { id: { in: idsToDelete } },
      data: { status: 'DELETED' },
    })
  }

  // 2. Refresh active rows after cleanup and insert any new Saved Messages files.
  const activeRows = existing.filter((row) => row.status !== 'DELETED' && !idsToDelete.includes(row.id))
  const byMessageId = new Map(activeRows.map((row) => [row.telegramMessageId, row]))
  const bySignature = new Map(activeRows.map((row) => [fileSignature(row.name, row.size), row]))
  const knownRemoteIds = new Set(
    activeRows
      .map((row) => row.telegramRemoteId)
      .filter((id): id is string => typeof id === 'string' && id.length > 0),
  )
  const deletedMessageIds = new Set(
    existing.filter((row) => row.status === 'DELETED').map((row) => row.telegramMessageId),
  )

  const seenLiveUnique = new Set<string>()
  for (const doc of [...liveDocs].reverse()) {
    const sig = fileSignature(doc.name, doc.size)
    const dedupeKey = doc.uniqueId ? `u:${doc.uniqueId}` : `s:${sig}`
    if (seenLiveUnique.has(dedupeKey)) continue
    seenLiveUnique.add(dedupeKey)

    if (deletedMessageIds.has(doc.messageId)) continue

    const matched = byMessageId.get(doc.messageId) ?? bySignature.get(sig)
    if (matched) {
      const updates: {
        name?: string
        telegramMessageId?: string
        telegramRemoteId?: string
      } = {}
      if (matched.name !== doc.name) updates.name = doc.name
      if (matched.telegramMessageId !== doc.messageId) updates.telegramMessageId = doc.messageId
      if (doc.remoteId && matched.telegramRemoteId !== doc.remoteId) updates.telegramRemoteId = doc.remoteId
      if (Object.keys(updates).length > 0) {
        await prisma.file.update({
          where: { id: matched.id },
          data: updates,
        })
      }
      continue
    }

    if (doc.remoteId && knownRemoteIds.has(doc.remoteId)) continue

    const created = await createUploadedFile(prisma, userId, folderId, {
      name: doc.name,
      mimeType: doc.mimeType,
      size: doc.size,
      telegramChatId: doc.chatId,
      telegramMessageId: doc.messageId,
      telegramFileId: doc.fileId,
      telegramRemoteId: doc.remoteId,
      status: 'UPLOADED',
    })
    const createdRow = {
      id: created.id,
      name: created.name,
      size: BigInt(created.size),
      status: 'UPLOADED' as const,
      telegramMessageId: doc.messageId,
      telegramRemoteId: doc.remoteId,
    }
    byMessageId.set(doc.messageId, createdRow)
    bySignature.set(sig, createdRow)
    if (doc.remoteId) knownRemoteIds.add(doc.remoteId)
  }
}

export async function createUploadedFile(
  prisma: PrismaClient,
  userId: string,
  folderId: string,
  input: Record<string, unknown>,
): Promise<PublicFile> {
  const reference = buildFileReference(input)
  const file = await prisma.file.create({
    data: {
      userId,
      folderId,
      name: reference.name,
      mimeType: reference.mimeType,
      size: BigInt(reference.size),
      telegramChatId: reference.telegramChatId,
      telegramMessageId: reference.telegramMessageId,
      telegramFileId: reference.telegramFileId,
      telegramRemoteId: reference.telegramRemoteId,
      status: 'UPLOADED',
      uploadJobs: {
        create: { userId, state: 'UPLOADED', progress: 100 },
      },
    },
  })
  return toPublicFile(file)
}

export async function markFileDeleted(
  prisma: PrismaClient,
  userId: string,
  fileId: string,
): Promise<PublicFile | null> {
  const existing = await prisma.file.findFirst({
    where: { id: fileId, userId, status: { not: 'DELETED' } },
  })
  if (!existing) return null
  const file = await prisma.file.update({
    where: { id: existing.id },
    data: { status: 'DELETED' },
  })
  return toPublicFile(file)
}

function toPublicFile(file: {
  id: string
  name: string
  mimeType: string
  size: bigint
  status: string
  folderId: string | null
}): PublicFile {
  return {
    id: file.id,
    name: file.name,
    mimeType: file.mimeType,
    size: Number(file.size),
    status: file.status,
    folderId: file.folderId,
  }
}
