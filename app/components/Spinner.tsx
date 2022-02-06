import clsx from 'clsx';
import { ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/solid';

export type State = 'ok' | 'error' | 'loading' | 'idle';

export function StateIcon({ state }: { state: State }) {
  switch (state) {
    case 'ok':
      return <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />;
    case 'error':
      return <ExclamationCircleIcon className="h-4 w-4 text-red-500 mr-2" />;
    case 'loading':
      return <Spinner className="h-4 w-4 text-white mr-2" />;
    default:
      return null;
  }
}

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={clsx('hidden motion-safe:block animate-spin', className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
}
