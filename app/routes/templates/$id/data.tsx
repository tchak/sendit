import type { LoaderFunction, MetaFunction } from 'remix';
import { useState, useMemo } from 'react';
import { z } from 'zod';
import { getParamsOrFail } from 'remix-params-helper';
import { useLoaderData } from 'remix';
import { SkipNavContent } from '@reach/skip-nav';
import DataGrid, { SortColumn } from 'react-data-grid';

import { authenticator } from '~/util/auth.server';
import * as EmailTemplate from '~/models/EmailTemplate';
import { Header, Breadcrumb } from '~/components/Header';

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
type Row = LoaderData['data']['data'][0];

export default function EmailTemplateDataRoute() {
  const [sortColumns, setSortColumns] = useState<SortColumn[]>([]);
  const data = useLoaderData<LoaderData>();
  const columns = useMemo(
    () => data.data.meta.fields.map((name) => getColumn(name)),
    [data]
  );
  const rows = useMemo<Row[]>(
    () => data.data.data.map((row, index) => ({ id: index, ...row })),
    [data]
  );
  const sortedRows = useMemo(
    () => sortRows(rows, sortColumns),
    [rows, sortColumns]
  );

  return (
    <div className="h-full flex flex-col">
      <Header title="Sendit">
        <Breadcrumb title={data.subject} to={`/templates/${data.id}`} />
        <Breadcrumb title="data" to={`/templates/${data.id}/data`} />
      </Header>
      <SkipNavContent />

      <DataGrid
        rowKeyGetter={rowKeyGetter}
        columns={columns}
        rows={sortedRows}
        defaultColumnOptions={defaultColumnOptions}
        sortColumns={sortColumns}
        onSortColumnsChange={setSortColumns}
        className="flex-grow rdg-light"
      />
    </div>
  );
}

const defaultColumnOptions = {
  resizable: true,
  sortable: true,
  minWidth: 100,
};

const rowKeyGetter = (row: Row) => String(row['id']);

const getColumn = (name: string) => {
  return {
    key: name,
    name,
    width: 150,
  };
};

const sortRows = (rows: Row[], sortColumns: SortColumn[]) => {
  if (sortColumns.length == 0) return rows;

  return [...rows].sort((a, b) => {
    for (const sort of sortColumns) {
      const sortColumn = sort.columnKey;
      const compResult = String(a[sortColumn]).localeCompare(
        String(b[sortColumn])
      );
      if (compResult !== 0) {
        return sort.direction === 'ASC' ? compResult : -compResult;
      }
    }
    return 0;
  });
};
