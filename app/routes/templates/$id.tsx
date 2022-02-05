import type { LoaderFunction, MetaFunction, ActionFunction } from 'remix';
import { Form, useTransition, useLoaderData, useActionData } from 'remix';
import { SkipNavContent } from '@reach/skip-nav';
import { z } from 'zod';

import { authenticator } from '~/util/auth.server';
import * as EmailTransport from '~/models/EmailTransport';
import * as EmailTemplate from '~/models/EmailTemplate';
import { Button, LinkButton } from '~/components/Form';
import { Spinner } from '~/components/Spinner';
import { EmailTemplateUpdateFields } from '~/components/EmailTemplateForm';
import { Header, Breadcrumb } from '~/components/Header';

export const meta: MetaFunction = () => ({
  title: 'Sendit - Email Template',
});
export const handle = { hydrate: true };
export const loader: LoaderFunction = async ({ request, params }) => {
  const templateId = z.string().parse(params.id);
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: '/signin',
  });
  const transports = await EmailTransport.findAll(user.id);
  return {
    transports,
    template: await EmailTemplate.findById(templateId, user.id),
  };
};
export const action: ActionFunction = async ({ request, params }) => {
  const templateId = z.string().parse(params.id);
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: '/signin',
  });

  const form = await request.formData();
  const result = await EmailTemplate.update(templateId, user.id, form);

  if ('id' in result) {
    return null;
  }
  return result;
};

type LoaderData = Awaited<ReturnType<typeof EmailTemplate.findById>>;

export default function EditEmailTransportRoute() {
  const transition = useTransition();
  const { template, transports } = useLoaderData<{
    transports: { id: string; name: string }[];
    template: LoaderData;
  }>();
  const actionData = useActionData<{ errors?: EmailTemplate.UpdateErrors }>();
  return (
    <div>
      <Header title="Sendit">
        <Breadcrumb title={template.subject} to={`/templates/${template.id}`} />
      </Header>
      <SkipNavContent />
      <Form
        method="post"
        replace
        noValidate
        className="space-y-6"
        aria-labelledby="email-template"
      >
        <EmailTemplateUpdateFields
          legend="Edit Email Template"
          id="email-template"
          values={template}
          options={{
            emailColumns: template.data.meta.fields.map((value) => ({
              label: value,
              value,
            })),
            transportId: transports.map(({ id: value, name: label }) => ({
              label,
              value,
            })),
          }}
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
