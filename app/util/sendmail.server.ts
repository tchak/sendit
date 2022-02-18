import { createTransport, SendMailOptions } from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import type JSONTransport from 'nodemailer/lib/json-transport';

export type Email = SendMailOptions;
export type SMTPOptions = SMTPTransport.Options;
export type GetTransportOptions =
  | { type: 'json' }
  | { type: 'smtp'; options: SMTPOptions };

export function verify(options: SMTPOptions) {
  return getTransport(options)
    .verify()
    .catch(() => false);
}

class EmailTransportError extends Error {
  isSMTPError = true;
}

export async function sendmail({
  transport,
  email,
}: {
  transport: GetTransportOptions;
  email: Email;
}): Promise<void> {
  try {
    if (transport.type == 'smtp') {
      await getTransport(transport.options).sendMail(email);
    } else {
      const sentMessageInfo = await jsonTransport.sendMail(email);
      sentEmails.push(sentMessageInfo);
    }
  } catch (error) {
    throw new EmailTransportError((error as Error).message);
  }
}

const TIMEOUT = 3000;

const jsonTransport = createTransport({ jsonTransport: true });
const sentEmails: JSONTransport.SentMessageInfo[] = [];
export function getSentMessages() {
  return sentEmails;
}

function getTransport(options: SMTPOptions) {
  return createTransport({
    ...options,
    connectionTimeout: TIMEOUT,
    greetingTimeout: TIMEOUT,
    secure: true,
    tls: {
      rejectUnauthorized: true,
      minVersion: 'TLSv1.2',
    },
  });
}
