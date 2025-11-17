'use client';

import { useState, useEffect } from 'react';
import { Filters } from '@/components/admin/Filters';
import { AddButton } from '@/components/admin/AddButton';
import { Table } from '@/components/admin/Table';
import { Pagination } from '@/components/admin/Pagination';
import Button from '@/components/ui/Button';
import { Ban, Edit } from 'lucide-react';
import { ActionButtons } from '@/components/admin/ActionButtons';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'Sinh viên' | 'Nhà tuyển dụng' | 'Admin';
  status: 'active' | 'inactive';
}

const columns: Column<User>[] = [
  { label: "#", render: (_, i) => i + 1 },
  { label: "Avatar", render: user => <img /> },
  { label: "Name", field: "name" },
  { label: "Email", field: "email" },
  { label: "Role", field: "role" },
  {
    label: "Status",
    render: user => (
      <span className={user.status === "active" ? "text-green-600" : "text-red-600"}>
        {user.status}
      </span>
    )
  },
  {
    label: "Action",
    render: user => (
      <div className='flex gap-2'>
        <ActionButtons type='edit'/>
        <ActionButtons type='delete'/>
      </div>
    )
  }
  
] as Column<User>[]; // ép kiểu

const mockData: User[] = [
  { id: 1, name: 'Phan Văn Giang', email: 'pvgttbqp@gmail.com', role: 'Sinh viên', status: 'active' },
  { id: 2, name: 'Nguyễn Tấn Cường', email: 'ntc66@gmail.com', role: 'Nhà tuyển dụng', status: 'inactive' },
  { id: 3, name: 'Nguyễn Trường Thắng', email: 'trthangnq@gmail.com', role: 'Admin', status: 'active' },
  { id: 4, name: 'Đoàn Xuân Bường', email: 'trthangnq@gmail.com', role: 'Sinh viên', status: 'inactive' },
  { id: 5, name: 'Lương Hoàng Giang', email: 'giangphutho@gmail.com', role: 'Nhà tuyển dụng', status: 'active' },
];

export default function UserManagementPage() {
  const [loading, setLoading] = useState(true);
  const [users] = useState<User[]>(mockData);

  // Giả lập loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý tài khoản</h1>
        <AddButton />
      </div>

      {/* Filters */}
      <Filters />

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4">
          <Table columns={columns} data={users} loading={loading} />
        </div>
      </div>

      {/* Pagination */}
      <Pagination />
    </div>
  );
}