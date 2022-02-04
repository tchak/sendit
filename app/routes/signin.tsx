import type { MetaFunction, LoaderFunction } from 'remix';
import { useTransition, Form, useLoaderData } from 'remix';
import { SkipNavContent } from '@reach/skip-nav';

import { authenticator } from '~/util/auth.server';

export const meta: MetaFunction = () => ({ title: 'Sign In' });
export const handle = { hydrate: true };
export const loader: LoaderFunction = async ({ request }) => {
  await authenticator.isAuthenticated(request, { successRedirect: '/' });
  const actions = [
    { name: 'GitHub', action: '/auth/github' },
    { name: 'Twitter', action: '/auth/twitter' },
  ];
  if (process.env.NODE_ENV != 'production') {
    actions.push({ name: 'Dev', action: '/auth/dev' });
  }
  return actions;
};

export default function SignInRoute() {
  const transition = useTransition();
  const actions = useLoaderData<{ name: string; action: string }[]>();
  const isConnecting = (action: string) =>
    transition.type == 'actionSubmission' &&
    transition.location.pathname == action;

  return (
    <div>
      <h1 className="py-6">Sign In</h1>
      <SkipNavContent />
      {actions.map(({ name, action }) => (
        <Form
          key={action}
          action={action}
          method="post"
          replace
          className="mb-2"
        >
          <button
            type="submit"
            disabled={isConnecting(action)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isConnecting(action)
              ? `Connecting with ${name}...`
              : `Continue with ${name}`}
          </button>
        </Form>
      ))}
    </div>
  );
}
