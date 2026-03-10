"use client";

import { Bot } from "lucide-react";
import { useChatbot } from "@/contexts/ChatbotContext";

export function ChatbotWelcome() {
  const { sendMessage } = useChatbot();

  const suggestions = [
    "Tư vấn nghề nghiệp cho sinh viên",
    "Kỹ năng cần có cho lập trình viên",
    "Việc làm ngành giáo dục",
  ];

  return (
    <div className="text-center py-8 px-4">
      <div
        className="w-16 h-16 bg-green-100 rounded-full flex items-center 
                      justify-center mx-auto mb-4"
      >
        <Bot className="text-green-500" size={32} />
      </div>
      <h3 className="font-semibold text-gray-800 mb-2">Xin chào! 👋</h3>
      <p className="text-sm text-gray-600 mb-6">
        Tôi là trợ lý AI, sẵn sàng giúp bạn tìm việc làm phù hợp
      </p>

      <div className="space-y-2">
        <p className="text-xs text-gray-500 mb-3">Gợi ý câu hỏi:</p>
        {suggestions.map((suggestion, i) => (
          <button
            key={i}
            onClick={() => sendMessage(suggestion)}
            className="block w-full text-left px-4 py-3 bg-white hover:bg-gray-50
                       border border-gray-200 rounded-lg text-sm text-gray-700 
                       transition-colors duration-200 hover:border-green-300 cursor-pointer"
          >
            💡 {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
