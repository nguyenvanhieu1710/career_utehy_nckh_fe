import { useState, useCallback } from "react";
import type { DraggableEvent, DraggableData } from "react-draggable";

interface Position {
  x: number;
  y: number;
}

interface UseChatbotPositionOptions {
  snapToEdge?: boolean;
  snapThreshold?: number;
  defaultPosition?: Position;
}

export function useChatbotPosition({
  snapToEdge = true,
  snapThreshold = 50,
  defaultPosition = { x: 0, y: 0 },
}: UseChatbotPositionOptions = {}) {
  const [position, setPosition] = useState<Position>(() => {
    // Initialize position from localStorage or default
    if (typeof window !== "undefined") {
      const savedPosition = localStorage.getItem("chatbot-position");
      if (savedPosition) {
        try {
          return JSON.parse(savedPosition);
        } catch {
          console.warn("Failed to parse saved chatbot position");
        }
      }
    }
    return defaultPosition;
  });

  const [isDragging, setIsDragging] = useState(false);

  // Save position to localStorage
  const savePosition = useCallback((newPosition: Position) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("chatbot-position", JSON.stringify(newPosition));
    }
  }, []);

  // Snap to edge logic
  const snapToEdgeIfNeeded = useCallback(
    (pos: Position) => {
      if (!snapToEdge || typeof window === "undefined") return pos;

      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const chatbotWidth = 380; // Width của chatbot
      const chatbotHeight = 600; // Height của chatbot

      let newX = pos.x;
      let newY = pos.y;

      // Snap to left or right edge
      if (pos.x < snapThreshold) {
        newX = 0;
      } else if (pos.x + chatbotWidth > windowWidth - snapThreshold) {
        newX = windowWidth - chatbotWidth;
      }

      // Keep within vertical bounds
      if (pos.y < 0) {
        newY = 0;
      } else if (pos.y + chatbotHeight > windowHeight) {
        newY = windowHeight - chatbotHeight;
      }

      return { x: newX, y: newY };
    },
    [snapToEdge, snapThreshold],
  );

  // Handle drag start
  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  // Handle drag stop
  const handleDragStop = useCallback(
    (_e: DraggableEvent, data: DraggableData) => {
      const newPosition = { x: data.x, y: data.y };
      const snappedPosition = snapToEdgeIfNeeded(newPosition);

      setPosition(snappedPosition);
      setIsDragging(false);
      savePosition(snappedPosition);
    },
    [snapToEdgeIfNeeded, savePosition],
  );

  // Reset position to default
  const resetPosition = useCallback(() => {
    setPosition(defaultPosition);
    savePosition(defaultPosition);
  }, [defaultPosition, savePosition]);

  // Get bounds for draggable
  const getBounds = useCallback(() => {
    if (typeof window === "undefined") {
      return { left: 0, top: 0, right: 0, bottom: 0 };
    }

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const chatbotWidth = 380;
    const chatbotHeight = 600;

    return {
      left: -windowWidth + chatbotWidth - 50, // Allow partial off-screen
      top: 0,
      right: windowWidth - 50, // Allow partial off-screen
      bottom: windowHeight - chatbotHeight,
    };
  }, []);

  return {
    position,
    isDragging,
    handleDragStart,
    handleDragStop,
    resetPosition,
    getBounds,
    setPosition,
  };
}
