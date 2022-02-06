import type { LoaderFunction, ActionFunction, MetaFunction } from 'remix';
import {
  Form,
  useTransition,
  useLoaderData,
  useActionData,
  redirect,
} from 'remix';
import { SkipNavContent } from '@reach/skip-nav';

import { authenticator } from '~/util/auth.server';
import * as EmailTemplate from '~/models/EmailTemplate';
import * as EmailTransport from '~/models/EmailTransport';
import { Button, LinkButton } from '~/components/Form';
import { StateIcon } from '~/components/Spinner';
import { EmailTemplateFields } from '~/components/EmailTemplateForm';
import { Header, Breadcrumb } from '~/components/Header';

export const meta: MetaFunction = () => ({
  title: 'Sendit - New Email Template',
});
export const handle = { hydrate: true };
export const loader: LoaderFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: '/signin',
  });

  const transports = await EmailTransport.findAll(user.id);

  return { transports };
};
export const action: ActionFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: '/signin',
  });

  const form = await request.formData();
  const result = await EmailTemplate.create(user.id, form);

  if ('id' in result) {
    return redirect(`/templates/${result.id}`);
  }
  return result;
};

type ActionData = EmailTemplate.ActionData;

export default function NewEmailTemplateRoute() {
  const transition = useTransition();
  const { transports } =
    useLoaderData<{ transports: { id: string; name: string }[] }>();
  const actionData = useActionData<ActionData>();

  return (
    <div>
      <Header title="Sendit">
        <Breadcrumb title="New Email Template" to="/templates/new" />
      </Header>
      <SkipNavContent />
      <Form
        method="post"
        replace
        noValidate
        className="space-y-6"
        aria-labelledby="email-template"
      >
        <EmailTemplateFields
          legend="New Email Template"
          id="email-template"
          values={{ transportId: transports[0].id }}
          transports={transports.map(({ id: value, name: label }) => ({
            label,
            value,
          }))}
          errors={transition.type == 'idle' ? actionData?.errors : undefined}
          disabled={transition.state == 'submitting'}
        />

        <div className="flex items-center justify-end">
          <Button
            type="submit"
            disabled={transition.state == 'submitting'}
            primary
          >
            <StateIcon
              state={transition.state == 'submitting' ? 'loading' : 'idle'}
            />
            {transition.state == 'submitting' ? 'Saving...' : 'Save'}
          </Button>
          <LinkButton to="/" className="ml-2">
            Cancel
          </LinkButton>
        </div>
      </Form>
    </div>
  );
}
