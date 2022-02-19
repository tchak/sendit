import type { MetaFunction, LoaderFunction } from 'remix';
import { SkipNavContent } from '@reach/skip-nav';

import { authenticator } from '~/util/auth.server';
import { LinkButton } from '~/components/Button';
import { Header, Breadcrumb } from '~/components/Header';

export const meta: MetaFunction = () => ({ title: 'Account' });
export const handle = { hydrate: true };
export const loader: LoaderFunction = ({ request }) =>
  authenticator.isAuthenticated(request, { failureRedirect: '/signin' });

export default function SignInRoute() {
  return (
    <div>
      <Header title="Sendit">
        <Breadcrumb title="Account" to="/account" />
      </Header>
      <SkipNavContent />
      <LinkButton to="/signout">Sign Out</LinkButton>
    </div>
  );
}
