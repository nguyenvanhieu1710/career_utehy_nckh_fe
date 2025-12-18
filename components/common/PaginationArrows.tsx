// components/common/PaginationArrows.tsx
"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

interface PaginationArrowsProps {
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export default function PaginationArrows({
  onPrevious,
  onNext,
  hasPrevious = true,
  hasNext = true,
}: PaginationArrowsProps) {
  const [hoveredButton, setHoveredButton] = useState<"prev" | "next" | null>(
    null
  );

  return (
    <motion.div
      className="flex gap-3"
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      viewport={{ once: true }}
    >
      {/* Previous Button */}
      <motion.button
        aria-label="Previous"
        disabled={!hasPrevious}
        onClick={onPrevious}
        onHoverStart={() => setHoveredButton("prev")}
        onHoverEnd={() => setHoveredButton(null)}
        className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 relative overflow-hidden ${
          hasPrevious
            ? "border-gray-300 hover:border-blue-400 cursor-pointer"
            : "border-gray-200 cursor-not-allowed opacity-50"
        }`}
        whileHover={
          hasPrevious
            ? {
                scale: 1.1,
                boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
              }
            : {}
        }
        whileTap={hasPrevious ? { scale: 0.95 } : {}}
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {/* Animated background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full"
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: hoveredButton === "prev" && hasPrevious ? 1 : 0,
            opacity: hoveredButton === "prev" && hasPrevious ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Icon with animation */}
        <motion.div
          animate={{
            x: hoveredButton === "prev" && hasPrevious ? [-1, -2, -1] : 0,
            scale: hoveredButton === "prev" && hasPrevious ? 1.1 : 1,
          }}
          transition={{
            duration: 0.6,
            repeat: hoveredButton === "prev" && hasPrevious ? Infinity : 0,
            ease: "easeInOut",
          }}
          className="relative z-10"
        >
          <ChevronLeft
            className={`w-5 h-5 transition-colors duration-300 ${
              hasPrevious
                ? hoveredButton === "prev"
                  ? "text-blue-600"
                  : "text-gray-700"
                : "text-gray-400"
            }`}
          />
        </motion.div>

        {/* Ripple effect */}
        {hoveredButton === "prev" && hasPrevious && (
          <motion.div
            className="absolute inset-0 border-2 border-blue-400 rounded-full"
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.6, repeat: Infinity }}
          />
        )}
      </motion.button>

      {/* Next Button */}
      <motion.button
        aria-label="Next"
        disabled={!hasNext}
        onClick={onNext}
        onHoverStart={() => setHoveredButton("next")}
        onHoverEnd={() => setHoveredButton(null)}
        className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 relative overflow-hidden ${
          hasNext
            ? "border-gray-300 hover:border-green-400 cursor-pointer"
            : "border-gray-200 cursor-not-allowed opacity-50"
        }`}
        whileHover={
          hasNext
            ? {
                scale: 1.1,
                boxShadow: "0 4px 12px rgba(34, 197, 94, 0.3)",
              }
            : {}
        }
        whileTap={hasNext ? { scale: 0.95 } : {}}
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Animated background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-green-50 to-emerald-50 rounded-full"
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: hoveredButton === "next" && hasNext ? 1 : 0,
            opacity: hoveredButton === "next" && hasNext ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Icon with animation */}
        <motion.div
          animate={{
            x: hoveredButton === "next" && hasNext ? [1, 2, 1] : 0,
            scale: hoveredButton === "next" && hasNext ? 1.1 : 1,
          }}
          transition={{
            duration: 0.6,
            repeat: hoveredButton === "next" && hasNext ? Infinity : 0,
            ease: "easeInOut",
          }}
          className="relative z-10"
        >
          <ChevronRight
            className={`w-5 h-5 transition-colors duration-300 ${
              hasNext
                ? hoveredButton === "next"
                  ? "text-green-600"
                  : "text-gray-700"
                : "text-gray-400"
            }`}
          />
        </motion.div>

        {/* Ripple effect */}
        {hoveredButton === "next" && hasNext && (
          <motion.div
            className="absolute inset-0 border-2 border-green-400 rounded-full"
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.6, repeat: Infinity }}
          />
        )}
      </motion.button>
    </motion.div>
  );
}
