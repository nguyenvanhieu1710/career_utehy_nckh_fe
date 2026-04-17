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

  // Crawler Payload Fields
  const [webName, setWebName] = useState("");
  const [userName, setUserName] = useState("");
  const [stageNumber, setStageNumber] = useState(1);
  const [repeatCount, setRepeatCount] = useState(0);
  const [folderName, setFolderName] = useState("");
  const [stepsJson, setStepsJson] = useState("[]");

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    base_url?: string;
    steps_json?: string;
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
    setMaxPages(initialData?.max_pages ?? 100);
    const payload =
      (initialData as any)?.crawler_payload ||
      (initialData as any)?.crawler_config?.crawler_payload ||
      {};

    setWebName(payload.web_name || "");
    setUserName(payload.user_name || "");
    setStageNumber(payload.stage || 1);
    setRepeatCount(payload.repeat || 0);
    setFolderName(payload.folder_name || "");

    let stepsToDisplay = payload.steps || [];
    if (typeof stepsToDisplay === "string") {
      try {
        stepsToDisplay = JSON.parse(stepsToDisplay);
      } catch {
        stepsToDisplay = [];
      }
    }

    setStepsJson(JSON.stringify(stepsToDisplay, null, 2));
    setErrors({});
  }, [open, initialData]);

  const validateForm = (): boolean => {
    const newErrors: {
      name?: string;
      base_url?: string;
      steps_json?: string;
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

    let cleanedSteps = stepsJson.trim();
    if (cleanedSteps.includes("\\'")) {
      cleanedSteps = cleanedSteps.replace(/\\'/g, "'");
    }

    try {
      if (cleanedSteps) JSON.parse(cleanedSteps);
    } catch (e: any) {
      newErrors.steps_json = `JSON lỗi: ${e.message}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      let cleanedSteps = stepsJson.trim() || "[]";
      if (cleanedSteps.includes("\\'")) {
        cleanedSteps = cleanedSteps.replace(/\\'/g, "'");
      }

      const payload: any = {
        web_name: webName.trim(),
        user_name: userName.trim(),
        repeat: repeatCount,
        steps: JSON.parse(cleanedSteps),
        stage: stageNumber,
        url_web: baseUrl.trim(),
      };

      payload.folder_name =
        folderName.trim() || (stageNumber === 1 ? "it_categories" : "");

      if (stageNumber !== 1) {
        payload.prev_folder = "";
        payload.new_folder = "";
      }

      onSubmit?.({
        name: name.trim(),
        description: description.trim() || undefined,
        base_url: baseUrl.trim() || undefined,
        isActive,
        crawl_frequency: crawlFrequency,
        crawl_enabled: crawlEnabled,
        max_pages: maxPages,
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
                URL API
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
                <Label htmlFor="isActive" className="text-green-900">
                  Kích hoạt nguồn
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="crawl_enabled"
                  checked={crawlEnabled}
                  onCheckedChange={setCrawlEnabled}
                />
                <Label htmlFor="crawl_enabled" className="text-green-900">
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
                  <SelectTrigger className="border-green-200">
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
                  className="border-green-200"
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="web_name" className="text-green-900">
                  Web Name
                </Label>
                <Input
                  id="web_name"
                  placeholder="topcv"
                  className="border-green-200 text-green-900"
                  value={webName}
                  onChange={(e) => setWebName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user_name" className="text-green-900">
                  User Name
                </Label>
                <Input
                  id="user_name"
                  placeholder="admin_thanh"
                  className="border-green-200 text-green-900"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-10">
              <div className="space-y-2">
                <Label htmlFor="stage" className="text-green-900">
                  Giai đoạn (Stage)
                </Label>
                <Select
                  value={stageNumber.toString()}
                  onValueChange={(v) => setStageNumber(parseInt(v))}
                >
                  <SelectTrigger className="border-green-200 text-green-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Stage 1 (Lấy Menu)</SelectItem>
                    <SelectItem value="2">Stage 2 (Lấy Link)</SelectItem>
                    <SelectItem value="3">Stage 3 (Lấy Data)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="repeat" className="text-green-900">
                  Lặp lại (Repeat)
                </Label>
                <Input
                  id="repeat"
                  type="number"
                  className="border-green-200 text-green-900"
                  value={repeatCount}
                  onChange={(e) =>
                    setRepeatCount(parseInt(e.target.value) || 0)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="folder_name" className="text-green-900">
                  Folder Name
                </Label>
                <Input
                  id="folder_name"
                  placeholder="it_categories"
                  className="border-green-200 text-green-900"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="steps_json"
                className="text-green-900 flex justify-between"
              >
                <span>Cấu hình Tiến trình (Steps JSON)</span>
                {errors.steps_json && (
                  <span className="text-red-500 text-xs">
                    {errors.steps_json}
                  </span>
                )}
              </Label>
              <textarea
                id="steps_json"
                className={`w-full min-h-[300px] p-3 rounded-md border-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.steps_json ? "border-red-500" : "border-green-200"}`}
                placeholder='[{"type": "action", "args": {...}}, {"type": "extract", "args": {...}}]'
                value={stepsJson}
                onChange={(e) => setStepsJson(e.target.value)}
              />
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
