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
  // Crawl config fields
  crawl_frequency?: string;
  crawl_enabled?: boolean;
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
  const [crawlFrequency, setCrawlFrequency] = useState("daily");
  const [crawlEnabled, setCrawlEnabled] = useState(true);
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
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-white border-2 border-green-200 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-green-900 flex items-center gap-2">
            <Database className="w-5 h-5" />
            {mode === "add" ? "Thêm nguồn dữ liệu" : "Chỉnh sửa nguồn dữ liệu"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Data Source Info */}
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

          {/* Crawl Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-green-900 border-b pb-2">
              Cấu hình crawl
            </h3>

            {/* Tần suất crawl */}
            <div className="space-y-2">
              <Label className="text-green-900">Tần suất crawl</Label>
              <Select value={crawlFrequency} onValueChange={setCrawlFrequency}>
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
                onValueChange={(value) => setCrawlEnabled(value === "enabled")}
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
