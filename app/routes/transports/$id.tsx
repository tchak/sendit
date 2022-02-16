import type {
  LoaderFunction,
  MetaFunction,
  ActionFunction,
  RouteHandle,
} from 'remix';
import {
  Form,
  useTransition,
  useLoaderData,
  useActionData,
  useFetcher,
} from 'remix';
import { useEffect, useState } from 'react';
import { SkipNavContent } from '@reach/skip-nav';
import { z } from 'zod';

import { authenticator } from '~/util/auth.server';
import * as EmailTransport from '~/models/EmailTransport';
import { Button, LinkButton } from '~/components/Form';
import { StateIcon, State } from '~/components/Spinner';
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

  if (request.method.toLowerCase() == 'delete') {
    await EmailTransport.destroy(transportId, user.id);
    return null;
  }

  const form = await request.formData();
  const result = await EmailTransport.update(transportId, user.id, form);

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
  const [state, verify] = useVerifyTransport(data.id);

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

        <div className="flex items-center justify-between">
          <Button onClick={() => verify()} primary>
            <StateIcon state={state} />
            Verify
          </Button>
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
    </div>
  );
}

function useVerifyTransport(id: string): [State, () => void] {
  const fetcher = useFetcher<{ ok: boolean }>();
  const [state, setState] = useState<State>('idle');
  useEffect(() => {
    if (fetcher.type == 'done') {
      setState(fetcher.data.ok ? 'ok' : 'error');
    } else if (fetcher.type == 'normalLoad') {
      setState('loading');
    } else {
      setState('idle');
    }
  }, [fetcher.type, fetcher.data]);
  return [
    state,
    () => {
      fetcher.load(`/transports/${id}/verify`);
    },
  ];
}
