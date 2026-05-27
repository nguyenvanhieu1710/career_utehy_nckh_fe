"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, FileText } from "lucide-react";
import { useChatbot } from "@/contexts/ChatbotContext";
import { ChatbotWelcome } from "./ChatbotWelcome";
import { ChatbotSource } from "@/types/chatbot";
import "./chatbot.css";

function SourceList({ sources }: { sources: ChatbotSource[] }) {
  const [open, setOpen] = useState(false);
  if (!sources?.length) return null;

  return (
    <div className="mt-3 border-t border-gray-100 pt-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-xs font-medium text-green-700 hover:text-green-800 transition-colors cursor-pointer"
      >
        <FileText size={12} />
        <span>{sources.length} nguồn tham khảo</span>
        <ChevronDown
          size={12}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <ol className="mt-2 space-y-2">
          {sources.map((src, idx) => (
            <li
              key={src.id}
              className="rounded-md bg-green-50/70 border border-green-100 p-2 text-xs leading-snug text-gray-700"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-semibold text-green-900">
                  [#{idx + 1}] {src.document_title || "Tài liệu"}
                </span>
                {typeof src.score === "number" && (
                  <span className="text-[10px] uppercase tracking-wide text-green-700/70">
                    {(src.score * 100).toFixed(0)}%
                  </span>
                )}
              </div>
              <p className="text-gray-600 line-clamp-3 whitespace-pre-wrap">
                {src.content}
              </p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export function ChatbotMessages() {
  const { messages, isTyping, isWaiting } = useChatbot();
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
            const showWaitingDots =
              isLastAssistantMessage && isWaiting && !msg.content;
            const showTypingCursor =
              isLastAssistantMessage && isTyping && !msg.content;

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
                            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
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

                  {msg.role === "assistant" &&
                    msg.note === "no_context" && (
                      <p className="mt-2 text-[11px] italic text-amber-700">
                        Chưa tìm thấy thông tin phù hợp trong tài liệu —
                        thử diễn đạt lại câu hỏi.
                      </p>
                    )}

                  {msg.role === "assistant" && (msg.sources?.length ?? 0) > 0 && (
                    <SourceList sources={msg.sources!} />
                  )}

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
