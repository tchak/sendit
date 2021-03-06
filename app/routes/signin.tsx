import type { MetaFunction, LoaderFunction, ActionFunction } from 'remix';
import { useTransition, Form, useLoaderData } from 'remix';

import { authenticator } from '~/util/auth.server';
import { sessionStorage } from '~/util/session.server';
import { Input } from '~/components/Form';
import { Button } from '~/components/Button';

export const meta: MetaFunction = () => ({ title: 'Sign In' });
export const handle = { hydrate: true };
export const loader: LoaderFunction = async ({ request }) => {
  await authenticator.isAuthenticated(request, { successRedirect: '/' });
  const session = await sessionStorage.getSession(
    request.headers.get('cookie')
  );
  return {
    magicLinkSent: session.has('auth:magiclink'),
    error: session.get('auth:error'),
  };
};
export const action: ActionFunction = async ({ request }) => {
  await authenticator.authenticate('email-link', request, {
    successRedirect: '/signin',
    failureRedirect: '/signin',
  });
};

export default function SignInRoute() {
  const transition = useTransition();
  const { magicLinkSent, error } =
    useLoaderData<{ magicLinkSent: boolean; error?: string }>();
  const isSigningIn = transition.type == 'actionSubmission';

  return (
    <div className="flex min-h-full flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h1>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {magicLinkSent ? (
            <p>Magic link sent! Check your email.</p>
          ) : (
            <Form
              action="/signin"
              method="post"
              aria-labelledby="signin"
              replace
              noValidate
              className="space-y-6"
            >
              <Input
                label="Email"
                name="email"
                type="email"
                required
                disabled={isSigningIn}
                errorMessage={error}
              />
              <div>
                <Button type="submit" primary className="w-full justify-center">
                  {isSigningIn ? 'Signing in...' : 'Sign in'}
                </Button>
              </div>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
}
