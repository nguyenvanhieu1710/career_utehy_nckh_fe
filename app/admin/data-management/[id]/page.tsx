"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  Calendar,
  Clock,
  Database,
  Loader2,
  Activity,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";

import { AddButton } from "@/components/admin/AddButton";
import { ActionButtons } from "@/components/admin/ActionButtons";
import {
  DataSourceDialog,
  DataSourceDialogData,
} from "@/components/admin/DataSourceDialog";
import { DeleteConfirmationDialog } from "@/components/admin/DeleteConfirmationDialog";
import { NotificationDialog } from "@/components/admin/NotificationDialog";
import { CrawlHistoryTable } from "@/components/admin/CrawlHistoryTable";
import { ScrapeUrlDialog } from "@/components/admin/ScrapeUrlDialog";
import { Switch } from "@/components/ui/switch";

import { dataSourceAPI, DataSourceStatistics } from "@/services/dataSource";
import { schedulerAPI } from "@/services/scheduler";
import { crawlHistoryAPI } from "@/services/crawlHistory";

import { DataSource } from "@/types/data-source";
import { CrawlHistory } from "@/types/crawl-history";
import { DialogState } from "@/types/dialog";

import {
  getDataSourceStatusIcon,
  getDataSourceStatusText,
  getDataSourceStatusColor,
} from "@/utils/crawl-helpers";
import { formatDate, formatNumber, formatDuration } from "@/utils/formatters";
import { logger } from "@/lib/logger";

const PIE_COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"];

export default function DataSourceDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const sourceId = params?.id as string;

  const [dataSource, setDataSource] = useState<DataSource | null>(null);
  const [stats, setStats] = useState<DataSourceStatistics | null>(null);
  const [histories, setHistories] = useState<CrawlHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scraping, setScraping] = useState(false);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isScrapeUrlOpen, setIsScrapeUrlOpen] = useState(false);
  const [dialog, setDialog] = useState<DialogState>({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  const loadAll = useCallback(async () => {
    if (!sourceId) return;
    setLoading(true);
    setError(null);
    try {
      const [srcRes, statsRes, histRes] = await Promise.all([
        dataSourceAPI.getDataSource(sourceId),
        dataSourceAPI.getDataSourceStatistics(sourceId).catch(() => null),
        crawlHistoryAPI
          .getCrawlHistoriesBySource(sourceId, { limit: 10, page: 1 })
          .catch(() => null),
      ]);

      const ds: any = srcRes.data;
      // BE may return either the object directly or wrapped { data: ... }
      const finalDS: DataSource = ds?.data ?? ds;
      if (!finalDS) {
        setError("Không tìm thấy nguồn dữ liệu.");
        return;
      }
      setDataSource(finalDS);

      if (statsRes?.data) {
        setStats(statsRes.data);
      }

      if (histRes?.data) {
        setHistories(histRes.data);
      } else {
        setHistories([]);
      }
    } catch (err) {
      logger.error("Failed to load data source detail", err);
      setError("Không thể tải dữ liệu nguồn.");
    } finally {
      setLoading(false);
    }
  }, [sourceId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleEdit = async (data: DataSourceDialogData) => {
    if (!dataSource) return;
    try {
      await dataSourceAPI.updateDataSource(dataSource.id, {
        name: data.name || dataSource.name,
        description: data.description,
        base_url: data.base_url,
        status: data.isActive ? "active" : "inactive",
        crawl_frequency: data.crawl_frequency,
        crawl_enabled: data.crawl_enabled,
        crawler_payload: data.crawler_payload,
        api_service: !!data.api_service,
        api_service_config: data.api_service_config ?? null,
      } as any);
      setDialog({
        isOpen: true,
        title: "Cập nhật thành công",
        message: "Nguồn dữ liệu đã được cập nhật.",
        type: "success",
      });
      setIsEditOpen(false);
      loadAll();
    } catch (err: any) {
      setDialog({
        isOpen: true,
        title: "Cập nhật thất bại",
        message: err?.message || "Có lỗi xảy ra khi cập nhật.",
        type: "error",
      });
    }
  };

  const handleAdd = async (data: DataSourceDialogData) => {
    try {
      await dataSourceAPI.createDataSource({
        name: data.name || "",
        description: data.description,
        base_url: data.base_url,
        status: data.isActive ? "active" : "inactive",
        crawl_frequency: data.crawl_frequency || "daily",
        crawl_enabled: data.crawl_enabled !== false,
        crawler_payload: data.crawler_payload,
        api_service: !!data.api_service,
        api_service_config: data.api_service_config ?? null,
      } as any);
      setDialog({
        isOpen: true,
        title: "Thêm thành công",
        message: `Đã tạo nguồn dữ liệu ${data.name}.`,
        type: "success",
      });
      setIsAddOpen(false);
    } catch (err: any) {
      setDialog({
        isOpen: true,
        title: "Thêm thất bại",
        message: err?.message || "Có lỗi xảy ra khi thêm nguồn.",
        type: "error",
      });
    }
  };

  const handleDelete = async () => {
    if (!dataSource) return;
    try {
      await dataSourceAPI.deleteDataSource(dataSource.id);
      setIsDeleteOpen(false);
      setDialog({
        isOpen: true,
        title: "Xóa nguồn dữ liệu thành công",
        message: `Đã xóa ${dataSource.name}. Đang quay về danh sách...`,
        type: "success",
      });
      setTimeout(() => router.push("/admin/data-management"), 1200);
    } catch (err: any) {
      setDialog({
        isOpen: true,
        title: "Xóa thất bại",
        message: err?.message || "Có lỗi xảy ra khi xóa.",
        type: "error",
      });
      setIsDeleteOpen(false);
    }
  };

  // Open the scrape-by-URL modal.
  const handleScrape = () => {
    if (!dataSource) return;
    setIsScrapeUrlOpen(true);
  };

  const handleScrapeUrlSubmit = async ({
    url,
    category_id,
  }: {
    url: string;
    category_id: string;
  }) => {
    if (!dataSource) return;
    setScraping(true);
    try {
      const res = await dataSourceAPI.scrapeUrl(dataSource.id, {
        url,
        category_id,
      });
      const result = res.data?.data;
      if (!result) {
        setDialog({
          isOpen: true,
          title: "Cào dữ liệu hoàn tất",
          message: "Không có dữ liệu trả về.",
          type: "info",
        });
      } else if (result.fetched === 0) {
        setDialog({
          isOpen: true,
          title: "Không có dữ liệu mới",
          message: "Không tìm thấy dữ liệu nào để lưu.",
          type: "info",
        });
      } else {
        setDialog({
          isOpen: true,
          title: "Cào thành công",
          message: `Lấy ${result.fetched} mục — thêm mới ${result.inserted}, trùng lặp ${result.skipped_duplicate}, lỗi ${result.failed}.`,
          type: result.failed > 0 ? "info" : "success",
        });
      }
      setIsScrapeUrlOpen(false);
      loadAll();
    } catch (err: any) {
      setDialog({
        isOpen: true,
        title: "Cào dữ liệu thất bại",
        message:
          err?.response?.data?.detail ||
          err?.message ||
          "Không thể cào dữ liệu lúc này.",
        type: "error",
      });
    } finally {
      setScraping(false);
    }
  };

  const handleToggleCrawl = async () => {
    if (!dataSource) return;
    const newStatus = dataSource.crawl_enabled ? "disabled" : "enabled";
    try {
      await schedulerAPI.updateSchedule(dataSource.id, {
        status: newStatus,
        frequency: dataSource.crawl_frequency || "daily",
      });
      setDialog({
        isOpen: true,
        title:
          newStatus === "enabled"
            ? "Đã bật lịch crawl"
            : "Đã tắt lịch crawl",
        message: `Cập nhật lịch cào dữ liệu cho ${dataSource.name} thành công.`,
        type: "success",
      });
      loadAll();
    } catch (err: any) {
      setDialog({
        isOpen: true,
        title: "Cập nhật thất bại",
        message: err?.message || "Có lỗi khi cập nhật lịch.",
        type: "error",
      });
    }
  };

  const historyChartData = useMemo(() => {
    return [...histories]
      .reverse()
      .slice(-10)
      .map((h) => ({
        name: h.started_at
          ? new Date(h.started_at).toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
            })
          : "—",
        jobs_created: h.jobs_created || 0,
        jobs_updated: h.jobs_updated || 0,
        jobs_failed: h.jobs_failed || 0,
        success_rate: Number(h.success_rate?.toFixed(1)) || 0,
      }));
  }, [histories]);

  const statusDistribution = useMemo(() => {
    const map = new Map<string, number>();
    histories.forEach((h) => {
      map.set(h.status, (map.get(h.status) || 0) + 1);
    });
    const labels: Record<string, string> = {
      completed: "Hoàn thành",
      running: "Đang chạy",
      failed: "Thất bại",
      cancelled: "Đã hủy",
    };
    return Array.from(map, ([key, value]) => ({
      name: labels[key] || key,
      value,
    }));
  }, [histories]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error || !dataSource) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white border border-red-200 rounded-lg p-8 text-center">
          <p className="text-red-600 mb-4">{error || "Không có dữ liệu"}</p>
          <Link
            href="/admin/data-management"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
          >
            <ArrowLeft size={16} /> Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  const successRate = stats?.success_rate ?? 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap gap-3 justify-between items-center">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/data-management"
            className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-md hover:bg-gray-50"
          >
            <ArrowLeft size={16} /> Danh sách
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Chi tiết nguồn dữ liệu
          </h1>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <ActionButtons
            type="scrape"
            permission="data_source.crawl"
            title="Cào dữ liệu ngay"
            loading={scraping}
            onClick={handleScrape}
          />
          <ActionButtons
            type="edit"
            permission="data_source.update"
            onClick={() => setIsEditOpen(true)}
          />
          <ActionButtons
            type="delete"
            permission="data_source.delete"
            onClick={() => setIsDeleteOpen(true)}
          />
          <AddButton
            permission="data_source.create"
            onClick={() => setIsAddOpen(true)}
          />
        </div>
      </div>

      {/* Main info */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <div className="w-20 h-20 rounded-lg border-2 border-emerald-200 bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <Database className="h-10 w-10 text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h2 className="text-xl font-semibold text-gray-900">
                {dataSource.name}
              </h2>
              <div className="flex items-center gap-2">
                {getDataSourceStatusIcon(dataSource.status)}
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${getDataSourceStatusColor(dataSource.status)}`}
                >
                  {getDataSourceStatusText(dataSource.status)}
                </span>
              </div>
            </div>
            {dataSource.description && (
              <p className="text-sm text-gray-600 mb-3">
                {dataSource.description}
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
              <div className="flex items-center gap-2 min-w-0">
                <ExternalLink size={14} className="text-emerald-600 flex-shrink-0" />
                {dataSource.base_url ? (
                  <a
                    href={dataSource.base_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline truncate"
                  >
                    {dataSource.base_url}
                  </a>
                ) : (
                  <span className="text-gray-400">Chưa có URL</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-emerald-600" />
                <span>Lần cào gần nhất: {formatDate(dataSource.last_crawled_at || undefined)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-emerald-600" />
                <span>Tạo: {formatDate(dataSource.created_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-emerald-600" />
                <span>Cập nhật: {formatDate(dataSource.updated_at)}</span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <Switch
                checked={!!dataSource.crawl_enabled}
                onCheckedChange={handleToggleCrawl}
                className="data-[state=checked]:bg-green-500"
              />
              <span
                className={`text-sm font-medium ${
                  dataSource.crawl_enabled ? "text-green-600" : "text-gray-400"
                }`}
              >
                {dataSource.crawl_enabled
                  ? `Tự động cào (${dataSource.crawl_frequency || "daily"})`
                  : "Đã tắt lịch cào"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Tổng việc làm"
          value={formatNumber(stats?.total_jobs || 0)}
          color="bg-blue-100 text-blue-700"
        />
        <StatCard
          label="7 ngày gần nhất"
          value={formatNumber(stats?.jobs_last_7_days || 0)}
          color="bg-emerald-100 text-emerald-700"
        />
        <StatCard
          label="30 ngày gần nhất"
          value={formatNumber(stats?.jobs_last_30_days || 0)}
          color="bg-amber-100 text-amber-700"
        />
        <StatCard
          label="Tỉ lệ thành công"
          value={`${successRate.toFixed(1)}%`}
          color="bg-purple-100 text-purple-700"
        />
      </div>

      {/* Secondary info: crawler payload, API service config */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">
            Cấu hình Crawler
          </h3>
          <dl className="space-y-2 text-sm">
            <Row label="Tần suất" value={dataSource.crawl_frequency || "daily"} />
            <Row
              label="Trạng thái lịch"
              value={dataSource.crawl_enabled ? "Đang bật" : "Đã tắt"}
            />
            <Row
              label="Lần chạy tiếp theo"
              value={formatDate(dataSource.next_run_at || undefined)}
            />
          </dl>
          {dataSource.crawler_payload && (
            <div className="mt-4">
              <p className="text-xs font-medium text-gray-500 mb-1">Payload</p>
              <pre className="bg-gray-50 border rounded p-3 text-[11px] overflow-x-auto max-h-40 text-gray-700">
                {JSON.stringify(dataSource.crawler_payload, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">
            API nhà cung cấp
          </h3>
          <dl className="space-y-2 text-sm">
            <Row
              label="Sử dụng API"
              value={dataSource.api_service ? "Có" : "Không"}
            />
            {dataSource.api_service && dataSource.api_service_config && (
              <>
                <Row
                  label="Endpoint"
                  value={dataSource.api_service_config.url}
                />
                <Row
                  label="Method"
                  value={dataSource.api_service_config.method || "GET"}
                />
              </>
            )}
          </dl>
          {dataSource.api_service && dataSource.api_service_config && (
            <div className="mt-4">
              <p className="text-xs font-medium text-gray-500 mb-1">
                Cấu hình đầy đủ
              </p>
              <pre className="bg-gray-50 border rounded p-3 text-[11px] overflow-x-auto max-h-40 text-gray-700">
                {JSON.stringify(dataSource.api_service_config, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6 lg:col-span-2">
          <h3 className="text-base font-semibold text-gray-800 mb-4">
            Hiệu suất 10 lần cào gần nhất
          </h3>
          <div className="h-72">
            {historyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={historyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="jobs_created" fill="#10B981" name="Thêm mới" />
                  <Bar dataKey="jobs_updated" fill="#3B82F6" name="Cập nhật" />
                  <Bar dataKey="jobs_failed" fill="#EF4444" name="Lỗi" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                Chưa có dữ liệu lịch sử cào
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">
            Tỉ lệ thành công
          </h3>
          <div className="h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                innerRadius="60%"
                outerRadius="100%"
                data={[
                  {
                    name: "success",
                    value: successRate,
                    fill: successRate >= 80 ? "#10B981" : successRate >= 50 ? "#F59E0B" : "#EF4444",
                  },
                ]}
                startAngle={90}
                endAngle={-270}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar background dataKey="value" cornerRadius={10} />
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-2xl font-bold fill-gray-800"
                >
                  {successRate.toFixed(1)}%
                </text>
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">
            Xu hướng thành công qua các lần cào
          </h3>
          <div className="h-72">
            {historyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 12 }} />
                  <YAxis
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                    domain={[0, 100]}
                  />
                  <Tooltip formatter={(v: number) => `${v}%`} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="success_rate"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Tỉ lệ thành công (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                Chưa có dữ liệu lịch sử
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">
            Phân bố trạng thái lần cào
          </h3>
          <div className="h-72">
            {statusDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ name, percent }) =>
                      `${name} ${((percent || 0) * 100).toFixed(0)}%`
                    }
                  >
                    {statusDistribution.map((_, idx) => (
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
      </div>

      {/* Referenced data: crawl history table */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <Activity size={16} className="text-emerald-600" /> Lịch sử cào dữ liệu
          </h3>
        </div>
        <CrawlHistoryTable sourceId={sourceId} />
      </div>

      {/* Dialogs */}
      <DataSourceDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        initialData={{
          ...dataSource,
          base_url: dataSource.base_url || "",
          isActive: dataSource.status === "active",
          crawl_frequency: dataSource.crawl_frequency || "daily",
          crawl_enabled: dataSource.crawl_enabled ?? true,
          crawler_payload: dataSource.crawler_payload,
          api_service: dataSource.api_service ?? false,
          api_service_config: dataSource.api_service_config ?? null,
        }}
        mode="edit"
        onSubmit={handleEdit}
      />

      <DataSourceDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        mode="add"
        onSubmit={handleAdd}
      />

      <ScrapeUrlDialog
        open={isScrapeUrlOpen}
        onOpenChange={setIsScrapeUrlOpen}
        dataSource={dataSource}
        submitting={scraping}
        onHistoryChange={() => loadAll()}
        onSubmit={handleScrapeUrlSubmit}
      />

      <DeleteConfirmationDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDelete}
        title="Xác nhận xóa nguồn dữ liệu"
        description={`Bạn có chắc muốn xóa nguồn dữ liệu ${dataSource.name}? Hành động này không thể hoàn tác.`}
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
      <p className={`mt-2 text-2xl font-bold inline-block px-2 py-0.5 rounded ${color}`}>
        {value}
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between gap-2 border-b border-gray-50 pb-1.5">
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-gray-800 text-right break-words">
        {value || <span className="text-gray-400">—</span>}
      </dd>
    </div>
  );
}
