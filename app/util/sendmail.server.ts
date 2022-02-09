import { createTransport, SendMailOptions } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

export type Email = SendMailOptions;
export type SMTPOptions = SMTPTransport.Options;

export async function verify(smtp: SMTPOptions) {
  const transport = getTransport(smtp);
  return transport.verify().catch(() => false);
}

class EmailTransportError extends Error {
  isSMTPError = true;
}

export async function sendmail({
  smtp,
  email,
}: {
  smtp: SMTPOptions;
  email: Email;
}): Promise<void> {
  const transport = getTransport(smtp);

  try {
    await transport.sendMail(email);
  } catch (error) {
    throw new EmailTransportError((error as Error).message);
  }
}

const TIMEOUT = 3000;

function getTransport(smtp: SMTPOptions) {
  return createTransport({
    ...smtp,
    connectionTimeout: TIMEOUT,
    greetingTimeout: TIMEOUT,
    secure: true,
    tls: {
      rejectUnauthorized: true,
      minVersion: 'TLSv1.2',
    },
  });
}
