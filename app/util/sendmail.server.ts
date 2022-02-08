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
}): Promise<boolean | Error> {
  const transport = getTransport(smtp);

  try {
    const ok = await transport.verify();
    if (ok) {
      await transport.sendMail(email);
      return true;
    } else {
      throw new EmailTransportError('Email Transport verification failed');
    }
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
