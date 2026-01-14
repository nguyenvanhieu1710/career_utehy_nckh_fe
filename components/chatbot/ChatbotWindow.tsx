"use client";

import { useState } from "react";
import { useChatbot } from "@/contexts/ChatbotContext";
import { ChatbotHeader } from "./ChatbotHeader";
import { ChatbotMessages } from "./ChatbotMessages";
import { ChatbotInput } from "./ChatbotInput";

export function ChatbotWindow() {
  const { isOpen, toggleChat } = useChatbot();
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 bg-white rounded-lg shadow-2xl
                   flex flex-col z-[9999] transition-all duration-300
                   ${isMinimized ? "h-14" : "h-[600px]"}
                   w-[380px]
                   max-md:w-full max-md:h-full max-md:bottom-0 max-md:right-0 
                   max-md:rounded-none max-md:top-0 max-md:left-0`}
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
  );
}
