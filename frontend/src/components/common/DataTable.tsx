import type { ReactNode } from 'react';

interface Column<T> {
  header: string;
  accessor: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export default function DataTable<T>({ columns, data, isLoading, emptyMessage = 'Tidak ada data' }: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-400">
        Memuat data...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
      <table className="w-full text-sm min-w-[640px]">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {columns.map((col, i) => (
              <th key={i} className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50">
              {columns.map((col, j) => (
                <td key={j} className={`px-4 py-3 text-gray-700 ${col.className ?? ''}`}>
                  {col.accessor(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}