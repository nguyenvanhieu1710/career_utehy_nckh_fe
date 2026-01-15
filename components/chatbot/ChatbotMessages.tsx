"use client";

import { useEffect, useRef } from "react";
import { useChatbot } from "@/contexts/ChatbotContext";
import { ChatbotWelcome } from "./ChatbotWelcome";
import { ChatbotTyping } from "./ChatbotTyping";
import "./chatbot.css";

export function ChatbotMessages() {
  const { messages, isTyping } = useChatbot();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Smooth scroll to bottom
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  };

  // Auto-scroll when messages change or typing
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100); // Small delay for smooth rendering

    return () => clearTimeout(timer);
  }, [messages, isTyping]);

  // Force scroll on new message
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length]);

  return (
    <div
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 scroll-smooth"
    >
      {messages.length === 0 ? (
        <ChatbotWelcome />
      ) : (
        <>
          {messages.map((msg, index) => {
            const isLastAssistantMessage =
              index === messages.length - 1 &&
              msg.role === "assistant" &&
              isTyping;

            return (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                } animate-fadeIn`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 chatbot-message-bubble ${
                    msg.role === "user"
                      ? "bg-green-500 text-white"
                      : "bg-white text-gray-800 shadow-sm border border-gray-100"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                    {msg.content}
                    {isLastAssistantMessage && (
                      <span className="typing-cursor"></span>
                    )}
                  </p>
                  <span className="text-xs opacity-70 mt-2 block">
                    {msg.timestamp.toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            );
          })}

          {isTyping && messages.length === 0 && <ChatbotTyping />}
        </>
      )}
      <div ref={messagesEndRef} className="h-4" />
    </div>
  );
}
