"use client";

import { useState, useEffect } from "react";
import { useChatbot } from "@/contexts/ChatbotContext";
import { ChatbotHeader } from "./ChatbotHeader";
import { ChatbotMessages } from "./ChatbotMessages";
import { ChatbotInput } from "./ChatbotInput";

export function ChatbotWindow() {
  const { isOpen, toggleChat } = useChatbot();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        toggleChat();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, toggleChat]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop for mobile */}
      {isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-[999] md:hidden"
          onClick={toggleChat}
        />
      )}

      <div
        className={`fixed bg-white rounded-lg shadow-2xl
                     flex flex-col transition-all duration-300 z-[1000]
                     ${isMinimized ? "h-14" : isMobile ? "h-[90vh]" : "h-[600px]"}
                     ${
                       isMobile
                         ? "bottom-0 left-4 right-4 rounded-b-none max-h-[90vh]"
                         : "bottom-6 right-6 w-[380px]"
                     }`}
        style={{
          animation: "slideUp 0.3s ease-out",
        }}
      >
        <ChatbotHeader
          isMinimized={isMinimized}
          onMinimize={() => setIsMinimized(!isMinimized)}
          onClose={toggleChat}
        />

        {!isMinimized && (
          <>
            <ChatbotMessages />
            <ChatbotInput />
          </>
        )}
      </div>
    </>
  );
}
