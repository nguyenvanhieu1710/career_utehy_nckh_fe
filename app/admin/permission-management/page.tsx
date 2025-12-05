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
import { toast } from "sonner";
import { Role } from "@/types/permission";
import { Input } from "@/components/ui/input";

export default function RoleManagementPage() {
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<Role[]>();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [filters, setFilters] = useState({
    id: "",
    searchKeyword: "",
    page: 1,
    row: 100,
  });
  const [perms, setPerms] = useState<string[]>();
  // Giả lập loading
  useEffect(() => {
    permAPI.getPerms().then((res) => {
      setPerms(res.data);
    });
    permAPI
      .getRoles(filters)
      .then((res) => {
        setRoles(res.data?.data);
      })
      .catch((err) => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAddRole = (data: { name: string; description: string }) => {
    const newRole: Role = {
      name: data.name,
      description: data.description,
    };

    setRoles([...(roles || []), newRole]);
    setSuccessMessage("Thêm người dùng thành công!");
    setIsAddDialogOpen(false);
    setIsSuccessDialogOpen(true);
  };

  const handleUpdateRole = (data: Omit<Role, "id" | "email">) => {
    if (!selectedRole) return;

    const updatedRoles = roles?.map((role) =>
      role.id === selectedRole.id
        ? {
            ...role,
            name: data.name,
            description: data.description,
            created_at: data.created_at,
          }
        : role
    );

    setRoles(updatedRoles);
    setSuccessMessage("Cập nhật thông tin thành công!");
    setIsAddDialogOpen(false);
    setIsSuccessDialogOpen(true);
    setSelectedRole(null);
  };

  const handleDeleteRole = () => {
    if (!selectedRole) return;

    const updatedRoles = roles?.filter((role) => role.id !== selectedRole.id);
    setRoles(updatedRoles);
    setIsDeleteDialogOpen(false);
    setSuccessMessage("Đã xóa người dùng thành công!");
    setIsSuccessDialogOpen(true);
    setSelectedRole(null);
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
        onSubmit={(data) => {
          permAPI
            .createRole(data)
            .then((res) => {
              toast.success("Thêm vai trò mới thành công!");
            })
            .catch((err) => {});
        }}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteRole}
        title="Xác nhận xóa người dùng"
        description={`Bạn có chắc chắn muốn xóa người dùng ${selectedRole?.name}?`}
      />

      {/* Success Dialog */}
      <NotificationDialog
        open={isSuccessDialogOpen}
        onOpenChange={setIsSuccessDialogOpen}
      />
    </div>
  );
}
