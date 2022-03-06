import { Link } from 'remix';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid';
import { UserCircleIcon } from '@heroicons/react/outline';
import type { ReactNode } from 'react';

export function Breadcrumb({ title, to }: { title: string; to: string }) {
  return (
    <li>
      <div className="flex items-center">
        <ChevronRightIcon
          className="h-5 w-5 flex-shrink-0 text-gray-400"
          aria-hidden="true"
        />
        <Link
          to={to}
          aria-current="page"
          className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          {title}
        </Link>
      </div>
    </li>
  );
}

export function Header({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-4 mt-2">
      <div>
        <nav className="sm:hidden" aria-label="Back">
          <Link
            to="/"
            className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            <ChevronLeftIcon
              className="-ml-1 mr-1 h-5 w-5 flex-shrink-0 text-gray-400"
              aria-hidden="true"
            />
            Back
          </Link>
        </nav>
        <nav className="hidden sm:flex" aria-label="Breadcrumb">
          <ol role="list" className="flex items-center space-x-4">
            <li>
              <div className="flex">
                <Link
                  to="/"
                  className="text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  Dashboard
                </Link>
              </div>
            </li>
            {children}
          </ol>
        </nav>
      </div>
      <div className="mt-2 md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
            {title}
          </h1>
        </div>
        <div className="mt-4 flex flex-shrink-0 md:mt-0 md:ml-4">
          <Link
            to="/account"
            className="text-base font-normal leading-none text-gray-400"
          >
            <span className="sr-only">Account</span>
            <UserCircleIcon className="h-7 w-7" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}
