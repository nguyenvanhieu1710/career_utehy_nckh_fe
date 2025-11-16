import { TableHeader } from "./TableHeader";
import { TableRow } from "./TableRow";

interface User {
  id: number;
  avatar?: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
}

interface TableProps {
  data: User[];
  loading?: boolean;
}

export function Table({ data, loading }: TableProps) {
  if (loading) return <div>Loading...</div>;
  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4">
        <TableHeader />
        <div className="mt-2">
          {data.map((user, idx) => (
            <TableRow key={user.id} user={user} index={idx + 1} />
          ))}
        </div>
      </div>
    </div>
  );
}
