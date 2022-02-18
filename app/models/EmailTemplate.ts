import { z } from 'zod';
import Papa from 'papaparse';
import mjml2html from 'mjml';
import { convert as htmlToText } from 'html-to-text';
import { getParams } from 'remix-params-helper';
import type { EmailMessageState } from '@prisma/client';

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
type CSV = z.infer<typeof CSV>;

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

const SchemaUpdate = z.object({
  subject: z.string().min(1),
  body: z.string(),
  transportId: z.string().uuid(),
  emailColumns: z.string().array(),
});

export async function findById(
  id: string,
  userId: string,
  state: EmailMessageState = 'Pending'
) {
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
      messages: {
        select: {
          to: true,
          subject: true,
          text: true,
          state: true,
          lastErrorMessage: true,
        },
        orderBy: { createdAt: 'asc' },
        where: { to: { isEmpty: false }, text: { not: '' }, state },
        take: 3,
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
  const states = await prisma.emailMessage.groupBy({
    by: ['state'],
    _count: true,
    where: {
      templateId: id,
      to: { isEmpty: false },
      text: { not: '' },
    },
  });
  const data = CSV.parse(template.data);
  const body = Body.parse(template.body);

  return {
    ...template,
    data,
    body,
    fields: data.meta.fields,
    transports: user.transports,
    states: Object.fromEntries(
      states.map(({ state: _state, _count }) => [
        _state,
        { count: _count, current: _state == state },
      ])
    ) as Record<EmailMessageState, { count: number; current: boolean }>,
  };
}

export function create(userId: string, form: FormData) {
  const result = SchemaCreate.safeParse(Object.fromEntries(form));

  if (result.success) {
    return prisma.emailTemplate.create({
      data: { userId, ...result.data },
      select: { id: true },
    });
  } else {
    return { errors: getErrors(result.error, form) };
  }
}

export function destroy(id: string, userId: string) {
  return prisma.emailTemplate
    .deleteMany({ where: { id, userId } })
    .then(() => ({ id }));
}

export async function update(id: string, userId: string, form: FormData) {
  const result = getParams(form, SchemaUpdate);

  if (result.success) {
    const template = await prisma.emailTemplate.update({
      where: { id_userId: { id, userId } },
      data: {
        userId,
        ...result.data,
        body: result.data.body
          ? Body.parse(JSON.parse(result.data.body))
          : undefined,
      },
      select: {
        id: true,
        subject: true,
        body: true,
        data: true,
        emailColumns: true,
        transport: { select: { email: true } },
        version: true,
      },
    });
    await prisma.emailMessage.deleteMany({
      where: { templateId: template.id, state: 'Pending' },
    });
    if (template.transport) {
      const messages = getMessages({
        from: template.transport.email,
        subject: template.subject,
        body: Body.parse(template.body),
        data: CSV.parse(template.data).data,
        emailColumns: template.emailColumns,
      });
      for (const { row, ...message } of messages) {
        const templateId_version_row = {
          templateId: template.id,
          version: template.version,
          row,
        };
        await prisma.emailMessage.upsert({
          where: { templateId_version_row },
          create: {
            ...message,
            ...templateId_version_row,
          },
          update: {},
        });
      }
    }

    return { id: template.id };
  } else {
    return {
      errors: Object.fromEntries(
        Object.entries(result.errors).map(([key, message]) => [
          key,
          { message },
        ])
      ),
    };
  }
}

type Message = {
  from: string;
  to: string[];
  subject: string;
  html: string;
  text: string;
  row: number;
};

function getMessages({
  subject,
  from,
  emailColumns,
  body,
  data,
}: {
  subject: string;
  from: string;
  emailColumns: string[];
  data: CSV['data'];
  body: Body;
}) {
  const messages: Message[] = [];
  for (let index = 0; index < data.length; index++) {
    const row = data[index];
    if (isValidRow(body, row)) {
      const html = renderHTML(subject, body, row);
      const text = htmlToText(html, { wordwrap: false });
      messages.push({
        from,
        to: emailColumns
          .filter((name) => row[name])
          .map((name) => String(row[name] ?? '')),
        subject,
        html,
        text,
        row: index,
      });
    }
  }
  return messages;
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
      if (block.length > 0) {
        return `<mj-text>${block
          .split(/\n/g)
          .join(`</mj-text><mj-text>`)}</mj-text>`;
      }
      return '';
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
