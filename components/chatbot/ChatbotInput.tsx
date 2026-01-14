"use client";

import { useState, FormEvent, KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { useChatbot } from "@/contexts/ChatbotContext";

export function ChatbotInput() {
  const { sendMessage, isTyping } = useChatbot();
  const [input, setInput] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isTyping) {
      sendMessage(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 border-t bg-white rounded-b-lg"
    >
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nhập câu hỏi của bạn..."
          disabled={isTyping}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full 
                     focus:outline-none focus:ring-2 focus:ring-green-500 
                     focus:border-transparent disabled:bg-gray-100 
                     disabled:cursor-not-allowed text-sm"
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full
                     disabled:opacity-50 disabled:cursor-not-allowed 
                     transition-colors duration-200 flex-shrink-0 cursor-pointer"
          aria-label="Gửi tin nhắn"
        >
          <Send size={20} />
        </button>
      </div>
    </form>
  );
}
