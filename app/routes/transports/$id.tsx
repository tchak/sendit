import type {
  LoaderFunction,
  MetaFunction,
  ActionFunction,
  RouteHandle,
} from 'remix';
import { Form, useTransition, useLoaderData, useActionData } from 'remix';
import { SkipNavContent } from '@reach/skip-nav';
import { z } from 'zod';

import { authenticator } from '~/util/auth.server';
import * as EmailTransport from '~/models/EmailTransport';
import { Button, LinkButton } from '~/components/Form';
import { Spinner } from '~/components/Spinner';
import { EmailTransportFields } from '~/components/EmailTransportForm';
import { Header, Breadcrumb } from '~/components/Header';

export const meta: MetaFunction = () => ({
  title: 'Sendit - Email Transport',
});
export const handle: RouteHandle = { hydrate: true };
export const loader: LoaderFunction = async ({ request, params }) => {
  const transportId = z.string().parse(params.id);
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: '/signin',
  });
  return EmailTransport.findById(transportId, user.id);
};
export const action: ActionFunction = async ({ request, params }) => {
  const transportId = z.string().parse(params.id);
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: '/signin',
  });

  const form = await request.formData();
  const result = await EmailTransport.update(user.id, transportId, form);

  if ('id' in result) {
    return null;
  }
  return result;
};

type LoaderData = Awaited<ReturnType<typeof EmailTransport.findById>>;
type ActionData = EmailTransport.ActionData;

export default function EditEmailTransportRoute() {
  const transition = useTransition();
  const data = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();

  return (
    <div>
      <Header title="Sendit">
        <Breadcrumb title={data.name} to={`/transports/${data.id}`} />
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
          legend="Edit Email Transport"
          id="email-transport"
          values={data}
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
