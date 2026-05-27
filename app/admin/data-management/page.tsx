"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Filters } from "@/components/admin/Filters";
import { Column, Table } from "@/components/admin/Table";
import { Pagination } from "@/components/admin/Pagination";
import { ActionButtons } from "@/components/admin/ActionButtons";
import { AddButton } from "@/components/admin/AddButton";
import {
  DataSourceDialog,
  DataSourceDialogData,
} from "@/components/admin/DataSourceDialog";
import { DeleteConfirmationDialog } from "@/components/admin/DeleteConfirmationDialog";
import { NotificationDialog } from "@/components/admin/NotificationDialog";
import { CrawlDetailDialog } from "@/components/admin/CrawlDetailDialog";
import { CrawlHistoryDialog } from "@/components/admin/CrawlHistoryDialog";
import { ScrapeUrlDialog } from "@/components/admin/ScrapeUrlDialog";
import { useDataSources } from "@/hooks/useDataSources";
import { DataSource } from "@/types/data-source";
import { CrawlHistory } from "@/types/crawl-history";
import { DialogState } from "@/types/dialog";
import {
  getDataSourceStatusIcon,
  getDataSourceStatusText,
  getDataSourceStatusColor,
} from "@/utils/crawl-helpers";
import { schedulerAPI } from "@/services/scheduler";
import { dataSourceAPI } from "@/services/dataSource";
import { Switch } from "@/components/ui/switch";
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
  PolarAngleAxis,
} from "recharts";
import { Loader2, X } from "lucide-react";

export default function DataManagementPage() {
  const router = useRouter();
  // Dialog states
  const [selectedDataSource, setSelectedDataSource] =
    useState<DataSource | null>(null);
  const [selectedCrawlHistory] = useState<CrawlHistory | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCrawlDetailOpen, setIsCrawlDetailOpen] = useState(false);
  const [isCrawlHistoryOpen, setIsCrawlHistoryOpen] = useState(false);
  const [isScrapeUrlOpen, setIsScrapeUrlOpen] = useState(false);
  const [prefillUrl, setPrefillUrl] = useState<string>("");
  const [prefillCategoryId, setPrefillCategoryId] = useState<string>("");
  const [scrapingId, setScrapingId] = useState<string | null>(null);
  const [dialogState, setDialogState] = useState<DialogState>({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  // Chart states
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartType, setChartType] = useState<"bar" | "line">("bar");
  const [chartsLoading, setChartsLoading] = useState(false);
  const COLORS = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#EC4899",
    "#14B8A6",
    "#F97316",
  ];

  // Data sources hook
  const {
    dataSources,
    loading,
    error,
    pagination,
    filters,
    handleStatusChange,
    handleSearchChange,
    handlePageChange,
    refreshData,
    createDataSource,
    updateDataSource,
    deleteDataSource,
  } = useDataSources();

  // Load chart data when dataSources change
  useEffect(() => {
    const loadChartData = async () => {
      if (dataSources.length === 0) {
        setChartData([]);
        return;
      }

      setChartsLoading(true);
      try {
        // Fetch statistics for each data source
        const statsPromises = dataSources.map((source) =>
          dataSourceAPI.getDataSourceStatistics(source.id).catch(() => null)
        );
        const statsResults = await Promise.all(statsPromises);

        // Process data for charts
        const processedData = dataSources
          .map((source, index) => {
            const stats = statsResults[index]?.data;
            return {
              name: source.name,
              total_jobs: stats?.total_jobs || 0,
              jobs_last_7_days: stats?.jobs_last_7_days || 0,
              jobs_last_30_days: stats?.jobs_last_30_days || 0,
              success_rate: stats?.success_rate || 0,
              id: source.id,
            };
          })
          .sort((a, b) => b.total_jobs - a.total_jobs);

        setChartData(processedData);
      } catch (error) {
        console.error("Failed to load chart data:", error);
      } finally {
        setChartsLoading(false);
      }
    };

    loadChartData();
  }, [dataSources]);

  // Handlers
  const handleAddClick = () => {
    setSelectedDataSource(null);
    setIsAddDialogOpen(true);
  };

  const handleEdit = (dataSource: DataSource) => {
    setSelectedDataSource(dataSource);
    setIsAddDialogOpen(true);
  };

  const handleDelete = (dataSource: DataSource) => {
    setSelectedDataSource(dataSource);
    setIsDeleteDialogOpen(true);
  };

  const handleViewHistory = (dataSource: DataSource) => {
    setSelectedDataSource(dataSource);
    setIsCrawlHistoryOpen(true);
  };

  // Open the scrape-by-URL modal for this source.
  const handleScrape = (dataSource: DataSource) => {
    setSelectedDataSource(dataSource);
    setPrefillUrl("");
    setPrefillCategoryId("");
    setIsScrapeUrlOpen(true);
  };

  // Actually run the scrape after the user submits the modal.
  const handleScrapeUrlSubmit = async ({
    url,
    category_id,
  }: {
    url: string;
    category_id: string;
  }) => {
    if (!selectedDataSource) return;
    setScrapingId(selectedDataSource.id);
    try {
      const response = await dataSourceAPI.scrapeUrl(selectedDataSource.id, {
        url,
        category_id,
      });
      const result = response.data?.data;

      const methodLabel: Record<string, string> = {
        api: "API nhà cung cấp",
        extraction: "Dịch vụ trích xuất",
        selector: "Selector scraper",
        mixed: "Kết hợp",
        noop: "Không có nguồn nào chạy",
      };

      if (!result) {
        setDialogState({
          isOpen: true,
          title: "Cào dữ liệu hoàn tất",
          message: "Đã chạy xong nhưng không có dữ liệu trả về.",
          type: "info",
        });
      } else if (result.fetched === 0) {
        setDialogState({
          isOpen: true,
          title: "Không có dữ liệu mới",
          message: `Phương thức: ${methodLabel[result.method] ?? result.method}. Không tìm thấy dữ liệu nào để lưu.`,
          type: "info",
        });
      } else {
        setDialogState({
          isOpen: true,
          title: `Cào ${selectedDataSource.name} thành công`,
          message: `Phương thức: ${methodLabel[result.method] ?? result.method}. Lấy ${result.fetched} mục — thêm mới ${result.inserted}, trùng lặp bỏ qua ${result.skipped_duplicate}, lỗi ${result.failed}.`,
          type: result.failed > 0 ? "info" : "success",
        });
      }

      setIsScrapeUrlOpen(false);
      refreshData();
    } catch (error: any) {
      setDialogState({
        isOpen: true,
        title: "Cào dữ liệu thất bại",
        message:
          error?.response?.data?.detail ||
          error?.message ||
          "Không thể cào dữ liệu lúc này.",
        type: "error",
      });
    } finally {
      setScrapingId(null);
    }
  };

  const handleToggleCrawl = async (dataSource: DataSource) => {
    const newStatus = dataSource.crawl_enabled ? "disabled" : "enabled";

    try {
      // Step 1: Update schedule immediately (enable/disable cron job)
      await schedulerAPI.updateSchedule(dataSource.id, {
        status: newStatus,
        frequency: dataSource.crawl_frequency || "daily",
      });

      // Step 2: Show success immediately
      if (newStatus === "enabled") {
        setDialogState({
          isOpen: true,
          title: "Kích hoạt crawl thành công",
          message: `Cron job cho ${dataSource.name} đã được kích hoạt! Đang bắt đầu crawl...`,
          type: "success",
        });
      } else {
        setDialogState({
          isOpen: true,
          title: "Tắt crawl thành công",
          message: `Cron job cho ${dataSource.name} đã được tắt!`,
          type: "success",
        });
      }

      // Step 3: Refresh UI immediately to show new state
      refreshData();

      // Step 4: If enabling, trigger crawl in background (don't wait)
      if (newStatus === "enabled") {
        schedulerAPI.triggerCrawl(dataSource.id).catch((error) => {
          console.error("Background crawl trigger failed:", error);
          // We don't disable the cron job anymore because a trigger failure
          // might be transient or just a timeout, while the scheduler is still valid.
          setDialogState({
            isOpen: true,
            title: "Thông tin",
            message: `Không thể kích hoạt crawl ngay lập tức: ${error.message}`,
            type: "info",
          });
        });
      }
    } catch (error: any) {
      setDialogState({
        isOpen: true,
        title: "Cập nhật thất bại",
        message:
          error.message || "Có lỗi xảy ra khi cập nhật trạng thái crawl!",
        type: "error",
      });
    }
  };

  const handleAddDataSource = async (data: DataSourceDialogData) => {
    try {
      const apiData = {
        name: data.name || "",
        description: data.description,
        base_url: data.base_url,
        status: data.isActive ? "active" : "inactive",
        crawl_frequency: data.crawl_frequency || "daily",
        crawl_enabled: data.crawl_enabled !== false,
        crawler_payload: data.crawler_payload,
        api_service: !!data.api_service,
        api_service_config: data.api_service_config ?? null,
      };

      await createDataSource(apiData);

      setDialogState({
        isOpen: true,
        title: "Thêm nguồn dữ liệu thành công",
        message: `Nguồn dữ liệu ${data.name} đã được thêm!`,
        type: "success",
      });
      setIsAddDialogOpen(false);
    } catch (error: any) {
      setDialogState({
        isOpen: true,
        title: "Thêm nguồn dữ liệu thất bại",
        message: error.message || "Có lỗi xảy ra khi thêm nguồn dữ liệu!",
        type: "error",
      });
    }
  };

  const handleUpdateDataSource = async (data: DataSourceDialogData) => {
    if (!selectedDataSource) return;

    try {
      const apiData = {
        name: data.name || selectedDataSource.name,
        description: data.description,
        base_url: data.base_url,
        status: data.isActive ? "active" : "inactive",
        crawl_frequency: data.crawl_frequency,
        crawl_enabled: data.crawl_enabled,
        crawler_payload: data.crawler_payload,
        api_service: !!data.api_service,
        api_service_config: data.api_service_config ?? null,
      };

      await updateDataSource(selectedDataSource.id, apiData);

      setDialogState({
        isOpen: true,
        title: "Cập nhật thành công",
        message: "Thông tin nguồn dữ liệu đã được cập nhật!",
        type: "success",
      });
      setIsAddDialogOpen(false);
      setSelectedDataSource(null);
    } catch (error: any) {
      setDialogState({
        isOpen: true,
        title: "Cập nhật thất bại",
        message: error.message || "Có lỗi xảy ra khi cập nhật nguồn dữ liệu!",
        type: "error",
      });
    }
  };

  const handleDeleteDataSource = async () => {
    if (!selectedDataSource) return;

    try {
      await deleteDataSource(selectedDataSource.id);

      setIsDeleteDialogOpen(false);
      setDialogState({
        isOpen: true,
        title: "Xóa nguồn dữ liệu thành công",
        message: `Nguồn dữ liệu ${selectedDataSource.name} đã được xóa!`,
        type: "success",
      });
      setSelectedDataSource(null);
    } catch (error: any) {
      setDialogState({
        isOpen: true,
        title: "Xóa thất bại",
        message: error.message || "Có lỗi xảy ra khi xóa nguồn dữ liệu!",
        type: "error",
      });
      setIsDeleteDialogOpen(false);
    }
  };

  // Table columns
  const columns: Column<DataSource>[] = [
    {
      label: "#",
      render: (_, i) => (pagination.page - 1) * pagination.limit + i + 1,
    },
    {
      label: "Tên nguồn dữ liệu",
      render: (dataSource) => (
        <div>
          <div className="font-medium text-gray-900">{dataSource.name}</div>
          {dataSource.description && (
            <div className="text-sm text-gray-500 mt-1">
              {dataSource.description}
            </div>
          )}
        </div>
      ),
    },
    {
      label: "URLs",
      render: (dataSource) => {
        const history = dataSource.crawl_urls || [];
        return (
          <div className="max-w-sm space-y-1.5">
            {dataSource.base_url && (
              <div
                className="text-xs text-gray-500 truncate"
                title={dataSource.base_url}
              >
                {dataSource.base_url}
              </div>
            )}
            {history.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {history.slice(0, 5).map((entry) => (
                  <span
                    key={entry.url}
                    className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 text-amber-800 text-[11px] px-2 py-0.5 hover:bg-amber-100 transition-colors"
                    title={entry.url}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDataSource(dataSource);
                        setPrefillUrl(entry.url);
                        setPrefillCategoryId(entry.category_id || "");
                        setIsScrapeUrlOpen(true);
                      }}
                      className="max-w-[180px] truncate text-left cursor-pointer"
                    >
                      {entry.url}
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await dataSourceAPI.deleteCrawlUrl(
                            dataSource.id,
                            entry.url,
                          );
                          refreshData();
                        } catch (e) {
                          /* ignore */
                        }
                      }}
                      className="text-gray-400 hover:text-red-600"
                      title="Xóa khỏi lịch sử"
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
                {history.length > 5 && (
                  <span className="inline-flex items-center text-[11px] text-gray-500 px-1.5">
                    +{history.length - 5}
                  </span>
                )}
              </div>
            ) : (
              <div className="text-[11px] text-gray-400">
                Chưa có URL đã cào
              </div>
            )}
          </div>
        );
      },
    },
    {
      label: "Trạng thái",
      render: (dataSource) => (
        <div className="flex items-center gap-2">
          {getDataSourceStatusIcon(dataSource.status)}
          <span
            className={`text-sm font-medium px-2 py-1 rounded-full ${getDataSourceStatusColor(
              dataSource.status,
            )}`}
          >
            {getDataSourceStatusText(dataSource.status)}
          </span>
        </div>
      ),
    },
    {
      label: "Cấu hình Crawl",
      render: (dataSource) => (
        <div className="flex items-center gap-3">
          <Switch
            checked={dataSource.crawl_enabled}
            onCheckedChange={() => handleToggleCrawl(dataSource)}
            className="data-[state=checked]:bg-green-500"
          />
          <span
            className={`text-sm font-medium ${dataSource.crawl_enabled ? "text-green-600" : "text-gray-400"}`}
          >
            {dataSource.crawl_enabled ? "Đang chạy" : "Đã tắt"}
          </span>
        </div>
      ),
    },
    {
      label: "Hành động",
      render: (dataSource) => (
        <div className="flex gap-2">
          <ActionButtons
            type="view"
            permission="data_source.read"
            title="Xem chi tiết"
            onClick={() =>
              router.push(`/admin/data-management/${dataSource.id}`)
            }
          />
          <ActionButtons
            type="scrape"
            permission="data_source.crawl"
            title="Cào dữ liệu ngay"
            loading={scrapingId === dataSource.id}
            onClick={() => handleScrape(dataSource)}
          />
          <ActionButtons
            type="history"
            permission="crawl_history.view"
            onClick={() => handleViewHistory(dataSource)}
          />
          <ActionButtons
            type="edit"
            permission="data_source.update"
            onClick={() => handleEdit(dataSource)}
          />
          <ActionButtons
            type="delete"
            permission="data_source.delete"
            onClick={() => handleDelete(dataSource)}
          />
        </div>
      ),
    },
  ] as Column<DataSource>[];

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center p-8">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý nguồn dữ liệu
          </h1>
        </div>
        <AddButton permission="data_source.create" onClick={handleAddClick} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Bar/Line Chart - Conversion Toggle */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Số lượng việc làm theo nguồn
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setChartType("bar")}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  chartType === "bar"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Cột
              </button>
              <button
                onClick={() => setChartType("line")}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  chartType === "line"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Đường
              </button>
            </div>
          </div>

          <div className="h-80 w-full relative">
            {chartsLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-lg">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                {chartType === "bar" ? (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                      label={{ value: "Số lượng", angle: -90, position: "insideLeft" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "0.5rem",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="total_jobs"
                      fill="#3B82F6"
                      name="Tổng việc làm"
                    />
                    <Bar
                      dataKey="jobs_last_7_days"
                      fill="#10B981"
                      name="7 ngày gần nhất"
                    />
                    <Bar
                      dataKey="jobs_last_30_days"
                      fill="#F59E0B"
                      name="30 ngày gần nhất"
                    />
                  </BarChart>
                ) : (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                      label={{ value: "Số lượng", angle: -90, position: "insideLeft" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "0.5rem",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="total_jobs"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Tổng việc làm"
                    />
                    <Line
                      type="monotone"
                      dataKey="jobs_last_7_days"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      name="7 ngày gần nhất"
                    />
                    <Line
                      type="monotone"
                      dataKey="jobs_last_30_days"
                      stroke="#F59E0B"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      name="30 ngày gần nhất"
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Không có dữ liệu biểu đồ
              </div>
            )}
          </div>
        </div>

        {/* Pie Chart - Data Source Distribution */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Phân bố việc làm theo nguồn
          </h2>

          <div className="h-80 w-full relative">
            {chartsLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-lg">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="total_jobs"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) => {
                      const percentage = percent ? (percent * 100).toFixed(0) : "0";
                      return `${name} ${percentage}%`;
                    }}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => value.toLocaleString()}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "0.5rem",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Không có dữ liệu biểu đồ
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter */}
      <Filters
        status={filters.status || "all"}
        searchKeyword={filters.search_keyword || ""}
        onStatusChange={handleStatusChange}
        onSearchChange={handleSearchChange}
        hideRoleFilter={true}
        searchPlaceholder="Nhập tên nguồn dữ liệu để tìm kiếm..."
      />

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4">
          <Table columns={columns} data={dataSources} loading={loading} />
        </div>
      </div>

      {/* Pagination */}
      <Pagination
        amountOfRecord={pagination.total}
        currentPage={pagination.page}
        totalPages={pagination.max_page}
        onPageChange={handlePageChange}
      />

      {/* Add/Edit Data Source Dialog */}
      <DataSourceDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        initialData={
          selectedDataSource
            ? {
                ...selectedDataSource,
                base_url: selectedDataSource.base_url || "",
                isActive: selectedDataSource.status === "active",
                crawl_frequency: selectedDataSource.crawl_frequency || "daily",
                crawl_enabled: selectedDataSource.crawl_enabled ?? true,
                crawler_payload: selectedDataSource.crawler_payload,
                api_service: selectedDataSource.api_service ?? false,
                api_service_config:
                  selectedDataSource.api_service_config ?? null,
              }
            : undefined
        }
        mode={selectedDataSource ? "edit" : "add"}
        onSubmit={(data) =>
          selectedDataSource
            ? handleUpdateDataSource(data)
            : handleAddDataSource(data)
        }
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteDataSource}
        title="Xác nhận xóa nguồn dữ liệu"
        description={`Bạn có chắc chắn muốn xóa nguồn dữ liệu ${selectedDataSource?.name}? Hành động này không thể hoàn tác.`}
      />

      {/* Scrape-by-URL Dialog */}
      <ScrapeUrlDialog
        open={isScrapeUrlOpen}
        onOpenChange={setIsScrapeUrlOpen}
        dataSource={selectedDataSource}
        submitting={scrapingId === selectedDataSource?.id}
        initialUrl={prefillUrl}
        initialCategoryId={prefillCategoryId}
        onHistoryChange={() => refreshData()}
        onSubmit={handleScrapeUrlSubmit}
      />

      {/* Crawl Detail Dialog */}
      <CrawlDetailDialog
        open={isCrawlDetailOpen}
        onOpenChange={setIsCrawlDetailOpen}
        crawlHistory={selectedCrawlHistory}
      />

      {/* Crawl History Dialog (List) */}
      <CrawlHistoryDialog
        open={isCrawlHistoryOpen}
        onOpenChange={setIsCrawlHistoryOpen}
        sourceId={selectedDataSource?.id}
        sourceName={selectedDataSource?.name}
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
