import { Link } from 'remix';
import {
  MailIcon,
  PlusCircleIcon,
  DotsVerticalIcon,
  TrashIcon,
} from '@heroicons/react/outline';
import { useFetcher } from 'remix';
import { Menu, MenuButton, MenuList, MenuItem } from '@reach/menu-button';
import clsx from 'clsx';

import { nbsp } from '~/util';

export function EmailTemplateCard({
  id,
  subject,
}: {
  id: string;
  subject: string;
}) {
  const fetcher = useFetcher();
  const isDeleting =
    fetcher.type == 'actionSubmission' || fetcher.type == 'actionReload';
  const onDelete = () =>
    confirm('Are you sure you want to delete this Email Template?') &&
    fetcher.submit(
      {},
      {
        action: `/templates/${id}`,
        method: 'delete',
        replace: true,
      }
    );

  return (
    <li
      className={clsx(
        'col-span-1 shadow-sm rounded-md',
        isDeleting ? 'hidden' : 'flex'
      )}
    >
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
          <Menu>
            <MenuButton
              id={`menu-${id}`}
              className="w-8 h-8 bg-white inline-flex items-center justify-center text-gray-400 rounded-full bg-transparent hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <span className="sr-only">Open menu</span>
              <DotsVerticalIcon className="w-5 h-5" aria-hidden="true" />
            </MenuButton>
            <MenuList className="p-0.5 shadow-sm rounded-md">
              <MenuItem
                onSelect={onDelete}
                className="flex items-center rounded-md"
              >
                <TrashIcon
                  className="w-5 h-5 text-red-500 mr-1"
                  aria-hidden="true"
                />
                Delete
              </MenuItem>
            </MenuList>
          </Menu>
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
