import type { ActionFunction } from 'remix';
import { z } from 'zod';

import { authenticator } from '~/util/auth.server';
//import { sendmail } from '~/util/sendmail.server';
import * as EmailMessage from '~/models/EmailMessage';

export const action: ActionFunction = async ({ request, params }) => {
  const messageId = z.string().uuid().parse(params.id);
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: '/signin',
  });

  const message = await EmailMessage.findById(messageId, user.id);
  EmailMessage.markAsSent(message.id, 'Sent');
  await awaitTimeout(200);
  return { ok: true };
};

const awaitTimeout = (delay: number, reason?: string) =>
  new Promise((resolve, reject) =>
    setTimeout(
      () => (reason === undefined ? resolve(true) : reject(reason)),
      delay
    )
  );
