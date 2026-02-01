"use client";

import { useState, useEffect } from "react";
import { useChatbot } from "@/contexts/ChatbotContext";
import { ChatbotHeader } from "./ChatbotHeader";
import { ChatbotMessages } from "./ChatbotMessages";
import { ChatbotInput } from "./ChatbotInput";

export function DraggableChatbot() {
  const { isOpen, toggleChat } = useChatbot();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
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

  // Mobile version
  if (isMobile) {
    return (
      <>
        {/* Backdrop for mobile */}
        <div
          className="fixed inset-0 bg-black/50 z-[999] md:hidden"
          onClick={toggleChat}
        />

        <div
          className={`fixed bg-white rounded-lg shadow-2xl
                       flex flex-col transition-all duration-300 z-[1000]
                       ${isMinimized ? "h-14" : "h-[90vh]"}
                       bottom-0 left-4 right-4 rounded-b-none max-h-[90vh]`}
        >
          <ChatbotHeader
            isMinimized={isMinimized}
            onMinimize={() => setIsMinimized(!isMinimized)}
            onClose={toggleChat}
            isDraggable={false}
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

  // Desktop version - fixed position (bottom-right corner)
  return (
    <div
      className={`fixed bg-white rounded-lg shadow-2xl
                 flex flex-col transition-all duration-300 z-[1000]
                 w-[380px] select-none
                 ${isMinimized ? "h-14" : "h-[600px]"}
                 bottom-6 right-6`}
    >
      <ChatbotHeader
        isMinimized={isMinimized}
        onMinimize={() => setIsMinimized(!isMinimized)}
        onClose={toggleChat}
        isDraggable={false}
      />

      {!isMinimized && (
        <>
          <ChatbotMessages />
          <ChatbotInput />
        </>
      )}
    </div>
  );
}
