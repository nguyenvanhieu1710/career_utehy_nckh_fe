"use client";

import { useState, useEffect } from "react";
import { AddButton } from "@/components/admin/AddButton";
import { Column, Table } from "@/components/admin/Table";
import { Pagination } from "@/components/admin/Pagination";
import { DeleteConfirmationDialog } from "@/components/admin/DeleteConfirmationDialog";
import { NotificationDialog } from "@/components/admin/NotificationDialog";
import { ActionButtons } from "@/components/admin/ActionButtons";
import { RoleDialog } from "@/components/admin/RoleDialog";
import { permAPI } from "@/services/perm";
import { Role } from "@/types/permission";
import { Input } from "@/components/ui/input";
import { DialogState } from "@/types/dialog";
import { GetSchema } from "@/types/base";

export default function RoleManagementPage() {
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [dialogState, setDialogState] = useState<DialogState>({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });
  const [filters, setFilters] = useState<GetSchema>({
    id: "",
    searchKeyword: "",
    page: 1,
    row: 10,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [perms, setPerms] = useState<string[]>();

  // Load permissions list (chỉ 1 lần)
  useEffect(() => {
    permAPI
      .getPerms()
      .then((res) => {
        setPerms(res.data.data);
      })
      .catch(() => {
        setDialogState({
          isOpen: true,
          title: "Lỗi",
          message: "Không thể tải danh sách quyền!",
          type: "error",
        });
      });
  }, []);

  // Load roles list (khi filters thay đổi)
  useEffect(() => {
    setLoading(true);
    permAPI
      .getRoles(filters)
      .then((res) => {
        setRoles(res.data?.data || []);
        setTotal(res.data?.total || 0);
        setTotalPages(res.data?.max_page || 1);
      })
      .catch(() => {
        setDialogState({
          isOpen: true,
          title: "Lỗi",
          message: "Không thể tải danh sách vai trò!",
          type: "error",
        });
      })
      .finally(() => setLoading(false));
  }, [filters]);

  const handleSearchChange = (value: string) => {
    setFilters({ ...filters, searchKeyword: value, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  const handleAddRole = async (data: {
    name: string;
    description?: string;
    perms: string[];
  }) => {
    try {
      setLoading(true);

      // Gọi API create role
      await permAPI.createRole(data);

      // Refresh danh sách roles sau khi create
      const res = await permAPI.getRoles(filters);
      setRoles(res.data?.data || []);
      setTotal(res.data?.total || 0);
      setTotalPages(res.data?.max_page || 1);

      setDialogState({
        isOpen: true,
        title: "Tạo vai trò thành công",
        message: `Vai trò ${data.name} đã được tạo!`,
        type: "success",
      });
      setIsAddDialogOpen(false);
    } catch {
      setDialogState({
        isOpen: true,
        title: "Tạo vai trò thất bại",
        message: "Có lỗi xảy ra khi tạo vai trò!",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (data: {
    name: string;
    description?: string;
    perms: string[];
  }) => {
    if (!selectedRole) return;

    try {
      setLoading(true);

      // Gọi API update role
      await permAPI.updateRole(selectedRole.id.toString(), data);

      // Refresh danh sách roles sau khi update
      const res = await permAPI.getRoles(filters);
      setRoles(res.data?.data || []);
      setTotal(res.data?.total || 0);
      setTotalPages(res.data?.max_page || 1);

      setDialogState({
        isOpen: true,
        title: "Cập nhật thành công",
        message: "Thông tin vai trò đã được cập nhật!",
        type: "success",
      });
      setIsAddDialogOpen(false);
      setSelectedRole(null);
    } catch {
      setDialogState({
        isOpen: true,
        title: "Cập nhật thất bại",
        message: "Có lỗi xảy ra khi cập nhật vai trò!",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedRole || !selectedRole.id) return;

    try {
      setLoading(true);

      // Gọi API delete role
      await permAPI.deleteRole(selectedRole.id.toString());

      // Refresh danh sách roles sau khi delete
      const res = await permAPI.getRoles(filters);
      setRoles(res.data?.data || []);
      setTotal(res.data?.total || 0);
      setTotalPages(res.data?.max_page || 1);

      setIsDeleteDialogOpen(false);
      setDialogState({
        isOpen: true,
        title: "Xóa vai trò thành công",
        message: `Vai trò ${selectedRole.name} đã được xóa!`,
        type: "success",
      });
      setSelectedRole(null);
    } catch {
      setDialogState({
        isOpen: true,
        title: "Xóa thất bại",
        message: "Có lỗi xảy ra khi xóa vai trò!",
        type: "error",
      });
      setIsDeleteDialogOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setIsAddDialogOpen(true);
  };

  const handleDelete = (role: Role) => {
    setSelectedRole(role);
    setIsDeleteDialogOpen(true);
  };

  const columns: Column<Role>[] = [
    {
      label: "#",
      render: (_, i) => ((filters.page || 1) - 1) * (filters.row || 10) + i + 1,
    },
    { label: "Name", field: "name" },
    { label: "Description", field: "description" },
    {
      label: "Action",
      render: (role) => (
        <div className="flex gap-2">
          <ActionButtons
            type="edit"
            permission="role.update"
            onClick={() => handleEdit(role)}
          />
          <ActionButtons
            type="delete"
            permission="role.delete"
            onClick={() => handleDelete(role)}
          />
        </div>
      ),
    },
  ] as Column<Role>[];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý vai trò</h1>
        <AddButton
          permission="role.create"
          onClick={() => {
            setSelectedRole(null);
            setIsAddDialogOpen(true);
          }}
        />
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex-1 min-w-64">
          <Input
            placeholder="Nhập tên vai trò để tìm kiếm..."
            className="w-full"
            value={filters.searchKeyword}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4">
          <Table columns={columns} data={roles} loading={loading} />
        </div>
      </div>

      {/* Pagination */}
      <Pagination
        amountOfRecord={total}
        currentPage={filters.page || 1}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {/* Add/Edit Role Dialog */}
      <RoleDialog
        open={isAddDialogOpen}
        permissions={perms || []}
        onOpenChange={setIsAddDialogOpen}
        initialData={
          selectedRole
            ? {
                name: selectedRole.name,
                description: selectedRole.description || undefined,
                permissions: selectedRole.permissions,
              }
            : undefined
        }
        mode={selectedRole ? "edit" : "add"}
        onSubmit={(data) =>
          selectedRole ? handleUpdateRole(data) : handleAddRole(data)
        }
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteRole}
        title="Xác nhận xóa vai trò"
        description={`Bạn có chắc chắn muốn xóa vai trò ${selectedRole?.name}?`}
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
