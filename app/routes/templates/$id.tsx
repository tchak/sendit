import type { LoaderFunction, MetaFunction, ActionFunction } from 'remix';
import { Form, useTransition, useLoaderData, useActionData } from 'remix';
import { SkipNavContent } from '@reach/skip-nav';
import { z } from 'zod';

import { authenticator } from '~/util/auth.server';
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
  return EmailTemplate.findById(templateId, user.id);
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
  const data = useLoaderData<LoaderData>();
  const actionData = useActionData<{ errors?: EmailTemplate.UpdateErrors }>();

  return (
    <div>
      <Header title="Sendit">
        <Breadcrumb title={data.subject} to={`/templates/${data.id}`} />
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
          values={data}
          options={{
            emailColumns: data.fields.map((value) => ({
              label: value,
              value,
            })),
            transportId: data.transports.map(({ id: value, name: label }) => ({
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

      <ul className="mt-6">
        {data.messages.map((message) => (
          <EmailPreview message={message} />
        ))}
      </ul>
    </div>
  );
}

function EmailPreview({ message }: { message: LoaderData['messages'][0] }) {
  return (
    <li className="bg-white shadow overflow-hidden sm:rounded-lg mb-4">
      <div className="px-2 py-3 sm:p-0">
        <dl className="sm:divide-y sm:divide-gray-200">
          <div className="py-2 sm:py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
            <dt className="text-sm font-medium text-gray-500">to:</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {message.to}
            </dd>
          </div>
          <div className="py-2 sm:py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
            <dt className="text-sm font-medium text-gray-500">subject:</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {message.subject}
            </dd>
          </div>
          <div className="py-2 sm:py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
            <p className="text-sm">{message.body}</p>
          </div>
        </dl>
      </div>
    </li>
  );
}
