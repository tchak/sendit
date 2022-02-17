import type { LoaderFunction, MetaFunction, ActionFunction } from 'remix';
import {
  Form,
  useTransition,
  useLoaderData,
  useActionData,
  useNavigate,
  Link,
} from 'remix';
import { useState } from 'react';
import { SkipNavContent } from '@reach/skip-nav';
import { Tooltip } from '@reach/tooltip';
import { z } from 'zod';
import clsx from 'clsx';
import { getParamsOrFail, getSearchParamsOrFail } from 'remix-params-helper';

import { authenticator } from '~/util/auth.server';
import * as EmailTemplate from '~/models/EmailTemplate';
import { Button, LinkButton } from '~/components/Form';
import { StateIcon } from '~/components/Spinner';
import { EmailTemplateUpdateFields } from '~/components/EmailTemplateForm';
import { Header, Breadcrumb } from '~/components/Header';
import { SendDialog } from '~/components/SendDialog';

export const meta: MetaFunction = () => ({
  title: 'Sendit - Email Template',
});
export const handle = { hydrate: true };
export const loader: LoaderFunction = async ({ request, params }) => {
  const { id: templateId } = getParamsOrFail(
    params,
    z.object({ id: z.string().uuid() })
  );
  const { state } = getSearchParamsOrFail(
    request,
    z.object({
      state: z.string().optional(),
    })
  );
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: '/signin',
  });
  return EmailTemplate.findById(
    templateId,
    user.id,
    state ? (capitalize(state) as keyof LoaderData['states']) : undefined
  );
};
export const action: ActionFunction = async ({ request, params }) => {
  const templateId = z.string().parse(params.id);
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: '/signin',
  });

  if (request.method.toLowerCase() == 'delete') {
    await EmailTemplate.destroy(templateId, user.id);
    return null;
  }

  const form = await request.formData();
  const result = await EmailTemplate.update(templateId, user.id, form);

  if ('id' in result) {
    return null;
  }
  return result;
};

type LoaderData = Awaited<ReturnType<typeof EmailTemplate.findById>>;
type ActionData = EmailTemplate.ActionData;

export default function EditEmailTransportRoute() {
  const transition = useTransition();
  const { states, ...data } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const [open, setOpen] = useState(false);

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
          fields={data.fields.map((value) => ({
            label: value,
            value,
          }))}
          transports={data.transports.map(({ id: value, name: label }) => ({
            label,
            value,
          }))}
          tags={data.fields}
          errors={transition.type == 'idle' ? actionData?.errors : undefined}
          disabled={transition.state == 'submitting'}
        />

        <div className="flex items-center justify-between">
          <Tooltip
            label={
              states.Pending?.count == 0 ? 'No emails to send' : 'Send emails'
            }
          >
            <Button
              primary
              disabled={states.Pending?.count == 0}
              onClick={() => setOpen(true)}
            >
              Send
            </Button>
          </Tooltip>
          <div className="flex items-center">
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
        </div>
      </Form>

      {Object.keys(states).length > 0 ? (
        <StateTabs states={states} className="mt-6" />
      ) : null}

      <ul role="list" className="mt-6">
        {data.messages.map((message, index) => (
          <EmailPreview key={message.to.join(',') + index} message={message} />
        ))}
      </ul>

      <SendDialog
        open={open}
        close={() => setOpen(false)}
        templateId={data.id}
      />
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
              {message.to.join(', ')}
            </dd>
          </div>
          <div className="py-2 sm:py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
            <dt className="text-sm font-medium text-gray-500">subject:</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {message.subject}
            </dd>
          </div>
          <div className="py-2 sm:py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
            <dt className="text-sm font-medium text-gray-500">state:</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <span
                className={clsx(
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  {
                    'bg-green-100 text-green-800': message.state == 'Sent',
                    'bg-red-100 text-red-800': message.state == 'Error',
                    'bg-blue-100 text-blue-800': message.state == 'Pending',
                  }
                )}
              >
                {message.state}
              </span>
            </dd>
          </div>
          {message.lastErrorMessage ? (
            <div className="py-2 sm:py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
              <dt className="text-sm font-medium text-gray-500">
                error message:
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {message.lastErrorMessage}
              </dd>
            </div>
          ) : null}
          <div className="py-2 sm:py-3 sm:px-3">
            <dd className="text-sm">
              <pre className="whitespace-pre-wrap">{message.text}</pre>
            </dd>
          </div>
        </dl>
      </div>
    </li>
  );
}

function capitalize(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function StateTabs({
  states,
  className,
}: {
  states: LoaderData['states'];
  className?: string;
}) {
  const navigate = useNavigate();
  const current = Object.entries(states).find(([, { current }]) => current);
  return (
    <div className={className}>
      <div className="sm:hidden">
        <label htmlFor="state" className="sr-only">
          Select a tab
        </label>
        {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
        <select
          id="state"
          name="state"
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          defaultValue={current ? current[0] : 'Pending'}
          onChange={(event) => {
            navigate(`?state=${event.target.value.toLowerCase()}`);
          }}
        >
          {Object.keys(states).map((state) => (
            <option key={state}>{state}</option>
          ))}
        </select>
      </div>
      <div className="hidden sm:block">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {Object.entries(states).map(([state, { count, current }]) => (
              <Link
                key={state}
                to={`?state=${state.toLowerCase()}`}
                className={clsx(
                  current
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200',
                  'whitespace-nowrap flex py-4 px-1 border-b-2 font-medium text-sm'
                )}
                aria-current={current ? 'page' : undefined}
              >
                {state}
                {count ? (
                  <span
                    className={clsx(
                      current
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-900',
                      'hidden ml-3 py-0.5 px-2.5 rounded-full text-xs font-medium md:inline-block'
                    )}
                  >
                    {count}
                  </span>
                ) : null}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
