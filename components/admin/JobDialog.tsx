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
  salary?: string;
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
  const [salary, setSalary] = useState("");
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
        console.error("Failed to load companies:", error);
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
        setSalary(job.salary || "");
        setSalaryMin(job.salary_min || undefined);
        setSalaryMax(job.salary_max || undefined);
        setRequirements(
          Array.isArray(job.requirements)
            ? job.requirements.join("\n")
            : job.requirements || ""
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
        setSalary("");
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
      salary: salary || undefined,
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {job ? "Chỉnh sửa tin tuyển dụng" : "Thêm tin tuyển dụng mới"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Tiêu đề công việc *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tiêu đề công việc"
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <Label htmlFor="company">Công ty *</Label>
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
                <p className="text-red-500 text-sm mt-1">{errors.company_id}</p>
              )}
            </div>

            <div>
              <Label htmlFor="job_type">Loại công việc</Label>
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

            <div>
              <Label htmlFor="work_arrangement">Hình thức làm việc</Label>
              <Select
                value={workArrangement}
                onValueChange={(value) =>
                  setWorkArrangement(
                    value as "remote" | "hybrid" | "onsite" | ""
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

            <div>
              <Label htmlFor="location">Địa điểm</Label>
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

            <div>
              <Label htmlFor="status">Trạng thái</Label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as JobStatusType)}
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

          {/* Salary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="salary">Mức lương hiển thị</Label>
              <Input
                id="salary"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="VD: 15-25 triệu VND"
              />
            </div>
            <div>
              <Label htmlFor="salary_min">Lương tối thiểu (triệu VND)</Label>
              <Input
                id="salary_min"
                type="number"
                value={salaryMin || ""}
                onChange={(e) =>
                  setSalaryMin(
                    e.target.value ? parseInt(e.target.value) : undefined
                  )
                }
                placeholder="15"
              />
            </div>
            <div>
              <Label htmlFor="salary_max">Lương tối đa (triệu VND)</Label>
              <Input
                id="salary_max"
                type="number"
                value={salaryMax || ""}
                onChange={(e) =>
                  setSalaryMax(
                    e.target.value ? parseInt(e.target.value) : undefined
                  )
                }
                placeholder="25"
              />
            </div>
          </div>

          {/* Text Areas */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="description">Mô tả công việc</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả chi tiết về công việc..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="requirements">Yêu cầu ứng viên</Label>
              <Textarea
                id="requirements"
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="Các yêu cầu về kinh nghiệm, kỹ năng..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="benefits">Quyền lợi</Label>
              <Textarea
                id="benefits"
                value={benefits}
                onChange={(e) => setBenefits(e.target.value)}
                placeholder="Các quyền lợi và phúc lợi..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              value="Hủy"
            />
            <Button
              type="submit"
              disable={loading}
              value={loading ? "Đang lưu..." : job ? "Cập nhật" : "Tạo mới"}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
