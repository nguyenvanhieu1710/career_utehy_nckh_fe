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

export default function RoleManagementPage() {
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<Role[]>();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [dialogState, setDialogState] = useState<DialogState>({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });
  const [filters, setFilters] = useState({
    id: "",
    searchKeyword: "",
    page: 1,
    row: 100,
  });
  const [perms, setPerms] = useState<string[]>();

  // Load permissions list (chỉ 1 lần)
  useEffect(() => {
    permAPI.getPerms().then((res) => {
      setPerms(res.data);
    });
  }, []);

  // Load roles list (khi filters thay đổi)
  useEffect(() => {
    setLoading(true);
    permAPI
      .getRoles(filters)
      .then((res) => {
        setRoles(res.data?.data);
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

  const handleDeleteRole = async () => {
    if (!selectedRole || !selectedRole.id) return;

    try {
      setLoading(true);
      // TODO: Implement delete API
      // await permAPI.deleteRole(selectedRole.id);

      // Refresh danh sách roles
      const res = await permAPI.getRoles(filters);
      setRoles(res.data?.data);

      setIsDeleteDialogOpen(false);
      setSelectedRole(null);
      setDialogState({
        isOpen: true,
        title: "Xóa thành công",
        message: "Đã xóa vai trò thành công!",
        type: "success",
      });
    } catch {
      setDialogState({
        isOpen: true,
        title: "Xóa thất bại",
        message: "Có lỗi xảy ra khi xóa vai trò!",
        type: "error",
      });
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
    { label: "#", render: (_, i) => i + 1 },
    { label: "Name", field: "name" },
    { label: "Description", field: "description" },
    {
      label: "Action",
      render: (role) => (
        <div className="flex gap-2">
          <ActionButtons type="edit" onClick={() => handleEdit(role)} />
          <ActionButtons type="delete" onClick={() => handleDelete(role)} />
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
            onChange={(e) => {
              setFilters((prev) => ({
                ...prev,
                searchKeyword: e.target.value,
              }));
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4">
          <Table columns={columns} data={roles || []} loading={loading} />
        </div>
      </div>

      {/* Pagination */}
      <Pagination amountOfRecord={roles?.length || 0} />

      {/* Add/Edit Role Dialog */}
      <RoleDialog
        open={isAddDialogOpen}
        permissions={perms || []}
        onOpenChange={setIsAddDialogOpen}
        initialData={selectedRole || undefined}
        mode={selectedRole ? "edit" : "add"}
        onSubmit={async (data) => {
          try {
            setLoading(true);
            await permAPI.createRole(data);

            // Refresh danh sách roles
            const res = await permAPI.getRoles(filters);
            setRoles(res.data?.data);

            // Đóng dialog và hiện thông báo
            setIsAddDialogOpen(false);
            setSelectedRole(null);
            setDialogState({
              isOpen: true,
              title: "Thêm thành công",
              message: "Thêm vai trò mới thành công!",
              type: "success",
            });
          } catch {
            setDialogState({
              isOpen: true,
              title: "Thêm thất bại",
              message: "Có lỗi xảy ra khi thêm vai trò!",
              type: "error",
            });
          } finally {
            setLoading(false);
          }
        }}
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
