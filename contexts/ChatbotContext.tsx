"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { ChatMessage, ChatbotContextType } from "@/types/chatbot";
import { chatAPI } from "@/services/chatbot";

const ChatbotContext = createContext<ChatbotContextType | null>(null);

export function ChatbotProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const toggleChat = () => {
    setIsOpen((prev) => !prev);
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

    setIsTyping(true);

    try {
      for await (const chunk of chatAPI.sendMessageStream(content)) {
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
      console.error("Failed to send message:", error);

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
      setIsTyping(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <ChatbotContext.Provider
      value={{
        isOpen,
        messages,
        isTyping,
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
