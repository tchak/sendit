import { createTransport, SendMailOptions } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

export type Email = SendMailOptions;
export type SMTPOptions = SMTPTransport.Options;

export async function verify(smtp: SMTPOptions) {
  const transport = getTransport(smtp);
  return transport.verify().catch(() => false);
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
      return false;
    }
  } catch (error) {
    return error as Error;
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
