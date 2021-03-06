import { z } from 'zod';

import { getErrors, Errors } from '~/util/form';
import { prisma } from '~/util/db.server';

export type ActionData = { errors?: Errors<Schema> };

const Schema = z.object({
  name: z.string().min(1),
  email: z.string().min(1).email(),
  host: z.string().min(1),
  port: z
    .string()
    .min(1)
    .regex(/[0-9]+/, 'Should be a valid port number')
    .transform((port) => parseInt(port))
    .refine((port) => port > 0, 'Should be a valid port number'),
  username: z.string().min(1),
  password: z.string().min(1),
});
export type Schema = z.infer<typeof Schema>;

export function findById(id: string, userId: string) {
  return prisma.emailTransport.findUnique({
    rejectOnNotFound: true,
    where: { id_userId: { id, userId } },
    select: {
      id: true,
      name: true,
      email: true,
      host: true,
      port: true,
      username: true,
      password: true,
    },
  });
}

export function findAll(userId: string) {
  return prisma.emailTransport.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true },
  });
}

export function create(userId: string, form: FormData) {
  const result = Schema.safeParse(Object.fromEntries(form));

  if (result.success) {
    return prisma.emailTransport.create({
      data: { userId, ...result.data },
      select: { id: true },
    });
  } else {
    return { errors: getErrors(result.error, form) };
  }
}

export function destroy(id: string, userId: string) {
  return prisma.emailTransport
    .deleteMany({ where: { id, userId } })
    .then(() => ({ id }));
}

export function update(id: string, userId: string, form: FormData) {
  const result = Schema.partial().safeParse(Object.fromEntries(form));

  if (result.success) {
    return prisma.emailTransport.update({
      where: { id_userId: { id, userId } },
      data: result.data,
      select: { id: true },
    });
  } else {
    return { errors: getErrors(result.error, form) };
  }
}
