"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { ChatMessage, ChatbotContextType } from "@/types/chatbot";
import { chatbotAPI } from "@/services/chatbot";
import { logger } from "@/lib/logger";

const ChatbotContext = createContext<ChatbotContextType | null>(null);

// Persist session id across page navigations so the user keeps their
// conversation when they reopen the widget.
const SESSION_STORAGE_KEY = "chatbot.session_id";

export function ChatbotProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (stored) setSessionId(stored);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionId) {
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    } else {
      window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, [sessionId]);

  const toggleChat = () => {
    setIsOpen((prev) => {
      const newIsOpen = !prev;
      if (newIsOpen) setUnreadCount(0);
      return newIsOpen;
    });
  };

  const sendMessage = async (content: string) => {
    const text = content.trim();
    if (!text) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    const botMessageId = (Date.now() + 1).toString();
    const botPlaceholder: ChatMessage = {
      id: botMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, botPlaceholder]);

    setIsWaiting(true);
    setIsTyping(false);

    try {
      const response = await chatbotAPI.ask({
        question: text,
        session_id: sessionId ?? undefined,
      });
      const data = response.data;

      // Remember session id assigned by the server on the first turn.
      if (data?.session_id && data.session_id !== sessionId) {
        setSessionId(data.session_id);
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMessageId
            ? {
                ...msg,
                content: data.answer || "",
                sources: data.sources || [],
                note: data.note,
                grounded: data.grounded,
                timestamp: new Date(),
              }
            : msg,
        ),
      );
    } catch (error: any) {
      logger.error("Failed to send chatbot message", error);
      const detail =
        error?.response?.data?.detail ||
        error?.message ||
        "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.";
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMessageId
            ? { ...msg, content: detail, note: "request_error" }
            : msg,
        ),
      );
    } finally {
      setIsWaiting(false);
      setIsTyping(false);
      if (!isOpen) {
        setUnreadCount((prev) => prev + 1);
      }
    }
  };

  const clearMessages = () => {
    setMessages([]);
    setUnreadCount(0);
    setIsWaiting(false);
    setIsTyping(false);
    setSessionId(null);
  };

  return (
    <ChatbotContext.Provider
      value={{
        isOpen,
        messages,
        isTyping,
        isWaiting,
        unreadCount,
        sessionId,
        toggleChat,
        sendMessage,
        clearMessages,
      }}
    >
      {children}
    </ChatbotContext.Provider>
  );
}

export function useChatbot() {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error("useChatbot must be used within ChatbotProvider");
  }
  return context;
}
