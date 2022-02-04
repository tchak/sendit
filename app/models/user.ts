import { prisma } from '~/util/db.server';

export type User = { id: string; name: string };

export async function findOrCreateByGithubId(
  githubId: string,
  name: string
): Promise<User> {
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
): Promise<User> {
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
