"use client";

import { useState, useEffect } from "react";
import { Column, Table } from "@/components/admin/Table";
import { Pagination } from "@/components/admin/Pagination";
import { DeleteConfirmationDialog } from "@/components/admin/DeleteConfirmationDialog";
import { NotificationDialog } from "@/components/admin/NotificationDialog";
import { ActionButtons } from "@/components/admin/ActionButtons";
import { jobMongoAPI, JobMongo } from "@/services/jobMongo";
import { DialogState } from "@/types/dialog";

export default function JobManagementPage() {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<JobMongo[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobMongo | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [dialogState, setDialogState] = useState<DialogState>({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  // Filters
  const [searchKeyword, setSearchKeyword] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadJobs();
  }, [page, searchKeyword, locationFilter, typeFilter]);

  const loadJobs = async () => {
    try {
      setLoading(true);

      const response = await jobMongoAPI.listJobs({
        query: searchKeyword || undefined,
        location: locationFilter || undefined,
        job_type: typeFilter || undefined,
        page,
        limit,
      });

      setJobs(response.data || []);
      setTotal(response.pagination.total || 0);
      setTotalPages(response.pagination.total_pages || 1);
    } catch (error) {
      console.error("Failed to load jobs:", error);
      setJobs([]);
      setDialogState({
        isOpen: true,
        title: "Lỗi tải dữ liệu",
        message: "Không thể tải danh sách công việc từ MongoDB!",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchKeyword(value);
    setPage(1);
  };

  const handleLocationChange = (value: string) => {
    setLocationFilter(value);
    setPage(1);
  };

  const handleTypeChange = (value: string) => {
    setTypeFilter(value);
    setPage(1);
  };

  const handleViewDetail = (job: JobMongo) => {
    setSelectedJob(job);
    setIsDetailDialogOpen(true);
  };

  const handleDelete = (job: JobMongo) => {
    setSelectedJob(job);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteJob = async () => {
    if (!selectedJob) return;

    setDialogState({
      isOpen: true,
      title: "Chức năng chưa hỗ trợ",
      message:
        "Xóa job từ MongoDB chưa được hỗ trợ. Đây là dữ liệu crawl từ nguồn bên ngoài.",
      type: "error",
    });
    setIsDeleteDialogOpen(false);
  };

  const formatSalary = (job: JobMongo) => {
    if (job.salaryDisplay) return job.salaryDisplay;
    if (job.salaryMin && job.salaryMax) {
      return `${(job.salaryMin / 1000000).toFixed(0)}-${(
        job.salaryMax / 1000000
      ).toFixed(0)} triệu`;
    }
    if (job.salaryMin)
      return `Từ ${(job.salaryMin / 1000000).toFixed(0)} triệu`;
    if (job.salaryMax)
      return `Đến ${(job.salaryMax / 1000000).toFixed(0)} triệu`;
    return "Thỏa thuận";
  };

  const formatJobType = (type?: string) => {
    const typeMap: Record<string, string> = {
      full_time: "Full-time",
      part_time: "Part-time",
      contract: "Hợp đồng",
      internship: "Thực tập",
      freelance: "Freelance",
    };
    return type ? typeMap[type] || type : "N/A";
  };

  const formatExperienceLevel = (level?: string) => {
    const levelMap: Record<string, string> = {
      entry: "Mới vào nghề",
      junior: "Junior",
      middle: "Middle",
      senior: "Senior",
      lead: "Lead",
      executive: "Executive",
    };
    return level ? levelMap[level] || level : "N/A";
  };

  const columns: Column<JobMongo>[] = [
    {
      label: "#",
      render: (_, i) => (page - 1) * limit + i + 1,
    },
    {
      label: "Tiêu đề",
      render: (job) => (
        <div>
          <div className="font-medium">{job.title || "N/A"}</div>
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
        <div className="font-medium">{job.company_name || "N/A"}</div>
      ),
    },
    {
      label: "Địa điểm",
      render: (job) => job.location || "N/A",
    },
    {
      label: "Loại / Cấp độ",
      render: (job) => (
        <div className="text-sm">
          <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs inline-block mb-1">
            {formatJobType(job.jobType)}
          </div>
          <div className="text-gray-600 text-xs">
            {formatExperienceLevel(job.experienceLevel)}
          </div>
        </div>
      ),
    },
    {
      label: "Lương",
      render: (job) => <div className="text-sm">{formatSalary(job)}</div>,
    },
    {
      label: "Remote",
      render: (job) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            job.remoteAllowed
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {job.remoteAllowed ? "Có" : "Không"}
        </span>
      ),
    },
    {
      label: "Nổi bật",
      render: (job) =>
        job.featured ? (
          <span className="text-yellow-500">⭐</span>
        ) : (
          <span className="text-gray-300">☆</span>
        ),
    },
    {
      label: "Hành động",
      render: (job) => (
        <div className="flex gap-2">
          <ActionButtons type="view" onClick={() => handleViewDetail(job)} />
          <ActionButtons type="delete" onClick={() => handleDelete(job)} />
        </div>
      ),
    },
  ] as Column<JobMongo>[];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý tin tuyển dụng
          </h1>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm
            </label>
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Tìm theo tiêu đề, mô tả..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Địa điểm
            </label>
            <input
              type="text"
              value={locationFilter}
              onChange={(e) => handleLocationChange(e.target.value)}
              placeholder="VD: Hà Nội, TP.HCM..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại công việc
            </label>
            <select
              value={typeFilter}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả</option>
              <option value="full_time">Full-time</option>
              <option value="part_time">Part-time</option>
              <option value="contract">Hợp đồng</option>
              <option value="internship">Thực tập</option>
              <option value="freelance">Freelance</option>
            </select>
          </div>
        </div>
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
        currentPage={page}
        totalPages={totalPages}
        onPageChange={(newPage) => setPage(newPage)}
      />

      {/* Job Detail Dialog */}
      {isDetailDialogOpen && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{selectedJob.title}</h2>
                <button
                  onClick={() => setIsDetailDialogOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Công ty</p>
                    <p className="font-medium">{selectedJob.company_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Địa điểm</p>
                    <p className="font-medium">{selectedJob.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Loại công việc</p>
                    <p className="font-medium">
                      {formatJobType(selectedJob.jobType)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Cấp độ</p>
                    <p className="font-medium">
                      {formatExperienceLevel(selectedJob.experienceLevel)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Lương</p>
                    <p className="font-medium">{formatSalary(selectedJob)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Remote</p>
                    <p className="font-medium">
                      {selectedJob.remoteAllowed ? "Có" : "Không"}
                    </p>
                  </div>
                </div>

                {selectedJob.description && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">
                      Mô tả công việc
                    </p>
                    <div className="text-sm whitespace-pre-wrap bg-gray-50 p-4 rounded">
                      {selectedJob.description}
                    </div>
                  </div>
                )}

                {selectedJob.requirements &&
                  selectedJob.requirements.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Yêu cầu</p>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {selectedJob.requirements.map((req, idx) => (
                          <li key={idx}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                {selectedJob.skills && selectedJob.skills.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Kỹ năng</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedJob.benefits && selectedJob.benefits.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Quyền lợi</p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {selectedJob.benefits.map((benefit, idx) => (
                        <li key={idx}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setIsDetailDialogOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
