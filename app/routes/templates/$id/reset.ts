import { ActionFunction, redirect } from 'remix';
import { z } from 'zod';
import { getParamsOrFail } from 'remix-params-helper';

import { authenticator } from '~/util/auth.server';
import * as EmailMessage from '~/models/EmailMessage';

export const action: ActionFunction = async ({ request, params }) => {
  const { id: templateId } = getParamsOrFail(
    params,
    z.object({ id: z.string().uuid() })
  );
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: '/signin',
  });

  await EmailMessage.reset(templateId, user.id);

  return redirect(`/templates/${templateId}?state=pending`);
};
