"use client";

import { useState, useRef, useEffect } from "react";
import Draggable from "react-draggable";
import { useChatbot } from "@/contexts/ChatbotContext";
import { useChatbotPosition } from "@/hooks/useChatbotPosition";
import { ChatbotHeader } from "./ChatbotHeader";
import { ChatbotMessages } from "./ChatbotMessages";
import { ChatbotInput } from "./ChatbotInput";

export function DraggableChatbot() {
  const { isOpen, toggleChat } = useChatbot();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);

  const { position, isDragging, handleDragStart, handleDragStop, getBounds } =
    useChatbotPosition({
      snapToEdge: true,
      snapThreshold: 50,
      defaultPosition: { x: 0, y: 0 },
    });

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

  // Mobile version - không draggable
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

  // Desktop version - draggable
  return (
    <Draggable
      nodeRef={nodeRef}
      handle=".drag-handle"
      position={position}
      onStart={handleDragStart}
      onStop={handleDragStop}
      bounds={getBounds()}
      disabled={isMinimized}
    >
      <div
        ref={nodeRef}
        className={`fixed bg-white rounded-lg shadow-2xl
                     flex flex-col transition-all duration-300 z-[1000]
                     w-[380px] select-none
                     ${isMinimized ? "h-14" : "h-[600px]"}
                     ${isDragging ? "cursor-grabbing shadow-2xl" : ""}
                     ${isDragging ? "chatbot-dragging" : ""}`}
        style={{
          // Default position nếu chưa có saved position
          right: position.x === 0 && position.y === 0 ? "24px" : "auto",
          bottom: position.x === 0 && position.y === 0 ? "24px" : "auto",
        }}
      >
        <ChatbotHeader
          isMinimized={isMinimized}
          onMinimize={() => setIsMinimized(!isMinimized)}
          onClose={toggleChat}
          isDraggable={true}
          isDragging={isDragging}
        />

        {!isMinimized && (
          <>
            <ChatbotMessages />
            <ChatbotInput />
          </>
        )}
      </div>
    </Draggable>
  );
}
