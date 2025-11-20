"use client";

import { useState, useEffect } from "react";
import { Filters } from "@/components/admin/Filters";
import { AddButton } from "@/components/admin/AddButton";
import { Column, Table } from "@/components/admin/Table";
import { Pagination } from "@/components/admin/Pagination";
import { AddAccountDialog } from "@/components/admin/AddAccountDialog";
import { DeleteConfirmationDialog } from "@/components/admin/DeleteConfirmationDialog";
import { SuccessDialog } from "@/components/admin/SuccessDialog";
import { ActionButtons } from "@/components/admin/ActionButtons";
import { userAPI } from "@/services/user";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Input } from "@/components/ui/input";
import { GetSchema } from "@/types/base";

interface User {
  id: number;
  name: string;
  email: string;
  role: "Sinh viên" | "Nhà tuyển dụng" | "Admin";
  status: "active" | "inactive";
}


export default function UserManagementPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [filters, setFilter] = useState<GetSchema>({
    id: "",
    searchKeyword: "",
    page: 1,
    row: 100
  })

  useEffect(() => {
    setLoading(true)
    userAPI.getUsers(filters).then(res => {
      setUsers(res.data?.data)
    }).catch(err => { })
      .finally(() => setLoading(false))
  }, [filters]);

  const handleAddUser = (data: {
    name: string;
    email: string;
    role: string;
    status: "active" | "inactive";
  }) => {
    const newUser: User = {
      id: Math.max(0, ...users.map((u) => u.id)) + 1, // Generate new ID
      name: data.name,
      email: data.email,
      role: data.role as User["role"],
      status: data.status,
    };

    setUsers([...users, newUser]);
    setSuccessMessage("Thêm người dùng thành công!");
    setIsAddDialogOpen(false);
    setIsSuccessDialogOpen(true);
  };

  const handleUpdateUser = (data: Omit<User, "id" | "email">) => {
    if (!selectedUser) return;

    const updatedUsers = users.map((user) =>
      user.id === selectedUser.id
        ? {
          ...user,
          name: data.name,
          status: data.status,
          role: data.role,
        }
        : user
    );

    setUsers(updatedUsers);
    setSuccessMessage("Cập nhật thông tin thành công!");
    setIsAddDialogOpen(false);
    setIsSuccessDialogOpen(true);
    setSelectedUser(null);
  };

  const handleDeleteUser = () => {

    if (!selectedUser) return;

    const updatedUsers = users.filter((user) => user.id !== selectedUser.id);
    setUsers(updatedUsers);
    setIsDeleteDialogOpen(false);
    setSuccessMessage("Đã xóa người dùng thành công!");
    setIsSuccessDialogOpen(true);
    setSelectedUser(null);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsAddDialogOpen(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };



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
          <ActionButtons type='edit' onClick={() => handleEdit(user)} />
          <ActionButtons type='ban' onClick={() => handleDelete(user)} />
        </div>
      )
    }

  ] as Column<User>[];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý tài khoản</h1>
        <AddButton
          onClick={() => {
            setSelectedUser(null);
            setIsAddDialogOpen(true);
          }}
        />
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <Select defaultValue="all">
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Lọc theo vai trò" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả vai trò</SelectItem>
            <SelectItem value="sinh-vien">Sinh viên</SelectItem>
            <SelectItem value="nha-tuyen-dung">Nhà tuyển dụng</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="all">
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="active">Còn hoạt động</SelectItem>
            <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex-1 min-w-64">
          <Input
            placeholder="Nhập tên người dùng để tìm kiếm..."
            className="w-full"
            value={filters.searchKeyword}
            onChange={(e) => {
              setFilter(prev => ({ ...prev, searchKeyword: e.target.value }))
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4">
          <Table columns={columns} data={users} loading={loading} />
        </div>
      </div>

      {/* Pagination */}
      <Pagination amountOfRecord={users?.length || 0} />

      {/* Add/Edit User Dialog */}
      <AddAccountDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        initialData={selectedUser || undefined}
        mode={selectedUser ? "edit" : "add"}
        onSubmit={undefined}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteUser}
        title="Xác nhận xóa người dùng"
        description={`Bạn có chắc chắn muốn xóa người dùng ${selectedUser?.name}?`}
      />

      {/* Success Dialog */}
      <SuccessDialog
        open={isSuccessDialogOpen}
        onOpenChange={setIsSuccessDialogOpen}
      />
    </div>
  );
}
