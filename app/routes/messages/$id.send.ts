import type { ActionFunction } from 'remix';
import { z } from 'zod';
import { getParamsOrFail } from 'remix-params-helper';

import { authenticator } from '~/util/auth.server';
import { sendmail } from '~/util/sendmail.server';
import * as EmailMessage from '~/models/EmailMessage';
import * as EmailTransport from '~/models/EmailTransport';

export const action: ActionFunction = async ({ request, params }) => {
  const { id: messageId } = getParamsOrFail(
    params,
    z.object({ id: z.string().uuid() })
  );
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: '/signin',
  });

  const {
    template: { transportId },
    ...message
  } = await EmailMessage.findById(messageId, user.id);

  if (transportId) {
    const transport = await EmailTransport.findById(transportId, user.id);
    try {
      await sendmail({
        transport: {
          type: 'smtp',
          options: {
            host: transport.host,
            port: transport.port,
            auth: { user: transport.username, pass: transport.password },
          },
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
