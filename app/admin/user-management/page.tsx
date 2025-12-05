"use client";

import { useState, useEffect } from "react";
import { Filters } from "@/components/admin/Filters";
import { AddButton } from "@/components/admin/AddButton";
import { Column, Table } from "@/components/admin/Table";
import { Pagination } from "@/components/admin/Pagination";
import { AddAccountDialog } from "@/components/admin/AddAccountDialog";
import { DeleteConfirmationDialog } from "@/components/admin/DeleteConfirmationDialog";
import { NotificationDialog } from "@/components/admin/NotificationDialog";
import { ActionButtons } from "@/components/admin/ActionButtons";
import { userAPI } from "@/services/user";
import { GetSchema } from "@/types/base";

interface User {
  id: number;
  name: string;
  email: string;
  role: "Sinh viên" | "Nhà tuyển dụng" | "Admin";
  status: "active" | "inactive";
}

interface DialogState {
  isOpen: boolean;
  title: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
}

export default function UserManagementPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [dialogState, setDialogState] = useState<DialogState>({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });
  const [filters, setFilter] = useState<GetSchema>({
    id: "",
    searchKeyword: "",
    page: 1,
    row: 100,
  });

  useEffect(() => {
    userAPI
      .getUsers(filters)
      .then((res) => {
        setUsers(res.data?.data);
      })
      .catch((err) => {})
      .finally(() => setLoading(false));
  }, [filters]);

  const handleAddUser = (data: {
    name: string;
    email: string;
    role: string;
    status: "active" | "inactive";
  }) => {
    const newUser: User = {
      id: Math.max(0, ...users.map((u) => u.id)) + 1,
      name: data.name,
      email: data.email,
      role: data.role as User["role"],
      status: data.status,
    };

    setUsers([...users, newUser]);
    setDialogState({
      isOpen: true,
      title: "Thêm người dùng thành công",
      message: "Người dùng mới đã được tạo thành công!",
      type: "success",
    });
    setIsAddDialogOpen(false);
  };

  const handleUpdateUser = (data: {
    name: string;
    email: string;
    role: string;
    status: "active" | "inactive";
    avatarFile?: File;
  }) => {
    if (!selectedUser) return;

    const updatedUsers = users.map((user) =>
      user.id === selectedUser.id
        ? {
            ...user,
            name: data.name,
            status: data.status,
            role: data.role as User["role"],
          }
        : user
    );

    setUsers(updatedUsers);
    setDialogState({
      isOpen: true,
      title: "Cập nhật thành công",
      message: "Thông tin người dùng đã được cập nhật!",
      type: "success",
    });
    setIsAddDialogOpen(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;

    const updatedUsers = users.filter((user) => user.id !== selectedUser.id);
    setUsers(updatedUsers);
    setIsDeleteDialogOpen(false);
    setDialogState({
      isOpen: true,
      title: "Xóa người dùng thành công",
      message: `Người dùng ${selectedUser.name} đã được xóa!`,
      type: "success",
    });
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
    { label: "Avatar", render: (user) => <img /> },
    { label: "Name", field: "name" },
    { label: "Email", field: "email" },
    { label: "Role", field: "role" },
    {
      label: "Status",
      render: (user) => (
        <span
          className={
            user.status === "active" ? "text-green-600" : "text-red-600"
          }
        >
          {user.status}
        </span>
      ),
    },
    {
      label: "Action",
      render: (user) => (
        <div className="flex gap-2">
          <ActionButtons type="edit" onClick={() => handleEdit(user)} />
          <ActionButtons type="ban" onClick={() => handleDelete(user)} />
        </div>
      ),
    },
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

      {/* Filter */}
      <Filters />

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
        onSubmit={selectedUser ? handleUpdateUser : handleAddUser}
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
      <NotificationDialog
        open={dialogState.isOpen}
        onOpenChange={(open) =>
          setDialogState({ ...dialogState, isOpen: open })
        }
        title={dialogState.title}
        message={dialogState.message}
        type={dialogState.type}
      />
    </div>
  );
}
