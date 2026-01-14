"use client";

import { MessageCircle } from "lucide-react";
import { useChatbot } from "@/contexts/ChatbotContext";

export function ChatbotButton() {
  const { isOpen, unreadCount, toggleChat } = useChatbot();

  if (isOpen) return null;

  return (
    <button
      onClick={toggleChat}
      className="fixed bottom-6 right-6 w-16 h-16 bg-green-500 hover:bg-green-600 
                 text-white rounded-full shadow-lg flex items-center justify-center
                 transition-all duration-300 hover:scale-110 z-[9999]
                 focus:outline-none focus:ring-4 focus:ring-green-300 cursor-pointer"
      aria-label="Mở chat"
    >
      <MessageCircle size={28} />

      {unreadCount > 0 && (
        <span
          className="absolute -top-1 -right-1 bg-red-500 text-white 
                     text-xs w-6 h-6 rounded-full flex items-center justify-center
                     font-bold animate-bounce"
        >
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
}
