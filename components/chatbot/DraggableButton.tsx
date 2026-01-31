"use client";

import { MessageCircle, Move } from "lucide-react";
import { useChatbot } from "@/contexts/ChatbotContext";
import { useState, useEffect, useRef, useCallback } from "react";

interface Position {
  x: number;
  y: number;
}

export function DraggableButton() {
  const { isOpen, unreadCount, toggleChat } = useChatbot();
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
  const [initialMousePos, setInitialMousePos] = useState<Position>({
    x: 0,
    y: 0,
  });
  const hasDraggedRef = useRef(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const DRAG_THRESHOLD = 5; // Minimum pixels to consider as drag

  // Initialize position
  useEffect(() => {
    const initPosition = () => {
      const savedPos = localStorage.getItem("chatbot-button-position");
      if (savedPos) {
        try {
          const parsed = JSON.parse(savedPos);
          // Validate position is within viewport
          const isValid =
            parsed.x >= 0 &&
            parsed.x <= window.innerWidth - 56 &&
            parsed.y >= 0 &&
            parsed.y <= window.innerHeight - 56;

          if (isValid) {
            setPosition(parsed);
            return;
          }
        } catch {
          console.warn("Invalid saved position");
        }
      }

      // Default to bottom-right
      setPosition({
        x: window.innerWidth - 56 - 24,
        y: window.innerHeight - 56 - 24,
      });
    };

    initPosition();

    // Handle window resize
    const handleResize = () => {
      setPosition((prev) => ({
        x: Math.min(prev.x, window.innerWidth - 56 - 24),
        y: Math.min(prev.y, window.innerHeight - 56 - 24),
      }));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Save position to localStorage
  const savePosition = useCallback((pos: Position) => {
    localStorage.setItem("chatbot-button-position", JSON.stringify(pos));
  }, []);

  // Snap to nearest edge
  const snapToEdge = useCallback((pos: Position): Position => {
    const margin = 24;
    const buttonSize = 56;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Calculate distances to edges
    const distToLeft = pos.x;
    const distToRight = windowWidth - pos.x - buttonSize;
    const distToTop = pos.y;
    const distToBottom = windowHeight - pos.y - buttonSize;

    // Find minimum distance
    const minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom);

    // Snap to nearest edge
    if (minDist === distToLeft) {
      return { x: margin, y: pos.y };
    } else if (minDist === distToRight) {
      return { x: windowWidth - buttonSize - margin, y: pos.y };
    } else if (minDist === distToTop) {
      return { x: pos.x, y: margin };
    } else {
      return { x: pos.x, y: windowHeight - buttonSize - margin };
    }
  }, []);

  // Mouse event handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return; // Only left click

      setIsDragging(true);
      hasDraggedRef.current = false;
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
      setInitialMousePos({
        x: e.clientX,
        y: e.clientY,
      });

      e.preventDefault();
    },
    [position],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      // Calculate distance from initial mouse position
      const dragDistance = Math.sqrt(
        Math.pow(e.clientX - initialMousePos.x, 2) +
          Math.pow(e.clientY - initialMousePos.y, 2),
      );

      // Only consider it a drag if moved more than threshold
      if (dragDistance > DRAG_THRESHOLD) {
        hasDraggedRef.current = true;

        const newPos = {
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        };

        // Constrain to viewport
        newPos.x = Math.max(0, Math.min(newPos.x, window.innerWidth - 56));
        newPos.y = Math.max(0, Math.min(newPos.y, window.innerHeight - 56));

        setPosition(newPos);
      }
    },
    [isDragging, dragStart, initialMousePos, DRAG_THRESHOLD],
  );

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;

    setIsDragging(false);

    if (hasDraggedRef.current) {
      // Snap to edge and save
      const snappedPos = snapToEdge(position);
      setPosition(snappedPos);
      savePosition(snappedPos);
    } else {
      // This was a click, not a drag - open chat
      console.log("✅ Opening chat");
      toggleChat();
    }

    // Reset drag state
    setTimeout(() => {
      hasDraggedRef.current = false;
    }, 10);
  }, [isDragging, position, snapToEdge, savePosition, toggleChat]);

  // Global mouse events
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "none";

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.userSelect = "";
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Don't show when chat is open
  if (isOpen) return null;

  return (
    <button
      ref={buttonRef}
      onMouseDown={handleMouseDown}
      className={`fixed w-14 h-14 bg-green-500 hover:bg-green-600 
                 text-white rounded-full shadow-lg flex items-center justify-center
                 transition-all duration-300 z-[1000]
                 focus:outline-none focus:ring-4 focus:ring-green-300
                 select-none
                 ${isDragging ? "cursor-grabbing scale-110 shadow-2xl" : "cursor-pointer hover:scale-110"}`}
      style={{
        left: position.x,
        top: position.y,
        transform: isDragging ? "rotate(2deg)" : "none",
      }}
      aria-label="Mở chat hỗ trợ"
      title={isDragging ? "Đang di chuyển..." : "Chat với chúng tôi"}
    >
      <MessageCircle size={24} />

      {unreadCount > 0 && (
        <span
          className="absolute -top-1 -right-1 bg-red-500 text-white 
                     text-xs w-5 h-5 rounded-full flex items-center justify-center
                     font-bold animate-pulse"
        >
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}

      {/* Drag indicator when hovering */}
      {!isDragging && (
        <div
          className="absolute inset-0 rounded-full opacity-0 hover:opacity-100 
                     transition-opacity duration-200 flex items-center justify-center
                     bg-black/20"
        >
          <Move size={16} className="text-white/80" />
        </div>
      )}
    </button>
  );
}
