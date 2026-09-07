import React from 'react';

export interface AppTableColumn<T> {
  key: string;
  header: string;
  align?: 'left' | 'right' | 'center';
  width?: number;
  render: (row: T) => React.ReactNode;
}

export interface AppTableProps<T> {
  columns: AppTableColumn<T>[];
  data: T[];
  getRowKey: (row: T) => string | number;
  minWidth?: number;
  className?: string;
}

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ');
}

const ALIGN_CLASS: Record<'left' | 'right' | 'center', string> = {
  left: 'text-left',
  right: 'text-right',
  center: 'text-center',
};

export default function AppTable<T>({
  columns,
  data,
  getRowKey,
  minWidth = 720,
  className,
}: AppTableProps<T>) {
  return (
    <div className={cx('overflow-x-auto', className)}>
      <table className="w-full text-left" style={{ minWidth }}>
        <thead>
          <tr className="border-b border-disabled">
            {columns.map((column) => (
              <th
                key={column.key}
                style={column.width ? { width: column.width } : undefined}
                className={cx(
                  'f1-m px-4 py-3 text-muted',
                  ALIGN_CLASS[column.align ?? 'left'],
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={getRowKey(row)}
              className="border-b border-disabled last:border-b-0"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  style={column.width ? { width: column.width } : undefined}
                  className={cx(
                    'px-4 py-3',
                    ALIGN_CLASS[column.align ?? 'left'],
                  )}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
