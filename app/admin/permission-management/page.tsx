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
import { DateTime } from "@/types/base";
import { RoleDialog } from "@/components/admin/RoleDialog";
import { authAPI } from "@/services/auth";
import { permAPI } from "@/services/perm";
import { toast } from "sonner";
import { Role } from "@/types/permission";



export default function RoleManagementPage() {
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<Role[]>();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [perms, setPerms] = useState<string[]>();
  // Giả lập loading
  useEffect(() => {
    authAPI.getPerms().then(res => {
      setPerms(res.data);
    })
    setLoading(true);
    permAPI.getRoles({ id: "", searchKeyword: "", page: 1, row: 100 }).then(res => {
      setRoles(res.data?.data)
    }).catch(err => { }).finally(() => setLoading(false))
  }, []);

  const handleAddRole = (data: {
    name: string;
    description: string;
  }) => {
    const newRole: Role = {
      name: data.name,
      description: data.description,
    };

    setRoles([...roles || [], newRole]);
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
          created_at: data.created_at
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
      render: role => (
        <div className='flex gap-2'>
          <ActionButtons type='edit' onClick={() => handleEdit(role)} />
          <ActionButtons type='delete' onClick={() => handleDelete(role)} />
        </div>
      )
    }

  ] as Column<Role>[];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý tài khoản</h1>
        <AddButton
          onClick={() => {
            setSelectedRole(null);
            setIsAddDialogOpen(true);
          }}
        />
      </div>

      {/* Filters */}
      <Filters />

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
          permAPI.createRole(data).then(res => {
            toast.success("Thêm vai trò mới thành công!")
          }).catch(err => {

          })
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
      <SuccessDialog
        open={isSuccessDialogOpen}
        onOpenChange={setIsSuccessDialogOpen}
      />
    </div>
  );
}
