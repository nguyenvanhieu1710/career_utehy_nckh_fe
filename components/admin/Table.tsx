// Table.tsx
export interface Column<T> {
  label: string; // tên cột
  field?: keyof T; // field trong object
  render?: (item: T, index: number) => React.ReactNode; // custom render
  className?: string; // optional style
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
}

export function Table<T>({ columns, data, loading }: TableProps<T>) {
  if (loading) return <div>Loading...</div>;

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <table className="w-full text-left border-collapse">
        {/* Header */}
        <thead className="bg-green-50 border-b">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={`p-3 font-medium text-green-900 ${
                  col.className || ""
                }`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {data.map((item, rowIndex) => (
            <tr key={rowIndex} className="border-b hover:bg-green-50">
              {columns.map((col, colIndex) => (
                <td key={colIndex} className="p-3">
                  {col.render
                    ? col.render(item, rowIndex) // custom cell
                    : col.field
                    ? String(item[col.field])
                    : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
