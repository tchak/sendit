import type { LoaderFunction, MetaFunction } from '@remix-run/node';
import { useRef } from 'react';
import { z } from 'zod';
import { getParamsOrFail } from 'remix-params-helper';
import { useLoaderData, useNavigate } from '@remix-run/react';

import { authenticator } from '~/util/auth.server';
import * as EmailTemplate from '~/models/EmailTemplate';
import { Dialog } from '~/components/dialog';
import { DataGrid } from '~/components/data-grid';

export const meta: MetaFunction = () => ({
  title: 'Sendit - Temaplate Data',
});
export const handle = { hydrate: true };
export const loader: LoaderFunction = async ({ request, params }) => {
  const { id: templateId } = getParamsOrFail(
    params,
    z.object({ id: z.string().uuid() })
  );
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: '/signin',
  });
  return EmailTemplate.findDataById(templateId, user.id);
};

type LoaderData = Awaited<ReturnType<typeof EmailTemplate.findDataById>>;

export default function EmailTemplateDataRoute() {
  const navigate = useNavigate();
  const cancelButtonRef = useRef(null);
  const data = useLoaderData<LoaderData>();

  return (
    <Dialog
      onClose={() => navigate(`/templates/${data.id}`)}
      initialFocus={cancelButtonRef}
    >
      <DataGrid data={data.data} />
    </Dialog>
  );
}
