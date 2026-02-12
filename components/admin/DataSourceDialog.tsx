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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Database } from "lucide-react";

interface DataSourceDialogData {
  name?: string;
  description?: string;
  base_url?: string;
  isActive?: boolean;
  // Essential crawl config fields
  crawl_frequency?: string;
  crawl_enabled?: boolean;
  max_pages?: number;
  // Selector configuration
  custom_selectors?: string;
}

interface DataSourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: DataSourceDialogData;
  mode?: "add" | "edit";
  onSubmit?: (data: DataSourceDialogData) => void;
}

export function DataSourceDialog({
  open,
  onOpenChange,
  initialData,
  mode = "add",
  onSubmit,
}: DataSourceDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Essential crawl settings
  const [crawlFrequency, setCrawlFrequency] = useState("daily");
  const [crawlEnabled, setCrawlEnabled] = useState(true);
  const [maxPages, setMaxPages] = useState(100);

  // Selector configuration
  // Individual selector fields
  const [titleSelector, setTitleSelector] = useState("");
  const [companySelector, setCompanySelector] = useState("");
  const [locationSelector, setLocationSelector] = useState("");
  const [salarySelector, setSalarySelector] = useState("");
  const [descriptionSelector, setDescriptionSelector] = useState("");
  const [requirementsSelector, setRequirementsSelector] = useState("");
  const [benefitsSelector, setBenefitsSelector] = useState("");
  const [postedDateSelector, setPostedDateSelector] = useState("");
  const [jobTypeSelector, setJobTypeSelector] = useState("");
  const [experienceSelector, setExperienceSelector] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    base_url?: string;
  }>({});

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setName(initialData?.name ?? "");
      setDescription(initialData?.description ?? "");
      setBaseUrl(initialData?.base_url ?? "");
      setIsActive(initialData?.isActive ?? true);
      setCrawlFrequency(initialData?.crawl_frequency ?? "daily");
      setCrawlEnabled(initialData?.crawl_enabled ?? true);

      // Essential settings
      setMaxPages(initialData?.max_pages ?? 100);

      // Parse and set individual selectors from JSON
      const selectors = initialData?.custom_selectors ? JSON.parse(initialData.custom_selectors) : {};
      setTitleSelector(selectors.title || "");
      setCompanySelector(selectors.company || "");
      setLocationSelector(selectors.location || "");
      setSalarySelector(selectors.salary || "");
      setDescriptionSelector(selectors.description || "");
      setRequirementsSelector(selectors.requirements || "");
      setBenefitsSelector(selectors.benefits || "");
      setPostedDateSelector(selectors.posted_date || "");
      setJobTypeSelector(selectors.job_type || "");
      setExperienceSelector(selectors.experience || "");

      setErrors({});
    }
  }, [open, initialData]);

  const validateForm = (): boolean => {
    const newErrors: {
      name?: string;
      base_url?: string;
    } = {};

    if (!name.trim()) {
      newErrors.name = "Tên nguồn dữ liệu không được để trống";
    } else if (name.trim().length < 3) {
      newErrors.name = "Tên nguồn dữ liệu phải có ít nhất 3 ký tự";
    }

    if (baseUrl.trim()) {
      try {
        new URL(baseUrl.trim());
      } catch {
        newErrors.base_url = "URL không hợp lệ";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API call

      // Build selectors JSON from individual fields
      const selectors = {
        title: titleSelector.trim(),
        company: companySelector.trim(),
        location: locationSelector.trim(),
        salary: salarySelector.trim(),
        description: descriptionSelector.trim(),
        requirements: requirementsSelector.trim(),
        benefits: benefitsSelector.trim(),
        posted_date: postedDateSelector.trim(),
        job_type: jobTypeSelector.trim(),
        experience: experienceSelector.trim(),
      };

      // Filter out empty selectors
      const filteredSelectors = Object.fromEntries(
        Object.entries(selectors).filter(([, value]) => value !== "")
      );

      const selectorsJson = Object.keys(filteredSelectors).length > 0 
        ? JSON.stringify(filteredSelectors, null, 2)
        : "";

      onSubmit?.({
        name: name.trim(),
        description: description.trim() || undefined,
        base_url: baseUrl.trim() || undefined,
        isActive,
        crawl_frequency: crawlFrequency,
        crawl_enabled: crawlEnabled,
        max_pages: maxPages,
        custom_selectors: selectorsJson || undefined,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl bg-white border-2 border-green-200 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-green-900 flex items-center gap-2">
            <Database className="w-5 h-5" />
            {mode === "add" ? "Thêm nguồn dữ liệu" : "Chỉnh sửa nguồn dữ liệu"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-4">
          {/* Left Column - Data Source Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-green-900 border-b pb-2">
              Thông tin nguồn dữ liệu
            </h3>

            {/* Tên nguồn dữ liệu */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-green-900">
                Tên nguồn dữ liệu *
              </Label>
              <Input
                id="name"
                className={`border-green-200 focus:border-green-500 focus:ring-green-500 text-green-900 placeholder:text-gray-300 ${
                  errors.name
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : ""
                }`}
                placeholder="Ví dụ: JobStreet API"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) {
                    setErrors({ ...errors, name: undefined });
                  }
                }}
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name}</p>
              )}
            </div>

            {/* URL */}
            <div className="space-y-2">
              <Label htmlFor="base_url" className="text-green-900">
                URL API
              </Label>
              <Input
                id="base_url"
                type="url"
                className={`border-green-200 focus:border-green-500 focus:ring-green-500 text-green-900 placeholder:text-gray-300 ${
                  errors.base_url
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : ""
                }`}
                placeholder="https://www.vietnamworks.com/"
                value={baseUrl}
                onChange={(e) => {
                  setBaseUrl(e.target.value);
                  if (errors.base_url) {
                    setErrors({ ...errors, base_url: undefined });
                  }
                }}
              />
              {errors.base_url && (
                <p className="text-red-500 text-sm">{errors.base_url}</p>
              )}
            </div>

            {/* Trạng thái nguồn dữ liệu */}
            <div className="space-y-2">
              <Label className="text-green-900">Trạng thái nguồn dữ liệu</Label>
              <Select
                value={isActive ? "active" : "inactive"}
                onValueChange={(value) => setIsActive(value === "active")}
              >
                <SelectTrigger className="border-green-200 focus:border-green-500 focus:ring-green-500 text-green-900">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">🟢 Hoạt động</SelectItem>
                  <SelectItem value="inactive">🔴 Tạm dừng</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Right Column - Crawl Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-green-900 border-b pb-2">
              Cấu hình Crawl
            </h3>

            {/* Tần suất crawl */}
            <div className="space-y-2">
              <Label className="text-green-900">Tần suất crawl</Label>
              <Select value={crawlFrequency} onValueChange={setCrawlFrequency}>
                <SelectTrigger className="border-green-200 focus:border-green-500 focus:ring-green-500 text-green-900">
                  <SelectValue placeholder="Chọn tần suất crawl" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">⏰ Hàng giờ</SelectItem>
                  <SelectItem value="daily">📅 Hàng ngày</SelectItem>
                  <SelectItem value="weekly">📆 Hàng tuần</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Trạng thái crawl */}
            <div className="space-y-2">
              <Label className="text-green-900">Trạng thái crawl</Label>
              <div className="flex items-center gap-3">
                <Switch
                  checked={crawlEnabled}
                  onCheckedChange={setCrawlEnabled}
                  className="data-[state=checked]:bg-green-500"
                />
                <span
                  className={`text-sm font-medium ${crawlEnabled ? "text-green-600" : "text-gray-400"}`}
                >
                  {crawlEnabled ? "Đang chạy" : "Đã tắt"}
                </span>
              </div>
            </div>

            {/* Max Pages */}
            <div className="space-y-2">
              <Label htmlFor="max_pages" className="text-green-900">
                Số trang tối đa
              </Label>
              <Input
                id="max_pages"
                type="number"
                min="1"
                max="10000"
                className="border-green-200 focus:border-green-500 focus:ring-green-500 text-green-900"
                value={maxPages}
                onChange={(e) => setMaxPages(parseInt(e.target.value) || 100)}
              />
            </div>

            {/* CSS Selectors */}
            <div className="space-y-4">
              <Label className="text-green-900 font-semibold text-lg">
                🔧 CSS Selectors tùy chỉnh
              </Label>
              
              <div className="grid grid-cols-1 gap-4">
                {/* Title Selector */}
                <div className="space-y-2">
                  <Label htmlFor="title_selector" className="text-green-900 font-medium">
                    📝 Tiêu đề công việc
                  </Label>
                  <Input
                    id="title_selector"
                    className="border-green-200 focus:border-green-500 focus:ring-green-500 text-green-900 placeholder:text-gray-300 font-mono text-sm"
                    placeholder=".job-title, h1.title, .position-name"
                    value={titleSelector}
                    onChange={(e) => setTitleSelector(e.target.value)}
                  />
                </div>

                {/* Company Selector */}
                <div className="space-y-2">
                  <Label htmlFor="company_selector" className="text-green-900 font-medium">
                    🏢 Tên công ty
                  </Label>
                  <Input
                    id="company_selector"
                    className="border-green-200 focus:border-green-500 focus:ring-green-500 text-green-900 placeholder:text-gray-300 font-mono text-sm"
                    placeholder=".company-name, .employer, .company-info h2"
                    value={companySelector}
                    onChange={(e) => setCompanySelector(e.target.value)}
                  />
                </div>

                {/* Location Selector */}
                <div className="space-y-2">
                  <Label htmlFor="location_selector" className="text-green-900 font-medium">
                    📍 Địa điểm
                  </Label>
                  <Input
                    id="location_selector"
                    className="border-green-200 focus:border-green-500 focus:ring-green-500 text-green-900 placeholder:text-gray-300 font-mono text-sm"
                    placeholder=".job-location, .location, .address"
                    value={locationSelector}
                    onChange={(e) => setLocationSelector(e.target.value)}
                  />
                </div>

                {/* Salary Selector */}
                <div className="space-y-2">
                  <Label htmlFor="salary_selector" className="text-green-900 font-medium">
                    💰 Mức lương
                  </Label>
                  <Input
                    id="salary_selector"
                    className="border-green-200 focus:border-green-500 focus:ring-green-500 text-green-900 placeholder:text-gray-300 font-mono text-sm"
                    placeholder=".salary, .wage, .compensation"
                    value={salarySelector}
                    onChange={(e) => setSalarySelector(e.target.value)}
                  />
                </div>

                {/* Description Selector */}
                <div className="space-y-2">
                  <Label htmlFor="description_selector" className="text-green-900 font-medium">
                    📄 Mô tả công việc
                  </Label>
                  <Input
                    id="description_selector"
                    className="border-green-200 focus:border-green-500 focus:ring-green-500 text-green-900 placeholder:text-gray-300 font-mono text-sm"
                    placeholder=".job-description, .job-content, .description"
                    value={descriptionSelector}
                    onChange={(e) => setDescriptionSelector(e.target.value)}
                  />
                </div>

                {/* Requirements Selector */}
                <div className="space-y-2">
                  <Label htmlFor="requirements_selector" className="text-green-900 font-medium">
                    ✅ Yêu cầu
                  </Label>
                  <Input
                    id="requirements_selector"
                    className="border-green-200 focus:border-green-500 focus:ring-green-500 text-green-900 placeholder:text-gray-300 font-mono text-sm"
                    placeholder=".requirements, .qualifications"
                    value={requirementsSelector}
                    onChange={(e) => setRequirementsSelector(e.target.value)}
                  />
                </div>

                {/* Benefits Selector */}
                <div className="space-y-2">
                  <Label htmlFor="benefits_selector" className="text-green-900 font-medium">
                    🎁 Phúc lợi
                  </Label>
                  <Input
                    id="benefits_selector"
                    className="border-green-200 focus:border-green-500 focus:ring-green-500 text-green-900 placeholder:text-gray-300 font-mono text-sm"
                    placeholder=".benefits, .perks"
                    value={benefitsSelector}
                    onChange={(e) => setBenefitsSelector(e.target.value)}
                  />
                </div>

                {/* Posted Date Selector */}
                <div className="space-y-2">
                  <Label htmlFor="posted_date_selector" className="text-green-900 font-medium">
                    📅 Ngày đăng
                  </Label>
                  <Input
                    id="posted_date_selector"
                    className="border-green-200 focus:border-green-500 focus:ring-green-500 text-green-900 placeholder:text-gray-300 font-mono text-sm"
                    placeholder=".posted-date, .date, time"
                    value={postedDateSelector}
                    onChange={(e) => setPostedDateSelector(e.target.value)}
                  />
                </div>

                {/* Job Type Selector */}
                <div className="space-y-2">
                  <Label htmlFor="job_type_selector" className="text-green-900 font-medium">
                    🏷️ Loại công việc
                  </Label>
                  <Input
                    id="job_type_selector"
                    className="border-green-200 focus:border-green-500 focus:ring-green-500 text-green-900 placeholder:text-gray-300 font-mono text-sm"
                    placeholder=".job-type, .employment-type"
                    value={jobTypeSelector}
                    onChange={(e) => setJobTypeSelector(e.target.value)}
                  />
                </div>

                {/* Experience Selector */}
                <div className="space-y-2">
                  <Label htmlFor="experience_selector" className="text-green-900 font-medium">
                    📈 Kinh nghiệm
                  </Label>
                  <Input
                    id="experience_selector"
                    className="border-green-200 focus:border-green-500 focus:ring-green-500 text-green-900 placeholder:text-gray-300 font-mono text-sm"
                    placeholder=".experience-level, .exp-required"
                    value={experienceSelector}
                    onChange={(e) => setExperienceSelector(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            value={mode === "add" ? "Thêm nguồn dữ liệu" : "Lưu thay đổi"}
            onClick={handleSubmit}
            disable={isLoading}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
