import type { LoaderFunction } from 'remix';
import { z } from 'zod';
import { getParamsOrFail } from 'remix-params-helper';

import { authenticator } from '~/util/auth.server';
import { verify } from '~/util/sendmail.server';
import * as EmailTransport from '~/models/EmailTransport';

export const loader: LoaderFunction = async ({ request, params }) => {
  const { id: transportId } = getParamsOrFail(
    params,
    z.object({ id: z.string().uuid() })
  );
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: '/signin',
  });
  const transport = await EmailTransport.findById(transportId, user.id);
  return {
    ok: await verify({
      host: transport.host,
      port: transport.port,
      auth: { user: transport.username, pass: transport.password },
    }),
  };
};
