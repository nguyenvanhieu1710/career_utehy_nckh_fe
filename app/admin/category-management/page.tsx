"use client";

import { useState, useEffect } from "react";
import { AddButton } from "@/components/admin/AddButton";
import { Column, Table } from "@/components/admin/Table";
import { Pagination } from "@/components/admin/Pagination";
import { CategoryDialog } from "@/components/admin/CategoryDialog";
import { DeleteConfirmationDialog } from "@/components/admin/DeleteConfirmationDialog";
import { NotificationDialog } from "@/components/admin/NotificationDialog";
import { ActionButtons } from "@/components/admin/ActionButtons";
import { categoryAPI } from "@/services/category";
import { GetSchema } from "@/types/base";
import { Category } from "@/types/category";
import { DialogState } from "@/types/dialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function CategoryManagementPage() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
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

  useEffect(() => {
    setLoading(true);
    categoryAPI
      .getCategories(filters)
      .then((res) => {
        setCategories(res.data?.data || []);
        setTotal(res.data?.total || 0);
        setTotalPages(res.data?.max_page || 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filters]);

  const loadCategories = () => {
    setLoading(true);
    categoryAPI
      .getCategories(filters)
      .then((res) => {
        setCategories(res.data?.data || []);
        setTotal(res.data?.total || 0);
        setTotalPages(res.data?.max_page || 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleSearchChange = (value: string) => {
    setFilter({ ...filters, searchKeyword: value, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setFilter({ ...filters, page });
  };

  const handleAddCategory = async (data: {
    name: string;
    description?: string;
  }) => {
    try {
      setLoading(true);

      await categoryAPI.createCategory(data);
      loadCategories();

      setDialogState({
        isOpen: true,
        title: "Tạo danh mục thành công",
        message: `Danh mục "${data.name}" đã được tạo!`,
        type: "success",
      });
      setIsAddDialogOpen(false);
    } catch (error: any) {
      setDialogState({
        isOpen: true,
        title: "Tạo danh mục thất bại",
        message:
          error.response?.data?.detail || "Có lỗi xảy ra khi tạo danh mục!",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCategory = async (data: {
    name: string;
    description?: string;
  }) => {
    if (!selectedCategory) return;

    try {
      setLoading(true);

      await categoryAPI.updateCategory(selectedCategory.id.toString(), data);
      loadCategories();

      setDialogState({
        isOpen: true,
        title: "Cập nhật thành công",
        message: "Thông tin danh mục đã được cập nhật!",
        type: "success",
      });
      setIsAddDialogOpen(false);
      setSelectedCategory(null);
    } catch (error: any) {
      setDialogState({
        isOpen: true,
        title: "Cập nhật thất bại",
        message:
          error.response?.data?.detail ||
          "Có lỗi xảy ra khi cập nhật danh mục!",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;

    try {
      setLoading(true);

      await categoryAPI.deleteCategory(selectedCategory.id.toString());
      loadCategories();

      setIsDeleteDialogOpen(false);
      setDialogState({
        isOpen: true,
        title: "Xóa danh mục thành công",
        message: `Danh mục "${selectedCategory.name}" đã được xóa!`,
        type: "success",
      });
      setSelectedCategory(null);
    } catch (error: unknown) {
      setDialogState({
        isOpen: true,
        title: "Xóa thất bại",
        message:
          error.response?.data?.detail || "Có lỗi xảy ra khi xóa danh mục!",
        type: "error",
      });
      setIsDeleteDialogOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsAddDialogOpen(true);
  };

  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const columns: Column<Category>[] = [
    {
      label: "#",
      render: (_, i) => ((filters.page || 1) - 1) * (filters.row || 10) + i + 1,
    },
    { label: "Tên danh mục", field: "name" },
    { label: "Mô tả", field: "description" },
    {
      label: "Trạng thái",
      render: (category) => (
        <span
          className={
            category.action_status === "active"
              ? "text-green-600"
              : "text-red-600"
          }
        >
          {category.action_status === "active"
            ? "Hoạt động"
            : "Ngừng hoạt động"}
        </span>
      ),
    },
    {
      label: "Hành động",
      render: (category) => (
        <div className="flex gap-2">
          <ActionButtons type="edit" onClick={() => handleEdit(category)} />
          <ActionButtons type="delete" onClick={() => handleDelete(category)} />
        </div>
      ),
    },
  ] as Column<Category>[];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý danh mục</h1>
        <AddButton
          onClick={() => {
            setSelectedCategory(null);
            setIsAddDialogOpen(true);
          }}
        />
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            value={filters.searchKeyword || ""}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 border-green-200 focus:border-green-500 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4">
          <Table columns={columns} data={categories} loading={loading} />
        </div>
      </div>

      {/* Pagination */}
      <Pagination
        amountOfRecord={total}
        currentPage={filters.page || 1}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {/* Add/Edit Category Dialog */}
      <CategoryDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        initialData={
          selectedCategory
            ? {
                name: selectedCategory.name,
                description: selectedCategory.description,
              }
            : undefined
        }
        mode={selectedCategory ? "edit" : "add"}
        onSubmit={(data) =>
          selectedCategory
            ? handleUpdateCategory(data)
            : handleAddCategory(data)
        }
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteCategory}
        title="Xác nhận xóa danh mục"
        description={`Bạn có chắc chắn muốn xóa danh mục "${selectedCategory?.name}"?`}
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
