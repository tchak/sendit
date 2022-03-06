import { Fragment, useEffect, useRef, useState } from 'react';
import { useNavigate, useFetcher } from 'remix';
import { Dialog, Transition } from '@headlessui/react';
import { CheckIcon } from '@heroicons/react/outline';

import { Button } from './Button';

export function SendDialog({
  open,
  close,
  templateId,
}: {
  open: boolean;
  close: () => void;
  templateId: string;
}) {
  const cancelButtonRef = useRef(null);
  const { done, sending, progress, total, send } = useSendMessages(
    templateId,
    open
  );

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto"
        initialFocus={cancelButtonRef}
        onClose={close}
      >
        <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>
          <span
            className="hidden sm:inline-block sm:h-screen sm:align-middle"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
              <div>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <CheckIcon
                    className="h-6 w-6 text-green-600"
                    aria-hidden="true"
                  />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Send Emails
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {done ? (
                        <>{progress} emails sent!</>
                      ) : (
                        <>
                          {progress} / {total}
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
              {done ? (
                <div className="mt-5 sm:mt-6">
                  <Button
                    className="w-full justify-center"
                    primary
                    onClick={close}
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
                    onClick={close}
                    ref={cancelButtonRef}
                  >
                    Cancel
                  </Button>
                </div>
              ) : null}
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

function useSendMessages(
  templateId: string,
  open: boolean
): {
  done: boolean;
  sending: boolean;
  progress: number;
  total: number;
  send: () => void;
} {
  const navigate = useNavigate();
  const fetcher = useFetcher<{ id: string }[]>();
  const [progress, setIndex] = useState(0);
  const [messageIds, setMessageIds] = useState<string[]>();

  const done = messageIds ? progress == messageIds.length : false;

  useEffect(() => {
    if (open) {
      fetcher.load(`/templates/${templateId}/messages`);
    }
  }, [open]);
  useEffect(() => {
    if (fetcher.type == 'done') {
      setMessageIds(fetcher.data.map(({ id }) => id));
    }
  }, [fetcher.type]);

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
