"use client";

import { useState, useEffect } from "react";
import { Filters } from "@/components/admin/Filters";
import { AddButton } from "@/components/admin/AddButton";
import { Column, Table } from "@/components/admin/Table";
import { Pagination } from "@/components/admin/Pagination";
import { DataSourceDialog } from "@/components/admin/DataSourceDialog";

interface DataSourceDialogData {
  name?: string;
  description?: string;
  url?: string;
  timePeriod?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}
import { DeleteConfirmationDialog } from "@/components/admin/DeleteConfirmationDialog";
import { NotificationDialog } from "@/components/admin/NotificationDialog";
import { ActionButtons } from "@/components/admin/ActionButtons";
import {
  Database,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertTriangle,
  Clock,
  Download,
} from "lucide-react";
import { format } from "date-fns";

interface DataSource {
  id: string;
  name: string;
  description?: string;
  url: string;
  timePeriod: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  status: "active" | "inactive" | "error" | "crawling";
  lastCrawl?: string;
  totalRecords: number;
  successRate: number;
  createdAt: string;
  updatedAt: string;
}

interface DialogState {
  isOpen: boolean;
  title: string;
  message: string;
  type: "success" | "error" | "warning";
}

// Mock data for data sources
const mockDataSources: DataSource[] = [
  {
    id: "1",
    name: "JobStreet API",
    description: "Thu thập dữ liệu việc làm từ JobStreet",
    url: "https://api.jobstreet.com/jobs",
    timePeriod: "30_days",
    startDate: "2024-11-16",
    endDate: "2024-12-16",
    isActive: true,
    status: "active",
    lastCrawl: "2024-12-16 10:30:00",
    totalRecords: 15420,
    successRate: 98.5,
    createdAt: "2024-11-01 09:00:00",
    updatedAt: "2024-12-16 10:30:00",
  },
  {
    id: "2",
    name: "VietnamWorks API",
    description: "Thu thập dữ liệu việc làm từ VietnamWorks",
    url: "https://api.vietnamworks.com/jobs",
    timePeriod: "7_days",
    startDate: "2024-12-09",
    endDate: "2024-12-16",
    isActive: true,
    status: "crawling",
    lastCrawl: "2024-12-16 14:15:00",
    totalRecords: 8950,
    successRate: 95.2,
    createdAt: "2024-11-15 14:30:00",
    updatedAt: "2024-12-16 14:15:00",
  },
  {
    id: "3",
    name: "TopCV API",
    description: "Thu thập dữ liệu việc làm từ TopCV",
    url: "https://api.topcv.vn/jobs",
    timePeriod: "custom",
    startDate: "2024-12-01",
    endDate: "2024-12-31",
    isActive: false,
    status: "error",
    lastCrawl: "2024-12-15 09:15:00",
    totalRecords: 3200,
    successRate: 78.3,
    createdAt: "2024-12-01 10:00:00",
    updatedAt: "2024-12-15 09:15:00",
  },
  {
    id: "4",
    name: "CareerBuilder API",
    description: "Thu thập dữ liệu việc làm từ CareerBuilder",
    url: "https://api.careerbuilder.vn/jobs",
    timePeriod: "3_months",
    startDate: "2024-09-16",
    endDate: "2024-12-16",
    isActive: true,
    status: "inactive",
    lastCrawl: "2024-12-14 16:45:00",
    totalRecords: 12750,
    successRate: 92.8,
    createdAt: "2024-09-01 11:20:00",
    updatedAt: "2024-12-14 16:45:00",
  },
];

export default function DataManagementPage() {
  const [loading, setLoading] = useState(false);
  const [dataSources, setDataSources] = useState<DataSource[]>(mockDataSources);
  const [selectedDataSource, setSelectedDataSource] =
    useState<DataSource | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [dialogState, setDialogState] = useState<DialogState>({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });
  const [filters, setFilters] = useState({
    searchKeyword: "",
    page: 1,
    row: 10,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    // Simulate API call
    const filteredData = dataSources.filter((ds) => {
      const matchesSearch =
        !filters.searchKeyword ||
        ds.name.toLowerCase().includes(filters.searchKeyword.toLowerCase()) ||
        ds.description
          ?.toLowerCase()
          .includes(filters.searchKeyword.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || ds.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    setTotal(filteredData.length);
    setTotalPages(Math.ceil(filteredData.length / filters.row));
  }, [dataSources, filters, statusFilter]);

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setFilters({ ...filters, page: 1 });
  };

  const handleSearchChange = (value: string) => {
    setFilters({ ...filters, searchKeyword: value, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  const handleAddDataSource = async (data: DataSourceDialogData) => {
    try {
      setLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newDataSource: DataSource = {
        id: (dataSources.length + 1).toString(),
        name: data.name || "",
        description: data.description,
        url: data.url || "",
        timePeriod: data.timePeriod || "",
        startDate: data.startDate,
        endDate: data.endDate,
        isActive: data.isActive || false,
        status: (data.isActive ? "active" : "inactive") as DataSource["status"],
        totalRecords: 0,
        successRate: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setDataSources([...dataSources, newDataSource]);
      setDialogState({
        isOpen: true,
        title: "Thêm nguồn dữ liệu thành công",
        message: `Nguồn dữ liệu ${data.name} đã được thêm!`,
        type: "success",
      });
      setIsAddDialogOpen(false);
    } catch {
      setDialogState({
        isOpen: true,
        title: "Thêm nguồn dữ liệu thất bại",
        message: "Có lỗi xảy ra khi thêm nguồn dữ liệu!",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDataSource = async (data: DataSourceDialogData) => {
    if (!selectedDataSource) return;

    try {
      setLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const updatedDataSources = dataSources.map((ds) =>
        ds.id === selectedDataSource.id
          ? {
              ...ds,
              name: data.name || ds.name,
              description: data.description,
              url: data.url || ds.url,
              timePeriod: data.timePeriod || ds.timePeriod,
              startDate: data.startDate,
              endDate: data.endDate,
              isActive:
                data.isActive !== undefined ? data.isActive : ds.isActive,
              updatedAt: new Date().toISOString(),
              status: (data.isActive
                ? "active"
                : "inactive") as DataSource["status"],
            }
          : ds
      );

      setDataSources(updatedDataSources);
      setDialogState({
        isOpen: true,
        title: "Cập nhật thành công",
        message: "Thông tin nguồn dữ liệu đã được cập nhật!",
        type: "success",
      });
      setIsAddDialogOpen(false);
      setSelectedDataSource(null);
    } catch {
      setDialogState({
        isOpen: true,
        title: "Cập nhật thất bại",
        message: "Có lỗi xảy ra khi cập nhật nguồn dữ liệu!",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDataSource = async () => {
    if (!selectedDataSource) return;

    try {
      setLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const updatedDataSources = dataSources.filter(
        (ds) => ds.id !== selectedDataSource.id
      );
      setDataSources(updatedDataSources);

      setIsDeleteDialogOpen(false);
      setDialogState({
        isOpen: true,
        title: "Xóa nguồn dữ liệu thành công",
        message: `Nguồn dữ liệu ${selectedDataSource.name} đã được xóa!`,
        type: "success",
      });
      setSelectedDataSource(null);
    } catch {
      setDialogState({
        isOpen: true,
        title: "Xóa thất bại",
        message: "Có lỗi xảy ra khi xóa nguồn dữ liệu!",
        type: "error",
      });
      setIsDeleteDialogOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (dataSource: DataSource) => {
    setSelectedDataSource(dataSource);
    setIsAddDialogOpen(true);
  };

  const handleDelete = (dataSource: DataSource) => {
    setSelectedDataSource(dataSource);
    setIsDeleteDialogOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "inactive":
        return <XCircle className="w-4 h-4 text-gray-600" />;
      case "error":
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case "crawling":
        return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
      default:
        return <Database className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Hoạt động";
      case "inactive":
        return "Tạm dừng";
      case "error":
        return "Lỗi";
      case "crawling":
        return "Đang thu thập";
      default:
        return "Không xác định";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-50";
      case "inactive":
        return "text-gray-600 bg-gray-50";
      case "error":
        return "text-red-600 bg-red-50";
      case "crawling":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getTimePeriodText = (timePeriod: string) => {
    switch (timePeriod) {
      case "7_days":
        return "7 ngày";
      case "30_days":
        return "30 ngày";
      case "3_months":
        return "3 tháng";
      case "6_months":
        return "6 tháng";
      case "1_year":
        return "1 năm";
      case "custom":
        return "Tùy chỉnh";
      default:
        return "Không xác định";
    }
  };

  // Filter data for current page
  const filteredData = dataSources.filter((ds) => {
    const matchesSearch =
      !filters.searchKeyword ||
      ds.name.toLowerCase().includes(filters.searchKeyword.toLowerCase()) ||
      ds.description
        ?.toLowerCase()
        .includes(filters.searchKeyword.toLowerCase());

    const matchesStatus = statusFilter === "all" || ds.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const paginatedData = filteredData.slice(
    (filters.page - 1) * filters.row,
    filters.page * filters.row
  );

  const columns: Column<DataSource>[] = [
    {
      label: "#",
      render: (_, i) => ((filters.page || 1) - 1) * (filters.row || 10) + i + 1,
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
          <div
            className="text-sm text-blue-600 truncate"
            title={dataSource.url}
          >
            {dataSource.url}
          </div>
        </div>
      ),
    },
    {
      label: "Khoảng thời gian",
      render: (dataSource) => (
        <div className="text-sm">
          <div className="font-medium">
            {getTimePeriodText(dataSource.timePeriod)}
          </div>
          {dataSource.startDate && dataSource.endDate && (
            <div className="text-gray-500 text-xs mt-1">
              {format(new Date(dataSource.startDate), "dd/MM/yyyy")} -{" "}
              {format(new Date(dataSource.endDate), "dd/MM/yyyy")}
            </div>
          )}
        </div>
      ),
    },
    {
      label: "Trạng thái",
      render: (dataSource) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(dataSource.status)}
          <span
            className={`text-sm font-medium px-2 py-1 rounded-full ${getStatusColor(
              dataSource.status
            )}`}
          >
            {getStatusText(dataSource.status)}
          </span>
        </div>
      ),
    },
    {
      label: "Thống kê",
      render: (dataSource) => (
        <div className="text-sm space-y-1">
          <div className="flex items-center gap-1">
            <Download className="w-3 h-3 text-gray-400" />
            <span>
              {dataSource.totalRecords.toLocaleString("vi-VN")} bản ghi
            </span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-green-500" />
            <span>{dataSource.successRate}% thành công</span>
          </div>
          {dataSource.lastCrawl && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500">
                {format(new Date(dataSource.lastCrawl), "dd/MM HH:mm")}
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      label: "Hành động",
      render: (dataSource) => (
        <div className="flex gap-2">
          <ActionButtons type="edit" onClick={() => handleEdit(dataSource)} />
          <ActionButtons
            type="delete"
            onClick={() => handleDelete(dataSource)}
          />
        </div>
      ),
    },
  ] as Column<DataSource>[];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý nguồn dữ liệu
          </h1>
        </div>
        <AddButton
          onClick={() => {
            setSelectedDataSource(null);
            setIsAddDialogOpen(true);
          }}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Database className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {dataSources.length}
              </div>
              <div className="text-sm text-gray-600">Tổng nguồn dữ liệu</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {dataSources.filter((ds) => ds.status === "active").length}
              </div>
              <div className="text-sm text-gray-600">Đang hoạt động</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <RefreshCw className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {dataSources.filter((ds) => ds.status === "crawling").length}
              </div>
              <div className="text-sm text-gray-600">Đang thu thập</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {dataSources.filter((ds) => ds.status === "error").length}
              </div>
              <div className="text-sm text-gray-600">Có lỗi</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <Filters
        status={statusFilter}
        searchKeyword={filters.searchKeyword || ""}
        onStatusChange={handleStatusChange}
        onSearchChange={handleSearchChange}
        hideRoleFilter={true}
        searchPlaceholder="Nhập tên nguồn dữ liệu để tìm kiếm..."
      />

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4">
          <Table columns={columns} data={paginatedData} loading={loading} />
        </div>
      </div>

      {/* Pagination */}
      <Pagination
        amountOfRecord={total}
        currentPage={filters.page || 1}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {/* Add/Edit Data Source Dialog */}
      <DataSourceDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        initialData={
          selectedDataSource
            ? {
                name: selectedDataSource.name,
                description: selectedDataSource.description,
                url: selectedDataSource.url,
                timePeriod: selectedDataSource.timePeriod,
                startDate: selectedDataSource.startDate,
                endDate: selectedDataSource.endDate,
                isActive: selectedDataSource.isActive,
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
