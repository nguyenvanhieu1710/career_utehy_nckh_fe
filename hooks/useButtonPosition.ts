import { useState, useCallback, useEffect } from "react";
import type { DraggableEvent, DraggableData } from "react-draggable";

interface Position {
  x: number;
  y: number;
}

interface SnapPosition extends Position {
  id: string;
  name: string;
}

interface UseButtonPositionOptions {
  buttonSize?: number;
  defaultPosition?: Position;
}

export function useButtonPosition({
  buttonSize = 56, // 14 * 4 = 56px (w-14 h-14)
  defaultPosition = { x: 0, y: 0 },
}: UseButtonPositionOptions = {}) {
  const [position, setPosition] = useState<Position>(() => {
    // Try to load from localStorage immediately if available
    if (typeof window !== "undefined") {
      const savedPosition = localStorage.getItem("chatbot-button-position");
      if (savedPosition) {
        try {
          const parsed = JSON.parse(savedPosition);

          // Validate if saved position is within current viewport
          const windowWidth = window.innerWidth;
          const windowHeight = window.innerHeight;

          // Check if position is visible (with some margin for safety)
          const isVisible =
            parsed.x >= -50 &&
            parsed.x <= windowWidth - buttonSize + 50 &&
            parsed.y >= -50 &&
            parsed.y <= windowHeight - buttonSize + 50;

          if (isVisible) {
            return parsed;
          } else {
            // Position is outside viewport, clear it and use default
            localStorage.removeItem("chatbot-button-position");
          }
        } catch {
          console.warn("Failed to parse saved button position");
        }
      }

      // If no saved position or invalid position, calculate bottom-right
      if (defaultPosition.x === -1 && defaultPosition.y === -1) {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const margin = 24;
        return {
          x: windowWidth - buttonSize - margin,
          y: windowHeight - buttonSize - margin,
        };
      }
    }
    return defaultPosition;
  });

  const [isDragging, setIsDragging] = useState(false);

  // Simplified - no need for isPositionLoaded, just render immediately

  // Calculate snap positions based on window size
  const getSnapPositions = useCallback((): SnapPosition[] => {
    if (typeof window === "undefined") return [];

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const margin = 24; // Distance from edges
    const centerX = (windowWidth - buttonSize) / 2;
    const centerY = (windowHeight - buttonSize) / 2;

    return [
      // 4 Corners
      { id: "top-left", name: "Góc trên trái", x: margin, y: margin },
      {
        id: "top-right",
        name: "Góc trên phải",
        x: windowWidth - buttonSize - margin,
        y: margin,
      },
      {
        id: "bottom-left",
        name: "Góc dưới trái",
        x: margin,
        y: windowHeight - buttonSize - margin,
      },
      {
        id: "bottom-right",
        name: "Góc dưới phải",
        x: windowWidth - buttonSize - margin,
        y: windowHeight - buttonSize - margin,
      },

      // 4 Edge centers
      { id: "top-center", name: "Giữa trên", x: centerX, y: margin },
      {
        id: "bottom-center",
        name: "Giữa dưới",
        x: centerX,
        y: windowHeight - buttonSize - margin,
      },
      { id: "left-center", name: "Giữa trái", x: margin, y: centerY },
      {
        id: "right-center",
        name: "Giữa phải",
        x: windowWidth - buttonSize - margin,
        y: centerY,
      },
    ];
  }, [buttonSize]);

  // Find nearest snap position
  const findNearestSnapPosition = useCallback(
    (pos: Position): SnapPosition => {
      const snapPositions = getSnapPositions();

      let nearestPosition = snapPositions[0];
      let minDistance = Infinity;

      snapPositions.forEach((snapPos) => {
        const distance = Math.sqrt(
          Math.pow(pos.x - snapPos.x, 2) + Math.pow(pos.y - snapPos.y, 2),
        );

        if (distance < minDistance) {
          minDistance = distance;
          nearestPosition = snapPos;
        }
      });

      return nearestPosition;
    },
    [getSnapPositions],
  );

  // Save position to localStorage
  const savePosition = useCallback((newPosition: Position) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "chatbot-button-position",
        JSON.stringify(newPosition),
      );
    }
  }, []);

  // Handle drag start
  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  // Handle drag stop with snapping
  const handleDragStop = useCallback(
    (_e: DraggableEvent, data: DraggableData) => {
      const currentPosition = { x: data.x, y: data.y };
      const nearestSnap = findNearestSnapPosition(currentPosition);

      // Always snap to nearest position
      const finalPosition = { x: nearestSnap.x, y: nearestSnap.y };

      setPosition(finalPosition);
      setIsDragging(false);
      savePosition(finalPosition);
    },
    [findNearestSnapPosition, savePosition],
  );

  // Get bounds for draggable (allow some overflow for better UX)
  const getBounds = useCallback(() => {
    if (typeof window === "undefined") {
      return { left: 0, top: 0, right: 0, bottom: 0 };
    }

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const overflow = 20; // Allow button to go slightly off-screen

    return {
      left: -overflow,
      top: -overflow,
      right: windowWidth - buttonSize + overflow,
      bottom: windowHeight - buttonSize + overflow,
    };
  }, [buttonSize]);

  // Reset to default position (bottom-right corner)
  const resetPosition = useCallback(() => {
    const snapPositions = getSnapPositions();
    const defaultSnap =
      snapPositions.find((pos) => pos.id === "bottom-right") ||
      snapPositions[0];

    setPosition({ x: defaultSnap.x, y: defaultSnap.y });
    savePosition({ x: defaultSnap.x, y: defaultSnap.y });
  }, [getSnapPositions, savePosition]);

  // Handle window resize - reposition if needed
  useEffect(() => {
    const handleResize = () => {
      const snapPositions = getSnapPositions();
      const currentSnap = findNearestSnapPosition(position);

      // Update position to maintain relative position after resize
      const newPosition = snapPositions.find(
        (pos) => pos.id === currentSnap.id,
      );
      if (newPosition) {
        setPosition({ x: newPosition.x, y: newPosition.y });
        savePosition({ x: newPosition.x, y: newPosition.y });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [position, getSnapPositions, findNearestSnapPosition, savePosition]);

  return {
    position,
    isDragging,
    handleDragStart,
    handleDragStop,
    resetPosition,
    getBounds,
    getSnapPositions,
    setPosition,
  };
}
