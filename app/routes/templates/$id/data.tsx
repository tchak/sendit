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
type Row = LoaderData['data']['data'][0] & { id: number };
type SummaryRow = {
  id: string;
  totalCount: number;
};

export default function EmailTemplateDataRoute() {
  const data = useLoaderData<LoaderData>();
  const [rows, setRows] = useState(() =>
    data.data.data.map((row, index) => ({ id: index, ...row }))
  );
  const [sortColumns, setSortColumns] = useState<SortColumn[]>([]);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(
    () => new Set()
  );
  const columns = useMemo(
    () => data.data.meta.fields.map((name, index) => getColumn(name, index)),
    [data]
  );
  const sortedRows = useMemo(
    () => sortRows(rows, sortColumns),
    [rows, sortColumns]
  );
  const summaryRows = useMemo(() => {
    const summaryRow: SummaryRow = {
      id: 'total_0',
      totalCount: rows.length,
    };
    return [summaryRow];
  }, [rows]);

  return (
    <div className="flex h-full flex-col">
      <Header title="Sendit">
        <Breadcrumb title={data.subject} to={`/templates/${data.id}`} />
        <Breadcrumb title="data" to={`/templates/${data.id}/data`} />
      </Header>
      <SkipNavContent />

      <DataGrid
        rowKeyGetter={rowKeyGetter}
        columns={columns}
        rows={sortedRows}
        summaryRows={summaryRows}
        defaultColumnOptions={defaultColumnOptions}
        sortColumns={sortColumns}
        onSortColumnsChange={setSortColumns}
        selectedRows={selectedRows}
        onSelectedRowsChange={setSelectedRows}
        onRowsChange={setRows}
        className="rdg-light flex-grow"
        cellNavigationMode="CHANGE_ROW"
      />
    </div>
  );
}

const defaultColumnOptions = {
  resizable: true,
  sortable: true,
  minWidth: 100,
};
const rowKeyGetter = (row: Row) => row.id;
const summaryFormatter = ({ row }: { row: SummaryRow }) => (
  <>{row.totalCount} rows</>
);
const getColumn = (name: string, index: number) => {
  return {
    key: name,
    name,
    width: 150,
    summaryFormatter: index == 0 ? summaryFormatter : undefined,
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
