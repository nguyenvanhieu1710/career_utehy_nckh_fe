"use client";

import { Bot, Minus, Maximize2, X, Move } from "lucide-react";

interface ChatbotHeaderProps {
  isMinimized: boolean;
  onMinimize: () => void;
  onClose: () => void;
  isDraggable?: boolean;
}

export function ChatbotHeader({
  isMinimized,
  onMinimize,
  onClose,
  isDraggable = false,
}: ChatbotHeaderProps) {
  return (
    <div
      className={`bg-gradient-to-r from-green-500 to-green-600 text-white 
                    px-4 py-3 rounded-t-lg flex items-center justify-between
                    ${isDraggable ? "drag-handle cursor-move" : ""}
                    transition-all duration-200`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
          <Bot className="text-green-500" size={24} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">Trợ lý AI</h3>
          <p className="text-xs opacity-90">
            {isDraggable ? "Kéo để di chuyển" : "Luôn sẵn sàng hỗ trợ bạn"}
          </p>
        </div>

        {isDraggable && (
          <div className="text-white/70 hover:text-white transition-colors">
            <Move size={16} />
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onMinimize}
          className="hover:bg-white/20 p-1 rounded transition-colors cursor-pointer"
          aria-label={isMinimized ? "Mở rộng" : "Thu nhỏ"}
        >
          {isMinimized ? <Maximize2 size={18} /> : <Minus size={18} />}
        </button>
        <button
          onClick={onClose}
          className="hover:bg-white/20 p-1 rounded transition-colors cursor-pointer"
          aria-label="Đóng"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
