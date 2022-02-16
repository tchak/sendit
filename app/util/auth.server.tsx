import { Authenticator } from 'remix-auth';
import { EmailLinkStrategy, SendEmailOptions } from 'remix-auth-email-link';
import { renderToString } from 'react-dom/server';
import { z } from 'zod';

import { sessionStorage } from './session.server';
import { getEnv } from '.';
import * as User from '~/models/User';
import { sendmail } from './sendmail.server';

export const authenticator = new Authenticator<User.Schema>(sessionStorage);

const secret = getEnv('AUTH_SECRET');
const smtp = {
  host: getEnv('SMTP_HOST'),
  port: parseInt(getEnv('SMTP_PORT')),
  auth: {
    user: getEnv('SMTP_USERNAME'),
    pass: getEnv('SMTP_PASSWORD'),
  },
};
const from = getEnv('SMTP_EMAIL');

async function sendEmail(options: SendEmailOptions<User.Schema>) {
  await sendmail({
    smtp,
    email: {
      from,
      to: options.emailAddress,
      subject: 'Sign in to Sendit',
      html: renderToString(
        <p>
          Hi {options.user?.email || 'there'},<br />
          <br />
          <a href={options.magicLink}>Click here to login</a>
        </p>
      ),
    },
  });
}

async function verifyEmailAddress(email: string) {
  const result = z.string().email().safeParse(email);
  if (!result.success) {
    throw new Error(result.error.issues[0].message);
  }
}

authenticator.use(
  new EmailLinkStrategy(
    { sendEmail, secret, verifyEmailAddress },
    ({ email }) => {
      return User.findOrCreateByEmail(email);
    }
  )
);
