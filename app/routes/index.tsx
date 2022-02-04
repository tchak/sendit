import type { MetaFunction, LoaderFunction } from 'remix';
import { Link, useLoaderData } from 'remix';
import { SkipNavContent } from '@reach/skip-nav';

import type { User } from '~/models/user';
import { authenticator } from '~/util/auth.server';

export const meta: MetaFunction = () => ({ title: 'Sendit' });
export const handle = { hydrate: true };
export const loader: LoaderFunction = ({ request }) =>
  authenticator.isAuthenticated(request, { failureRedirect: '/signin' });

export default function IndexRoute() {
  const user = useLoaderData<User>();
  return (
    <div>
      <h1 className="py-6">Sendit</h1>
      <SkipNavContent />

      <p className="mb-4 text-base">Hello {user.name}</p>

      <Link
        to="/signout"
        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Sign Out
      </Link>
    </div>
  );
}
