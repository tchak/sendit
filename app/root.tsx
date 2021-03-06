import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useMatches,
  useLoaderData,
} from 'remix';
import type {
  LinksFunction,
  ThrownResponse,
  MetaFunction,
  LoaderFunction,
} from 'remix';
import { ReactNode } from 'react';
import { SkipNavLink } from '@reach/skip-nav';

import tailwind from '~/styles/tailwind.css';

export const meta: MetaFunction = () => ({
  'theme-color': '#ffffff',
  description: 'Sendit',
});

export const links: LinksFunction = () => {
  return [
    {
      rel: 'stylesheet',
      href: 'https://unpkg.com/@reach/skip-nav@0.16.0/styles.css',
    },
    {
      rel: 'stylesheet',
      href: 'https://unpkg.com/@reach/tooltip@0.16.2/styles.css',
    },
    {
      rel: 'stylesheet',
      href: 'https://unpkg.com/@reach/menu-button@0.16.2/styles.css',
    },
    { rel: 'stylesheet', href: tailwind },
    {
      rel: 'apple-touch-icon',
      sizes: '180x180',
      href: '/apple-touch-icon.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      href: '/favicon-32x32.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      href: '/favicon-16x16.png',
    },
    {
      rel: 'manifest',
      href: '/site.webmanifest',
    },
  ];
};

type GlobalENV = Record<string, string | undefined>;

export const loader: LoaderFunction = () => {
  return {
    ENV: {
      APP_DOMAIN: process.env['APP_DOMAIN'],
      COMMIT_ID: process.env['COMMIT_ID'],
      SENTRY_DSN: process.env['SENTRY_DSN'],
    },
  };
};

export const unstable_shouldReload = () => false;

export default function App() {
  const { ENV } = useLoaderData<{ ENV: GlobalENV }>();
  return (
    <Document ENV={ENV}>
      <Outlet />
    </Document>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);
  return <ErrorMessage title="There was an error" message={error.message} />;
}

export function CatchBoundary() {
  const caught = useCatch();

  return (
    <ErrorMessage
      title={`${caught.status}: ${caught.statusText}`}
      message={caughtMessage(caught)}
    />
  );
}

function Document({
  children,
  title,
  lang = 'en',
  skipNavLink = true,
  ENV,
}: {
  children: React.ReactNode;
  title?: string;
  lang?: string;
  skipNavLink?: boolean;
  ENV?: GlobalENV;
}) {
  const matches = useMatches();
  const includeScripts = matches.some((match) => match.handle?.hydrate);

  return (
    <html lang={lang}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        {title ? <title>{title}</title> : null}
        <Meta />
        <Links />
      </head>
      <body>
        {skipNavLink ? (
          <SkipNavLink className="rounded-md underline shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100" />
        ) : null}
        <Layout>{children}</Layout>
        <ScrollRestoration />
        {includeScripts ? <Scripts /> : null}
        {process.env.NODE_ENV == 'development' && <LiveReload />}
        {ENV ? (
          <>
            <script
              dangerouslySetInnerHTML={{
                __html: `window.ENV = ${JSON.stringify(ENV)};`,
              }}
            />
            {process.env.NODE_ENV == 'production' && (
              <script
                async
                defer
                data-domain={ENV['APP_DOMAIN']}
                src="https://plausible.io/js/plausible.js"
              />
            )}
          </>
        ) : null}
      </body>
    </html>
  );
}

function ErrorMessage({ title, message }: { title: string; message: string }) {
  return (
    <Document title={title} skipNavLink={false}>
      <div>
        <h1 className="py-6">{title}</h1>
        <p>{message}</p>
      </div>
    </Document>
  );
}

function caughtMessage(caught: ThrownResponse) {
  switch (caught.status) {
    case 401:
      return 'Oops! Looks like you tried to visit a page that you do not have access to.';
    case 404:
      return 'Oops! Looks like you tried to visit a page that does not exist.';
    default:
      throw new Error(caught.data || caught.statusText);
  }
}

function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mx-auto h-screen max-w-3xl">
        <main className="h-full">{children}</main>
        <footer className="my-8 flex flex-col-reverse items-start text-xs md:flex-row md:items-center md:justify-between"></footer>
      </div>
    </div>
  );
}
