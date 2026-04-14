"use client";

import { useState } from "react";
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
import { Switch } from "@/components/ui/switch";

export default function DataManagementPage() {
  // Dialog states
  const [selectedDataSource, setSelectedDataSource] =
    useState<DataSource | null>(null);
  const [selectedCrawlHistory, setSelectedCrawlHistory] =
    useState<CrawlHistory | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCrawlDetailOpen, setIsCrawlDetailOpen] = useState(false);
  const [dialogState, setDialogState] = useState<DialogState>({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

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
    // TODO: Fetch crawl history for this data source
    // For now, just open the dialog with mock data
    setSelectedCrawlHistory({
      id: "mock-1",
      source_id: dataSource.id,
      source_name: dataSource.name,
      status: "completed",
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      duration_seconds: 120,
      total_jobs_found: 150,
      jobs_created: 100,
      jobs_updated: 45,
      jobs_failed: 5,
      jobs_skipped: 0,
      success_rate: 96.7,
      error_count: 5,
      crawler_version: "1.0.0",
    });
    setIsCrawlDetailOpen(true);
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
          // If crawl fails, revert the switch and show error
          schedulerAPI
            .updateSchedule(dataSource.id, {
              status: "disabled",
              frequency: dataSource.crawl_frequency || "daily",
            })
            .then(() => {
              setDialogState({
                isOpen: true,
                title: "Lỗi khi crawl",
                message: `Không thể crawl ${dataSource.name}: ${error.message}. Đã tắt cron job.`,
                type: "error",
              });
              refreshData();
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
      label: "URL",
      render: (dataSource) => (
        <div className="max-w-xs">
          <div title={dataSource.base_url || ""}>
            {dataSource.base_url || "N/A"}
          </div>
        </div>
      ),
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

      {/* Crawl Detail Dialog */}
      <CrawlDetailDialog
        open={isCrawlDetailOpen}
        onOpenChange={setIsCrawlDetailOpen}
        crawlHistory={selectedCrawlHistory}
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
