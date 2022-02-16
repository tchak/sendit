import { prisma } from '~/util/db.server';

export type Schema = { id: string; email: string };

export async function findOrCreateByEmail(email: string): Promise<Schema> {
  return await prisma.user.upsert({
    where: { email },
    create: { email },
    update: {},
    select: { id: true, email: true },
  });
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
