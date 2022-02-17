import type { ActionFunction } from 'remix';
import { z } from 'zod';
import { getParamsOrFail } from 'remix-params-helper';

import { authenticator } from '~/util/auth.server';
import { sendmail } from '~/util/sendmail.server';
import * as EmailMessage from '~/models/EmailMessage';

export const action: ActionFunction = async ({ request, params }) => {
  const { id: messageId } = getParamsOrFail(
    params,
    z.object({ id: z.string().uuid() })
  );
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: '/signin',
  });

  const {
    template: { transport },
    ...message
  } = await EmailMessage.findById(messageId, user.id);

  if (transport) {
    try {
      await sendmail({
        smtp: {
          host: transport.host,
          port: transport.port,
          auth: { user: transport.username, pass: transport.password },
        },
        email: message,
      });
      await EmailMessage.markAsSent(message.id, 'Sent');
    } catch (error) {
      await EmailMessage.markAsSent(
        message.id,
        'Error',
        (error as Error).message
      );
    }
  }
  return { ok: true };
};
