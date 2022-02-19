import type { LoaderFunction } from 'remix';
import { z } from 'zod';
import { getParamsOrFail } from 'remix-params-helper';

import { authenticator } from '~/util/auth.server';
import * as EmailMessage from '~/models/EmailMessage';

export const loader: LoaderFunction = async ({ request, params }) => {
  const { id: templateId } = getParamsOrFail(
    params,
    z.object({ id: z.string().uuid() })
  );
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: '/signin',
  });
  return EmailMessage.findAllByTemplateId(templateId, user.id);
};
