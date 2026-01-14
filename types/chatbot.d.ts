export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  answer: string;
}

export interface ChatbotContextType {
  isOpen: boolean;
  messages: ChatMessage[];
  isTyping: boolean;
  unreadCount: number;
  toggleChat: () => void;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
}

export interface ChatbotState {
  isOpen: boolean;
  messages: ChatMessage[];
  isTyping: boolean;
  unreadCount: number;
}

export interface SuggestedQuestion {
  id: string;
  text: string;
  category?: string;
}

export interface ChatHistory {
  messages: ChatMessage[];
  lastUpdated: string;
}

export interface ChatbotConfig {
  enableStreaming: boolean;
  maxMessages: number;
  saveHistory: boolean;
  welcomeMessage?: string;
  suggestedQuestions?: string[];
}

export interface ChatAPIResponse {
  status: "success" | "error";
  data?: ChatResponse;
  message?: string;
}
