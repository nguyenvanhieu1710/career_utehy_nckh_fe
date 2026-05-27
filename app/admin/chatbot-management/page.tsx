"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Bot,
  CheckCircle2,
  Clock,
  FileText,
  RefreshCw,
} from "lucide-react";
import { Column, Table } from "@/components/admin/Table";
import { Pagination } from "@/components/admin/Pagination";
import { ActionButtons } from "@/components/admin/ActionButtons";
import { AddButton } from "@/components/admin/AddButton";
import { DeleteConfirmationDialog } from "@/components/admin/DeleteConfirmationDialog";
import { NotificationDialog } from "@/components/admin/NotificationDialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  ChatbotDocumentDialog,
  ChatbotDocumentDialogSubmit,
} from "@/components/admin/ChatbotDocumentDialog";
import { ChatbotDocumentViewDialog } from "@/components/admin/ChatbotDocumentViewDialog";
import { chatbotAPI } from "@/services/chatbot";
import {
  ChatbotDocument,
  ChatbotDocumentStatus,
  ChatbotVectorStoreStats,
} from "@/types/chatbot";
import { DialogState } from "@/types/dialog";

const STATUS_OPTIONS: Array<{
  value: string;
  label: string;
}> = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "ready", label: "Sẵn sàng" },
  { value: "processing", label: "Đang xử lý" },
  { value: "pending", label: "Chờ xử lý" },
  { value: "failed", label: "Lỗi" },
];

function StatusPill({ status }: { status: ChatbotDocumentStatus }) {
  const meta: Record<
    ChatbotDocumentStatus,
    { label: string; className: string; Icon: typeof CheckCircle2 }
  > = {
    ready: {
      label: "Sẵn sàng",
      className: "bg-green-50 text-green-700 border-green-200",
      Icon: CheckCircle2,
    },
    processing: {
      label: "Đang xử lý",
      className: "bg-amber-50 text-amber-700 border-amber-200",
      Icon: RefreshCw,
    },
    pending: {
      label: "Chờ xử lý",
      className: "bg-gray-50 text-gray-700 border-gray-200",
      Icon: Clock,
    },
    failed: {
      label: "Lỗi",
      className: "bg-red-50 text-red-700 border-red-200",
      Icon: AlertCircle,
    },
  };
  const { label, className, Icon } = meta[status] || meta.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border ${className}`}
    >
      <Icon size={12} className={status === "processing" ? "animate-spin" : ""} />
      {label}
    </span>
  );
}

function formatBytes(bytes: number | null | undefined): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ChatbotManagementPage() {
  // Data
  const [documents, setDocuments] = useState<ChatbotDocument[]>([]);
  const [total, setTotal] = useState(0);
  const [maxPage, setMaxPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [supportedExtensions, setSupportedExtensions] = useState<string[]>([]);
  const [stats, setStats] = useState<ChatbotVectorStoreStats | null>(null);

  // Filters
  const [filters, setFilters] = useState({
    searchKeyword: "",
    status: "all",
    page: 1,
    row: 10,
  });

  // Dialogs
  const [docDialogOpen, setDocDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [selectedDoc, setSelectedDoc] = useState<ChatbotDocument | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewDoc, setViewDoc] = useState<ChatbotDocument | null>(null);

  // Upload / action state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [reindexingId, setReindexingId] = useState<string | null>(null);

  // Notification
  const [notification, setNotification] = useState<DialogState>({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  // ----- Loaders -----
  const loadDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await chatbotAPI.listDocuments({
        searchKeyword: filters.searchKeyword.trim() || undefined,
        status: filters.status === "all" ? undefined : filters.status,
        page: filters.page,
        row: filters.row,
      });
      const payload = res.data;
      setDocuments(payload.data || []);
      setTotal(payload.total || 0);
      setMaxPage(payload.max_page || 1);
    } catch (e: any) {
      setNotification({
        isOpen: true,
        title: "Không tải được danh sách",
        message:
          e?.response?.data?.detail || e?.message || "Lỗi không xác định",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadStats = useCallback(async () => {
    try {
      const [statsRes, extRes] = await Promise.all([
        chatbotAPI.getVectorStoreStats().catch(() => null),
        chatbotAPI.getSupportedExtensions().catch(() => null),
      ]);
      if (statsRes?.data?.data) setStats(statsRes.data.data);
      if (extRes?.data?.extensions) {
        setSupportedExtensions(extRes.data.extensions);
      }
    } catch {
      /* non-fatal */
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // ----- Handlers -----
  const handleAdd = () => {
    setSelectedDoc(null);
    setDialogMode("add");
    setDocDialogOpen(true);
  };

  const handleEdit = (doc: ChatbotDocument) => {
    setSelectedDoc(doc);
    setDialogMode("edit");
    setDocDialogOpen(true);
  };

  const handleView = (doc: ChatbotDocument) => {
    setViewDoc(doc);
    setViewOpen(true);
  };

  const handleDelete = (doc: ChatbotDocument) => {
    setSelectedDoc(doc);
    setDeleteOpen(true);
  };

  const handleDialogSubmit = async (data: ChatbotDocumentDialogSubmit) => {
    try {
      if (dialogMode === "add") {
        if (!data.file) return;
        setUploading(true);
        setUploadProgress(0);
        const res = await chatbotAPI.uploadDocument(
          data.file,
          data.title || undefined,
          data.description || undefined,
          (p) => setUploadProgress(p),
        );
        const doc = res.data?.data;
        setUploading(false);
        setDocDialogOpen(false);
        if (doc?.status === "ready") {
          setNotification({
            isOpen: true,
            title: "Lập chỉ mục thành công",
            message: `Đã tạo ${doc.total_chunks} đoạn vector từ "${doc.title}".`,
            type: "success",
          });
        } else if (doc?.status === "failed") {
          setNotification({
            isOpen: true,
            title: "Lập chỉ mục thất bại",
            message:
              doc?.error_message ||
              "Không tách được nội dung từ tài liệu này.",
            type: "error",
          });
        } else {
          setNotification({
            isOpen: true,
            title: "Tài liệu đã được tải lên",
            message: "Hệ thống đang xử lý — danh sách sẽ tự cập nhật.",
            type: "info",
          });
        }
        await loadDocuments();
        await loadStats();
      } else {
        if (!selectedDoc) return;
        await chatbotAPI.updateDocument(selectedDoc.id, {
          title: data.title,
          description: data.description,
        });
        setDocDialogOpen(false);
        setNotification({
          isOpen: true,
          title: "Cập nhật thành công",
          message: "Đã lưu thông tin tài liệu.",
          type: "success",
        });
        await loadDocuments();
      }
    } catch (e: any) {
      setUploading(false);
      setNotification({
        isOpen: true,
        title: dialogMode === "add" ? "Tải lên thất bại" : "Cập nhật thất bại",
        message:
          e?.response?.data?.detail || e?.message || "Đã xảy ra lỗi.",
        type: "error",
      });
    }
  };

  const handleReindex = async (doc: ChatbotDocument) => {
    setReindexingId(doc.id);
    try {
      const res = await chatbotAPI.reindexDocument(doc.id);
      const updated = res.data?.data;
      setNotification({
        isOpen: true,
        title:
          updated?.status === "ready"
            ? "Tái lập chỉ mục thành công"
            : "Tái lập chỉ mục hoàn tất",
        message:
          updated?.status === "ready"
            ? `Đã làm lại ${updated.total_chunks} chunk cho "${doc.title}".`
            : updated?.error_message || "Trạng thái mới đã được cập nhật.",
        type: updated?.status === "ready" ? "success" : "error",
      });
      await loadDocuments();
      await loadStats();
    } catch (e: any) {
      setNotification({
        isOpen: true,
        title: "Tái lập chỉ mục thất bại",
        message: e?.response?.data?.detail || e?.message || "Lỗi.",
        type: "error",
      });
    } finally {
      setReindexingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedDoc) return;
    try {
      await chatbotAPI.deleteDocument(selectedDoc.id);
      setDeleteOpen(false);
      setNotification({
        isOpen: true,
        title: "Đã xóa tài liệu",
        message: `Tài liệu "${selectedDoc.title}" đã được xóa khỏi tri thức.`,
        type: "success",
      });
      setSelectedDoc(null);
      await loadDocuments();
      await loadStats();
    } catch (e: any) {
      setNotification({
        isOpen: true,
        title: "Xóa thất bại",
        message: e?.response?.data?.detail || e?.message || "Lỗi.",
        type: "error",
      });
      setDeleteOpen(false);
    }
  };

  // ----- Table -----
  const columns: Column<ChatbotDocument>[] = useMemo(
    () => [
      {
        label: "#",
        render: (_, i) => (filters.page - 1) * filters.row + i + 1,
      },
      {
        label: "Tài liệu",
        render: (doc) => (
          <div className="flex items-start gap-3">
            <div className="mt-0.5 w-9 h-9 rounded-md bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
              <FileText size={18} />
            </div>
            <div className="min-w-0">
              <div className="font-medium text-gray-900 truncate">
                {doc.title}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {doc.file_name}
              </div>
              {doc.description && (
                <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {doc.description}
                </div>
              )}
            </div>
          </div>
        ),
      },
      {
        label: "Định dạng",
        render: (doc) => (
          <span className="uppercase text-xs font-medium text-gray-600">
            {doc.extension?.replace(".", "") || "—"}
          </span>
        ),
      },
      {
        label: "Kích thước",
        render: (doc) => (
          <span className="text-sm text-gray-700">
            {formatBytes(doc.file_size)}
          </span>
        ),
      },
      {
        label: "Đoạn (chunks)",
        render: (doc) => (
          <span className="text-sm text-gray-700">
            {doc.total_chunks > 0 ? doc.total_chunks : "—"}
          </span>
        ),
      },
      {
        label: "Trạng thái",
        render: (doc) => (
          <div className="flex flex-col gap-1">
            <StatusPill status={doc.status} />
            {doc.status === "failed" && doc.error_message && (
              <span
                className="text-[11px] text-red-600 max-w-[220px] truncate"
                title={doc.error_message}
              >
                {doc.error_message}
              </span>
            )}
          </div>
        ),
      },
      {
        label: "Hành động",
        render: (doc) => (
          <div className="flex gap-2">
            <ActionButtons
              type="view"
              permission="chatbot.document.read"
              title="Xem nội dung tài liệu"
              onClick={() => handleView(doc)}
            />
            <ActionButtons
              type="scrape"
              permission="chatbot.document.reindex"
              title="Tái lập chỉ mục"
              loading={reindexingId === doc.id}
              onClick={() => handleReindex(doc)}
            />
            <ActionButtons
              type="edit"
              permission="chatbot.document.update"
              onClick={() => handleEdit(doc)}
            />
            <ActionButtons
              type="delete"
              permission="chatbot.document.delete"
              onClick={() => handleDelete(doc)}
            />
          </div>
        ),
      },
    ],
    [filters.page, filters.row, reindexingId],
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 gap-3">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
            <Bot size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Quản lý Chatbot (RAG)
            </h1>
            <p className="text-sm text-gray-500 max-w-2xl">
              Tải lên tài liệu (Word, PDF, TXT, Excel, …).
            </p>
          </div>
        </div>
        <AddButton
          permission="chatbot.document.create"
          text="Tải tài liệu"
          onClick={handleAdd}
        />
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white border rounded-lg p-3">
            <div className="text-xs text-gray-500">Tổng số tài liệu</div>
            <div className="text-xl font-semibold text-gray-900">{total}</div>
          </div>
          <div className="bg-white border rounded-lg p-3">
            <div className="text-xs text-gray-500">Vector đã lập chỉ mục</div>
            <div className="text-xl font-semibold text-gray-900">
              {stats.total_vectors.toLocaleString()}
            </div>
          </div>
          <div className="bg-white border rounded-lg p-3">
            <div className="text-xs text-gray-500">Mô hình embedding</div>
            <div
              className="text-sm font-medium text-gray-800 truncate"
              title={stats.embedding_model}
            >
              {stats.embedding_model || "—"}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {stats.dim || stats.embedding_dim_configured} chiều
            </div>
          </div>
          <div className="bg-white border rounded-lg p-3">
            <div className="text-xs text-gray-500">Chunk size / overlap</div>
            <div className="text-sm font-medium text-gray-800">
              {stats.chunk_size ?? "—"} / {stats.chunk_overlap ?? "—"}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              top_k = {stats.top_k ?? "—"}
            </div>
          </div>
        </div>
      )}

      {/* Filter row */}
      <div className="flex flex-wrap gap-3 mb-4">
        <Select
          value={filters.status}
          onValueChange={(v) =>
            setFilters((prev) => ({ ...prev, status: v, page: 1 }))
          }
        >
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex-1 min-w-64">
          <Input
            placeholder="Tìm theo tiêu đề, tên tệp, mô tả…"
            value={filters.searchKeyword}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                searchKeyword: e.target.value,
                page: 1,
              }))
            }
          />
        </div>
        <button
          type="button"
          onClick={() => {
            loadDocuments();
            loadStats();
          }}
          className="px-3 py-2 border rounded-md text-sm text-gray-700 hover:bg-gray-50 inline-flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw size={14} />
          Làm mới
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4">
          <Table columns={columns} data={documents} loading={loading} />
          {!loading && documents.length === 0 && (
            <div className="text-center py-12 text-sm text-gray-500">
              Chưa có tài liệu nào. Hãy tải tệp đầu tiên để chatbot có thể
              tham chiếu.
            </div>
          )}
        </div>
      </div>

      <Pagination
        amountOfRecord={total}
        currentPage={filters.page}
        totalPages={maxPage}
        onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
      />

      {/* Dialogs */}
      <ChatbotDocumentDialog
        open={docDialogOpen}
        onOpenChange={setDocDialogOpen}
        mode={dialogMode}
        initialData={selectedDoc}
        supportedExtensions={supportedExtensions}
        uploading={uploading}
        uploadProgress={uploadProgress}
        onSubmit={handleDialogSubmit}
      />

      <DeleteConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleConfirmDelete}
        title="Xóa tài liệu chatbot"
        description={`Tài liệu "${selectedDoc?.title}" cùng toàn bộ vector liên quan sẽ bị xóa vĩnh viễn.`}
      />

      <ChatbotDocumentViewDialog
        open={viewOpen}
        onOpenChange={setViewOpen}
        document={viewDoc}
      />

      <NotificationDialog
        open={notification.isOpen}
        onOpenChange={(open) =>
          setNotification((prev) => ({ ...prev, isOpen: open }))
        }
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
    </div>
  );
}
