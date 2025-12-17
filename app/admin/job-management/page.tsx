"use client";

import { useState, useEffect } from "react";
import { Filters } from "@/components/admin/Filters";
import { AddButton } from "@/components/admin/AddButton";
import { Column, Table } from "@/components/admin/Table";
import { Pagination } from "@/components/admin/Pagination";
import { JobDialog } from "@/components/admin/JobDialog";
import { DeleteConfirmationDialog } from "@/components/admin/DeleteConfirmationDialog";
import { NotificationDialog } from "@/components/admin/NotificationDialog";
import { ActionButtons } from "@/components/admin/ActionButtons";
import { jobAPI } from "@/services/job";
import { GetSchema } from "@/types/base";
import { Job } from "@/types/job";
import { DialogState } from "@/types/dialog";
import {
  getJobStatusLabel,
  getJobTypeLabel,
  formatSalary,
  formatJobLocation,
} from "@/constants/job";

interface JobDialogSubmitData {
  title: string;
  company_id: string;
  location?: string;
  other_locations?: string[];
  work_arrangement?: string;
  job_type: string;
  salary_display?: string;
  salary_min?: number;
  salary_max?: number;
  skills?: string[];
  requirements?: string;
  description?: string;
  benefits?: string;
  status?: string;
  url_source?: string;
}

export default function JobManagementPage() {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
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
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    setLoading(true);

    const loadJobs = async () => {
      try {
        let response;
        if (statusFilter === "all") {
          response = await jobAPI.getJobs(filters);
        } else {
          response = await jobAPI.getJobsByStatus(statusFilter, filters);
        }

        setJobs(response.data || []);
        setTotal(response.total || 0);
        setTotalPages(response.max_page || 1);
      } catch (error) {
        console.error("Failed to load jobs:", error);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, [filters, statusFilter]);

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setFilter({ ...filters, page: 1 });
  };

  const handleTypeChange = (value: string) => {
    setTypeFilter(value);
    setFilter({ ...filters, page: 1 });
  };

  const handleSearchChange = (value: string) => {
    setFilter({ ...filters, searchKeyword: value, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setFilter({ ...filters, page });
  };

  const handleAddJob = async (data: JobDialogSubmitData) => {
    try {
      setLoading(true);

      await jobAPI.createJob(data);

      // Refresh danh sách job sau khi create
      const response = await jobAPI.getJobs(filters);
      setJobs(response.data || []);
      setTotal(response.total || 0);
      setTotalPages(response.max_page || 1);

      setDialogState({
        isOpen: true,
        title: "Tạo tin tuyển dụng thành công",
        message: `Tin tuyển dụng "${data.title}" đã được tạo!`,
        type: "success",
      });
      setIsJobDialogOpen(false);
    } catch (error: unknown) {
      setDialogState({
        isOpen: true,
        title: "Tạo tin tuyển dụng thất bại",
        message: "Có lỗi xảy ra khi tạo tin tuyển dụng!",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateJob = async (data: JobDialogSubmitData) => {
    if (!selectedJob) return;

    try {
      setLoading(true);

      await jobAPI.updateJob(selectedJob.id, data);

      // Refresh danh sách job sau khi update
      const response = await jobAPI.getJobs(filters);
      setJobs(response.data || []);
      setTotal(response.total || 0);
      setTotalPages(response.max_page || 1);

      setDialogState({
        isOpen: true,
        title: "Cập nhật thành công",
        message: "Thông tin tin tuyển dụng đã được cập nhật!",
        type: "success",
      });
      setIsJobDialogOpen(false);
      setSelectedJob(null);
    } catch (error: unknown) {
      setDialogState({
        isOpen: true,
        title: "Cập nhật thất bại",
        message: "Có lỗi xảy ra khi cập nhật tin tuyển dụng!",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async () => {
    if (!selectedJob) return;

    try {
      setLoading(true);

      await jobAPI.deleteJob(selectedJob.id);

      // Refresh danh sách job sau khi delete
      const response = await jobAPI.getJobs(filters);
      setJobs(response.data || []);
      setTotal(response.total || 0);
      setTotalPages(response.max_page || 1);

      setIsDeleteDialogOpen(false);
      setDialogState({
        isOpen: true,
        title: "Xóa tin tuyển dụng thành công",
        message: `Tin tuyển dụng "${selectedJob.title}" đã được xóa!`,
        type: "success",
      });
      setSelectedJob(null);
    } catch (error: unknown) {
      setDialogState({
        isOpen: true,
        title: "Xóa thất bại",
        message: "Có lỗi xảy ra khi xóa tin tuyển dụng!",
        type: "error",
      });
      setIsDeleteDialogOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (job: Job) => {
    try {
      await jobAPI.approveJob(job.id);

      // Refresh data
      const response = await jobAPI.getJobs(filters);
      setJobs(response.data || []);

      setDialogState({
        isOpen: true,
        title: "Duyệt thành công",
        message: `Tin tuyển dụng "${job.title}" đã được duyệt!`,
        type: "success",
      });
    } catch (error) {
      setDialogState({
        isOpen: true,
        title: "Duyệt thất bại",
        message: "Có lỗi xảy ra khi duyệt tin tuyển dụng!",
        type: "error",
      });
    }
  };

  const handleReject = async (job: Job) => {
    try {
      await jobAPI.rejectJob(job.id);

      // Refresh data
      const response = await jobAPI.getJobs(filters);
      setJobs(response.data || []);

      setDialogState({
        isOpen: true,
        title: "Từ chối thành công",
        message: `Tin tuyển dụng "${job.title}" đã bị từ chối!`,
        type: "success",
      });
    } catch (error) {
      setDialogState({
        isOpen: true,
        title: "Từ chối thất bại",
        message: "Có lỗi xảy ra khi từ chối tin tuyển dụng!",
        type: "error",
      });
    }
  };

  const handleEdit = (job: Job) => {
    setSelectedJob(job);
    setIsJobDialogOpen(true);
  };

  const handleDelete = (job: Job) => {
    setSelectedJob(job);
    setIsDeleteDialogOpen(true);
  };

  const columns: Column<Job>[] = [
    {
      label: "#",
      render: (_, i) => ((filters.page || 1) - 1) * (filters.row || 10) + i + 1,
    },
    {
      label: "Tiêu đề",
      render: (job) => (
        <div>
          <div className="font-medium">{job.title}</div>
          {job.skills && job.skills.length > 0 && (
            <div className="text-xs text-gray-500 mt-1">
              {job.skills.slice(0, 3).join(", ")}
              {job.skills.length > 3 && ` +${job.skills.length - 3}`}
            </div>
          )}
        </div>
      ),
    },
    {
      label: "Công ty",
      render: (job) => (
        <div className="font-medium">{job.company?.name || "N/A"}</div>
      ),
    },
    {
      label: "Địa điểm",
      render: (job) => formatJobLocation(job.location, job.other_locations),
    },
    {
      label: "Loại",
      render: (job) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
          {getJobTypeLabel(job.job_type)}
        </span>
      ),
    },
    {
      label: "Lương",
      render: (job) => formatSalary(job.salary_min, job.salary_max),
    },
    {
      label: "Trạng thái",
      render: (job) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            job.status === "approved"
              ? "bg-green-100 text-green-800"
              : job.status === "pending"
              ? "bg-orange-100 text-orange-800"
              : job.status === "rejected"
              ? "bg-red-100 text-red-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {getJobStatusLabel(job.status || "pending")}
        </span>
      ),
    },
    {
      label: "Hành động",
      render: (job) => (
        <div className="flex gap-2">
          <ActionButtons type="edit" onClick={() => handleEdit(job)} />
          <ActionButtons type="delete" onClick={() => handleDelete(job)} />
        </div>
      ),
    },
  ] as Column<Job>[];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Quản lý tin tuyển dụng
        </h1>
        <AddButton
          onClick={() => {
            setSelectedJob(null);
            setIsJobDialogOpen(true);
          }}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4">
          <Table columns={columns} data={jobs} loading={loading} />
        </div>
      </div>

      {/* Pagination */}
      <Pagination
        amountOfRecord={total}
        currentPage={filters.page || 1}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {/* Add/Edit Job Dialog */}
      <JobDialog
        open={isJobDialogOpen}
        onOpenChange={setIsJobDialogOpen}
        job={selectedJob}
        onSuccess={(data) =>
          selectedJob ? handleUpdateJob(data) : handleAddJob(data)
        }
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteJob}
        title="Xác nhận xóa tin tuyển dụng"
        description={`Bạn có chắc chắn muốn xóa tin tuyển dụng "${selectedJob?.title}"?`}
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
