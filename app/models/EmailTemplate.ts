import { z, ZodError } from 'zod';
import Papa from 'papaparse';

import { prisma } from '~/util/db.server';

const Schema = z.object({
  subject: z.string().min(1),
  transportId: z.string().uuid(),
  data: z.string(),
});
export type Schema = z.infer<typeof Schema>;
export type Errors = Record<
  keyof Schema,
  { message?: string; value?: string } | undefined
>;

const UpdateSchema = z.object({
  subject: z.string().min(1),
  body: z.string().nullable(),
  transportId: z.string().uuid().nullable(),
  emailColumns: z
    .string()
    .transform((name) => [name])
    .or(z.string().array()),
});
export type UpdateSchema = z.infer<typeof UpdateSchema>;
export type UpdateErrors = Record<
  keyof UpdateSchema,
  { message?: string; value?: string } | undefined
>;

const TemplateData = z.string().transform((csv) => {
  const parsedResult = Papa.parse(csv, {
    dynamicTyping: true,
    header: true,
  });
  return CSV.parse(parsedResult);
});
const CSV = z.object({
  data: z
    .record(z.string(), z.union([z.string(), z.number()]).nullish())
    .array(),
  meta: z.object({ delimiter: z.string(), fields: z.string().array() }),
});

export async function findById(id: string, userId: string) {
  const { user, ...template } = await prisma.emailTemplate.findUnique({
    rejectOnNotFound: true,
    where: { id_userId: { id, userId } },
    select: {
      id: true,
      subject: true,
      body: true,
      emailColumns: true,
      data: true,
      transportId: true,
      user: { select: { transports: { select: { id: true, name: true } } } },
    },
  });

  return {
    ...template,
    data: CSV.parse(template.data),
    transports: user.transports,
  };
}

export function create(userId: string, form: FormData) {
  const result = Schema.extend({ data: TemplateData }).safeParse(
    Object.fromEntries(form)
  );

  if (result.success) {
    return prisma.emailTemplate.create({
      data: { userId, ...result.data },
      select: { id: true },
    });
  } else {
    return { errors: getErrors(result.error, form) };
  }
}

export function update(id: string, userId: string, form: FormData) {
  const result = UpdateSchema.partial().safeParse(Object.fromEntries(form));

  if (result.success) {
    return prisma.emailTemplate.update({
      where: { id_userId: { id, userId } },
      data: { userId, ...result.data },
      select: { id: true },
    });
  } else {
    return { errors: getErrors(result.error, form) };
  }
}

function getErrors(error: ZodError, formData: FormData): Errors {
  const errors: Record<string, unknown> = {};
  const issues = Object.fromEntries(
    error.issues.map(({ message, path }) => [path[0], message])
  );
  for (const [name, value] of formData) {
    errors[name] = { value: String(value), message: issues[name] };
  }
  return errors as Errors;
}
