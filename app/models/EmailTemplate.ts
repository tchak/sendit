import { z } from 'zod';
import Papa from 'papaparse';
import mjml2html from 'mjml';
import { convert as htmlToText } from 'html-to-text';

import { getErrors, Errors } from '~/util/form';
import { prisma } from '~/util/db.server';
import {
  Document as Body,
  isList,
  isTag,
  Descendant,
  FormattedText,
} from './TemplateDocument';

export type ActionData = { errors?: Errors<Schema> };

const Row = z.record(z.string(), z.union([z.string(), z.number()]).nullish());
type Row = z.infer<typeof Row>;
const CSV = z.object({
  data: Row.array(),
  meta: z.object({ delimiter: z.string(), fields: z.string().array() }),
});

const Schema = z.object({
  subject: z.string(),
  transportId: z.string().uuid().nullable(),
  body: Body,
  data: CSV,
  emailColumns: z.string().array(),
});
export type Schema = z.infer<typeof Schema>;

const SchemaCreate = z.object({
  subject: z.string().min(1),
  transportId: z.string().uuid(),
  data: z.string().transform((csv) => {
    const parsedResult = Papa.parse(csv, {
      dynamicTyping: true,
      header: true,
    });
    return CSV.parse(parsedResult);
  }),
});

const SchemaUpdate = z
  .object({
    subject: z.string().min(1),
    body: z.string().transform((json) => Body.parse(JSON.parse(json))),
    transportId: z.string().uuid().nullable(),
    emailColumns: z
      .string()
      .transform((name) => [name])
      .or(z.string().array()),
  })
  .partial();

export async function findById(id: string, userId: string) {
  const { user, transport, ...template } =
    await prisma.emailTemplate.findUnique({
      rejectOnNotFound: true,
      where: { id_userId: { id, userId } },
      select: {
        id: true,
        subject: true,
        body: true,
        emailColumns: true,
        data: true,
        transport: {
          select: { id: true, email: true },
        },
        user: {
          select: {
            transports: {
              orderBy: { createdAt: 'asc' },
              select: { id: true, name: true },
            },
          },
        },
      },
    });
  const data = CSV.parse(template.data);
  const body = Body.parse(template.body);
  const fields = data.meta.fields;
  const messages = data.data
    .filter((row) => isValidRow(body, row))
    .slice(0, 3)
    .map((row) => {
      const html = renderHTML(template.subject, body, row);
      const text = htmlToText(html, { wordwrap: false });
      return {
        from: transport?.email ?? '',
        to: template.emailColumns.map((name) => row[name]).join(', '),
        subject: template.subject,
        html,
        text,
      };
    });

  return {
    ...template,
    transportId: transport?.id,
    data,
    body,
    fields,
    messages,
    transports: user.transports,
  };
}

export function create(userId: string, form: FormData) {
  const result = SchemaCreate.safeParse(Object.fromEntries(form));

  if (result.success) {
    return prisma.emailTemplate.create({
      data: {
        userId,
        ...result.data,
        body: [{ type: 'paragraph', children: [{ text: '' }] }],
      },
      select: { id: true },
    });
  } else {
    return { errors: getErrors(result.error, form) };
  }
}

export function update(id: string, userId: string, form: FormData) {
  const result = SchemaUpdate.safeParse(Object.fromEntries(form));

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

function isValidRow(body: Body, row: Row) {
  const tags = body.flatMap((element) =>
    isList(element)
      ? element.children.flatMap((element) => element.children.filter(isTag))
      : element.children.filter(isTag)
  );
  return tags.length == 0 || tags.every(({ tag }) => !!row[tag]);
}

function renderBody(body: Body, row: Row): string {
  return body
    .map((node) => {
      if (isList(node)) {
        const list = node.children
          .map((node) =>
            node.children.map((node) => renderLeaf(node, row)).join('')
          )
          .map((text) => `<li>${text}</li>`)
          .join('');
        return `<mj-text><ul>${list}</ul></mj-text>`;
      }

      const block = node.children.map((node) => renderLeaf(node, row)).join('');
      return `<mj-text>${block}</mj-text>`;
    })
    .join('');
}

function renderHTML(
  subject: string,
  body: Body,
  row: Row,
  styles: Record<string, string> = {}
) {
  return mjml2html(`<mjml>
  <mj-head>
    <mj-attributes>
      <mj-text ${Object.entries(styles)
        .map(([name, value]) => `${name}="${value}"`)
        .join(' ')} />
    </mj-attributes>
    <mj-title>${subject}</mj-title>
  </mj-head>
  <mj-body>
    <mj-section>
      <mj-column>
        ${renderBody(body, row)}
      </mj-column>
    </mj-section>
  </mj-body>
  </mjml>`).html;
}

function renderText(node: FormattedText) {
  return node.text;
}

function renderLeaf(node: Descendant, row: Row): string {
  if ('text' in node) {
    return renderText(node);
  } else if (node.type == 'tag') {
    return String(row[node.tag]);
  }
  const title = node.children.map((node) => renderLeaf(node, row)).join('');
  return `[${title}](${node.url})`;
}
