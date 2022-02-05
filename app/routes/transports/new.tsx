import type { ActionFunction, MetaFunction } from 'remix';
import { Form, useTransition, redirect, useActionData } from 'remix';
import { SkipNavContent } from '@reach/skip-nav';

import { authenticator } from '~/util/auth.server';
import * as EmailTransport from '~/models/EmailTransport';
import { Button, LinkButton } from '~/components/Form';
import { Spinner } from '~/components/Spinner';
import { EmailTransportFields } from '~/components/EmailTransportForm';
import { Header, Breadcrumb } from '~/components/Header';

export const meta: MetaFunction = () => ({
  title: 'Sendit - New Email Transport',
});
export const handle = { hydrate: true };
export const action: ActionFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: '/signin',
  });

  const form = await request.formData();
  const result = await EmailTransport.create(user.id, form);

  if ('id' in result) {
    return redirect('/');
  }
  return result;
};

export default function NewEmailTransportRoute() {
  const transition = useTransition();
  const actionData = useActionData<{ errors?: EmailTransport.Errors }>();

  return (
    <div>
      <Header title="Sendit">
        <Breadcrumb title="New Email Transport" to="/transports/new" />
      </Header>
      <SkipNavContent />
      <Form
        method="post"
        replace
        noValidate
        className="space-y-6"
        aria-labelledby="email-transport"
      >
        <EmailTransportFields
          legend="New Email Transport"
          id="email-transport"
          errors={transition.type == 'idle' ? actionData?.errors : undefined}
          disabled={transition.state == 'submitting'}
        />
        <div className="flex items-center justify-end">
          <LinkButton to="/" className="mr-2">
            Cancel
          </LinkButton>
          <Button
            type="submit"
            disabled={transition.state == 'submitting'}
            primary
          >
            {transition.state == 'submitting' ? (
              <>
                <Spinner />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </Button>
        </div>
      </Form>
    </div>
  );
}
