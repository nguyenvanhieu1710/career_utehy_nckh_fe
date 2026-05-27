import api from "@/cores/api";
import { config } from "@/lib/config";
import { logger } from "@/lib/logger";
import {
  ChatbotChatRequest,
  ChatbotChatResponse,
  ChatbotDocument,
  ChatbotDocumentContent,
  ChatbotDocumentFilter,
  ChatbotDocumentListResponse,
  ChatbotMessageRow,
  ChatbotSessionRow,
  ChatbotVectorStoreStats,
} from "@/types/chatbot";

/**
 * RAG chat surface
 * --------------------------------------------------------------
 * Plain JSON POST /chat — no streaming. The BE pipeline runs the
 * full Embedding → Vector Search → Retrieve → Prompt → LLM flow
 * and returns the answer plus the source chunks used. Citations
 * are exposed so the FE can render `[#N]` badges next to claims.
 */
export const chatbotAPI = {
  // ---- Chat ----
  ask(payload: ChatbotChatRequest) {
    return api.post<ChatbotChatResponse>("/chatbot/chat", payload, {
      timeout: config.api.chatTimeout,
    });
  },

  // ---- Sessions ----
  listSessions() {
    return api.get<{ status: string; data: ChatbotSessionRow[] }>(
      "/chatbot/sessions",
    );
  },
  getSessionMessages(sessionId: string) {
    return api.get<{ status: string; data: ChatbotMessageRow[] }>(
      `/chatbot/sessions/${sessionId}/messages`,
    );
  },
  deleteSession(sessionId: string) {
    return api.delete<{ status: string; message: string }>(
      `/chatbot/sessions/${sessionId}`,
    );
  },

  // ---- Document management (admin) ----
  listDocuments(filters: ChatbotDocumentFilter) {
    return api.post<ChatbotDocumentListResponse>(
      "/chatbot/documents/get-all",
      filters,
    );
  },
  getDocument(id: string) {
    return api.get<{ status: string; data: ChatbotDocument }>(
      `/chatbot/documents/${id}`,
    );
  },
  getDocumentContent(id: string) {
    return api.get<{ status: string; data: ChatbotDocumentContent }>(
      `/chatbot/documents/${id}/content`,
    );
  },
  updateDocument(id: string, data: { title?: string; description?: string }) {
    return api.put<{ status: string; data: ChatbotDocument }>(
      `/chatbot/documents/${id}`,
      data,
    );
  },
  uploadDocument(
    file: File,
    title?: string,
    description?: string,
    onUploadProgress?: (percent: number) => void,
  ) {
    const formData = new FormData();
    formData.append("file", file);
    if (title) formData.append("title", title);
    if (description) formData.append("description", description);
    return api.post<{ status: string; data: ChatbotDocument }>(
      "/chatbot/documents/upload",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: config.api.reindexTimeout,
        onUploadProgress: (evt) => {
          if (onUploadProgress && evt.total) {
            onUploadProgress(Math.round((evt.loaded * 100) / evt.total));
          }
        },
      },
    );
  },
  reindexDocument(id: string) {
    return api.post<{ status: string; data: ChatbotDocument }>(
      `/chatbot/documents/${id}/reindex`,
      undefined,
      { timeout: config.api.reindexTimeout },
    );
  },
  deleteDocument(id: string) {
    return api.delete<{ status: string; message: string }>(
      `/chatbot/documents/${id}`,
    );
  },
  getSupportedExtensions() {
    return api.get<{ extensions: string[] }>(
      "/chatbot/documents/supported-extensions",
    );
  },
  getVectorStoreStats() {
    return api.get<{ status: string; data: ChatbotVectorStoreStats }>(
      "/chatbot/documents/vector-store-stats",
    );
  },
};

/**
 * Compatibility shim — the old DraggableChatbot UI calls `sendMessageStream`
 * and yields chunks. We now do a single non-streamed call, so the shim
 * yields the whole answer once. Keeps the existing widget working without
 * touching it.
 *
 * NOTE: prefer `chatbotAPI.ask` in new code.
 */
export const chatAPI = {
  async *sendMessageStream(
    message: string,
    sessionId?: string,
  ): AsyncGenerator<string, ChatbotChatResponse | undefined, unknown> {
    try {
      const { data } = await chatbotAPI.ask({
        question: message,
        session_id: sessionId,
      });
      if (data?.answer) {
        yield data.answer;
      }
      return data;
    } catch (error) {
      logger.error("Chatbot ask error", error);
      throw error;
    }
  },
};
