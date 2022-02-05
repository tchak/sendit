import { Link } from 'remix';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid';
import { UserCircleIcon } from '@heroicons/react/outline';
import type { ReactNode } from 'react';

export function Breadcrumb({ title, to }: { title: string; to: string }) {
  return (
    <li>
      <div className="flex items-center">
        <ChevronRightIcon
          className="flex-shrink-0 h-5 w-5 text-gray-400"
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
    <div className="mb-4">
      <div>
        <nav className="sm:hidden" aria-label="Back">
          <Link
            to="/"
            className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            <ChevronLeftIcon
              className="flex-shrink-0 -ml-1 mr-1 h-5 w-5 text-gray-400"
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
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            {title}
          </h2>
        </div>
        <div className="mt-4 flex-shrink-0 flex md:mt-0 md:ml-4">
          <Link
            to="/account"
            className="font-normal leading-none text-base text-gray-400"
          >
            <UserCircleIcon className="w-7 h-7" />
          </Link>
        </div>
      </div>
    </div>
  );
}
