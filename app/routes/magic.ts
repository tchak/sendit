import type { LoaderFunction } from 'remix';

import { authenticator } from '~/util/auth.server';

export const loader: LoaderFunction = ({ request }) =>
  authenticator.authenticate('email-link', request, {
    successRedirect: '/',
    failureRedirect: '/signin',
  });
