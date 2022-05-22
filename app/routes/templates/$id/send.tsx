import { useLoaderData, useNavigate } from '@remix-run/react';
import type { LoaderFunction, MetaFunction } from '@remix-run/node';
import { z } from 'zod';
import { getParamsOrFail } from 'remix-params-helper';
import { useRef, useState } from 'react';
import { CheckIcon } from '@heroicons/react/outline';

import { authenticator } from '~/util/auth.server';
import * as EmailMessage from '~/models/EmailMessage';
import { Button } from '~/components/Button';
import { Dialog } from '~/components/dialog';

export const meta: MetaFunction = () => ({
  title: 'Sendit - Email Template',
});
export const handle = { hydrate: true };
export const loader: LoaderFunction = async ({ request, params }) => {
  const { id: templateId } = getParamsOrFail(
    params,
    z.object({ id: z.string().uuid() })
  );
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: '/signin',
  });
  const messages = await EmailMessage.findAllByTemplateId(templateId, user.id);
  return { id: templateId, messages };
};

type LoaderData = {
  id: string;
  messages: Awaited<ReturnType<typeof EmailMessage.findAllByTemplateId>>;
};

export default function EmailTemplateSendRoute() {
  const navigate = useNavigate();
  const data = useLoaderData<LoaderData>();
  const cancelButtonRef = useRef(null);
  const { done, sending, progress, total, send } = useSendMessages(
    data.messages.map(({ id }) => id)
  );
  const onClose = () => navigate(`/templates/${data.id}`);

  const buttons = done ? (
    <div className="mt-5 sm:mt-6">
      <Button
        className="w-full justify-center"
        primary
        onClick={onClose}
        ref={cancelButtonRef}
      >
        Done
      </Button>
    </div>
  ) : !sending ? (
    <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
      <Button className="justify-center" primary onClick={send}>
        Send
      </Button>
      <Button
        className="justify-center"
        onClick={onClose}
        ref={cancelButtonRef}
      >
        Cancel
      </Button>
    </div>
  ) : null;

  return (
    <Dialog
      icon={<CheckIcon className="h-6 w-6 text-green-600" aria-hidden="true" />}
      title="Send Emails"
      buttons={buttons}
      onClose={onClose}
      initialFocus={cancelButtonRef}
    >
      <p className="text-sm text-gray-500">
        {done ? (
          <>{progress} emails sent!</>
        ) : (
          <>
            {progress} / {total}
          </>
        )}
      </p>
    </Dialog>
  );
}

function useSendMessages(messageIds: string[]): {
  done: boolean;
  sending: boolean;
  progress: number;
  total: number;
  send: () => void;
} {
  const navigate = useNavigate();
  const [progress, setIndex] = useState(0);

  const done = progress == messageIds.length;

  return {
    done,
    sending: !done && progress != 0,
    progress,
    total: messageIds?.length ?? 0,
    send: () => {
      if (messageIds) {
        sendMessages(
          messageIds,
          () => setIndex((index) => index + 1),
          () => navigate('.', { replace: true })
        );
      }
    },
  };
}

async function sendMessages(
  messageIds: string[],
  progress: () => void,
  done: () => void
) {
  for (const messageId of messageIds) {
    await fetch(`/messages/${messageId}/send`, { method: 'post' });
    progress();
  }
  done();
}
