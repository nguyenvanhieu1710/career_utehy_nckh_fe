export interface ChatbotSource {
  id: string;
  document_id: string;
  chunk_index: number;
  content: string;
  score: number | null;
  document_title?: string | null;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: ChatbotSource[];
  /** Server-side note: "no_context", "llm_error:<reason>", … */
  note?: string | null;
  grounded?: boolean;
}

export interface ChatbotChatRequest {
  session_id?: string;
  question: string;
  top_k?: number;
  document_ids?: string[];
}

export interface ChatbotChatResponse {
  session_id: string;
  question: string;
  answer: string;
  sources: ChatbotSource[];
  model: string | null;
  latency_ms: number | null;
  grounded: boolean;
  note?: string | null;
}

export interface ChatbotContextType {
  isOpen: boolean;
  messages: ChatMessage[];
  isTyping: boolean;
  isWaiting: boolean;
  unreadCount: number;
  sessionId: string | null;
  toggleChat: () => void;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
}

// --------------------------------------------------------------------------- //
//  Admin chatbot management
// --------------------------------------------------------------------------- //
export type ChatbotDocumentStatus =
  | "pending"
  | "processing"
  | "ready"
  | "failed";

export interface ChatbotDocument {
  id: string;
  title: string;
  description: string | null;
  file_name: string;
  file_path: string;
  file_url: string | null;
  file_size: number | null;
  mime_type: string | null;
  extension: string | null;
  status: ChatbotDocumentStatus;
  error_message: string | null;
  total_chars: number | null;
  total_chunks: number;
  embedding_model: string | null;
  embedding_dim: number | null;
  created_at: string;
  updated_at: string | null;
}

export interface ChatbotDocumentFilter {
  searchKeyword?: string;
  status?: string;
  page?: number;
  row?: number;
}

export interface ChatbotDocumentListResponse {
  total: number;
  page: number;
  max_page: number;
  row: number;
  data: ChatbotDocument[];
}

export interface ChatbotSessionRow {
  id: string;
  user_id: string | null;
  title: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface ChatbotMessageRow {
  id: string;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  sources?: ChatbotSource[] | null;
  model?: string | null;
  latency_ms?: number | null;
  created_at: string;
}

export interface ChatbotDocumentChunkPreview {
  id: string;
  chunk_index: number;
  content: string;
  char_count: number | null;
  vector_index: number | null;
}

export interface ChatbotDocumentContent {
  document: ChatbotDocument;
  chunks: ChatbotDocumentChunkPreview[];
  full_text: string;
  total_chunks: number;
}

export interface ChatbotVectorStoreStats {
  dim: number | null;
  total_vectors: number;
  rows_tracked: number;
  storage_dir: string;
  embedding_model?: string;
  embedding_dim_configured?: number;
  chunk_size?: number;
  chunk_overlap?: number;
  top_k?: number;
}
