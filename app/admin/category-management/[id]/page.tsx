"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Tag,
  Briefcase,
  Calendar,
  Loader2,
  Building2,
  MapPin,
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { AddButton } from "@/components/admin/AddButton";
import { ActionButtons } from "@/components/admin/ActionButtons";
import { CategoryDialog } from "@/components/admin/CategoryDialog";
import { DeleteConfirmationDialog } from "@/components/admin/DeleteConfirmationDialog";
import { NotificationDialog } from "@/components/admin/NotificationDialog";

import { categoryAPI } from "@/services/category";
import { jobAPI } from "@/services/job";
import { logger } from "@/lib/logger";
import { formatDate, formatNumber } from "@/utils/formatters";
import BehaviorAnalyticsSection from "@/components/admin/BehaviorAnalyticsSection";

import { Category } from "@/types/category";
import { Job } from "@/types/job";
import { DialogState } from "@/types/dialog";

const PIE_COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
];

interface CategoryDetail extends Partial<Category> {
  title?: string;
  slug?: string;
  job_count?: number;
}

export default function CategoryDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const categoryId = params?.id as string;

  const [category, setCategory] = useState<CategoryDetail | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [dialog, setDialog] = useState<DialogState>({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  const loadAll = useCallback(async () => {
    if (!categoryId) return;
    setLoading(true);
    setError(null);
    try {
      const catRes = await categoryAPI.getCategoryById(categoryId);
      const fetched: any = catRes.data?.data;
      if (!fetched) {
        setError("Không tìm thấy ngành nghề.");
        return;
      }
      setCategory(fetched);

      const slug = fetched.slug || fetched.id || categoryId;
      try {
        const jobsRes = await jobAPI.getJobs({
          page: 1,
          row: 20,
          category_slug: slug,
        } as any);
        setJobs(jobsRes.data || []);
        setTotalJobs(jobsRes.total || (jobsRes.data || []).length || 0);
      } catch (jobErr) {
        logger.warn("Failed to load jobs in category", jobErr);
        setJobs([]);
        setTotalJobs(0);
      }
    } catch (err) {
      logger.error("Failed to load category detail", err);
      setError("Không thể tải dữ liệu ngành nghề.");
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleUpdate = async (data: {
    name: string;
    description?: string;
    avatar_url?: string;
  }) => {
    if (!category?.id) {
      setDialog({
        isOpen: true,
        title: "Không thể cập nhật",
        message: "Ngành này được suy ra từ dữ liệu việc làm, không có bản ghi riêng để chỉnh sửa.",
        type: "info",
      });
      setIsEditOpen(false);
      return;
    }
    try {
      await categoryAPI.updateCategory(category.id.toString(), {
        name: data.name,
        description: data.description,
        avatar_url: data.avatar_url,
      });
      setDialog({
        isOpen: true,
        title: "Cập nhật thành công",
        message: "Thông tin ngành đã được cập nhật.",
        type: "success",
      });
      setIsEditOpen(false);
      loadAll();
    } catch {
      setDialog({
        isOpen: true,
        title: "Cập nhật thất bại",
        message: "Có lỗi xảy ra khi cập nhật ngành.",
        type: "error",
      });
    }
  };

  const handleCreate = async (data: {
    name: string;
    description?: string;
    avatar_url?: string;
    avatarFile?: File;
  }) => {
    try {
      const created = await categoryAPI.createCategory({
        name: data.name,
        description: data.description,
      });
      if (data.avatarFile && created.data?.data?.id) {
        try {
          await categoryAPI.uploadAvatar(
            created.data.data.id.toString(),
            data.avatarFile,
            true,
          );
        } catch (e) {
          logger.warn("Avatar upload failed after create", e);
        }
      }
      setDialog({
        isOpen: true,
        title: "Thêm thành công",
        message: `Đã thêm ngành "${data.name}".`,
        type: "success",
      });
      setIsAddOpen(false);
    } catch {
      setDialog({
        isOpen: true,
        title: "Thêm thất bại",
        message: "Có lỗi xảy ra khi thêm ngành.",
        type: "error",
      });
    }
  };

  const handleDelete = async () => {
    if (!category?.id) {
      setDialog({
        isOpen: true,
        title: "Không thể xóa",
        message: "Ngành này được suy ra từ dữ liệu việc làm, không có bản ghi riêng để xóa.",
        type: "info",
      });
      setIsDeleteOpen(false);
      return;
    }
    try {
      await categoryAPI.deleteCategory(category.id.toString());
      setIsDeleteOpen(false);
      setDialog({
        isOpen: true,
        title: "Xóa thành công",
        message: "Ngành đã được xóa. Đang quay về danh sách...",
        type: "success",
      });
      setTimeout(() => router.push("/admin/category-management"), 1200);
    } catch {
      setDialog({
        isOpen: true,
        title: "Xóa thất bại",
        message: "Có lỗi xảy ra khi xóa ngành.",
        type: "error",
      });
      setIsDeleteOpen(false);
    }
  };

  const jobTypeData = useMemo(() => {
    const map = new Map<string, number>();
    jobs.forEach((j) => {
      const key = j.job_type || "khác";
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map, ([name, value]) => ({ name, value }));
  }, [jobs]);

  const arrangementData = useMemo(() => {
    const map = new Map<string, number>();
    jobs.forEach((j) => {
      const key = j.work_arrangement || "khác";
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map, ([name, value]) => ({ name, value }));
  }, [jobs]);

  const topCompanies = useMemo(() => {
    const map = new Map<string, number>();
    jobs.forEach((j) => {
      const name = j.company?.name || "Không xác định";
      map.set(name, (map.get(name) || 0) + 1);
    });
    return Array.from(map, ([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 7);
  }, [jobs]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white border border-red-200 rounded-lg p-8 text-center">
          <p className="text-red-600 mb-4">{error || "Không có dữ liệu"}</p>
          <Link
            href="/admin/category-management"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
          >
            <ArrowLeft size={16} /> Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  const displayName = category.name || category.title || "Ngành nghề";
  const displaySlug = category.slug || category.id || categoryId;
  const jobCount = category.job_count ?? totalJobs;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap gap-3 justify-between items-center">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/category-management"
            className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-md hover:bg-gray-50"
          >
            <ArrowLeft size={16} /> Danh sách
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Chi tiết ngành nghề</h1>
        </div>
        <div className="flex gap-2">
          <ActionButtons
            type="edit"
            permission="category.update"
            onClick={() => setIsEditOpen(true)}
          />
          <ActionButtons
            type="delete"
            permission="category.delete"
            onClick={() => setIsDeleteOpen(true)}
          />
          <AddButton
            permission="category.create"
            onClick={() => setIsAddOpen(true)}
          />
        </div>
      </div>

      {/* Main info */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="w-24 h-24 rounded-lg border-2 border-emerald-200 overflow-hidden bg-emerald-50 flex items-center justify-center flex-shrink-0">
            {category.avatar_url ? (
              <img
                src={categoryAPI.getAvatarUrl(category as Category)}
                alt={displayName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/default-category.png";
                }}
              />
            ) : (
              <Tag className="h-10 w-10 text-emerald-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">
              {displayName}
            </h2>
            <p className="text-sm text-gray-500 mb-3">
              Slug: <span className="font-mono">{displaySlug}</span>
            </p>
            {category.description && (
              <p className="text-sm text-gray-700 mb-3">{category.description}</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <Briefcase size={14} className="text-emerald-600" />
                <span>
                  <strong>{formatNumber(jobCount)}</strong> việc làm
                </span>
              </div>
              {category.created_at && (
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-emerald-600" />
                  <span>Tạo: {formatDate(category.created_at)}</span>
                </div>
              )}
              {category.updated_at && (
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-emerald-600" />
                  <span>Cập nhật: {formatDate(category.updated_at)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Tổng việc làm"
          value={formatNumber(jobCount)}
          color="bg-blue-100 text-blue-700"
        />
        <StatCard
          label="Việc đang hiển thị"
          value={formatNumber(jobs.length)}
          color="bg-emerald-100 text-emerald-700"
        />
        <StatCard
          label="Công ty khác nhau"
          value={formatNumber(topCompanies.length)}
          color="bg-amber-100 text-amber-700"
        />
        <StatCard
          label="Loại hình"
          value={formatNumber(jobTypeData.length)}
          color="bg-purple-100 text-purple-700"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">
            Phân bố theo loại hình
          </h3>
          <div className="h-72">
            {jobTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={jobTypeData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ name, percent }) =>
                      `${name} ${((percent || 0) * 100).toFixed(0)}%`
                    }
                  >
                    {jobTypeData.map((_, idx) => (
                      <Cell
                        key={`cell-${idx}`}
                        fill={PIE_COLORS[idx % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                Chưa có dữ liệu
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">
            Phân bố theo hình thức làm việc
          </h3>
          <div className="h-72">
            {arrangementData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={arrangementData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6" name="Số việc làm" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                Chưa có dữ liệu
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top companies chart */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">
          Top công ty trong ngành (theo số tin đăng hiện có)
        </h3>
        <div className="h-72">
          {topCompanies.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCompanies} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fill: "#6b7280", fontSize: 12 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={140}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                />
                <Tooltip />
                <Bar dataKey="value" fill="#10B981" name="Số tin đăng" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
              Chưa có công ty nào
            </div>
          )}
        </div>
      </div>

      {/* Referenced data: jobs in this category */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <Briefcase size={16} className="text-emerald-600" /> Việc làm trong ngành
            <span className="text-xs text-gray-500 font-normal">
              ({formatNumber(jobs.length)} hiển thị)
            </span>
          </h3>
          <Link
            href="/admin/job-management"
            className="text-sm text-emerald-700 hover:underline"
          >
            Quản lý việc làm
          </Link>
        </div>
        {jobs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">
                    #
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">
                    Tiêu đề
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">
                    Công ty
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">
                    Địa điểm
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">
                    Loại
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {jobs.map((job, i) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-500">{i + 1}</td>
                    <td className="px-3 py-2 font-medium text-gray-800 max-w-xs truncate">
                      {job.title}
                    </td>
                    <td className="px-3 py-2 text-gray-700">
                      <span className="inline-flex items-center gap-1">
                        <Building2 size={12} className="text-gray-400" />
                        {job.company?.name || "—"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-700">
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={12} className="text-gray-400" />
                        {job.location || "—"}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="inline-block text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                        {job.job_type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-6">
            Chưa có việc làm nào trong ngành này.
          </p>
        )}
      </div>

      {/* Behavior analytics for this industry */}
      <BehaviorAnalyticsSection
        mode="category"
        categoryId={category.id ? category.id.toString() : undefined}
        categorySlug={displaySlug ? String(displaySlug) : undefined}
        title="Phân tích hành vi người dùng trong ngành"
      />

      {/* Dialogs */}
      <CategoryDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        initialData={{
          name: displayName,
          description: category.description,
          avatar_url: category.avatar_url,
        }}
        category={(category.id ? (category as Category) : undefined) as any}
        mode="edit"
        onSubmit={handleUpdate}
      />

      <CategoryDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        mode="add"
        onSubmit={handleCreate}
      />

      <DeleteConfirmationDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDelete}
        title="Xác nhận xóa ngành"
        description={`Bạn có chắc muốn xóa ngành "${displayName}"? Hành động này không thể hoàn tác.`}
      />

      <NotificationDialog
        open={dialog.isOpen}
        onOpenChange={(open) => setDialog({ ...dialog, isOpen: open })}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p
        className={`mt-2 text-2xl font-bold inline-block px-2 py-0.5 rounded ${color}`}
      >
        {value}
      </p>
    </div>
  );
}
