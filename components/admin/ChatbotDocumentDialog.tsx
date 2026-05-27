"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { Loader2, UploadCloud } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ChatbotDocument } from "@/types/chatbot";

export interface ChatbotDocumentDialogSubmit {
  file: File | null;
  title: string;
  description: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  initialData?: ChatbotDocument | null;
  supportedExtensions: string[];
  uploading?: boolean;
  uploadProgress?: number;
  onSubmit: (data: ChatbotDocumentDialogSubmit) => Promise<void> | void;
}

const MAX_FILE_MB = 25;

export function ChatbotDocumentDialog({
  open,
  onOpenChange,
  mode,
  initialData,
  supportedExtensions,
  uploading = false,
  uploadProgress = 0,
  onSubmit,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setFile(null);
      setFileError(null);
      setTitle(initialData?.title || "");
      setDescription(initialData?.description || "");
    }
  }, [open, initialData]);

  const acceptAttr = supportedExtensions.length
    ? supportedExtensions.join(",")
    : ".pdf,.docx,.txt,.md,.csv,.xlsx";

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFileError(null);
    if (!f) {
      setFile(null);
      return;
    }
    const lowerName = f.name.toLowerCase();
    const ext = "." + (lowerName.split(".").pop() ?? "");
    if (supportedExtensions.length && !supportedExtensions.includes(ext)) {
      setFileError(
        `Định dạng .${ext.replace(".", "")} không được hỗ trợ. Cho phép: ${supportedExtensions.join(", ")}`,
      );
      setFile(null);
      return;
    }
    if (f.size > MAX_FILE_MB * 1024 * 1024) {
      setFileError(`Tập tin vượt quá ${MAX_FILE_MB}MB.`);
      setFile(null);
      return;
    }
    setFile(f);
    if (!title) {
      const stem = f.name.replace(/\.[^.]+$/, "");
      setTitle(stem.slice(0, 200));
    }
  };

  const isAdd = mode === "add";
  const canSubmit = isAdd ? !!file && !fileError : !!title.trim();

  const handleSubmit = async () => {
    if (!canSubmit) return;
    await onSubmit({
      file,
      title: title.trim(),
      description: description.trim(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !uploading && onOpenChange(o)}>
      <DialogContent className="sm:max-w-lg bg-white border-2 border-green-200">
        <DialogHeader>
          <DialogTitle className="text-green-900">
            {isAdd ? "Tải tài liệu cho chatbot" : "Cập nhật tài liệu"}
          </DialogTitle>
          <DialogDescription>
            {isAdd
              ? "Tài liệu sẽ được phân tích, chia nhỏ và lập chỉ mục để chatbot trả lời dựa trên nội dung thật."
              : "Cập nhật tiêu đề và mô tả hiển thị cho tài liệu."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {isAdd && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tập tin <span className="text-red-500">*</span>
              </label>
              <label
                className={`flex flex-col items-center justify-center gap-2 cursor-pointer rounded-lg border-2 border-dashed px-4 py-6 transition-colors ${
                  fileError
                    ? "border-red-300 bg-red-50"
                    : "border-green-300 hover:bg-green-50"
                }`}
              >
                <UploadCloud
                  size={32}
                  className={fileError ? "text-red-400" : "text-green-500"}
                />
                <div className="text-sm text-gray-700 text-center">
                  {file ? (
                    <span className="font-medium text-green-700">
                      {file.name}
                    </span>
                  ) : (
                    <>
                      <span className="font-medium">Kéo & thả</span> hoặc
                      <span className="underline ml-1">chọn tập tin</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Hỗ trợ {acceptAttr.replace(/\./g, "").toUpperCase()} — tối đa{" "}
                  {MAX_FILE_MB}MB
                </p>
                <input
                  type="file"
                  accept={acceptAttr}
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
              </label>
              {fileError && (
                <p className="mt-1 text-xs text-red-500">{fileError}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tiêu đề {!isAdd && <span className="text-red-500">*</span>}
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Quy chế đào tạo UTEHY 2024"
              disabled={uploading}
              maxLength={255}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả ngắn
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ghi chú nội dung tài liệu (không bắt buộc)"
              rows={3}
              disabled={uploading}
            />
          </div>

          {uploading && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Đang tải & lập chỉ mục…</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
              <p className="text-xs text-gray-500">
                Quá trình bao gồm: tải file → bóc tách → chia khối → nhúng
                vector → lập chỉ mục FAISS. Có thể mất vài giây tùy kích thước.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={uploading}
            className="px-4 py-2 border-2 border-green-600 text-green-600 rounded-md font-medium hover:bg-green-50 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || uploading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {uploading && <Loader2 size={16} className="animate-spin" />}
            {isAdd ? "Tải lên & lập chỉ mục" : "Lưu thay đổi"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
