import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useMatches,
} from 'remix';
import type { LinksFunction, ThrownResponse, MetaFunction } from 'remix';
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

export default function App() {
  return (
    <Document>
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
}: {
  children: React.ReactNode;
  title?: string;
  lang?: string;
  skipNavLink?: boolean;
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
          <SkipNavLink className="rounded-md underline shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-blue-500" />
        ) : null}
        <Layout>{children}</Layout>
        <ScrollRestoration />
        {includeScripts ? <Scripts /> : null}
        {process.env.NODE_ENV == 'development' && <LiveReload />}
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto text-xl">
        <main>{children}</main>
        <footer className="my-8 text-xs flex flex-col-reverse items-start md:items-center md:flex-row md:justify-between"></footer>
      </div>
    </div>
  );
}
