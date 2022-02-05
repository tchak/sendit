import { Link } from 'remix';
import {
  MailIcon,
  PlusCircleIcon,
  DotsVerticalIcon,
} from '@heroicons/react/outline';

import { nbsp } from '~/util';

export function EmailTemplateCard({
  id,
  subject,
}: {
  id: string;
  subject: string;
}) {
  return (
    <li className="col-span-1 flex shadow-sm rounded-md">
      <div className="bg-blue-500 flex-shrink-0 flex items-center justify-center w-16 text-white text-sm font-medium rounded-l-md">
        <MailIcon className="w-6 h-6" />
      </div>
      <div className="flex-1 flex items-center justify-between border-t border-r border-b border-gray-200 bg-white rounded-r-md truncate">
        <div className="flex-1 px-4 py-2 text-sm truncate">
          <Link
            to={`/templates/${id}`}
            className="text-gray-900 font-medium hover:text-gray-600"
          >
            {subject}
          </Link>
          <div>{nbsp(' ')}</div>
        </div>
        <div className="flex-shrink-0 pr-2">
          <button
            type="button"
            className="w-8 h-8 bg-white inline-flex items-center justify-center text-gray-400 rounded-full bg-transparent hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <span className="sr-only">Open options</span>
            <DotsVerticalIcon className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </li>
  );
}

export function AddEmailTemplateCard() {
  return (
    <li className="col-span-1 flex shadow-sm rounded-md">
      <div className="bg-gray-500 flex-shrink-0 flex items-center justify-center w-16 text-white text-sm font-medium rounded-l-md">
        <PlusCircleIcon className="w-6 h-6" />
      </div>
      <div className="flex-1 flex items-center justify-between border-t border-r border-b border-gray-200 bg-white rounded-r-md truncate">
        <div className="flex-1 px-4 py-2 text-sm truncate">
          <Link
            to="/templates/new"
            className="text-gray-900 font-medium hover:text-gray-600"
          >
            New Email Template
          </Link>
        </div>
      </div>
    </li>
  );
}
