"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { ChatMessage, ChatbotContextType } from "@/types/chatbot";
import { chatAPI } from "@/services/chatbot";
import { logger } from "@/lib/logger";

const ChatbotContext = createContext<ChatbotContextType | null>(null);

export function ChatbotProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false); // New state for waiting
  const [unreadCount, setUnreadCount] = useState(0);

  const toggleChat = () => {
    setIsOpen((prev) => {
      const newIsOpen = !prev;
      // Clear unread count when opening chat
      if (newIsOpen) {
        setUnreadCount(0);
      }
      return newIsOpen;
    });
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Create bot message placeholder
    const botMessageId = (Date.now() + 1).toString();
    const botMessage: ChatMessage = {
      id: botMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, botMessage]);

    // Set waiting state (shows ... dots)
    setIsWaiting(true);
    setIsTyping(false);

    try {
      let isFirstChunk = true;
      for await (const chunk of chatAPI.sendMessageStream(content)) {
        // On first chunk, switch from waiting to typing
        if (isFirstChunk) {
          setIsWaiting(false);
          setIsTyping(true);
          isFirstChunk = false;
        }

        setMessages((prev) => {
          return prev.map((msg) => {
            if (msg.id === botMessageId) {
              return {
                ...msg,
                content: msg.content + chunk,
              };
            }
            return msg;
          });
        });
      }
    } catch (error) {
      logger.error("Failed to send message", error);

      setMessages((prev) => {
        return prev.map((msg) => {
          if (msg.id === botMessageId) {
            return {
              ...msg,
              content: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.",
            };
          }
          return msg;
        });
      });
    } finally {
      setIsWaiting(false);
      setIsTyping(false);

      // Increment unread count if chat is closed
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
  };

  return (
    <ChatbotContext.Provider
      value={{
        isOpen,
        messages,
        isTyping,
        isWaiting,
        unreadCount,
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
