import { Sidebar } from '@/components/layout/Sidebar';
import { Breadcrumb } from '@/components/layout/Breadcrumb';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50 text-gray-700">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">
        <Breadcrumb />
        {children}
      </main>
    </div>
  );
}