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
    confirm('Are you sure you want to delete this Template?') &&
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
        'col-span-1 h-14 rounded-md shadow-sm',
        isDeleting ? 'hidden' : 'flex'
      )}
    >
      <div className="flex w-16 flex-shrink-0 items-center justify-center rounded-l-md bg-blue-500 text-sm font-medium text-white">
        <MailIcon className="h-6 w-6" />
      </div>
      <div className="flex flex-1 items-center justify-between truncate rounded-r-md border-t border-r border-b border-gray-200 bg-white">
        <div className="flex-1 truncate px-4 py-2 text-sm">
          <Link
            to={`/templates/${id}`}
            className="font-medium text-gray-900 hover:text-gray-600"
          >
            {subject}
          </Link>
        </div>
        <div className="flex-shrink-0 pr-2">
          <Menu>
            <MenuButton
              id={`menu-${id}`}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white bg-transparent text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span className="sr-only">Open menu</span>
              <DotsVerticalIcon className="h-5 w-5" aria-hidden="true" />
            </MenuButton>
            <MenuList className="rounded-md p-0.5 shadow-sm">
              <MenuItem
                onSelect={onDelete}
                className="flex items-center rounded-md"
              >
                <TrashIcon
                  className="mr-1 h-5 w-5 text-red-500"
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
    <li className="col-span-1 flex h-14 rounded-md shadow-sm">
      <div className="flex w-16 flex-shrink-0 items-center justify-center rounded-l-md bg-gray-500 text-sm font-medium text-white">
        <PlusCircleIcon className="h-6 w-6" />
      </div>
      <div className="flex flex-1 items-center justify-between truncate rounded-r-md border-t border-r border-b border-gray-200 bg-white">
        <div className="flex-1 truncate px-4 py-2 text-sm">
          <Link
            to="/templates/new"
            className="font-medium text-gray-900 hover:text-gray-600"
          >
            New Template
          </Link>
        </div>
      </div>
    </li>
  );
}
