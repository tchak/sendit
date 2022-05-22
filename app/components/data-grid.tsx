import { useState, useMemo } from 'react';
import ReactDataGrid, { SortColumn } from 'react-data-grid';

type IRow = Record<string, unknown>;
type SummaryRow = {
  id: string;
  totalCount: number;
};

export function DataGrid<Row extends IRow>({
  data,
}: {
  data: { rows: Row[]; columns: string[] };
}) {
  const [rows, setRows] = useState<Row[]>(() =>
    data.rows.map((row, index) => ({ id: index, ...row }))
  );
  const [sortColumns, setSortColumns] = useState<SortColumn[]>([]);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(
    () => new Set()
  );
  const columns = useMemo(
    () => data.columns.map((name, index) => getColumn(name, index)),
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
    <ReactDataGrid
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
  );
}

const defaultColumnOptions = {
  resizable: true,
  sortable: true,
  minWidth: 100,
};
const rowKeyGetter: <Row extends IRow>(row: Row) => number = (row) =>
  Number(row.id);
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
const sortRows: <Row extends IRow>(
  rows: Row[],
  sortColumns: SortColumn[]
) => Row[] = (rows, sortColumns) => {
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
