import { prisma } from '~/util/db.server';

export function findById(id: string, userId: string) {
  return prisma.emailMessage.findFirst({
    rejectOnNotFound: true,
    where: { id, template: { userId } },
    select: {
      id: true,
      from: true,
      to: true,
      subject: true,
      html: true,
      text: true,
      template: {
        select: {
          transport: {
            select: { host: true, port: true, username: true, password: true },
          },
        },
      },
    },
  });
}

export function countByTemplateId(templateId: string, userId: string) {
  return prisma.emailMessage.count({
    where: {
      template: { id: templateId, userId },
      state: { not: 'Sent' },
      text: { not: '' },
      to: { isEmpty: false },
    },
  });
}
export function findAllByTemplateId(templateId: string, userId: string) {
  return prisma.emailMessage.findMany({
    where: {
      template: { id: templateId, userId },
      state: { not: 'Sent' },
      text: { not: '' },
      to: { isEmpty: false },
    },
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  });
}

export async function markAsSent(id: string, state: 'Sent' | 'Error') {
  await prisma.emailMessage.update({
    where: { id },
    data: { state, sentAt: new Date() },
  });
}