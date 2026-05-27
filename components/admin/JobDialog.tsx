"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Job, JobType, JobStatusType } from "@/types/job";
import { companyAPI } from "@/services/company";
import {
  JOB_TYPE_OPTIONS,
  JOB_STATUS_OPTIONS,
  WORK_ARRANGEMENT_OPTIONS,
  VIETNAM_CITIES,
} from "@/constants/job";
import { logger } from "@/lib/logger";
import { cn } from "@/lib/utils";

interface Company {
  id: string;
  name: string;
}

interface JobDialogData {
  title: string;
  company_id: string;
  location?: string;
  work_arrangement?: "remote" | "hybrid" | "onsite";
  job_type: JobType;
  salary_display?: string;
  salary_min?: number;
  salary_max?: number;
  requirements?: string;
  description?: string;
  benefits?: string;
  status?: JobStatusType;
}

interface JobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job?: Job | null;
  onSuccess: (data: JobDialogData) => void;
}

export const JobDialog = ({
  open,
  onOpenChange,
  job,
  onSuccess,
}: JobDialogProps) => {
  const [title, setTitle] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [location, setLocation] = useState("");
  const [workArrangement, setWorkArrangement] = useState<
    "remote" | "hybrid" | "onsite" | ""
  >("");
  const [jobType, setJobType] = useState<JobType>("full-time");
  const [salaryDisplay, setSalaryDisplay] = useState("");
  const [salaryMin, setSalaryMin] = useState<number | undefined>();
  const [salaryMax, setSalaryMax] = useState<number | undefined>();
  const [requirements, setRequirements] = useState("");
  const [description, setDescription] = useState("");
  const [benefits, setBenefits] = useState("");
  const [status, setStatus] = useState<JobStatusType>("pending");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    title?: string;
    company_id?: string;
  }>({});

  // Load companies for dropdown
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const response = await companyAPI.getCompaniesDropdown();
        if (response.status === "success") {
          setCompanies(response.data);
        }
      } catch (error) {
        logger.error("Failed to load companies", error);
      }
    };

    if (open) {
      loadCompanies();
    }
  }, [open]);

  // Populate form when editing
  useEffect(() => {
    if (!open) return;

    const populateForm = () => {
      if (job) {
        setTitle(job.title);
        setCompanyId(job.company.id);
        setLocation(job.location || "");
        setWorkArrangement(job.work_arrangement || "");
        setJobType(job.job_type);
        setSalaryDisplay(job.salary_display || job.salary || "");
        setSalaryMin(job.salary_min || undefined);
        setSalaryMax(job.salary_max || undefined);
        setRequirements(
          Array.isArray(job.requirements)
            ? job.requirements.join("\n")
            : job.requirements || "",
        );
        setDescription(job.description || "");
        setBenefits(Array.isArray(job.benefits) ? job.benefits.join("\n") : "");
        setStatus(job.status || "pending");
      } else {
        // Reset form for new job
        setTitle("");
        setCompanyId("");
        setLocation("");
        setWorkArrangement("");
        setJobType("full-time");
        setSalaryDisplay("");
        setSalaryMin(undefined);
        setSalaryMax(undefined);
        setRequirements("");
        setDescription("");
        setBenefits("");
        setStatus("pending");
      }
      setErrors({});
    };

    // Use setTimeout to avoid cascading renders
    const timeoutId = setTimeout(populateForm, 0);
    return () => clearTimeout(timeoutId);
  }, [job, open]);

  const validateForm = () => {
    const newErrors: { title?: string; company_id?: string } = {};

    if (!title.trim()) {
      newErrors.title = "Tiêu đề công việc là bắt buộc";
    }

    if (!companyId) {
      newErrors.company_id = "Vui lòng chọn công ty";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const data: JobDialogData = {
      title,
      company_id: companyId,
      location: location || undefined,
      work_arrangement: workArrangement || undefined,
      job_type: jobType,
      salary_display: salaryDisplay || undefined,
      salary_min: salaryMin,
      salary_max: salaryMax,
      requirements: requirements || undefined,
      description: description || undefined,
      benefits: benefits || undefined,
      status: status || undefined,
    };

    onSuccess(data);
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {job ? "Chỉnh sửa tin tuyển dụng" : "Thêm tin tuyển dụng mới"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-12 gap-8">
            {/* Left Column: Core Content */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-base font-semibold">
                    Tiêu đề công việc *
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="VD: Senior Frontend Developer (ReactJS)"
                    className={cn(
                      "mt-1.5 h-11 text-lg font-medium",
                      errors.title && "border-red-500 ring-red-500/20",
                    )}
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <Label htmlFor="description" className="font-semibold">
                    Mô tả công việc
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Mô tả chi tiết về công việc..."
                    rows={6}
                    className="mt-1.5"
                  />
                </div>

                <div className="pt-2">
                  <Label htmlFor="requirements" className="font-semibold">
                    Yêu cầu ứng viên
                  </Label>
                  <Textarea
                    id="requirements"
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    placeholder="Các yêu cầu về kinh nghiệm, kỹ năng..."
                    rows={6}
                    className="mt-1.5"
                  />
                </div>

                <div className="pt-2">
                  <Label htmlFor="benefits" className="font-semibold">
                    Quyền lợi & Chế độ
                  </Label>
                  <Textarea
                    id="benefits"
                    value={benefits}
                    onChange={(e) => setBenefits(e.target.value)}
                    placeholder="Các quyền lợi và phúc lợi..."
                    rows={4}
                    className="mt-1.5"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Metadata & Settings */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 space-y-5">
                <h3 className="font-bold text-gray-900 border-b pb-2">
                  Thông tin chung
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="company" className="font-medium">
                    Công ty *
                  </Label>
                  <Select value={companyId} onValueChange={setCompanyId}>
                    <SelectTrigger
                      className={errors.company_id ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Chọn công ty" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.company_id && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.company_id}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="job_type" className="font-medium text-xs">
                      Loại công việc
                    </Label>
                    <Select
                      value={jobType}
                      onValueChange={(value) => setJobType(value as JobType)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {JOB_TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status" className="font-medium text-xs">
                      Trạng thái
                    </Label>
                    <Select
                      value={status}
                      onValueChange={(value) =>
                        setStatus(value as JobStatusType)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {JOB_STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="work_arrangement" className="font-medium">
                    Hình thức làm việc
                  </Label>
                  <Select
                    value={workArrangement}
                    onValueChange={(value) =>
                      setWorkArrangement(
                        value as "remote" | "hybrid" | "onsite" | "",
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn hình thức" />
                    </SelectTrigger>
                    <SelectContent>
                      {WORK_ARRANGEMENT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="font-medium">
                    Địa điểm
                  </Label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn địa điểm" />
                    </SelectTrigger>
                    <SelectContent>
                      {VIETNAM_CITIES.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Salary Section */}
              <div className="bg-blue-50/30 p-6 rounded-xl border border-blue-100/50 space-y-4">
                <h3 className="font-bold text-green-900 flex items-center">
                  Thông tin lương
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="salary" className="text-xs">
                    Mức lương hiển thị
                  </Label>
                  <Input
                    id="salary"
                    value={salaryDisplay}
                    onChange={(e) => setSalaryDisplay(e.target.value)}
                    placeholder="VD: 15-25 triệu VND"
                    className="bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label
                      htmlFor="salary_min"
                      className="text-[10px] uppercase tracking-wider text-gray-500"
                    >
                      Lương Min (Tr.)
                    </Label>
                    <Input
                      id="salary_min"
                      type="number"
                      value={salaryMin || ""}
                      onChange={(e) =>
                        setSalaryMin(
                          e.target.value ? parseInt(e.target.value) : undefined,
                        )
                      }
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="salary_max"
                      className="text-[10px] uppercase tracking-wider text-gray-500"
                    >
                      Lương Max (Tr.)
                    </Label>
                    <Input
                      id="salary_max"
                      type="number"
                      value={salaryMax || ""}
                      onChange={(e) =>
                        setSalaryMax(
                          e.target.value ? parseInt(e.target.value) : undefined,
                        )
                      }
                      className="bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 pb-6 border-t sticky bottom-[-25px] bg-white z-10">
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              value="Hủy bỏ"
              backgroundColor="#f3f4f6"
              color="#374151"
              border="1px solid #d1d5db"
            />
            <Button
              type="submit"
              disable={loading}
              value={
                loading
                  ? "Đang xử lý..."
                  : job
                    ? "Lưu thay đổi"
                    : "Đăng tin ngay"
              }
              backgroundColor="green"
            />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
