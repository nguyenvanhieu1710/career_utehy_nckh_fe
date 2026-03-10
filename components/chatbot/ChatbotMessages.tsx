"use client";

import { useEffect, useRef } from "react";
import { useChatbot } from "@/contexts/ChatbotContext";
import { ChatbotWelcome } from "./ChatbotWelcome";
import "./chatbot.css";

export function ChatbotMessages() {
  const { messages, isTyping, isWaiting } = useChatbot();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages, isTyping, isWaiting]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 scroll-smooth">
      {messages.length === 0 ? (
        <ChatbotWelcome />
      ) : (
        <>
          {messages.map((msg, index) => {
            const isLastAssistantMessage =
              index === messages.length - 1 && msg.role === "assistant";
            const showTypingCursor = isLastAssistantMessage && isTyping;
            const showWaitingDots = isLastAssistantMessage && isWaiting;

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
                  <div className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                    {msg.role === "assistant" ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: msg.content
                            // Convert **text** to <strong>text</strong> (bold)
                            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                            // Convert *text* to <em>text</em> (italic)
                            .replace(/\*(.*?)\*/g, "<em>$1</em>"),
                        }}
                      />
                    ) : (
                      msg.content
                    )}
                    {showWaitingDots && (
                      <span className="waiting-dots">...</span>
                    )}
                    {showTypingCursor && (
                      <span className="typing-cursor"></span>
                    )}
                  </div>
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
        </>
      )}
      <div ref={messagesEndRef} className="h-4" />
    </div>
  );
}
