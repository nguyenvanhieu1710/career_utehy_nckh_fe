"use client";

import { useEffect, useState, useMemo } from "react";
import { Download, Loader2, X, History } from "lucide-react";
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

import { categoryAPI } from "@/services/category";
import { dataSourceAPI } from "@/services/dataSource";
import { CrawlUrlEntry, DataSource } from "@/types/data-source";
import { Category } from "@/types/category";
import { logger } from "@/lib/logger";

export interface ScrapeUrlDialogResult {
  url: string;
  category_id: string;
}

interface ScrapeUrlDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dataSource: DataSource | null;
  onSubmit: (data: ScrapeUrlDialogResult) => Promise<void> | void;
  submitting?: boolean;
  /** Optional: emitted when the user removes a chip via the X button. */
  onHistoryChange?: (next: CrawlUrlEntry[]) => void;
  /** Initial URL to pre-fill (e.g. from clicking a chip in the parent list). */
  initialUrl?: string;
  /** Initial category UUID to pre-fill. */
  initialCategoryId?: string;
}

export function ScrapeUrlDialog({
  open,
  onOpenChange,
  dataSource,
  onSubmit,
  submitting = false,
  onHistoryChange,
  initialUrl = "",
  initialCategoryId = "",
}: ScrapeUrlDialogProps) {
  const [url, setUrl] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [history, setHistory] = useState<CrawlUrlEntry[]>([]);
  const [errors, setErrors] = useState<{ url?: string; category?: string }>(
    {},
  );
  const [removing, setRemoving] = useState<string | null>(null);

  // Reset state every time the dialog opens for a (potentially different) source.
  useEffect(() => {
    if (!open) return;
    setUrl(initialUrl);
    setCategoryId(initialCategoryId);
    setErrors({});
    setHistory(dataSource?.crawl_urls || []);
  }, [open, dataSource, initialUrl, initialCategoryId]);

  // Load category options on mount of dialog.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setCategoriesLoading(true);
    categoryAPI
      .getCategories({ page: 1, row: 100 })
      .then((res) => {
        if (cancelled) return;
        setCategories(res.data?.data || []);
      })
      .catch((err) => {
        if (cancelled) return;
        logger.error("Failed to load categories for scrape dialog", err);
        setCategories([]);
      })
      .finally(() => {
        if (!cancelled) setCategoriesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c) => map.set(c.id.toString(), c.name));
    return map;
  }, [categories]);

  const handleUseChip = (entry: CrawlUrlEntry) => {
    setUrl(entry.url);
    if (entry.category_id) {
      setCategoryId(entry.category_id);
    }
    setErrors({});
  };

  const handleRemoveChip = async (entry: CrawlUrlEntry) => {
    if (!dataSource) return;
    setRemoving(entry.url);
    try {
      const res = await dataSourceAPI.deleteCrawlUrl(dataSource.id, entry.url);
      const next = res.data?.data || [];
      setHistory(next);
      onHistoryChange?.(next);
    } catch (err) {
      logger.error("Failed to delete crawl url", err);
    } finally {
      setRemoving(null);
    }
  };

  const validate = (): boolean => {
    const next: { url?: string; category?: string } = {};
    const cleanedUrl = url.trim();
    if (!cleanedUrl) {
      next.url = "Vui lòng nhập URL cần cào";
    } else if (!/^https?:\/\//i.test(cleanedUrl)) {
      next.url = "URL phải bắt đầu bằng http:// hoặc https://";
    }
    if (!categoryId) {
      next.category = "Vui lòng chọn danh mục ngành";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    await onSubmit({ url: url.trim(), category_id: categoryId });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-white border-2 border-amber-200">
        <DialogHeader>
          <DialogTitle className="text-amber-900 flex items-center gap-2">
            <Download size={18} className="text-amber-600" />
            Cào dữ liệu theo URL
            {dataSource && (
              <span className="text-sm font-normal text-gray-500">
                — {dataSource.name}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          {/* URL input */}
          <div className="space-y-1.5">
            <Label htmlFor="scrape-url" className="text-amber-900">
              URL trang danh sách <span className="text-red-500">*</span>
            </Label>
            <Input
              id="scrape-url"
              type="url"
              placeholder="https://example.com/jobs?industry=it"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (errors.url) setErrors({ ...errors, url: undefined });
              }}
              className={`border-amber-200 focus:border-amber-500 focus:ring-amber-500 text-gray-900 ${
                errors.url ? "border-red-500" : ""
              }`}
            />
            {errors.url && (
              <p className="text-red-500 text-sm">{errors.url}</p>
            )}
          </div>

          {/* Category select */}
          <div className="space-y-1.5">
            <Label htmlFor="scrape-category" className="text-amber-900">
              Danh mục ngành <span className="text-red-500">*</span>
            </Label>
            <Select
              value={categoryId}
              onValueChange={(v) => {
                setCategoryId(v);
                if (errors.category)
                  setErrors({ ...errors, category: undefined });
              }}
              disabled={categoriesLoading}
            >
              <SelectTrigger
                id="scrape-category"
                className={`w-full border-amber-200 ${
                  errors.category ? "border-red-500" : ""
                }`}
              >
                <SelectValue
                  placeholder={
                    categoriesLoading
                      ? "Đang tải danh mục..."
                      : "Chọn danh mục ngành"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {categories.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    Chưa có danh mục. Vui lòng tạo ở trang Quản lý danh mục ngành.
                  </div>
                ) : (
                  categories.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-red-500 text-sm">{errors.category}</p>
            )}
          </div>

          {/* History chips */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <History size={14} className="text-amber-600" />
              <span>
                URL đã dùng
                {history.length > 0 && (
                  <span className="text-gray-400 ml-1">({history.length})</span>
                )}
              </span>
            </div>
            {history.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
                {history.map((entry) => {
                  const catName = entry.category_id
                    ? categoryNameById.get(entry.category_id)
                    : null;
                  const isActive = entry.url === url;
                  const isRemoving = removing === entry.url;
                  return (
                    <span
                      key={entry.url}
                      className={`inline-flex items-center gap-1 rounded-full border text-xs px-2 py-1 transition-colors ${
                        isActive
                          ? "bg-amber-100 border-amber-400 text-amber-900"
                          : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-amber-50 hover:border-amber-200"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleUseChip(entry)}
                        className="max-w-[280px] truncate text-left cursor-pointer"
                        title={`${entry.url}${catName ? `\nDanh mục: ${catName}` : ""}`}
                      >
                        {entry.url}
                      </button>
                      {catName && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-medium">
                          {catName}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveChip(entry)}
                        disabled={isRemoving}
                        className="ml-0.5 text-gray-400 hover:text-red-600 disabled:opacity-50"
                        title="Xóa URL khỏi lịch sử"
                      >
                        {isRemoving ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <X size={12} />
                        )}
                      </button>
                    </span>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-400">
                Chưa có URL nào được lưu. URL sẽ được lưu sau khi cào.
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            value={submitting ? "Đang cào..." : "Cào ngay"}
            onClick={handleSubmit}
            disable={submitting || !dataSource}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
