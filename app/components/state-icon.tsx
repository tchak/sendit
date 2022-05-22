import clsx from 'clsx';
import { ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/solid';

export type State = 'ok' | 'error' | 'loading' | 'idle';

export function StateIcon({ state }: { state: State }) {
  switch (state) {
    case 'ok':
      return <CheckCircleIcon className="mr-2 h-4 w-4 text-green-500" />;
    case 'error':
      return <ExclamationCircleIcon className="mr-2 h-4 w-4 text-red-500" />;
    case 'loading':
      return <Spinner className="mr-2 h-4 w-4 text-white" />;
    default:
      return null;
  }
}

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={clsx('hidden animate-spin motion-safe:block', className)}
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
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
}
