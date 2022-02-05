import type { MetaFunction, LoaderFunction } from 'remix';
import { useLoaderData } from 'remix';
import { SkipNavContent } from '@reach/skip-nav';

import * as User from '~/models/User';
import { authenticator } from '~/util/auth.server';
import {
  AddEmailTemplateCard,
  EmailTemplateCard,
} from '~/components/EmailTemplateCard';
import {
  AddEmailTransportCard,
  EmailTransportCard,
} from '~/components/EmailTransportCard';
import { Header } from '~/components/Header';

export type LoaderData = Awaited<
  ReturnType<typeof User.findWithTransportsAndTemplates>
>;

export const meta: MetaFunction = () => ({ title: 'Sendit' });
export const handle = { hydrate: true };
export const loader: LoaderFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: '/signin',
  });

  return User.findWithTransportsAndTemplates(user.id);
};

export default function IndexRoute() {
  const user = useLoaderData<LoaderData>();
  const hasTransports = user.transports.length > 0;

  return (
    <div>
      <Header title="Sendit" />
      <SkipNavContent />

      <div>
        {hasTransports ? (
          <div className="mb-5">
            <h2 className="text-gray-500 text-xs font-medium uppercase tracking-wide">
              Email Templates
            </h2>

            <ul
              role="list"
              className="mt-3 grid grid-cols-1 gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {user.templates.map((template) => (
                <EmailTemplateCard key={template.id} {...template} />
              ))}
              <AddEmailTemplateCard />
            </ul>
          </div>
        ) : null}

        <div>
          <h2 className="text-gray-500 text-xs font-medium uppercase tracking-wide">
            Email Transports
          </h2>

          <ul
            role="list"
            className="mt-3 grid grid-cols-1 gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {user.transports.map((transports) => (
              <EmailTransportCard key={transports.id} {...transports} />
            ))}
            <AddEmailTransportCard />
          </ul>
        </div>
      </div>
    </div>
  );
}
