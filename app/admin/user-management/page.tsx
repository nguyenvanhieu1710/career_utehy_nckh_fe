"use client";

import { useState, useEffect } from "react";
import { Filters } from "@/components/admin/Filters";
import { AddButton } from "@/components/admin/AddButton";
import { Column, Table } from "@/components/admin/Table";
import { Pagination } from "@/components/admin/Pagination";
import { AccountDialog } from "@/components/admin/AccountDialog";
import { DeleteConfirmationDialog } from "@/components/admin/DeleteConfirmationDialog";
import { NotificationDialog } from "@/components/admin/NotificationDialog";
import { ActionButtons } from "@/components/admin/ActionButtons";
import { userAPI } from "@/services/user";
import { GetSchema } from "@/types/base";
import { User } from "@/types/user";
import { DialogState, AccountDialogSubmitData } from "@/types/dialog";

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
    row: 10,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    setLoading(true);
    userAPI
      .getUsers(filters)
      .then((res) => {
        setUsers(res.data?.data || []);
        setTotal(res.data?.total || 0);
        setTotalPages(res.data?.max_page || 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filters]);

  const loadUsers = () => {
    setLoading(true);
    userAPI
      .getUsers(filters)
      .then((res) => {
        setUsers(res.data?.data || []);
        setTotal(res.data?.total || 0);
        setTotalPages(res.data?.max_page || 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleRoleChange = (value: string) => {
    setRoleFilter(value);
    // Reset to page 1 when filter changes
    setFilter({ ...filters, page: 1 });
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    // Reset to page 1 when filter changes
    setFilter({ ...filters, page: 1 });
  };

  const handleSearchChange = (value: string) => {
    setFilter({ ...filters, searchKeyword: value, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setFilter({ ...filters, page });
  };

  const handleAddUser = async (data: AccountDialogSubmitData) => {
    try {
      setLoading(true);

      // Create user first
      const createResult = await userAPI.createUser({
        email: data.email,
        username: data.email.split("@")[0], // Generate username from email
        password: data.email.split("@")[0], // Default password
        fullname: data.fullname,
      });

      // If there's an avatar file, upload it
      if (data.avatarFile && createResult.data?.data?.id) {
        try {
          await userAPI.uploadAvatar(
            createResult.data.data.id.toString(),
            data.avatarFile,
            true
          );
        } catch (avatarError) {
          console.warn(
            "Avatar upload failed, but user was created:",
            avatarError
          );
        }
      }

      loadUsers();

      setDialogState({
        isOpen: true,
        title: "Tạo người dùng thành công",
        message: `Người dùng ${data.fullname} đã được tạo! Mật khẩu mặc định: ${
          data.email.split("@")[0]
        }`,
        type: "success",
      });
      setIsAddDialogOpen(false);
    } catch (error: unknown) {
      setDialogState({
        isOpen: true,
        title: "Tạo người dùng thất bại",
        message: "Có lỗi xảy ra khi tạo người dùng!",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (data: AccountDialogSubmitData) => {
    if (!selectedUser) return;

    try {
      setLoading(true);

      await userAPI.updateUser(selectedUser.id.toString(), {
        fullname: data.fullname,
        email: data.email,
      });

      loadUsers();

      setDialogState({
        isOpen: true,
        title: "Cập nhật thành công",
        message: "Thông tin người dùng đã được cập nhật!",
        type: "success",
      });
      setIsAddDialogOpen(false);
      setSelectedUser(null);
    } catch {
      setDialogState({
        isOpen: true,
        title: "Cập nhật thất bại",
        message: "Có lỗi xảy ra khi cập nhật người dùng!",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);

      // Gọi API delete user
      await userAPI.deleteUser(selectedUser.id.toString());

      // Refresh danh sách user sau khi delete
      const res = await userAPI.getUsers(filters);
      setUsers(res.data?.data || []);
      setTotal(res.data?.total || 0);
      setTotalPages(res.data?.max_page || 1);

      setIsDeleteDialogOpen(false);
      setDialogState({
        isOpen: true,
        title: "Xóa người dùng thành công",
        message: `Người dùng ${selectedUser.fullname} đã được xóa!`,
        type: "success",
      });
      setSelectedUser(null);
    } catch (error: unknown) {
      setDialogState({
        isOpen: true,
        title: "Xóa thất bại",
        message: "Có lỗi xảy ra khi xóa người dùng!",
        type: "error",
      });
      setIsDeleteDialogOpen(false);
    } finally {
      setLoading(false);
    }
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
    {
      label: "#",
      render: (_, i) => ((filters.page || 1) - 1) * (filters.row || 10) + i + 1,
    },
    {
      label: "Avatar",
      render: (user) => (
        <div className="w-10 h-10 rounded-full border border-gray-200 overflow-hidden bg-gray-50">
          <img
            src={userAPI.getAvatarUrl(user)}
            alt={`${user.fullname} avatar`}
            className="w-full h-full object-cover"
            onLoad={() => {
              console.log("✅ Avatar loaded successfully for:", user.fullname);
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              console.error(
                "❌ Avatar failed to load for:",
                user.fullname,
                "URL:",
                target.src
              );
              target.src = "/default-avatar.png";
            }}
          />
        </div>
      ),
    },
    { label: "Họ tên", field: "fullname" },
    { label: "Email", field: "email" },
    { label: "Vai trò", render: () => <span>{"Chưa xác định"}</span> },
    {
      label: "Trạng thái",
      render: (user) => (
        <span
          className={
            user.action_status === "active" ? "text-green-600" : "text-red-600"
          }
        >
          {user.action_status === "active"
            ? "Hoạt động"
            : user.action_status === "inactive"
            ? "Không hoạt động"
            : "Đã xóa"}
        </span>
      ),
    },
    {
      label: "Hành động",
      render: (user) => (
        <div className="flex gap-2">
          <ActionButtons type="edit" onClick={() => handleEdit(user)} />
          <ActionButtons type="delete" onClick={() => handleDelete(user)} />
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
      <Filters
        role={roleFilter}
        status={statusFilter}
        searchKeyword={filters.searchKeyword || ""}
        onRoleChange={handleRoleChange}
        onStatusChange={handleStatusChange}
        onSearchChange={handleSearchChange}
      />

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4">
          <Table columns={columns} data={users} loading={loading} />
        </div>
      </div>

      {/* Pagination */}
      <Pagination
        amountOfRecord={total}
        currentPage={filters.page || 1}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {/* Add/Edit Account Dialog */}
      <AccountDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        initialData={
          selectedUser
            ? {
                fullname: selectedUser.fullname,
                email: selectedUser.email,
                role: "student", // TODO: Get from user roles
                status:
                  selectedUser.action_status === "active"
                    ? "active"
                    : "inactive",
                avatar: selectedUser.avatar_url,
              }
            : undefined
        }
        user={selectedUser || undefined}
        mode={selectedUser ? "edit" : "add"}
        onSubmit={(data) =>
          selectedUser ? handleUpdateUser(data) : handleAddUser(data)
        }
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteUser}
        title="Xác nhận xóa người dùng"
        description={`Bạn có chắc chắn muốn xóa người dùng ${selectedUser?.fullname}?`}
      />

      {/* Notification Dialog */}
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
