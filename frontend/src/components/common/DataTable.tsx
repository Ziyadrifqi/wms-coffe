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

export default function DataTable<T>({ columns, data, isLoading, emptyMessage = 'Belum ada data' }: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="bg-cream rounded-xl border border-espresso/8 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 border-b border-espresso/5 last:border-0 animate-shimmer" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-cream rounded-xl border border-espresso/8 p-10 text-center">
        <p className="text-espresso/40 text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-cream rounded-xl border border-espresso/8 overflow-x-auto shadow-sm shadow-espresso/[0.02]">
      <table className="w-full text-sm min-w-[640px]">
        <thead className="bg-latte/60 border-b border-espresso/8">
          <tr>
            {columns.map((col, i) => (
              <th key={i} className="text-left px-4 py-3 font-medium text-espresso/50 text-xs uppercase tracking-wide whitespace-nowrap">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-espresso/5">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-latte/30 transition-colors">
              {columns.map((col, j) => (
                <td key={j} className={`px-4 py-3 text-espresso/80 font-mono text-[13px] ${col.className ?? ''}`}>
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