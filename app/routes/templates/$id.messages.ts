import type { LoaderFunction } from 'remix';
import { z } from 'zod';

import { authenticator } from '~/util/auth.server';
import * as EmailMessage from '~/models/EmailMessage';

export const loader: LoaderFunction = async ({ request, params }) => {
  const templateId = z.string().uuid().parse(params.id);
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: '/signin',
  });
  return EmailMessage.findAllByTemplateId(templateId, user.id);
};
