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

  useEffect(() => {
    // Auto-scroll to bottom when new content arrives
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        100;

      // Only auto-scroll if user is near bottom (not scrolling up to read)
      if (isNearBottom) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages, isTyping]);

  return (
    <div
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
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
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 chatbot-message-bubble ${
                    msg.role === "user"
                      ? "bg-green-500 text-white"
                      : "bg-white text-gray-800 shadow-sm border border-gray-100"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words leading-relaxed chatbot-message-content">
                    {msg.content}
                    {isLastAssistantMessage && (
                      <span className="typing-cursor"></span>
                    )}
                  </p>
                  <span className="text-xs opacity-70 mt-1 block">
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
      <div ref={messagesEndRef} />
    </div>
  );
}
