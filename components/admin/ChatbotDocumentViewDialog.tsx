"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  Copy,
  Download,
  FileText,
  Hash,
  Layers,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { chatbotAPI } from "@/services/chatbot";
import { getStaticUrl } from "@/lib/config";
import {
  ChatbotDocument,
  ChatbotDocumentChunkPreview,
  ChatbotDocumentContent,
} from "@/types/chatbot";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: ChatbotDocument | null;
}

type ViewMode = "full" | "chunks";

function formatBytes(bytes: number | null | undefined): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function highlight(text: string, keyword: string) {
  const trimmed = keyword.trim();
  if (!trimmed) return text;
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === trimmed.toLowerCase() ? (
      <mark
        key={i}
        className="bg-yellow-200 text-gray-900 rounded-sm px-0.5"
      >
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

export function ChatbotDocumentViewDialog({
  open,
  onOpenChange,
  document: doc,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<ChatbotDocumentContent | null>(null);
  const [mode, setMode] = useState<ViewMode>("full");
  const [keyword, setKeyword] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open || !doc) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setContent(null);
    setMode("full");
    setKeyword("");
    chatbotAPI
      .getDocumentContent(doc.id)
      .then((res) => {
        if (cancelled) return;
        setContent(res.data?.data || null);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(
          e?.response?.data?.detail ||
            e?.message ||
            "Không tải được nội dung tài liệu.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, doc]);

  const handleCopy = async () => {
    if (!content?.full_text) return;
    try {
      await navigator.clipboard.writeText(content.full_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const fileLink = doc?.file_url ? getStaticUrl(doc.file_url) : null;
  const filteredChunks: ChatbotDocumentChunkPreview[] =
    content?.chunks?.filter((c) =>
      keyword.trim()
        ? c.content.toLowerCase().includes(keyword.trim().toLowerCase())
        : true,
    ) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl bg-white border-2 border-green-200 max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-green-900 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Nội dung tài liệu
          </DialogTitle>
          <DialogDescription>
            Xem nội dung tài liệu đã được bóc tách và chia khối để chatbot sử
            dụng.
          </DialogDescription>
        </DialogHeader>

        {/* Document meta */}
        {doc && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs bg-green-50 border border-green-100 rounded-md p-3">
            <div>
              <div className="text-gray-500">Tiêu đề</div>
              <div
                className="font-medium text-gray-900 truncate"
                title={doc.title}
              >
                {doc.title}
              </div>
            </div>
            <div>
              <div className="text-gray-500">Tệp gốc</div>
              <div
                className="font-medium text-gray-900 truncate"
                title={doc.file_name}
              >
                {doc.file_name}
              </div>
            </div>
            <div>
              <div className="text-gray-500">Định dạng / Kích thước</div>
              <div className="font-medium text-gray-900">
                {(doc.extension || "—").replace(".", "").toUpperCase()} ·{" "}
                {formatBytes(doc.file_size)}
              </div>
            </div>
            <div>
              <div className="text-gray-500">Số chunk / Ký tự</div>
              <div className="font-medium text-gray-900">
                {content?.total_chunks ?? doc.total_chunks} ·{" "}
                {content?.full_text
                  ? content.full_text.length.toLocaleString()
                  : (doc.total_chars ?? 0).toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-md border border-gray-200 overflow-hidden text-sm">
            <button
              type="button"
              onClick={() => setMode("full")}
              className={`px-3 py-1.5 inline-flex items-center gap-1.5 cursor-pointer ${
                mode === "full"
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <FileText size={14} />
              Toàn văn
            </button>
            <button
              type="button"
              onClick={() => setMode("chunks")}
              className={`px-3 py-1.5 inline-flex items-center gap-1.5 cursor-pointer border-l border-gray-200 ${
                mode === "chunks"
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Layers size={14} />
              Theo chunk ({content?.total_chunks ?? 0})
            </button>
          </div>

          <div className="flex-1 min-w-48">
            <Input
              placeholder="Tìm trong nội dung…"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>

          <button
            type="button"
            onClick={handleCopy}
            disabled={!content?.full_text}
            title="Sao chép toàn bộ nội dung"
            className="px-3 py-1.5 border rounded-md text-sm text-gray-700 hover:bg-gray-50 inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Copy size={14} />
            {copied ? "Đã sao chép" : "Sao chép"}
          </button>

          {fileLink && (
            <a
              href={fileLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 border rounded-md text-sm text-gray-700 hover:bg-gray-50 inline-flex items-center gap-1.5"
            >
              <Download size={14} />
              Tải tệp gốc
            </a>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 min-h-[300px] border border-gray-200 rounded-md bg-gray-50 overflow-hidden">
          {loading && (
            <div className="h-full flex items-center justify-center text-sm text-gray-500 py-12">
              <Loader2 size={18} className="animate-spin mr-2" />
              Đang tải nội dung…
            </div>
          )}

          {!loading && error && (
            <div className="h-full flex flex-col items-center justify-center text-sm text-red-600 gap-2 py-12">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {!loading && !error && content && (
            <>
              {mode === "full" ? (
                <div className="h-[55vh] overflow-y-auto p-4">
                  {content.full_text ? (
                    <pre className="whitespace-pre-wrap break-words text-sm text-gray-800 font-sans leading-relaxed">
                      {highlight(content.full_text, keyword)}
                    </pre>
                  ) : (
                    <div className="text-sm text-gray-500 text-center py-10">
                      Tài liệu chưa có nội dung được lập chỉ mục.
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-[55vh] overflow-y-auto p-3 space-y-3">
                  {filteredChunks.length === 0 ? (
                    <div className="text-sm text-gray-500 text-center py-10">
                      {keyword.trim()
                        ? "Không có chunk nào khớp với từ khóa."
                        : "Tài liệu chưa có chunk nào."}
                    </div>
                  ) : (
                    filteredChunks.map((c) => (
                      <div
                        key={c.id}
                        className="bg-white border border-gray-200 rounded-md p-3"
                      >
                        <div className="flex items-center justify-between mb-2 text-xs text-gray-500">
                          <span className="inline-flex items-center gap-1 font-medium text-green-700">
                            <Hash size={12} />
                            Chunk #{c.chunk_index + 1}
                          </span>
                          <span>
                            {c.char_count ?? c.content.length} ký tự
                            {c.vector_index != null &&
                              ` · vector_idx=${c.vector_index}`}
                          </span>
                        </div>
                        <pre className="whitespace-pre-wrap break-words text-sm text-gray-800 font-sans leading-relaxed">
                          {highlight(c.content, keyword)}
                        </pre>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
