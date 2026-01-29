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
  max_depth?: number;
  user_agent?: string;
  headers?: string;
  respect_robots_txt?: boolean;
  // Selector configuration
  include_patterns?: string;
  exclude_patterns?: string;
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
  const [maxDepth, setMaxDepth] = useState(3);
  const [userAgent, setUserAgent] = useState(
    "Mozilla/5.0 (compatible; CareerBot/1.0)",
  );
  const [headers, setHeaders] = useState("");
  const [respectRobotsTxt, setRespectRobotsTxt] = useState(true);

  // Selector configuration
  const [includePatterns, setIncludePatterns] = useState("");
  const [excludePatterns, setExcludePatterns] = useState("");
  const [customSelectors, setCustomSelectors] = useState("");

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
      setMaxDepth(initialData?.max_depth ?? 3);
      setUserAgent(
        initialData?.user_agent ?? "Mozilla/5.0 (compatible; CareerBot/1.0)",
      );
      setHeaders(initialData?.headers ?? "");
      setRespectRobotsTxt(initialData?.respect_robots_txt ?? true);

      // Selector configuration
      setIncludePatterns(initialData?.include_patterns ?? "");
      setExcludePatterns(initialData?.exclude_patterns ?? "");
      setCustomSelectors(initialData?.custom_selectors ?? "");

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

      onSubmit?.({
        name: name.trim(),
        description: description.trim() || undefined,
        base_url: baseUrl.trim() || undefined,
        isActive,
        crawl_frequency: crawlFrequency,
        crawl_enabled: crawlEnabled,
        max_pages: maxPages,
        max_depth: maxDepth,
        user_agent: userAgent.trim() || undefined,
        headers: headers.trim() || undefined,
        respect_robots_txt: respectRobotsTxt,
        include_patterns: includePatterns.trim() || undefined,
        exclude_patterns: excludePatterns.trim() || undefined,
        custom_selectors: customSelectors.trim() || undefined,
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
          {/* Left Column - Data Source Info & Basic Crawl Config */}
          <div className="space-y-6">
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
                  placeholder="https://api.example.com/jobs"
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

              {/* Mô tả */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-green-900">
                  Mô tả
                </Label>
                <Textarea
                  id="description"
                  className="border-green-200 focus:border-green-500 focus:ring-green-500 text-green-900 placeholder:text-gray-300 min-h-[80px]"
                  placeholder="Mô tả về nguồn dữ liệu này..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Trạng thái nguồn dữ liệu */}
              <div className="space-y-2">
                <Label className="text-green-900">
                  Trạng thái nguồn dữ liệu
                </Label>
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

            {/* Basic Crawl Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-green-900 border-b pb-2">
                Cấu hình crawl cơ bản
              </h3>

              {/* Tần suất crawl */}
              <div className="space-y-2">
                <Label className="text-green-900">Tần suất crawl</Label>
                <Select
                  value={crawlFrequency}
                  onValueChange={setCrawlFrequency}
                >
                  <SelectTrigger className="border-green-200 focus:border-green-500 focus:ring-green-500 text-green-900">
                    <SelectValue placeholder="Chọn tần suất crawl" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">⏰ Mỗi giờ</SelectItem>
                    <SelectItem value="daily">📅 Hàng ngày</SelectItem>
                    <SelectItem value="weekly">📆 Hàng tuần</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Trạng thái crawl */}
              <div className="space-y-2">
                <Label className="text-green-900">Trạng thái crawl</Label>
                <Select
                  value={crawlEnabled ? "enabled" : "disabled"}
                  onValueChange={(value) =>
                    setCrawlEnabled(value === "enabled")
                  }
                >
                  <SelectTrigger className="border-green-200 focus:border-green-500 focus:ring-green-500 text-green-900">
                    <SelectValue placeholder="Chọn trạng thái crawl" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enabled">✅ Kích hoạt</SelectItem>
                    <SelectItem value="disabled">❌ Tắt</SelectItem>
                  </SelectContent>
                </Select>
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

              {/* Max Depth */}
              <div className="space-y-2">
                <Label htmlFor="max_depth" className="text-green-900">
                  Độ sâu tối đa
                </Label>
                <Input
                  id="max_depth"
                  type="number"
                  min="1"
                  max="10"
                  className="border-green-200 focus:border-green-500 focus:ring-green-500 text-green-900"
                  value={maxDepth}
                  onChange={(e) => setMaxDepth(parseInt(e.target.value) || 3)}
                />
              </div>

              {/* User Agent */}
              <div className="space-y-2">
                <Label htmlFor="user_agent" className="text-green-900">
                  User Agent
                </Label>
                <Input
                  id="user_agent"
                  className="border-green-200 focus:border-green-500 focus:ring-green-500 text-green-900"
                  placeholder="Mozilla/5.0 (compatible; CareerBot/1.0)"
                  value={userAgent}
                  onChange={(e) => setUserAgent(e.target.value)}
                />
              </div>

              {/* Headers */}
              <div className="space-y-2">
                <Label htmlFor="headers" className="text-green-900">
                  Headers (JSON)
                </Label>
                <Textarea
                  id="headers"
                  className="border-green-200 focus:border-green-500 focus:ring-green-500 text-green-900 placeholder:text-gray-300 min-h-[60px]"
                  placeholder='{"Authorization": "Bearer token", "Accept": "application/json"}'
                  value={headers}
                  onChange={(e) => setHeaders(e.target.value)}
                />
              </div>

              {/* Respect robots.txt */}
              <div className="space-y-2">
                <Label className="text-green-900">Tuân thủ robots.txt</Label>
                <Select
                  value={respectRobotsTxt ? "enabled" : "disabled"}
                  onValueChange={(value) =>
                    setRespectRobotsTxt(value === "enabled")
                  }
                >
                  <SelectTrigger className="border-green-200 focus:border-green-500 focus:ring-green-500 text-green-900">
                    <SelectValue placeholder="Chọn cấu hình robots.txt" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enabled">✅ Có</SelectItem>
                    <SelectItem value="disabled">❌ Không</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Right Column - Selector Configuration */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-green-900 border-b pb-2 flex items-center gap-2">
                🎯 Cấu hình Selector
              </h3>

              {/* Custom Selectors - MOST IMPORTANT */}
              <div className="space-y-2">
                <Label
                  htmlFor="custom_selectors"
                  className="text-green-900 font-semibold"
                >
                  🔧 CSS Selectors tùy chỉnh (JSON) *
                </Label>
                <Textarea
                  id="custom_selectors"
                  className="border-green-200 focus:border-green-500 focus:ring-green-500 text-green-900 placeholder:text-gray-300 min-h-[120px] font-mono text-sm"
                  placeholder={`{
  "title": ".job-title, h1.title, .position-name",
  "company": ".company-name, .employer, .company-info h2",
  "location": ".job-location, .location, .address",
  "salary": ".salary, .wage, .compensation",
  "description": ".job-description, .job-content, .description",
  "requirements": ".requirements, .qualifications",
  "benefits": ".benefits, .perks",
  "posted_date": ".posted-date, .date, time",
  "job_type": ".job-type, .employment-type",
  "experience": ".experience-level, .exp-required"
}`}
                  value={customSelectors}
                  onChange={(e) => setCustomSelectors(e.target.value)}
                />
                <p className="text-xs text-gray-600">
                  Định nghĩa CSS selectors để extract các trường dữ liệu từ job
                  listings
                </p>
              </div>

              {/* Include Patterns */}
              <div className="space-y-2">
                <Label
                  htmlFor="include_patterns"
                  className="text-green-900 font-semibold"
                >
                  ✅ URL patterns để crawl
                </Label>
                <Textarea
                  id="include_patterns"
                  className="border-green-200 focus:border-green-500 focus:ring-green-500 text-green-900 placeholder:text-gray-300 min-h-[80px] font-mono text-sm"
                  placeholder={`/jobs/*
/careers/*
/job-detail/*
/positions/*
*.html`}
                  value={includePatterns}
                  onChange={(e) => setIncludePatterns(e.target.value)}
                />
                <p className="text-xs text-gray-600">
                  Chỉ crawl các URL khớp với patterns này (mỗi pattern một dòng)
                </p>
              </div>

              {/* Exclude Patterns */}
              <div className="space-y-2">
                <Label
                  htmlFor="exclude_patterns"
                  className="text-green-900 font-semibold"
                >
                  ❌ URL patterns để bỏ qua
                </Label>
                <Textarea
                  id="exclude_patterns"
                  className="border-green-200 focus:border-green-500 focus:ring-green-500 text-green-900 placeholder:text-gray-300 min-h-[80px] font-mono text-sm"
                  placeholder={`/admin/*
/login/*
/register/*
/api/*
*.pdf
*.doc
*.zip
/search?*`}
                  value={excludePatterns}
                  onChange={(e) => setExcludePatterns(e.target.value)}
                />
                <p className="text-xs text-gray-600">
                  Bỏ qua các URL khớp với patterns này (mỗi pattern một dòng)
                </p>
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
