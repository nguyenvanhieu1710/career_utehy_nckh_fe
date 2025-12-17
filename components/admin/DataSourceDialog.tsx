import { useState, useEffect, useMemo } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  Clock,
  Database,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Trash2,
} from "lucide-react";
import { format, subDays, subMonths, subYears } from "date-fns";

interface CrawlHistoryItem {
  id: string;
  date: string;
  status: "success" | "failed" | "in_progress";
  recordsCount: number;
  duration: string;
  source: string;
  errorMessage?: string;
}

interface DataSourceDialogData {
  name?: string;
  description?: string;
  url?: string;
  timePeriod?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
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
  const [url, setUrl] = useState("");
  const [timePeriod, setTimePeriod] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [crawlHistory, setCrawlHistory] = useState<CrawlHistoryItem[]>([]);
  const [errors, setErrors] = useState<{
    name?: string;
    url?: string;
    timePeriod?: string;
    dateRange?: string;
  }>({});

  // Mock crawl history data - memoized to prevent re-creation on every render
  const mockCrawlHistory = useMemo<CrawlHistoryItem[]>(
    () => [
      {
        id: "1",
        date: "2024-12-16 10:30:00",
        status: "success",
        recordsCount: 1250,
        duration: "2m 15s",
        source: "JobStreet API",
      },
      {
        id: "2",
        date: "2024-12-15 14:20:00",
        status: "success",
        recordsCount: 980,
        duration: "1m 45s",
        source: "VietnamWorks API",
      },
      {
        id: "3",
        date: "2024-12-15 09:15:00",
        status: "failed",
        recordsCount: 0,
        duration: "0m 30s",
        source: "TopCV API",
        errorMessage: "API rate limit exceeded",
      },
      {
        id: "4",
        date: "2024-12-14 16:45:00",
        status: "in_progress",
        recordsCount: 0,
        duration: "Running...",
        source: "CareerBuilder API",
      },
    ],
    []
  );

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setName(initialData?.name ?? "");
      setDescription(initialData?.description ?? "");
      setUrl(initialData?.url ?? "");
      setTimePeriod(initialData?.timePeriod ?? "");
      setStartDate(initialData?.startDate ?? "");
      setEndDate(initialData?.endDate ?? "");
      setIsActive(initialData?.isActive ?? true);
      setCrawlHistory(mockCrawlHistory);
      setErrors({});
    }
  }, [open, initialData, mockCrawlHistory]);

  // Handle time period change and auto-set dates
  const handleTimePeriodChange = (period: string) => {
    setTimePeriod(period);
    const today = new Date();
    let start = new Date();

    switch (period) {
      case "7_days":
        start = subDays(today, 7);
        break;
      case "30_days":
        start = subDays(today, 30);
        break;
      case "3_months":
        start = subMonths(today, 3);
        break;
      case "6_months":
        start = subMonths(today, 6);
        break;
      case "1_year":
        start = subYears(today, 1);
        break;
      case "custom":
        // Don't auto-set dates for custom period
        return;
      default:
        return;
    }

    setStartDate(format(start, "yyyy-MM-dd"));
    setEndDate(format(today, "yyyy-MM-dd"));
  };

  const validateForm = (): boolean => {
    const newErrors: {
      name?: string;
      url?: string;
      timePeriod?: string;
      dateRange?: string;
    } = {};

    if (!name.trim()) {
      newErrors.name = "Tên nguồn dữ liệu không được để trống";
    } else if (name.trim().length < 3) {
      newErrors.name = "Tên nguồn dữ liệu phải có ít nhất 3 ký tự";
    }

    if (!url.trim()) {
      newErrors.url = "URL không được để trống";
    } else {
      try {
        new URL(url.trim());
      } catch {
        newErrors.url = "URL không hợp lệ";
      }
    }

    if (!timePeriod) {
      newErrors.timePeriod = "Vui lòng chọn khoảng thời gian";
    }

    if (timePeriod === "custom") {
      if (!startDate || !endDate) {
        newErrors.dateRange = "Vui lòng chọn ngày bắt đầu và kết thúc";
      } else if (new Date(startDate) > new Date(endDate)) {
        newErrors.dateRange = "Ngày bắt đầu phải trước ngày kết thúc";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      onSubmit?.({
        name: name.trim(),
        description: description.trim() || undefined,
        url: url.trim(),
        timePeriod,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        isActive,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "in_progress":
        return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "success":
        return "Thành công";
      case "failed":
        return "Thất bại";
      case "in_progress":
        return "Đang xử lý";
      default:
        return "Không xác định";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600 bg-green-50";
      case "failed":
        return "text-red-600 bg-red-50";
      case "in_progress":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl bg-white border-2 border-green-200 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-green-900 flex items-center gap-2">
            <Database className="w-5 h-5" />
            {mode === "add" ? "Thêm nguồn dữ liệu" : "Chỉnh sửa nguồn dữ liệu"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-4">
          {/* Left Column - Form */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-green-900">
                Thông tin cơ bản
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
                <Label htmlFor="url" className="text-green-900">
                  URL API *
                </Label>
                <Input
                  id="url"
                  type="url"
                  className={`border-green-200 focus:border-green-500 focus:ring-green-500 text-green-900 placeholder:text-gray-300 ${
                    errors.url
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                  placeholder="https://api.example.com/jobs"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (errors.url) {
                      setErrors({ ...errors, url: undefined });
                    }
                  }}
                />
                {errors.url && (
                  <p className="text-red-500 text-sm">{errors.url}</p>
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
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-green-900">
                Cấu hình thu thập
              </h3>

              {/* Khoảng thời gian */}
              <div className="space-y-2">
                <Label className="text-green-900">
                  Khoảng thời gian thu thập *
                </Label>
                <Select
                  value={timePeriod}
                  onValueChange={(value) => {
                    handleTimePeriodChange(value);
                    if (errors.timePeriod) {
                      setErrors({ ...errors, timePeriod: undefined });
                    }
                  }}
                >
                  <SelectTrigger
                    className={`border-green-200 focus:border-green-500 focus:ring-green-500 text-green-900 ${
                      errors.timePeriod
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : ""
                    }`}
                  >
                    <SelectValue placeholder="Chọn khoảng thời gian" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7_days">7 ngày gần đây</SelectItem>
                    <SelectItem value="30_days">30 ngày gần đây</SelectItem>
                    <SelectItem value="3_months">3 tháng gần đây</SelectItem>
                    <SelectItem value="6_months">6 tháng gần đây</SelectItem>
                    <SelectItem value="1_year">1 năm gần đây</SelectItem>
                    <SelectItem value="custom">Tùy chỉnh</SelectItem>
                  </SelectContent>
                </Select>
                {errors.timePeriod && (
                  <p className="text-red-500 text-sm">{errors.timePeriod}</p>
                )}
              </div>

              {/* Custom date range */}
              {timePeriod === "custom" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-green-900">
                      Từ ngày
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      className={`border-green-200 focus:border-green-500 focus:ring-green-500 text-green-900 ${
                        errors.dateRange
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : ""
                      }`}
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        if (errors.dateRange) {
                          setErrors({ ...errors, dateRange: undefined });
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-green-900">
                      Đến ngày
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      className={`border-green-200 focus:border-green-500 focus:ring-green-500 text-green-900 ${
                        errors.dateRange
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : ""
                      }`}
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        if (errors.dateRange) {
                          setErrors({ ...errors, dateRange: undefined });
                        }
                      }}
                    />
                  </div>
                </div>
              )}

              {errors.dateRange && (
                <p className="text-red-500 text-sm">{errors.dateRange}</p>
              )}

              {/* Trạng thái hoạt động */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                />
                <Label htmlFor="isActive" className="text-green-900">
                  Kích hoạt thu thập tự động
                </Label>
              </div>
            </div>
          </div>

          {/* Right Column - Crawl History */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-green-900">
                Lịch sử thu thập
              </h3>
              <button
                type="button"
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Làm mới
              </button>
            </div>

            <div className="border border-green-200 rounded-lg bg-gray-50 max-h-96 overflow-y-auto">
              {crawlHistory.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Database className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Chưa có lịch sử thu thập</p>
                </div>
              ) : (
                <div className="divide-y divide-green-100">
                  {crawlHistory.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 hover:bg-white transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusIcon(item.status)}
                            <span
                              className={`text-sm font-medium px-2 py-1 rounded-full ${getStatusColor(
                                item.status
                              )}`}
                            >
                              {getStatusText(item.status)}
                            </span>
                          </div>

                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{item.date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Database className="w-4 h-4" />
                              <span>{item.source}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Download className="w-4 h-4" />
                              <span>
                                {item.recordsCount.toLocaleString("vi-VN")} bản
                                ghi
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>{item.duration}</span>
                            </div>
                          </div>

                          {item.errorMessage && (
                            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                              <strong>Lỗi:</strong> {item.errorMessage}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1 ml-4">
                          <button
                            type="button"
                            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
