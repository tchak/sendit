import { createTransport, SendMailOptions } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

export type Email = SendMailOptions;
export type SMTPOptions = SMTPTransport.Options;

export async function sendmail({
  smtp,
  email,
}: {
  smtp: SMTPOptions;
  email: Email;
}): Promise<boolean | Error> {
  const transport = getTransport(smtp);
  const ok = await transport.verify();

  if (ok) {
    try {
      await transport.sendMail(email);
      return true;
    } catch (error) {
      return error as Error;
    }
  } else {
    return false;
  }
}

function getTransport(smtp: SMTPOptions) {
  return createTransport({
    ...smtp,
    secure: true,
    tls: {
      rejectUnauthorized: true,
      minVersion: 'TLSv1.2',
    },
  });
}
