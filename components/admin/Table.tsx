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
                key={col.field ? String(col.field) : `col-${idx}`}
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
          {data.map((item, rowIndex) => {
            // Try to get unique id from item, fallback to index
            const rowKey = (item as any)?.id ?? `row-${rowIndex}`;
            return (
              <tr key={rowKey} className="border-b hover:bg-green-50">
                {columns.map((col, colIndex) => {
                  const cellKey = col.field ? `${rowKey}-${String(col.field)}` : `${rowKey}-col-${colIndex}`;
                  return (
                    <td key={cellKey} className="p-3">
                      {col.render
                        ? col.render(item, rowIndex) // custom cell
                        : col.field
                        ? String(item[col.field])
                        : null}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
