"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface AnimatedProgressProps {
  value: number;
  maxValue?: number;
  height?: string;
  color?: string;
  backgroundColor?: string;
  showLabel?: boolean;
  label?: string;
  delay?: number;
  duration?: number;
  className?: string;
}

export function AnimatedProgress({
  value,
  maxValue = 100,
  height = "h-2",
  color = "bg-green-500",
  backgroundColor = "bg-gray-200",
  showLabel = false,
  label,
  delay = 0,
  duration = 1,
  className = "",
}: AnimatedProgressProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const percentage = Math.min((value / maxValue) * 100, 100);

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-sm font-bold text-gray-900">{value}%</span>
        </div>
      )}

      <div
        className={`w-full ${backgroundColor} rounded-full ${height} overflow-hidden`}
      >
        <motion.div
          className={`${height} ${color} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: isVisible ? `${percentage}%` : 0 }}
          transition={{
            duration,
            ease: "easeOut",
            delay: delay / 1000,
          }}
        />
      </div>
    </div>
  );
}

// Dual Progress Bar for comparison
interface DualProgressProps {
  userValue: number;
  requiredValue: number;
  maxValue?: number;
  height?: string;
  userColor?: string;
  requiredColor?: string;
  backgroundColor?: string;
  showLabels?: boolean;
  delay?: number;
  className?: string;
}

export function DualProgress({
  userValue,
  requiredValue,
  maxValue = 100,
  height = "h-6",
  userColor = "bg-green-500",
  requiredColor = "bg-gray-300",
  backgroundColor = "bg-gray-200",
  showLabels = true,
  delay = 0,
  className = "",
}: DualProgressProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const userPercentage = Math.min((userValue / maxValue) * 100, 100);
  const requiredPercentage = Math.min((requiredValue / maxValue) * 100, 100);

  return (
    <div className={`w-full ${className}`}>
      {showLabels && (
        <div className="flex justify-between items-center mb-2 text-sm">
          <span className="text-gray-600">Trình độ của bạn: {userValue}%</span>
          <span className="text-gray-600">Yêu cầu: {requiredValue}%</span>
        </div>
      )}

      <div
        className={`relative w-full ${backgroundColor} rounded-full ${height}`}
      >
        {/* Required Level (Background) */}
        <motion.div
          className={`absolute top-0 left-0 ${requiredColor} ${height} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: isVisible ? `${requiredPercentage}%` : 0 }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
            delay: delay / 1000,
          }}
        />

        {/* User Level (Foreground) */}
        <motion.div
          className={`absolute top-0 left-0 ${userColor} ${height} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: isVisible ? `${userPercentage}%` : 0 }}
          transition={{
            duration: 1,
            ease: "easeOut",
            delay: (delay + 200) / 1000,
          }}
        />

        {/* Percentage Labels */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium text-gray-800">
            {userValue}% / {requiredValue}%
          </span>
        </div>
      </div>

      {/* Gap Indicator */}
      {userValue < requiredValue && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 5 }}
          transition={{ delay: (delay + 500) / 1000 }}
          className="text-xs text-orange-600 mt-1 flex items-center gap-1"
        >
          <span>Cần cải thiện:</span>
          <span className="font-medium">+{requiredValue - userValue}%</span>
        </motion.div>
      )}
    </div>
  );
}

// Circular Progress with animation
interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showValue?: boolean;
  delay?: number;
  duration?: number;
  className?: string;
}

export function CircularProgress({
  value,
  size = 120,
  strokeWidth = 8,
  color = "#22c55e",
  backgroundColor = "#e5e7eb",
  showValue = true,
  delay = 0,
  duration = 1.5,
  className = "",
}: CircularProgressProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className={`relative ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress Circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{
            strokeDashoffset: isVisible ? offset : circumference,
          }}
          transition={{
            duration,
            ease: "easeOut",
            delay: delay / 1000,
          }}
        />
      </svg>

      {showValue && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: isVisible ? 1 : 0,
            scale: isVisible ? 1 : 0.5,
          }}
          transition={{
            duration: 0.5,
            delay: (delay + duration * 500) / 1000,
          }}
        >
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color }}>
              {value}%
            </div>
            <div className="text-xs text-gray-600">Phù hợp</div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
