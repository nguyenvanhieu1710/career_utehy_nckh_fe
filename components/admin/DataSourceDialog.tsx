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

export interface DataSourceDialogData {
  name?: string;
  description?: string;
  base_url?: string;
  isActive?: boolean;
  crawl_frequency?: string;
  crawl_enabled?: boolean;
  max_pages?: number;
  fetch_detail?: boolean;
  crawler_payload?: any;
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
  const [fetchDetail, setFetchDetail] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [cssConfigJson, setCssConfigJson] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    base_url?: string;
    css_config_json?: string;
  }>({});

  // Reset form when dialog opens
  useEffect(() => {
    if (!open) return;

    setName(initialData?.name ?? "");
    setDescription(initialData?.description ?? "");
    setBaseUrl(initialData?.base_url || "");
    setIsActive(initialData?.isActive ?? true);
    setCrawlFrequency(initialData?.crawl_frequency ?? "daily");
    setCrawlEnabled(initialData?.crawl_enabled ?? true);
    // Extract settings from crawler_payload if exists
    const payload = (initialData as any)?.crawler_payload || 
                    (initialData as any)?.crawler_config?.crawler_payload || {};
    
    setFetchDetail(payload.fetchDetail !== undefined ? payload.fetchDetail : true);
    setMaxPages(payload.maxPages || initialData?.max_pages || 100);
    
    if (payload.cssConfig) {
      setCssConfigJson(JSON.stringify(payload.cssConfig, null, 2));
    } else {
      setCssConfigJson("");
    }
    
    setErrors({});
  }, [open, initialData]);

  const validateForm = (): boolean => {
    const newErrors: {
      name?: string;
      base_url?: string;
      css_config_json?: string;
    } = {};

    if (!name.trim()) {
      newErrors.name = "Tên nguồn dữ liệu không được để trống";
    }

    if (baseUrl.trim()) {
      try {
        new URL(baseUrl.trim());
      } catch {
        newErrors.base_url = "URL không hợp lệ";
      }
    }

    if (cssConfigJson.trim()) {
      try {
        JSON.parse(cssConfigJson);
      } catch (e: any) {
        newErrors.css_config_json = "JSON không hợp lệ";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormatJson = () => {
    if (!cssConfigJson.trim()) return;

    try {
      // Dùng kỹ thuật Function để parse các chuỗi dạng JS Object (chấp nhận ngoặc đơn, key không ngoặc)
      // eslint-disable-next-line no-new-func
      const obj = new Function(`return ${cssConfigJson}`)();
      const formatted = JSON.stringify(obj, null, 2);
      setCssConfigJson(formatted);
      setErrors((prev) => ({ ...prev, css_config_json: undefined }));
    } catch (e: any) {
      setErrors((prev) => ({
        ...prev,
        css_config_json: "Không thể định dạng: Kiểm tra lại cú pháp.",
      }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const payload: any = {
        source: name.trim().toLowerCase(),
        maxPages: maxPages,
        fetchDetail: fetchDetail,
        saveToDb: true,
      };

      if (cssConfigJson.trim()) {
        payload.cssConfig = JSON.parse(cssConfigJson.trim());
      }

      onSubmit?.({
        name: name.trim(),
        description: description.trim() || undefined,
        base_url: baseUrl.trim() || undefined,
        isActive,
        crawl_frequency: crawlFrequency,
        crawl_enabled: crawlEnabled,
        max_pages: maxPages,
        fetch_detail: fetchDetail,
        crawler_payload: payload,
      });
    } catch (error) {
      console.error("Submit error:", error);
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
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-green-900 border-b pb-2">
              Thông tin nguồn dữ liệu
            </h3>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-green-900">
                Tên nguồn dữ liệu *
              </Label>
              <Input
                id="name"
                className={`border-green-200 text-green-900 ${errors.name ? "border-red-500" : ""}`}
                placeholder="Ví dụ: TopCV"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="base_url" className="text-green-900">
                URL Website
              </Label>
              <Input
                id="base_url"
                className={`border-green-200 text-green-900 ${errors.base_url ? "border-red-500" : ""}`}
                placeholder="https://www.vietnamworks.com/"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
              />
              {errors.base_url && (
                <p className="text-red-500 text-sm">{errors.base_url}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-green-900">
                Mô tả
              </Label>
              <textarea
                id="description"
                className="w-full p-2 border border-green-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-green-900"
                rows={3}
                placeholder="Mô tả về nguồn dữ liệu..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-8 pt-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <Label
                  htmlFor="isActive"
                  className="text-green-900 cursor-pointer"
                >
                  Kích hoạt nguồn
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="crawl_enabled"
                  checked={crawlEnabled}
                  onCheckedChange={setCrawlEnabled}
                />
                <Label
                  htmlFor="crawl_enabled"
                  className="text-green-900 cursor-pointer"
                >
                  Tự động Crawl
                </Label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="crawl_frequency" className="text-green-900">
                  Tần suất
                </Label>
                <Select
                  value={crawlFrequency}
                  onValueChange={setCrawlFrequency}
                >
                  <SelectTrigger className="border-green-200 text-green-900">
                    <SelectValue placeholder="Chọn tần suất" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hàng giờ</SelectItem>
                    <SelectItem value="daily">Hàng ngày</SelectItem>
                    <SelectItem value="weekly">Hàng tuần</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_pages" className="text-green-900">
                  Giới hạn trang
                </Label>
                <Input
                  id="max_pages"
                  type="number"
                  className="border-green-200 text-green-900"
                  value={maxPages}
                  onChange={(e) => setMaxPages(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 bg-emerald-50/30 p-4 rounded-lg border border-emerald-100">
            <h3 className="text-lg font-medium text-green-900 border-b border-emerald-200 pb-2">
              Cấu hình Crawler
            </h3>

            <div className="space-y-6">
              {/* 
              <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-emerald-100 shadow-sm">
                <Switch
                  id="fetch_detail"
                  checked={fetchDetail}
                  onCheckedChange={setFetchDetail}
                />
                <div className="space-y-1">
                  <Label
                    htmlFor="fetch_detail"
                    className="text-green-900 font-medium cursor-pointer"
                  >
                    Lấy dữ liệu chi tiết tin tuyển dụng
                  </Label>
                  <p className="text-xs text-gray-500">
                    Truy cập trang chi tiết từng công việc để lấy đầy đủ mô tả
                  </p>
                </div>
              </div>
              */}

              <div className="space-y-2 pt-2">
                <Label
                  htmlFor="css_config_json"
                  className="text-green-900 flex justify-between font-medium items-center"
                >
                  <span>CSS Selectors (JSON - Tùy chọn)</span>
                  <div className="flex gap-2">
                    {errors.css_config_json && (
                      <span className="text-red-500 text-xs font-normal">
                        {errors.css_config_json}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={handleFormatJson}
                      className="text-[10px] bg-green-100 text-green-700 px-2 py-1.5 rounded hover:bg-green-200 transition-colors border border-green-200 cursor-pointer"
                    >
                      Định dạng JSON
                    </button>
                  </div>
                </Label>
                <textarea
                  id="css_config_json"
                  className={`w-full min-h-[250px] p-3 rounded-md border-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-green-500 bg-white ${
                    errors.css_config_json
                      ? "border-red-500"
                      : "border-green-100"
                  }`}
                  placeholder='{ "list": { "container": ".job-item", "title": { "selector": "h3", "extract": "text" } } }'
                  value={cssConfigJson}
                  onChange={(e) => setCssConfigJson(e.target.value)}
                />
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
