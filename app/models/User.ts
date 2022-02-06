import { prisma } from '~/util/db.server';

export type Schema = { id: string; name: string };

export async function findOrCreateByGithubId(
  githubId: string,
  name: string
): Promise<Schema> {
  try {
    return await prisma.user.create({
      data: { githubId, name },
      select: { id: true, name: true },
    });
  } catch (e) {
    return prisma.user.findUnique({
      rejectOnNotFound: true,
      where: { githubId },
      select: { id: true, name: true },
    });
  }
}

export async function findOrCreateByTwitterId(
  twitterId: string,
  name: string
): Promise<Schema> {
  try {
    return await prisma.user.create({
      data: { twitterId, name },
      select: { id: true, name: true },
    });
  } catch (e) {
    return prisma.user.findUnique({
      rejectOnNotFound: true,
      where: { twitterId },
      select: { id: true, name: true },
    });
  }
}

export function findWithTransportsAndTemplates(userId: string) {
  return prisma.user.findUnique({
    rejectOnNotFound: true,
    where: { id: userId },
    select: {
      transports: {
        orderBy: { createdAt: 'asc' },
        select: { id: true, name: true, email: true },
      },
      templates: {
        orderBy: { createdAt: 'asc' },
        select: { id: true, subject: true },
      },
    },
  });
}
