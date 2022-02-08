import type { MetaFunction, LoaderFunction, ActionFunction } from 'remix';
import { useTransition, Form, useLoaderData } from 'remix';
import { SkipNavContent } from '@reach/skip-nav';

import { authenticator } from '~/util/auth.server';
import { sessionStorage } from '~/util/session.server';
import { Header } from '~/components/Header';
import { Input, Button, Fieldset } from '~/components/Form';

export const meta: MetaFunction = () => ({ title: 'Sign In' });
export const handle = { hydrate: true };
export const loader: LoaderFunction = async ({ request }) => {
  await authenticator.isAuthenticated(request, { successRedirect: '/' });
  const session = await sessionStorage.getSession(
    request.headers.get('cookie')
  );
  return { magicLinkSent: session.has('auth:magiclink') };
};
export const action: ActionFunction = async ({ request }) => {
  await authenticator.authenticate('email-link', request, {
    successRedirect: '/signin',
    failureRedirect: '/signin',
  });
};

export default function SignInRoute() {
  const transition = useTransition();
  const { magicLinkSent } = useLoaderData<{ magicLinkSent: boolean }>();
  const isSigningIn = transition.type == 'actionSubmission';

  if (magicLinkSent) {
    return (
      <div>
        <Header title="Sign In" />
        <SkipNavContent />
        <p>Magic link sent! Check your email.</p>
      </div>
    );
  }

  return (
    <div>
      <Header title="Sendit" />
      <SkipNavContent />
      <Form
        action="/signin"
        method="post"
        aria-labelledby="signin"
        replace
        noValidate
        className="space-y-6"
      >
        <Fieldset legend="Sign In to your account" id="signin">
          <Input label="Email" name="email" type="email" required />
        </Fieldset>
        <div className="flex items-center justify-between">
          <Button type="submit" primary disabled={isSigningIn}>
            {isSigningIn ? `Signing In...` : `Sign In`}
          </Button>
        </div>
      </Form>
    </div>
  );
}
