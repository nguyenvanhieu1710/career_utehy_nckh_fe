"use client";

import { useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
  className?: string;
}

export function InteractiveTooltip({
  content,
  children,
  position = "top",
  delay = 0,
  className = "",
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    if (timeoutId) clearTimeout(timeoutId);
    const id = setTimeout(() => setIsVisible(true), delay);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setIsVisible(false);
  };

  const getPositionClasses = () => {
    switch (position) {
      case "top":
        return "bottom-full left-1/2 transform -translate-x-1/2 mb-2";
      case "bottom":
        return "top-full left-1/2 transform -translate-x-1/2 mt-2";
      case "left":
        return "right-full top-1/2 transform -translate-y-1/2 mr-2";
      case "right":
        return "left-full top-1/2 transform -translate-y-1/2 ml-2";
      default:
        return "bottom-full left-1/2 transform -translate-x-1/2 mb-2";
    }
  };

  const getArrowClasses = () => {
    switch (position) {
      case "top":
        return "top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-800";
      case "bottom":
        return "bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-800";
      case "left":
        return "left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-800";
      case "right":
        return "right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-800";
      default:
        return "top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-800";
    }
  };

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-[100] ${getPositionClasses()}`}
          >
            <div className="bg-gray-800 text-white text-sm rounded-lg px-4 py-3 shadow-xl border border-gray-700 min-w-[280px] sm:min-w-[320px] max-w-xs sm:max-w-sm w-max">
              {content}
            </div>
            <div className={`absolute w-0 h-0 border-4 ${getArrowClasses()}`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Specialized tooltip for skill items
interface SkillTooltipProps {
  skill: {
    name: string;
    userLevel: number;
    requiredLevel: number;
    status: string;
  };
  children: ReactNode;
}

export function SkillTooltip({ skill, children }: SkillTooltipProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "text-green-400";
      case "good":
        return "text-blue-400";
      case "needs_improvement":
        return "text-yellow-400";
      case "missing":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "excellent":
        return "Xuất sắc";
      case "good":
        return "Tốt";
      case "needs_improvement":
        return "Cần cải thiện";
      case "missing":
        return "Chưa có";
      default:
        return "Không xác định";
    }
  };

  const content = (
    <div className="space-y-3 min-w-0">
      <div className="font-semibold text-white border-b border-gray-600 pb-2">
        {skill.name}
      </div>
      <div className="space-y-2 text-xs">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <span className="text-gray-300">Trình độ của bạn:</span>
          <span className="font-semibold text-right">{skill.userLevel}%</span>

          <span className="text-gray-300">Yêu cầu công việc:</span>
          <span className="font-semibold text-right">
            {skill.requiredLevel}%
          </span>

          <span className="text-gray-300">Trạng thái:</span>
          <span
            className={`font-semibold text-right ${getStatusColor(
              skill.status
            )}`}
          >
            {getStatusLabel(skill.status)}
          </span>
        </div>

        {skill.userLevel < skill.requiredLevel && (
          <div className="pt-2 border-t border-gray-600">
            <div className="flex items-center justify-between">
              <span className="text-yellow-400 font-medium">
                Cần cải thiện:
              </span>
              <span className="text-yellow-400 font-semibold">
                +{skill.requiredLevel - skill.userLevel}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <InteractiveTooltip
      content={content}
      position="right"
      delay={300}
      className="inline-block"
    >
      {children}
    </InteractiveTooltip>
  );
}
