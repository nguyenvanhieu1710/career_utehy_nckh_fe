"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation"; // Dùng để điều hướng sang trang Canvas
import { Filters } from "@/components/admin/Filters";
import { AddButton } from "@/components/admin/AddButton";
import { Column, Table } from "@/components/admin/Table";
import { Pagination } from "@/components/admin/Pagination";
import { DeleteConfirmationDialog } from "@/components/admin/DeleteConfirmationDialog";
import { ActionButtons } from "@/components/admin/ActionButtons";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Layout, Palette, Copy, Edit3 } from "lucide-react";
import { cvTemplateAPI } from "../../../services/cvTemplate";
import { toast } from "sonner";

// Định nghĩa kiểu dữ liệu cho Template
export interface CVTemplate {
  id: string;
  name: string;
  category: string;
  status: "active" | "draft";
  created_at: string;
  updated_at?: string;
}

export default function TemplateManagementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<CVTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<CVTemplate | null>(
    null,
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [filters, setFilter] = useState({
    searchKeyword: "",
    page: 1,
    row: 10,
    category: "all",
    status: "all",
  });

  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const res = await cvTemplateAPI.getTemplates(filters);
      setTemplates(res.data?.data || []);
    } catch (error) {
      toast.error("Không thể tải danh sách mẫu CV");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  // Điều hướng sang trang kéo thả Canvas
  const handleEditDesign = (id: string) => {
    router.push(`/admin/cv-builder/${id}`);
  };

  // const handleClone = async (id: string) => {
  //   try {
  //       await cvTemplateAPI.clone(id);
  //       toast.success("Đã nhân bản mẫu CV");
  //       loadTemplates();
  //   } catch (error) { toast.error("Nhân bản thất bại"); }
  // };

  const columns: Column<CVTemplate>[] = [
    {
      label: "STT",
      render: (tpl, index) => index + 1,
    },
    {
      label: "Tên mẫu",
      field: "name",
      render: (tpl) => (
        <span className="font-semibold text-gray-800">{tpl.name}</span>
      ),
    },
    { label: "Danh mục", field: "category" },
    {
      label: "Trạng thái",
      render: (tpl) => <StatusBadge status={tpl.status} size="sm" showIcon />,
    },
    {
      label: "Cập nhật cuối",
      render: (tpl) => {
        const dateToShow = tpl.updated_at || tpl.created_at;
        return (
          <span className="text-gray-500 text-xs">
            {dateToShow
              ? new Date(dateToShow).toLocaleDateString("vi-VN")
              : "---"}
          </span>
        );
      },
    },
    {
      label: "Hành động",
      render: (tpl) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEditDesign(tpl.id)}
            className="p-2 hover:bg-blue-50 text-blue-600 rounded-md border border-blue-200 cursor-pointer"
            title="Chỉnh sửa mẫu CV"
          >
            <Edit3 size={16} />
          </button>

          <ActionButtons
            permission="admin"
            type="delete"
            onClick={() => {
              setSelectedTemplate(tpl);
              setIsDeleteDialogOpen(true);
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header tương tự trang User nhưng đổi text và icon */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Mẫu CV</h1>
          <p className="text-sm text-gray-500">
            Tạo và thiết kế các mẫu CV kéo thả cho hệ thống
          </p>
        </div>
        <AddButton
          permission="admin"
          text="Tạo mẫu mới"
          onClick={() => router.push("/admin/cv-builder/new")}
        />
      </div>

      {/* Filters: Thêm lọc theo Category của CV */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <input
          placeholder="Tìm tên mẫu..."
          className="border rounded-md px-3 py-2 text-sm"
          onChange={(e) =>
            setFilter({ ...filters, searchKeyword: e.target.value })
          }
        />
        <select
          className="border rounded-md px-3 py-2 text-sm bg-white"
          value={filters.category}
          onChange={(e) =>
            setFilter({ ...filters, category: e.target.value, page: 1 })
          }
        >
          <option value="all">Tất cả ngành nghề</option>
          <option value="Chung">Chung</option>
          <option value="IT">Công nghệ thông tin</option>
          <option value="Marketing">Marketing</option>
          <option value="Design">Thiết kế</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-4">
        <Table columns={columns} data={templates} loading={loading} />
      </div>

      <Pagination
        amountOfRecord={templates.length}
        currentPage={filters.page}
        totalPages={10}
        onPageChange={(p) => setFilter({ ...filters, page: p })}
      />

      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={async () => {
          if (!selectedTemplate) return;
          try {
            await cvTemplateAPI.deleteTemplate(selectedTemplate.id);
            toast.success("Đã xóa mẫu");
            loadTemplates();
          } catch (error) {
            toast.error("Xóa thất bại");
          } finally {
            setIsDeleteDialogOpen(false);
          }
        }}
        title="Xóa mẫu thiết kế"
        description={`Mẫu "${selectedTemplate?.name}" sẽ bị xóa vĩnh viễn. Người dùng đang sử dụng mẫu này sẽ không bị ảnh hưởng.`}
      />
    </div>
  );
}
