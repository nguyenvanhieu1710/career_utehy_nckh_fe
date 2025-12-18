"use client";

import { useState, useEffect, useCallback } from "react";
import { Filters } from "@/components/admin/Filters";
import { AddButton } from "@/components/admin/AddButton";
import { Column, Table } from "@/components/admin/Table";
import { Pagination } from "@/components/admin/Pagination";
import { AccountDialog } from "@/components/admin/AccountDialog";
import { DeleteConfirmationDialog } from "@/components/admin/DeleteConfirmationDialog";
import { NotificationDialog } from "@/components/admin/NotificationDialog";
import { ActionButtons } from "@/components/admin/ActionButtons";
import { UserRoleDisplay } from "@/components/admin/UserRoleDisplay";
import { StatusBadge } from "@/components/common/StatusBadge";
import { userAPI } from "@/services/user";
import { useRoles } from "@/contexts/RolesContext";
import { useDebounce } from "@/hooks/useDebounce";
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
    role_id: undefined,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchInput, setSearchInput] = useState<string>("");

  // Use roles context for caching and error handling
  const { roles: availableRoles, loading: rolesLoading } = useRoles();

  // Debounce search input
  const debouncedSearch = useDebounce(searchInput, 500);

  // Load users with optimized API calls
  const loadUsers = useCallback(async (currentFilters: GetSchema) => {
    try {
      setLoading(true);

      const res = await userAPI.getUsers(currentFilters);
      setUsers(res.data?.data || []);
      setTotal(res.data?.total || 0);
      setTotalPages(res.data?.max_page || 1);
    } catch (error) {
      setDialogState({
        isOpen: true,
        title: "Lỗi tải dữ liệu",
        message: "Không thể tải danh sách người dùng. Vui lòng thử lại.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Update filters when debounced search changes
  useEffect(() => {
    setFilter((prev) => ({
      ...prev,
      searchKeyword: debouncedSearch,
      page: 1, // Reset to first page on search
    }));
  }, [debouncedSearch]);

  // Load users when filters change
  useEffect(() => {
    loadUsers(filters);
  }, [filters, loadUsers]);

  const handleRoleChange = (value: string) => {
    setRoleFilter(value);
    setFilter((prev) => ({
      ...prev,
      role_id: value === "all" ? undefined : value,
      page: 1,
    }));
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setFilter((prev) => ({
      ...prev,
      status: value === "all" ? undefined : value,
      page: 1,
    }));
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value); // This will trigger debounced search
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
        role_ids: data.roles || [], // Send roles to backend
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

      loadUsers(filters);

      const selectedRoleName = data.roles?.[0]
        ? availableRoles.find((r) => r.id === data.roles?.[0])?.name ||
          "Không xác định"
        : "Chưa gán vai trò";

      setDialogState({
        isOpen: true,
        title: "Tạo người dùng thành công",
        message: `Người dùng ${
          data.fullname
        } đã được tạo với vai trò ${selectedRoleName}! Mật khẩu mặc định: ${
          data.email.split("@")[0]
        }`,
        type: "success",
      });
      setIsAddDialogOpen(false);
    } catch {
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
        action_status: data.status,
        role_ids: data.roles || [], // Send roles to backend
      });

      loadUsers(filters);

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
    } catch {
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

  const handleEdit = async (user: User) => {
    setSelectedUser(user);

    // Load user roles for editing
    try {
      const userRoles = await userAPI.getUserRolesPermissions(
        user.id.toString()
      );
      const currentRoleId = userRoles.data.data.roles?.[0]?.id || "";

      // Update selected user with current role for dialog
      setSelectedUser({
        ...user,
        currentRoleId, // Add this for dialog initialization
      } as User & { currentRoleId: string });
    } catch {
      console.error("Failed to load user roles");
    }

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
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/default-avatar.jpg";
            }}
          />
        </div>
      ),
    },
    { label: "Họ tên", field: "fullname" },
    { label: "Email", field: "email" },
    {
      label: "Vai trò",
      render: (user) => (
        <UserRoleDisplay userId={user.id.toString()} maxDisplay={2} />
      ),
    },
    {
      label: "Trạng thái",
      render: (user) => {
        return (
          <StatusBadge
            status={user.action_status || "active"}
            size="sm"
            showIcon
          />
        );
      },
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
        <div className="flex gap-2">
          <AddButton
            onClick={() => {
              setSelectedUser(null);
              setIsAddDialogOpen(true);
            }}
          />
        </div>
      </div>

      {/* Filter */}
      <Filters
        role={roleFilter}
        status={statusFilter}
        searchKeyword={filters.searchKeyword || ""}
        onRoleChange={handleRoleChange}
        onStatusChange={handleStatusChange}
        onSearchChange={handleSearchChange}
        availableRoles={availableRoles}
        rolesLoading={rolesLoading}
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
                role:
                  (selectedUser as User & { currentRoleId: string })
                    .currentRoleId || "", // Use loaded role ID
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
        availableRoles={availableRoles}
        rolesLoading={rolesLoading}
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
