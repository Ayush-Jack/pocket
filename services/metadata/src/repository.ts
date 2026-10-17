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
    where: { userId },
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
